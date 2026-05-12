create table if not exists public.homes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  address text not null,
  property_type text not null,
  year_built integer not null check (year_built between 1600 and 2100),
  square_meters numeric(8, 1) not null check (square_meters > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homes enable row level security;

drop policy if exists "Users can read their own homes" on public.homes;
create policy "Users can read their own homes"
on public.homes
for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "Users can create their own homes" on public.homes;
create policy "Users can create their own homes"
on public.homes
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "Users can update their own homes" on public.homes;
create policy "Users can update their own homes"
on public.homes
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Users can delete their own homes" on public.homes;
create policy "Users can delete their own homes"
on public.homes
for delete
to authenticated
using (auth.uid() = owner_id);
