export interface Transaction {
    hash: string;
    from_address: string;
    to_address: string;
    value_wei: string;
    value_eth: number;
    status: string;
    block_number?: number;
    block_hash?: string;
    transaction_index?: number;
    gas_used?: number;
    gas_price?: number;
    timestamp: string;
    input_data?: string;
    nonce?: number;
    type?: number;
    chain_id?: number;
}