-- ============================================================
-- Migration 002: switch from Somnia (EVM) to Solana
-- Run this in Supabase Dashboard -> SQL Editor.
--
-- Column mapping (same table, same generic names where possible):
--   hash          -> transaction signature (base58)
--   from_address  -> fee payer
--   to_address    -> SOL transfer recipient, NULL for program interactions
--   value_wei     -> value_lamports (lamports, as text)
--   value_eth     -> value_sol (SOL, float)
--   block_number  -> slot
--   block_hash    -> blockhash
--   gas_used      -> compute units consumed
--   input_data    -> top-level program ids, comma-separated
--   + fee_lamports (new)
-- EVM-only columns (gas_price, nonce, "type", chain_id) are dropped.
-- Old EVM rows are truncated: they are meaningless on the new chain.
-- ============================================================

-- 1. Clear EVM-era data
truncate public.transactions;

-- 2. Reshape columns
alter table public.transactions rename column value_wei to value_lamports;
alter table public.transactions rename column value_eth to value_sol;
alter table public.transactions add column if not exists fee_lamports bigint;

alter table public.transactions drop column if exists gas_price;
alter table public.transactions drop column if exists nonce;
alter table public.transactions drop column if exists "type";
alter table public.transactions drop column if exists chain_id;

comment on column public.transactions.hash is 'Solana transaction signature (base58)';
comment on column public.transactions.from_address is 'Fee payer';
comment on column public.transactions.to_address is 'SOL transfer recipient, NULL for program interactions';
comment on column public.transactions.value_lamports is 'Lamports moved (largest SystemProgram transfer in the tx)';
comment on column public.transactions.value_sol is 'SOL moved (lamports / 1e9)';
comment on column public.transactions.fee_lamports is 'Transaction fee in lamports';
comment on column public.transactions.block_number is 'Slot';
comment on column public.transactions.block_hash is 'Blockhash';
comment on column public.transactions.gas_used is 'Compute units consumed';
comment on column public.transactions.input_data is 'Top-level program ids, comma-separated';

-- 3. Refresh RPC functions that referenced the old column names
create or replace function public.get_top_volume(limit_count int default 5, time_interval_days int default 7)
returns table (address text, total_volume double precision)
language sql
stable
as $$
  with vols as (
    select from_address as address, value_sol
    from public.transactions
    where timestamp >= now() - (time_interval_days || ' days')::interval
    union all
    select to_address as address, value_sol
    from public.transactions
    where to_address is not null
      and timestamp >= now() - (time_interval_days || ' days')::interval
  )
  select address, sum(value_sol) as total_volume
  from vols
  group by address
  order by total_volume desc
  limit limit_count;
$$;

-- NOTE: OUT parameter renamed (total_volume_eth -> total_volume_sol), which
-- changes the row type, so OR REPLACE is rejected -> drop first.
drop function if exists public.get_address_summary(text);

create or replace function public.get_address_summary(target_address text)
returns table (total_sent_txs bigint, total_received_txs bigint, total_volume_sol double precision)
language sql
stable
as $$
  select
    (select count(*) from public.transactions where lower(from_address) = lower(target_address)) as total_sent_txs,
    (select count(*) from public.transactions where to_address is not null and lower(to_address) = lower(target_address)) as total_received_txs,
    (select coalesce(sum(value_sol), 0) from public.transactions
      where lower(from_address) = lower(target_address)
         or (to_address is not null and lower(to_address) = lower(target_address))) as total_volume_sol;
$$;
