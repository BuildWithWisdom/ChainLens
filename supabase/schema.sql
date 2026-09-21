-- ============================================================
-- ChainLens Supabase setup (Solana)
-- Paste this whole file into Supabase Dashboard -> SQL Editor -> New query -> Run
-- It creates the transactions table, indexes, read policies,
-- and all RPC functions used by app/lib/api.ts
--
-- Column mapping:
--   hash          -> transaction signature (base58)
--   from_address  -> fee payer
--   to_address    -> SOL transfer recipient, NULL for program interactions
--   value_lamports-> lamports moved (largest SystemProgram transfer in the tx)
--   value_sol     -> SOL moved (lamports / 1e9)
--   fee_lamports  -> transaction fee in lamports
--   block_number  -> slot
--   block_hash    -> blockhash
--   gas_used      -> compute units consumed
--   input_data    -> top-level program ids, comma-separated
-- ============================================================

-- ---------- 1. Table ----------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  hash text unique not null,
  from_address text not null,
  to_address text,
  value_lamports text not null default '0',
  value_sol double precision not null default 0,
  fee_lamports bigint,
  status text not null default 'success',
  block_number bigint,
  block_hash text,
  transaction_index integer,
  gas_used bigint,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  input_data text
);

-- ---------- 2. Indexes (keeps feed / search / address pages fast) ----------
create index if not exists idx_transactions_timestamp on public.transactions (timestamp desc);
create index if not exists idx_transactions_from on public.transactions (from_address);
create index if not exists idx_transactions_to on public.transactions (to_address);
create index if not exists idx_transactions_block on public.transactions (block_number desc);

-- ---------- 3. Row Level Security ----------
-- Frontend uses the PUBLISHABLE key: read-only access.
-- The NestJS indexer uses the SECRET key, which bypasses RLS for writes.
alter table public.transactions enable row level security;

drop policy if exists "public read transactions" on public.transactions;
create policy "public read transactions"
  on public.transactions for select
  using (true);

-- ---------- 4. RPC: analytics (last 1 minute) ----------
-- Used by: api.getAnalytics()
create or replace function public.get_analytics_data()
returns table (tps_1min numeric, blocks_1min bigint, active_addresses_1min bigint, txs_1min bigint)
language sql
stable
as $$
  with recent as (
    select block_number, from_address, to_address
    from public.transactions
    where timestamp >= now() - interval '1 minute'
  )
  select
    round((select count(*)::numeric from recent) / 60, 2) as tps_1min,
    (select count(distinct block_number) from recent) as blocks_1min,
    (select count(*) from (
      select from_address as addr from recent
      union
      select to_address from recent where to_address is not null
    ) addrs) as active_addresses_1min,
    (select count(*) from recent) as txs_1min;
$$;

-- ---------- 5. RPC: hourly volume (last 24h) ----------
-- Used by: api.getTransactionVolume()
create or replace function public.get_transaction_volume()
returns table ("hour" timestamptz, transaction_count bigint)
language sql
stable
as $$
  select date_trunc('hour', timestamp) as "hour", count(*) as transaction_count
  from public.transactions
  where timestamp >= date_trunc('hour', now()) - interval '24 hours'
  group by 1
  order by 1;
$$;

-- ---------- 6. RPC: leaderboards ----------
-- Used by: api.getTopSenders / getTopReceivers / getTopVolume
create or replace function public.get_top_senders(limit_count int default 5, time_interval_days int default 7)
returns table (address text, tx_count bigint)
language sql
stable
as $$
  select from_address as address, count(*) as tx_count
  from public.transactions
  where timestamp >= now() - (time_interval_days || ' days')::interval
  group by from_address
  order by tx_count desc
  limit limit_count;
$$;

create or replace function public.get_top_receivers(limit_count int default 5, time_interval_days int default 7)
returns table (address text, tx_count bigint)
language sql
stable
as $$
  select to_address as address, count(*) as tx_count
  from public.transactions
  where to_address is not null
    and timestamp >= now() - (time_interval_days || ' days')::interval
  group by to_address
  order by tx_count desc
  limit limit_count;
$$;

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

-- ---------- 7. RPC: address page ----------
-- Used by: api.getAddressSummary / api.getTransactionsForAddress
-- NOTE: drops first so re-running this file on a DB created from the old
-- (EVM) schema doesn't fail with "cannot change return type" (42P13).
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

create or replace function public.get_transactions_for_address(target_address text, limit_count int default 50, offset_count int default 0)
returns setof public.transactions
language sql
stable
as $$
  select *
  from public.transactions
  where lower(from_address) = lower(target_address)
     or (to_address is not null and lower(to_address) = lower(target_address))
  order by timestamp desc
  limit limit_count
  offset offset_count;
$$;

-- ---------- 8. Optional: manual retention cleanup ----------
-- The backend runs this automatically (see TX_RETENTION_DAYS, default 3),
-- but you can also run it by hand to trim the table any time:
-- delete from public.transactions where timestamp < now() - interval '3 days';
