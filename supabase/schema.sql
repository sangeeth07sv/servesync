-- Run this on a new ServeSync Supabase project.
create table if not exists public.records (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  kind text not null check (kind in ('menu','order','expense')),
  data jsonb not null,
  primary key (user_id,id)
);
create index if not exists records_user_kind_idx on public.records (user_id,kind);
alter table public.records enable row level security;
grant select, insert, update, delete on public.records to authenticated;
create policy "Owners read their records" on public.records for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners insert their records" on public.records for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners update their records" on public.records for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Owners delete their records" on public.records for delete to authenticated using ((select auth.uid()) = user_id);
