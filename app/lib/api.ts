import { supabase, type Transaction } from './supabase';

export type TxApi = {
	id: string;
	hash: string; // truncated for display
	fullHash: string; // full hash for deduplication
	from: string;
	to: string | null;
	status: "success" | "pending" | "failed";
	value: string; // formatted ETH string "1.23 ETH"
	blockNumber?: number;
	timestamp?: string;
	gasUsed?: string;
	gasPrice?: string;
};

const API_URL = (import.meta as any).env?.VITE_API_URL ?? "";

type JsonRpcRequest = { jsonrpc: "2.0"; id: number; method: string; params: unknown[] };
type JsonRpcResponse<T> = { jsonrpc: "2.0"; id: number; result?: T; error?: { code: number; message: string } };

async function jsonRpc<T>(method: string, params: unknown[]): Promise<T> {
	if (!API_URL) throw new Error("VITE_API_URL is not set");
	const payload: JsonRpcRequest = { jsonrpc: "2.0", id: Date.now(), method, params };
	const res = await fetch(API_URL, {
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

function hexToNumber(hex?: string | null): number | undefined {
	if (!hex) return undefined;
	return Number.parseInt(hex, 16);
}

function formatEthFromHexWei(hexWei?: string | null): string {
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

function truncateAddress(address: string): string {
	if (!address || address.length <= 10) return address;
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Convert database transaction to API format
function dbToApi(tx: Transaction): TxApi {
	return {
		id: tx.id,
		hash: truncateAddress(tx.hash),
		fullHash: tx.hash,
		from: truncateAddress(tx.from_address),
		to: tx.to_address ? truncateAddress(tx.to_address) : null,
		status: tx.status as "success" | "pending" | "failed",
		value: `${tx.value_eth} ETH`,
		blockNumber: tx.block_number,
		timestamp: tx.timestamp,
		gasUsed: tx.gas_used || undefined,
		gasPrice: tx.gas_price || undefined,
	};
}

export const api = {
	// Store transactions from RPC to database
	async storeLatestTransactions(): Promise<void> {
		console.log('Fetching latest block from RPC...');
		const latestHex = await jsonRpc<string>("eth_blockNumber", []);
		const latest = hexToNumber(latestHex) ?? 0;
		console.log(`Latest block number: ${latest}`);
		
		const block = await jsonRpc<any>("eth_getBlockByNumber", [latestHex, true]);
		const timestamp = hexToNumber(block?.timestamp);
		console.log(`Block has ${block?.transactions?.length || 0} transactions`);
		
		const transactionsToStore = [];
		
		for (const t of block?.transactions ?? []) {
			const valueWei = BigInt(t.value || "0");
			const valueEth = Number(valueWei) / Math.pow(10, 18);
			
			transactionsToStore.push({
				hash: t.hash,
				from_address: t.from,
				to_address: t.to,
				value_wei: t.value || "0",
				value_eth: valueEth,
				status: "success",
				block_number: hexToNumber(t.blockNumber) || 0,
				block_hash: block?.hash,
				transaction_index: hexToNumber(t.transactionIndex),
				gas_used: t.gas,
				gas_price: t.gasPrice,
				timestamp: timestamp ? new Date(timestamp * 1000).toISOString() : new Date().toISOString(),
			});
		}
		
		console.log(`Prepared ${transactionsToStore.length} transactions for storage`);
		
		if (transactionsToStore.length > 0) {
			const client = supabase.client;
			if (!client) {
				console.warn('Supabase client not available, skipping transaction storage');
				return;
			}
			
			console.log('Storing transactions to Supabase...');
			const { error } = await client
				.from('transactions')
				.upsert(transactionsToStore, { onConflict: 'hash' });
			
			if (error) {
				console.error('Error storing transactions:', error);
				throw error;
			}
			console.log('Successfully stored transactions to Supabase');
		} else {
			console.log('No transactions to store');
		}
	},

	// Fetch latest transactions from database
	async getLatestTransactions(limit: number = 50): Promise<TxApi[]> {
		const client = supabase.client;
		if (!client) {
			console.warn('Supabase client not available, returning empty array');
			return [];
		}
		
		const { data, error } = await client
			.from('transactions')
			.select('*')
			.order('timestamp', { ascending: false })
			.limit(limit);
		
		if (error) {
			console.error('Error fetching transactions:', error);
			throw error;
		}
		
		return data?.map(dbToApi) || [];
	},

	// Search transactions
	async searchTransactions(query: string, limit: number = 50): Promise<TxApi[]> {
		const client = supabase.client;
		if (!client) {
			console.warn('Supabase client not available, returning empty array');
			return [];
		}
		
		const { data, error } = await client
			.from('transactions')
			.select('*')
			.or(`hash.ilike.%${query}%,from_address.ilike.%${query}%,to_address.ilike.%${query}%`)
			.order('timestamp', { ascending: false })
			.limit(limit);
		
		if (error) {
			console.error('Error searching transactions:', error);
			throw error;
		}
		
		return data?.map(dbToApi) || [];
	},

	// Filter transactions by type
	async filterTransactions(filter: string, limit: number = 50): Promise<TxApi[]> {
		const client = supabase.client;
		if (!client) {
			console.warn('Supabase client not available, returning empty array');
			return [];
		}
		
		let query = client
			.from('transactions')
			.select('*')
			.order('timestamp', { ascending: false })
			.limit(limit);

		switch (filter) {
			case 'token_transfers':
				query = query.gt('value_eth', 0);
				break;
			case 'contract_calls':
				query = query.eq('value_eth', 0);
				break;
			case 'failed':
				query = query.eq('status', 'failed');
				break;
			default:
				// 'all' - no additional filter
				break;
		}

		const { data, error } = await query;
		
		if (error) {
			console.error('Error filtering transactions:', error);
			throw error;
		}
		
		return data?.map(dbToApi) || [];
	},

	// Get analytics data
	async getAnalytics() {
		const client = supabase.client;
		if (!client) {
			console.warn('Supabase client not available, returning default analytics');
			return {
				tps: 0,
				blocksPerMinute: 0,
				activeAddresses: 0,
				totalTxs: 0,
			};
		}

		const { data, error } = await client.rpc('get_analytics_data');

		if (error) {
			console.error('Error fetching analytics:', error);
			throw error;
		}

		const stats = data && data[0] ? data[0] : null;

		if (!stats) {
			return {
				tps: 0,
				blocksPerMinute: 0,
				activeAddresses: 0,
				totalTxs: 0,
			};
		}

		return {
			tps: parseFloat(stats.tps_1min) || 0,
			blocksPerMinute: parseInt(stats.blocks_1min, 10) || 0,
			activeAddresses: parseInt(stats.active_addresses_1min, 10) || 0,
			totalTxs: parseInt(stats.txs_1min, 10) || 0,
		};
	},
};

export function startPolling<T>(
	fn: () => Promise<T>,
	intervalMs: number,
	onData: (data: T) => void,
	onError?: (e: unknown) => void
) {
	let stopped = false;
	let busy = false;

	async function tick() {
		if (busy) return;
		busy = true;
		try {
			const data = await fn();
			if (!stopped) onData(data);
		} catch (e) {
			if (!stopped && onError) onError(e);
		} finally {
			busy = false;
		}
		if (!stopped) setTimeout(tick, intervalMs);
	}

	void tick();

	return () => {
		stopped = true;
	};
}
