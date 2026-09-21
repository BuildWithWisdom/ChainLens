-- ============================================================
-- Migration 001: widen gas columns
-- Run this in Supabase Dashboard -> SQL Editor if the indexer logs:
--   value "..." is out of range for type integer
-- Older tables defined gas_used / gas_price as integer, but Somnia
-- gas values exceed the 32-bit integer range.
-- Safe to run on new databases too (no-op there).
-- ============================================================

alter table public.transactions alter column gas_used type bigint;
alter table public.transactions alter column gas_price type numeric;
