export interface Transaction {
    hash: string; // Solana signature
    from_address: string; // fee payer
    to_address: string | null; // SOL transfer recipient, null for program interactions
    value_lamports: string;
    value_sol: number;
    fee_lamports: number;
    status: string;
    block_number?: number; // slot
    block_hash?: string | null; // blockhash
    transaction_index?: number;
    gas_used?: number | null; // compute units consumed
    timestamp: string;
    input_data?: string | null; // top-level program ids, comma-separated
}
