import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { Transaction } from '../types';

type JsonRpcRequest = { jsonrpc: "2.0"; id: number; method: string; params: unknown[] };
type JsonRpcResponse<T> = { jsonrpc: "2.0"; id: number; result?: T; error?: { code: number; message: string } };

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);
    private readonly API_URL: string;

    constructor(private configService: ConfigService, private supabaseService: SupabaseService) {
        this.API_URL = this.configService.get<string>('VITE_API_URL') as string;
        if (!this.API_URL) {
            this.logger.error('VITE_API_URL is not defined in environment variables!');
            throw new Error('VITE_API_URL is not defined');
        }
    }

    private async jsonRpc<T>(method: string, params: unknown[]): Promise<T> {
        const payload: JsonRpcRequest = { jsonrpc: "2.0", id: Date.now(), method, params };
        const res = await fetch(this.API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`RPC ${method} failed ${res.status}: ${text}`);
        }
        const data = (await res.json()) as JsonRpcResponse<T>;
        if (data.error) throw new Error(`RPC ${method} error ${data.error.code}: ${data.error.message}`);
        return data.result as T;
    }

    private hexToNumber(hex?: string | null): number | undefined {
        if (!hex) return undefined;
        return Number.parseInt(hex, 16);
    }

    private formatEthFromHexWei(hexWei?: string | null): string {
        if (!hexWei) return "0 ETH";
        const wei = BigInt(hexWei);
        const denom = 10n ** 18n;
        const whole = wei / denom;
        const frac = wei % denom;
        if (frac === 0n) return `${whole} ETH`;
        const fracStr = frac.toString().padStart(18, '0').slice(0, 4);
        const trimmedFrac = fracStr.replace(/0+$/, '');
        return trimmedFrac ? `${whole}.${trimmedFrac} ETH` : `${whole} ETH`;
    }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async handleCron() {
        this.logger.log('Attempting to store latest transactions...');
        try {
            await this.storeLatestTransactions();
        } catch (error: any) { // Explicitly type error as 'any' for now
            this.logger.error('Error during transaction storage cron job:', error.message);
        }
    }

    async storeLatestTransactions(): Promise<void> {
        this.logger.log('Fetching latest block from RPC...');
        const latestHex = await this.jsonRpc<string>("eth_blockNumber", []);
        const latest = this.hexToNumber(latestHex) ?? 0;
        this.logger.log(`Latest block number: ${latest}`);

        const block = await this.jsonRpc<any>("eth_getBlockByNumber", [latestHex, true]);
        const timestamp = this.hexToNumber(block?.timestamp);
        this.logger.log(`Block has ${block?.transactions?.length || 0} transactions`);

        const transactionsToStore: Transaction[] = [];

        for (const t of block?.transactions ?? []) {
            const valueWei = BigInt(t.value || "0");
            const valueEth = Number(valueWei) / Math.pow(10, 18);

            transactionsToStore.push({
                hash: t.hash,
                from_address: t.from,
                to_address: t.to,
                value_wei: t.value || "0",
                value_eth: valueEth,
                status: "success", // Assuming success for now
                block_number: this.hexToNumber(t.blockNumber),
                block_hash: block?.hash,
                transaction_index: this.hexToNumber(t.transactionIndex),
                gas_used: this.hexToNumber(t.gas),
                gas_price: this.hexToNumber(t.gasPrice),
                timestamp: timestamp ? new Date(timestamp * 1000).toISOString() : new Date().toISOString(),
                input_data: t.input,
                nonce: this.hexToNumber(t.nonce),
                type: this.hexToNumber(t.type),
                chain_id: this.hexToNumber(t.chainId),
            });
        }

        this.logger.log(`Prepared ${transactionsToStore.length} transactions for storage`);

        if (transactionsToStore.length > 0) {
            const client = this.supabaseService.client;
            if (!client) {
                this.logger.warn('Supabase client not available, skipping transaction storage');
                return;
            }

            this.logger.log('Storing transactions to Supabase...');
            const { error } = await client
                .from('transactions')
                .upsert(transactionsToStore, { onConflict: 'hash' });

            if (error) {
                this.logger.error('Error storing transactions:', error.message);
                throw error;
            }
            this.logger.log('Successfully stored transactions to Supabase');
        } else {
            this.logger.log('No transactions to store');
        }
    }
}