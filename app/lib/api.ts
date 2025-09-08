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
	inputData?: string;
	nonce?: number;
	type?: string;
	chainId?: number;
};

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
		from: tx.from_address,
		to: tx.to_address ? tx.to_address : null,
		status: tx.status as "success" | "pending" | "failed",
		value: `${tx.value_eth} ETH`,
		blockNumber: tx.block_number,
		timestamp: tx.timestamp,
		gasUsed: tx.gas_used?.toString(),
		gasPrice: tx.gas_price?.toString(),
		inputData: tx.input_data || undefined,
		nonce: tx.nonce || undefined,
		type: tx.type?.toString() || undefined,
		chainId: tx.chain_id || undefined,
	};
}

export const api = {
	// Fetch latest transactions from database
	async getLatestTransactions(limit: number = 50, offset: number = 0): Promise<TxApi[]> {
		const client = supabase.client;
		if (!client) {
			console.warn('Supabase client not available, returning empty array');
			return [];
		}
		
		const { data, error } = await client
			.from('transactions')
			.select('*')
			.order('timestamp', { ascending: false })
			.limit(limit)
			.range(offset, offset + limit - 1); // Use range for offset
		
		if (error) {
			console.error('Error fetching transactions:', error);
			throw error;
		}
		
		return data?.map(dbToApi) || [];
	},

	// Search transactions
	async searchTransactions(query: string, limit: number = 50, offset: number = 0): Promise<TxApi[]> {
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
			.limit(limit)
			.range(offset, offset + limit - 1); // Use range for offset
		
		if (error) {
			console.error('Error searching transactions:', error);
			throw error;
		}
		
		return data?.map(dbToApi) || [];
	},

	// Filter transactions by type
	async filterTransactions(filter: string, limit: number = 50, offset: number = 0): Promise<TxApi[]> {
		const client = supabase.client;
		if (!client) {
			console.warn('Supabase client not available, returning empty array');
			return [];
		}
		
		let query = client
			.from('transactions')
			.select('*')
			.order('timestamp', { ascending: false })
			.limit(limit)
			.range(offset, offset + limit - 1); // Use range for offset

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

	// Get a single transaction by its full hash
	async getTxByFullHash(hash: string): Promise<TxApi | null> {
		const client = supabase.client;
		if (!client) {
			console.warn('Supabase client not available, returning null');
			return null;
		}

		const { data, error } = await client
			.from('transactions')
			.select('*')
			.eq('hash', hash)
			.single();

		if (error) {
			console.error(`Error fetching transaction ${hash}:`, error);
			// If no row is found, Supabase returns an error. We should handle this gracefully.
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}

		return data ? dbToApi(data) : null;
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

	// Get transaction volume for the last 24 hours
	async getTransactionVolume() {
		const client = supabase.client;
		if (!client) {
			console.warn('Supabase client not available, returning empty array');
			return [];
		}

		const { data, error } = await client.rpc('get_transaction_volume');

		if (error) {
			console.error('Error fetching transaction volume:', error);
			throw error;
		}

				return data || [];
	},

	// Leaderboard APIs
	async getTopSenders(limit: number = 5, timeFilter: number = 7) {
		const client = supabase.client;
		if (!client) return [];
		const { data, error } = await client.rpc('get_top_senders', { limit_count: limit, time_interval_days: timeFilter });
		if (error) {
			console.error('Error fetching top senders:', error);
			throw error;
		}
		return data || [];
	},

	async getTopReceivers(limit: number = 5, timeFilter: number = 7) {
		const client = supabase.client;
		if (!client) return [];
		const { data, error } = await client.rpc('get_top_receivers', { limit_count: limit, time_interval_days: timeFilter });
		if (error) {
			console.error('Error fetching top receivers:', error);
			throw error;
		}
		return data || [];
	},

	async getTopVolume(limit: number = 5, timeFilter: number = 7) {
		const client = supabase.client;
		if (!client) return [];
		const { data, error } = await client.rpc('get_top_volume', { limit_count: limit, time_interval_days: timeFilter });
		if (error) {
			console.error('Error fetching top volume:', error);
			throw error;
		}
		return data || [];
	},

	// Address Details APIs
	async getAddressSummary(address: string) {
		const client = supabase.client;
		if (!client) return null;
		const { data, error } = await client.rpc('get_address_summary', { target_address: address });
		if (error) {
			console.error(`Error fetching summary for ${address}:`, error);
			throw error;
		}
		return data && data.length > 0 ? data[0] : null;
	},

	async getTransactionsForAddress(address: string, limit: number = 50, offset: number = 0): Promise<TxApi[]> {
		const client = supabase.client;
		if (!client) return [];
		const { data, error } = await client.rpc('get_transactions_for_address', { target_address: address, limit_count: limit, offset_count: offset });
		if (error) {
			console.error(`Error fetching transactions for ${address}:`, error);
			throw error;
		}
		return data?.map(dbToApi) || [];
	},
};