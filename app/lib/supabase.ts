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
  hash: string; // Solana signature (base58)
  from_address: string; // fee payer
  to_address: string | null; // SOL transfer recipient, null for program interactions
  value_lamports: string;
  value_sol: number;
  fee_lamports: number | null;
  status: string;
  block_number: number; // slot
  block_hash: string | null; // blockhash
  transaction_index: number | null;
  gas_used: string | number | null; // compute units consumed
  timestamp: string;
  created_at: string;
  updated_at: string;
  input_data?: string | null; // top-level program ids, comma-separated
};
