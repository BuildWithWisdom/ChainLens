import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { Transaction } from '../types';

type JsonRpcRequest = { jsonrpc: "2.0"; id: number; method: string; params: unknown[] };
type JsonRpcResponse<T> = { jsonrpc: "2.0"; id: number; result?: T; error?: { code: number; message: string } };

type CompiledInstruction = { programIdIndex: number; accounts: number[]; data: string };

const SYSTEM_PROGRAM = '11111111111111111111111111111111';
const VOTE_PROGRAM = 'Vote111111111111111111111111111111111111111';
const LAMPORTS_PER_SOL = 1_000_000_000;

const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Minimal base58 decoder (avoids an extra dependency for one use).
function base58Decode(input: string): Buffer {
    const bytes: number[] = [0];
    for (const ch of input) {
        let carry = B58_ALPHABET.indexOf(ch);
        if (carry < 0) throw new Error('Invalid base58 character');
        for (let i = 0; i < bytes.length; i++) {
            carry += bytes[i] * 58;
            bytes[i] = carry & 0xff;
            carry >>= 8;
        }
        while (carry > 0) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }
    for (const ch of input) {
        if (ch === '1') bytes.push(0);
        else break;
    }
    return Buffer.from(bytes.reverse());
}

// Parse a SystemProgram transfer instruction (u32 index 2, then u64 lamports).
function parseSystemTransfer(
    accountKeys: string[],
    ix: CompiledInstruction,
): { to: string; lamports: bigint } | null {
    try {
        if (accountKeys[ix.programIdIndex] !== SYSTEM_PROGRAM) return null;
        if (!ix.accounts || ix.accounts.length < 2) return null;
        const buf = base58Decode(ix.data);
        if (buf.length < 12 || buf.readUInt32LE(0) !== 2) return null;
        const to = accountKeys[ix.accounts[1]];
        if (!to) return null;
        return { to, lamports: buf.readBigUInt64LE(4) };
    } catch {
        return null;
    }
}

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);
    private readonly API_URL: string;
    private readonly maxTxsPerBlock: number;

    constructor(private configService: ConfigService, private supabaseService: SupabaseService) {
        this.API_URL = this.configService.get<string>('VITE_API_URL') as string;
        if (!this.API_URL) {
            this.logger.error('VITE_API_URL is not defined in environment variables!');
            throw new Error('VITE_API_URL is not defined');
        }
        this.maxTxsPerBlock = Number(this.configService.get<string>('TXS_PER_BLOCK') ?? 25) || 25;
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

    // Slots can be skipped; walk back to the most recent block with data.
    private async getConfirmedBlock(startSlot: number, maxWalkBack = 25): Promise<{ slot: number; block: any } | null> {
        for (let s = startSlot; s > startSlot - maxWalkBack; s--) {
            const block = await this.jsonRpc<any>("getBlock", [s, {
                encoding: "json",
                transactionDetails: "full",
                rewards: false,
                maxSupportedTransactionVersion: 1,
                commitment: "confirmed",
            }]);
            if (block?.transactions) return { slot: s, block };
        }
        return null;
    }

    // Samples the latest confirmed block. Mainnet blocks are large, so we store
    // at most TXS_PER_BLOCK non-vote transactions per sample (see .env.example).
    @Cron('*/15 * * * * *')
    async handleCron() {
        this.logger.log('Attempting to store latest transactions...');
        try {
            await this.storeLatestTransactions();
        } catch (error: any) { // Explicitly type error as 'any' for now
            this.logger.error('Error during transaction storage cron job:', error.message);
        }
    }

    async storeLatestTransactions(): Promise<void> {
        this.logger.log('Fetching latest slot from RPC...');
        const slot = await this.jsonRpc<number>("getSlot", [{ commitment: "confirmed" }]);
        this.logger.log(`Latest slot: ${slot}`);

        const found = await this.getConfirmedBlock(slot);
        if (!found) {
            this.logger.warn('No confirmed block found in walk-back window, skipping cycle.');
            return;
        }
        const { slot: sampleSlot, block } = found;
        const timestamp = block.blockTime
            ? new Date(block.blockTime * 1000).toISOString()
            : new Date().toISOString();
        const entries: any[] = block.transactions ?? [];
        this.logger.log(`Slot ${sampleSlot} has ${entries.length} transactions`);

        const transactionsToStore: Transaction[] = [];
        let skippedVotes = 0;

        for (let idx = 0; idx < entries.length && transactionsToStore.length < this.maxTxsPerBlock; idx++) {
            const entry = entries[idx];
            const meta = entry?.meta;
            const message = entry?.transaction?.message;
            const signatures: string[] = entry?.transaction?.signatures ?? [];
            const accountKeys: string[] = message?.accountKeys ?? [];
            if (!meta || !message || signatures.length === 0 || accountKeys.length === 0) continue;

            const instructions: CompiledInstruction[] = message.instructions ?? [];
            const programIds = instructions
                .map((ix) => accountKeys[ix.programIdIndex])
                .filter((p): p is string => !!p);

            // Skip vote-only transactions (consensus noise, not user activity).
            if (programIds.length > 0 && programIds.every((p) => p === VOTE_PROGRAM)) {
                skippedVotes++;
                continue;
            }

            let to: string | null = null;
            let lamports = BigInt(0);
            for (const ix of instructions) {
                const t = parseSystemTransfer(accountKeys, ix);
                if (t && t.lamports > lamports) {
                    lamports = t.lamports;
                    to = t.to;
                }
            }

            transactionsToStore.push({
                hash: signatures[0],
                from_address: accountKeys[0],
                to_address: to,
                value_lamports: lamports.toString(),
                value_sol: Number(lamports) / LAMPORTS_PER_SOL,
                fee_lamports: typeof meta.fee === 'number' ? meta.fee : 0,
                status: meta.err ? "failed" : "success",
                block_number: sampleSlot,
                block_hash: block.blockhash ?? null,
                transaction_index: idx,
                gas_used: typeof meta.computeUnitsConsumed === 'number' ? meta.computeUnitsConsumed : null,
                timestamp,
                input_data: [...new Set(programIds)].slice(0, 8).join(',') || null,
            });
        }

        this.logger.log(`Prepared ${transactionsToStore.length} transactions for storage (skipped ${skippedVotes} votes)`);

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

    // Bounds table growth: deletes raw transactions older than TX_RETENTION_DAYS (default 3).
    // NOTE: retention must cover the longest leaderboard filter in the UI (24H).
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleRetentionCleanup() {
        const retentionDays = Number(this.configService.get<string>('TX_RETENTION_DAYS') ?? 3);
        if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
            this.logger.log('Retention cleanup disabled (TX_RETENTION_DAYS not set or <= 0).');
            return;
        }
        const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
        this.logger.log(`Deleting transactions older than ${retentionDays} days (before ${cutoff})...`);
        try {
            const client = this.supabaseService.client;
            if (!client) {
                this.logger.warn('Supabase client not available, skipping retention cleanup');
                return;
            }
            const { error, count } = await client
                .from('transactions')
                .delete({ count: 'exact' })
                .lt('timestamp', cutoff);
            if (error) {
                this.logger.error('Error during retention cleanup:', error.message);
                return;
            }
            this.logger.log(`Retention cleanup done, deleted ${count ?? 'unknown'} rows.`);
        } catch (error: any) {
            this.logger.error('Error during retention cleanup cron job:', error.message);
        }
    }
}
