import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;

function getSupabaseClient() {
	if (!supabaseClient) {
		const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL ?? "";
		const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_KEY ?? "";

		if (!supabaseUrl || !supabaseKey) {
			console.warn('Supabase environment variables not found. Database features will be disabled.');
			return null;
		}

		supabaseClient = createClient(supabaseUrl, supabaseKey);
	}
	return supabaseClient;
}

export const supabase = {
	get client() {
		return getSupabaseClient();
	}
};

export type Transaction = {
  id: string;
  hash: string;
  from_address: string;
  to_address: string | null;
  value_wei: string;
  value_eth: number;
  status: string;
  block_number: number;
  block_hash: string | null;
  transaction_index: number | null;
  gas_used: string | null;
  gas_price: string | null;
  timestamp: string;
  created_at: string;
  updated_at: string;
};
