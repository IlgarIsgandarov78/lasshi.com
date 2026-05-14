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

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  room_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rooms_home_id_idx on public.rooms(home_id);
create index if not exists rooms_owner_id_idx on public.rooms(owner_id);

alter table public.rooms enable row level security;

drop policy if exists "Users can read rooms in their own homes" on public.rooms;
create policy "Users can read rooms in their own homes"
on public.rooms
for select
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = rooms.home_id
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can create rooms in their own homes" on public.rooms;
create policy "Users can create rooms in their own homes"
on public.rooms
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = rooms.home_id
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can update rooms in their own homes" on public.rooms;
create policy "Users can update rooms in their own homes"
on public.rooms
for update
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = rooms.home_id
      and homes.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = rooms.home_id
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can delete rooms in their own homes" on public.rooms;
create policy "Users can delete rooms in their own homes"
on public.rooms
for delete
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = rooms.home_id
      and homes.owner_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'room-documents',
  'room-documents',
  false,
  20971520,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.room_documents (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  document_type text not null,
  file_name text not null,
  file_size bigint not null check (file_size > 0),
  mime_type text not null,
  storage_bucket text not null default 'room-documents',
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists room_documents_home_id_idx on public.room_documents(home_id);
create index if not exists room_documents_room_id_idx on public.room_documents(room_id);
create index if not exists room_documents_owner_id_idx on public.room_documents(owner_id);

alter table public.room_documents enable row level security;

drop policy if exists "Users can read documents in their own rooms" on public.room_documents;
create policy "Users can read documents in their own rooms"
on public.room_documents
for select
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_documents.room_id
      and rooms.home_id = room_documents.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can create documents in their own rooms" on public.room_documents;
create policy "Users can create documents in their own rooms"
on public.room_documents
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and storage_bucket = 'room-documents'
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_documents.room_id
      and rooms.home_id = room_documents.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can update documents in their own rooms" on public.room_documents;
create policy "Users can update documents in their own rooms"
on public.room_documents
for update
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_documents.room_id
      and rooms.home_id = room_documents.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = owner_id
  and storage_bucket = 'room-documents'
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_documents.room_id
      and rooms.home_id = room_documents.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can delete documents in their own rooms" on public.room_documents;
create policy "Users can delete documents in their own rooms"
on public.room_documents
for delete
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_documents.room_id
      and rooms.home_id = room_documents.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can upload their own room documents" on storage.objects;
create policy "Users can upload their own room documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'room-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can read their own room documents" on storage.objects;
create policy "Users can read their own room documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'room-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own room documents" on storage.objects;
create policy "Users can delete their own room documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'room-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  event_date date not null,
  event_type text not null,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists timeline_events_home_id_idx on public.timeline_events(home_id);
create index if not exists timeline_events_room_id_idx on public.timeline_events(room_id);
create index if not exists timeline_events_owner_id_idx on public.timeline_events(owner_id);
create index if not exists timeline_events_event_date_idx on public.timeline_events(event_date desc);

alter table public.timeline_events enable row level security;

drop policy if exists "Users can read timeline events for their own homes" on public.timeline_events;
create policy "Users can read timeline events for their own homes"
on public.timeline_events
for select
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = timeline_events.home_id
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can create timeline events for their own homes" on public.timeline_events;
create policy "Users can create timeline events for their own homes"
on public.timeline_events
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = timeline_events.home_id
      and homes.owner_id = auth.uid()
  )
  and (
    room_id is null
    or exists (
      select 1
      from public.rooms
      where rooms.id = timeline_events.room_id
        and rooms.home_id = timeline_events.home_id
        and rooms.owner_id = auth.uid()
    )
  )
);

drop policy if exists "Users can update timeline events for their own homes" on public.timeline_events;
create policy "Users can update timeline events for their own homes"
on public.timeline_events
for update
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = timeline_events.home_id
      and homes.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = timeline_events.home_id
      and homes.owner_id = auth.uid()
  )
  and (
    room_id is null
    or exists (
      select 1
      from public.rooms
      where rooms.id = timeline_events.room_id
        and rooms.home_id = timeline_events.home_id
        and rooms.owner_id = auth.uid()
    )
  )
);

drop policy if exists "Users can delete timeline events for their own homes" on public.timeline_events;
create policy "Users can delete timeline events for their own homes"
on public.timeline_events
for delete
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = timeline_events.home_id
      and homes.owner_id = auth.uid()
  )
);

create table if not exists public.room_infrastructure (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  infrastructure_type text not null,
  title text not null,
  location_note text not null,
  risk_level text not null check (risk_level in ('Low', 'Medium', 'High')),
  confidence_level text not null check (confidence_level in ('Low', 'Medium', 'High')),
  source_document_id uuid references public.room_documents(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists room_infrastructure_home_id_idx on public.room_infrastructure(home_id);
create index if not exists room_infrastructure_room_id_idx on public.room_infrastructure(room_id);
create index if not exists room_infrastructure_owner_id_idx on public.room_infrastructure(owner_id);
create index if not exists room_infrastructure_source_document_id_idx on public.room_infrastructure(source_document_id);

alter table public.room_infrastructure enable row level security;

drop policy if exists "Users can read infrastructure in their own rooms" on public.room_infrastructure;
create policy "Users can read infrastructure in their own rooms"
on public.room_infrastructure
for select
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_infrastructure.room_id
      and rooms.home_id = room_infrastructure.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can create infrastructure in their own rooms" on public.room_infrastructure;
create policy "Users can create infrastructure in their own rooms"
on public.room_infrastructure
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_infrastructure.room_id
      and rooms.home_id = room_infrastructure.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
  and (
    source_document_id is null
    or exists (
      select 1
      from public.room_documents
      where room_documents.id = room_infrastructure.source_document_id
        and room_documents.home_id = room_infrastructure.home_id
        and room_documents.room_id = room_infrastructure.room_id
        and room_documents.owner_id = auth.uid()
    )
  )
);

drop policy if exists "Users can update infrastructure in their own rooms" on public.room_infrastructure;
create policy "Users can update infrastructure in their own rooms"
on public.room_infrastructure
for update
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_infrastructure.room_id
      and rooms.home_id = room_infrastructure.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_infrastructure.room_id
      and rooms.home_id = room_infrastructure.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
  and (
    source_document_id is null
    or exists (
      select 1
      from public.room_documents
      where room_documents.id = room_infrastructure.source_document_id
        and room_documents.home_id = room_infrastructure.home_id
        and room_documents.room_id = room_infrastructure.room_id
        and room_documents.owner_id = auth.uid()
    )
  )
);

drop policy if exists "Users can delete infrastructure in their own rooms" on public.room_infrastructure;
create policy "Users can delete infrastructure in their own rooms"
on public.room_infrastructure
for delete
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_infrastructure.room_id
      and rooms.home_id = room_infrastructure.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

create table if not exists public.timeline_event_documents (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  event_id uuid not null references public.timeline_events(id) on delete cascade,
  document_id uuid not null references public.room_documents(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, document_id)
);

create index if not exists timeline_event_documents_home_id_idx on public.timeline_event_documents(home_id);
create index if not exists timeline_event_documents_event_id_idx on public.timeline_event_documents(event_id);
create index if not exists timeline_event_documents_document_id_idx on public.timeline_event_documents(document_id);
create index if not exists timeline_event_documents_owner_id_idx on public.timeline_event_documents(owner_id);

alter table public.timeline_event_documents enable row level security;

drop policy if exists "Users can read timeline evidence for their own homes" on public.timeline_event_documents;
create policy "Users can read timeline evidence for their own homes"
on public.timeline_event_documents
for select
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.timeline_events
    join public.homes on homes.id = timeline_events.home_id
    where timeline_events.id = timeline_event_documents.event_id
      and timeline_events.home_id = timeline_event_documents.home_id
      and timeline_events.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
  and exists (
    select 1
    from public.room_documents
    where room_documents.id = timeline_event_documents.document_id
      and room_documents.home_id = timeline_event_documents.home_id
      and room_documents.owner_id = auth.uid()
  )
);

drop policy if exists "Users can create timeline evidence for their own homes" on public.timeline_event_documents;
create policy "Users can create timeline evidence for their own homes"
on public.timeline_event_documents
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.timeline_events
    join public.homes on homes.id = timeline_events.home_id
    where timeline_events.id = timeline_event_documents.event_id
      and timeline_events.home_id = timeline_event_documents.home_id
      and timeline_events.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
  and exists (
    select 1
    from public.room_documents
    where room_documents.id = timeline_event_documents.document_id
      and room_documents.home_id = timeline_event_documents.home_id
      and room_documents.owner_id = auth.uid()
  )
);

drop policy if exists "Users can delete timeline evidence for their own homes" on public.timeline_event_documents;
create policy "Users can delete timeline evidence for their own homes"
on public.timeline_event_documents
for delete
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.timeline_events
    join public.homes on homes.id = timeline_events.home_id
    where timeline_events.id = timeline_event_documents.event_id
      and timeline_events.home_id = timeline_event_documents.home_id
      and timeline_events.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

create table if not exists public.home_floors (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (home_id, name)
);

create index if not exists home_floors_home_id_idx on public.home_floors(home_id);
create index if not exists home_floors_owner_id_idx on public.home_floors(owner_id);

alter table public.home_floors enable row level security;

drop policy if exists "Users can read floors for their own homes" on public.home_floors;
create policy "Users can read floors for their own homes"
on public.home_floors
for select
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = home_floors.home_id
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can create floors for their own homes" on public.home_floors;
create policy "Users can create floors for their own homes"
on public.home_floors
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = home_floors.home_id
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can update floors for their own homes" on public.home_floors;
create policy "Users can update floors for their own homes"
on public.home_floors
for update
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = home_floors.home_id
      and homes.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = home_floors.home_id
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can delete floors for their own homes" on public.home_floors;
create policy "Users can delete floors for their own homes"
on public.home_floors
for delete
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.homes
    where homes.id = home_floors.home_id
      and homes.owner_id = auth.uid()
  )
);

create table if not exists public.room_layouts (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  x numeric(6, 2) not null check (x >= 0 and x <= 100),
  y numeric(6, 2) not null check (y >= 0 and y <= 100),
  width numeric(6, 2) not null check (width > 0 and width <= 100),
  height numeric(6, 2) not null check (height > 0 and height <= 100),
  floor_name text not null default 'Main Floor',
  dimensions_label text,
  plan_features jsonb not null default '{"openings":[],"fixtures":[]}'::jsonb,
  baseline_layout jsonb,
  baseline_features jsonb not null default '{"openings":[],"fixtures":[]}'::jsonb,
  baseline_source text not null default 'manual' check (baseline_source in ('manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id)
);

alter table public.room_layouts
  add column if not exists floor_name text not null default 'Main Floor',
  add column if not exists dimensions_label text,
  add column if not exists plan_features jsonb not null default '{"openings":[],"fixtures":[]}'::jsonb,
  add column if not exists baseline_layout jsonb,
  add column if not exists baseline_features jsonb not null default '{"openings":[],"fixtures":[]}'::jsonb,
  add column if not exists baseline_source text not null default 'manual';

alter table public.room_layouts
  drop constraint if exists room_layouts_baseline_source_check;

alter table public.room_layouts
  add constraint room_layouts_baseline_source_check check (baseline_source in ('manual'));

create index if not exists room_layouts_home_id_idx on public.room_layouts(home_id);
create index if not exists room_layouts_room_id_idx on public.room_layouts(room_id);
create index if not exists room_layouts_owner_id_idx on public.room_layouts(owner_id);

alter table public.room_layouts enable row level security;

drop policy if exists "Users can read layouts for their own homes" on public.room_layouts;
create policy "Users can read layouts for their own homes"
on public.room_layouts
for select
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_layouts.room_id
      and rooms.home_id = room_layouts.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can create layouts for their own homes" on public.room_layouts;
create policy "Users can create layouts for their own homes"
on public.room_layouts
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_layouts.room_id
      and rooms.home_id = room_layouts.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can update layouts for their own homes" on public.room_layouts;
create policy "Users can update layouts for their own homes"
on public.room_layouts
for update
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_layouts.room_id
      and rooms.home_id = room_layouts.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_layouts.room_id
      and rooms.home_id = room_layouts.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Users can delete layouts for their own homes" on public.room_layouts;
create policy "Users can delete layouts for their own homes"
on public.room_layouts
for delete
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = room_layouts.room_id
      and rooms.home_id = room_layouts.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  account_type text not null default 'consumer' check (account_type in ('consumer', 'contractor')),
  trade_type text,
  company_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  add column if not exists email text,
  add column if not exists full_name text not null default '',
  add column if not exists account_type text not null default 'consumer',
  add column if not exists trade_type text,
  add column if not exists company_name text,
  add column if not exists phone text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.user_profiles
  drop constraint if exists user_profiles_account_type_check;

alter table public.user_profiles
  add constraint user_profiles_account_type_check check (account_type in ('consumer', 'contractor'));

create unique index if not exists user_profiles_email_lower_idx
on public.user_profiles (lower(email))
where email is not null;

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.user_profiles;
create policy "Users can read their own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own profile" on public.user_profiles;
create policy "Users can create their own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    user_id,
    email,
    full_name,
    account_type,
    trade_type,
    company_name
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'account_type', ''), 'consumer'),
    nullif(new.raw_user_meta_data ->> 'trade_type', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', '')
  )
  on conflict (user_id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    account_type = excluded.account_type,
    trade_type = excluded.trade_type,
    company_name = excluded.company_name,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create table if not exists public.contractor_room_access (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contractor_id uuid references auth.users(id) on delete set null,
  contractor_email text not null,
  contractor_name text,
  trade_type text not null default 'General',
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  work_scope text not null,
  access_note text,
  status text not null default 'active' check (status in ('pending', 'active', 'paused', 'revoked', 'completed')),
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (contractor_email = lower(contractor_email)),
  check (length(trim(contractor_email)) > 3)
);

alter table public.contractor_room_access
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists contractor_id uuid references auth.users(id) on delete set null,
  add column if not exists contractor_email text,
  add column if not exists contractor_name text,
  add column if not exists trade_type text not null default 'General',
  add column if not exists home_id uuid references public.homes(id) on delete cascade,
  add column if not exists room_id uuid references public.rooms(id) on delete cascade,
  add column if not exists work_scope text not null default '',
  add column if not exists access_note text,
  add column if not exists status text not null default 'active',
  add column if not exists starts_on date,
  add column if not exists ends_on date,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.contractor_room_access
  drop constraint if exists contractor_room_access_status_check;

alter table public.contractor_room_access
  add constraint contractor_room_access_status_check check (status in ('pending', 'active', 'paused', 'revoked', 'completed'));

create index if not exists contractor_room_access_owner_id_idx on public.contractor_room_access(owner_id);
create index if not exists contractor_room_access_contractor_id_idx on public.contractor_room_access(contractor_id);
create index if not exists contractor_room_access_home_id_idx on public.contractor_room_access(home_id);
create index if not exists contractor_room_access_room_id_idx on public.contractor_room_access(room_id);
create index if not exists contractor_room_access_contractor_email_idx on public.contractor_room_access(lower(contractor_email));

create unique index if not exists contractor_room_access_active_room_idx
on public.contractor_room_access (lower(contractor_email), room_id)
where status in ('pending', 'active', 'paused');

alter table public.contractor_room_access enable row level security;

drop policy if exists "Owners can read room access they created" on public.contractor_room_access;
create policy "Owners can read room access they created"
on public.contractor_room_access
for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "Contractors can read assigned room access" on public.contractor_room_access;
create policy "Contractors can read assigned room access"
on public.contractor_room_access
for select
to authenticated
using (
  status <> 'revoked'
  and (
    contractor_id = auth.uid()
    or lower(contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Owners can create room access for their homes" on public.contractor_room_access;
create policy "Owners can create room access for their homes"
on public.contractor_room_access
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and contractor_email = lower(contractor_email)
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = contractor_room_access.room_id
      and rooms.home_id = contractor_room_access.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can update room access they created" on public.contractor_room_access;
create policy "Owners can update room access they created"
on public.contractor_room_access
for update
to authenticated
using (auth.uid() = owner_id)
with check (
  auth.uid() = owner_id
  and contractor_email = lower(contractor_email)
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = contractor_room_access.room_id
      and rooms.home_id = contractor_room_access.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can delete room access they created" on public.contractor_room_access;
create policy "Owners can delete room access they created"
on public.contractor_room_access
for delete
to authenticated
using (auth.uid() = owner_id);

create or replace function public.has_contractor_room_access(p_home_id uuid, p_room_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.contractor_room_access shared_access
    where shared_access.home_id = p_home_id
      and (p_room_id is null or shared_access.room_id = p_room_id)
      and shared_access.status in ('pending', 'active', 'paused')
      and (
        shared_access.contractor_id = auth.uid()
        or lower(shared_access.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

revoke all on function public.has_contractor_room_access(uuid, uuid) from public;
grant execute on function public.has_contractor_room_access(uuid, uuid) to authenticated;

create table if not exists public.contractor_work_updates (
  id uuid primary key default gen_random_uuid(),
  access_id uuid not null references public.contractor_room_access(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  contractor_id uuid not null references auth.users(id) on delete cascade,
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  update_type text not null check (update_type in ('Visit note', 'Progress', 'Issue', 'Material', 'Completion', 'Question')),
  work_status text not null default 'In progress' check (work_status in ('Planned', 'In progress', 'Blocked', 'Done')),
  title text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contractor_work_updates
  add column if not exists access_id uuid references public.contractor_room_access(id) on delete cascade,
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists contractor_id uuid references auth.users(id) on delete cascade,
  add column if not exists home_id uuid references public.homes(id) on delete cascade,
  add column if not exists room_id uuid references public.rooms(id) on delete cascade,
  add column if not exists update_type text not null default 'Progress',
  add column if not exists work_status text not null default 'In progress',
  add column if not exists title text not null default '',
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.contractor_work_updates
  drop constraint if exists contractor_work_updates_update_type_check,
  drop constraint if exists contractor_work_updates_work_status_check;

alter table public.contractor_work_updates
  add constraint contractor_work_updates_update_type_check check (update_type in ('Visit note', 'Progress', 'Issue', 'Material', 'Completion', 'Question')),
  add constraint contractor_work_updates_work_status_check check (work_status in ('Planned', 'In progress', 'Blocked', 'Done'));

create index if not exists contractor_work_updates_access_id_idx on public.contractor_work_updates(access_id);
create index if not exists contractor_work_updates_owner_id_idx on public.contractor_work_updates(owner_id);
create index if not exists contractor_work_updates_contractor_id_idx on public.contractor_work_updates(contractor_id);
create index if not exists contractor_work_updates_home_id_idx on public.contractor_work_updates(home_id);
create index if not exists contractor_work_updates_room_id_idx on public.contractor_work_updates(room_id);

alter table public.contractor_work_updates enable row level security;

drop policy if exists "Owners can read contractor work updates" on public.contractor_work_updates;
create policy "Owners can read contractor work updates"
on public.contractor_work_updates
for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "Contractors can read their work updates" on public.contractor_work_updates;
create policy "Contractors can read their work updates"
on public.contractor_work_updates
for select
to authenticated
using (
  contractor_id = auth.uid()
  or exists (
    select 1
    from public.contractor_room_access shared_access
    where shared_access.id = contractor_work_updates.access_id
      and shared_access.status <> 'revoked'
      and lower(shared_access.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Contractors can create work updates for assigned rooms" on public.contractor_work_updates;
create policy "Contractors can create work updates for assigned rooms"
on public.contractor_work_updates
for insert
to authenticated
with check (
  contractor_id = auth.uid()
  and exists (
    select 1
    from public.contractor_room_access shared_access
    where shared_access.id = contractor_work_updates.access_id
      and shared_access.owner_id = contractor_work_updates.owner_id
      and shared_access.home_id = contractor_work_updates.home_id
      and shared_access.room_id = contractor_work_updates.room_id
      and shared_access.status in ('pending', 'active', 'paused')
      and (
        shared_access.contractor_id = auth.uid()
        or lower(shared_access.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

drop policy if exists "Contractors can update their own work updates" on public.contractor_work_updates;
create policy "Contractors can update their own work updates"
on public.contractor_work_updates
for update
to authenticated
using (contractor_id = auth.uid())
with check (contractor_id = auth.uid());

drop policy if exists "Owners and contractors can delete work updates" on public.contractor_work_updates;
create policy "Owners and contractors can delete work updates"
on public.contractor_work_updates
for delete
to authenticated
using (owner_id = auth.uid() or contractor_id = auth.uid());

drop policy if exists "Users can read their own homes" on public.homes;
create policy "Users can read their own homes"
on public.homes
for select
to authenticated
using (
  auth.uid() = owner_id
  or public.has_contractor_room_access(homes.id, null)
);

drop policy if exists "Users can read rooms in their own homes" on public.rooms;
create policy "Users can read rooms in their own homes"
on public.rooms
for select
to authenticated
using (
  (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.homes
      where homes.id = rooms.home_id
        and homes.owner_id = auth.uid()
    )
  )
  or public.has_contractor_room_access(rooms.home_id, rooms.id)
);

drop policy if exists "Users can read documents in their own rooms" on public.room_documents;
create policy "Users can read documents in their own rooms"
on public.room_documents
for select
to authenticated
using (
  (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.rooms
      join public.homes on homes.id = rooms.home_id
      where rooms.id = room_documents.room_id
        and rooms.home_id = room_documents.home_id
        and rooms.owner_id = auth.uid()
        and homes.owner_id = auth.uid()
    )
  )
  or public.has_contractor_room_access(room_documents.home_id, room_documents.room_id)
);

drop policy if exists "Contractors can read shared room document files" on storage.objects;
create policy "Contractors can read shared room document files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'room-documents'
  and exists (
    select 1
    from public.room_documents
    where room_documents.storage_path = name
      and public.has_contractor_room_access(room_documents.home_id, room_documents.room_id)
  )
);

drop policy if exists "Users can read timeline events for their own homes" on public.timeline_events;
create policy "Users can read timeline events for their own homes"
on public.timeline_events
for select
to authenticated
using (
  (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.homes
      where homes.id = timeline_events.home_id
        and homes.owner_id = auth.uid()
    )
  )
  or public.has_contractor_room_access(timeline_events.home_id, timeline_events.room_id)
);

drop policy if exists "Users can read infrastructure in their own rooms" on public.room_infrastructure;
create policy "Users can read infrastructure in their own rooms"
on public.room_infrastructure
for select
to authenticated
using (
  (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.rooms
      join public.homes on homes.id = rooms.home_id
      where rooms.id = room_infrastructure.room_id
        and rooms.home_id = room_infrastructure.home_id
        and rooms.owner_id = auth.uid()
        and homes.owner_id = auth.uid()
    )
  )
  or public.has_contractor_room_access(room_infrastructure.home_id, room_infrastructure.room_id)
);

drop policy if exists "Users can read timeline evidence for their own homes" on public.timeline_event_documents;
create policy "Users can read timeline evidence for their own homes"
on public.timeline_event_documents
for select
to authenticated
using (
  (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.timeline_events
      join public.homes on homes.id = timeline_events.home_id
      where timeline_events.id = timeline_event_documents.event_id
        and timeline_events.home_id = timeline_event_documents.home_id
        and timeline_events.owner_id = auth.uid()
        and homes.owner_id = auth.uid()
    )
    and exists (
      select 1
      from public.room_documents
      where room_documents.id = timeline_event_documents.document_id
        and room_documents.home_id = timeline_event_documents.home_id
        and room_documents.owner_id = auth.uid()
    )
  )
  or exists (
    select 1
    from public.timeline_events
    where timeline_events.id = timeline_event_documents.event_id
      and timeline_events.home_id = timeline_event_documents.home_id
      and public.has_contractor_room_access(timeline_events.home_id, timeline_events.room_id)
  )
);

drop policy if exists "Users can read floors for their own homes" on public.home_floors;
create policy "Users can read floors for their own homes"
on public.home_floors
for select
to authenticated
using (
  (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.homes
      where homes.id = home_floors.home_id
        and homes.owner_id = auth.uid()
    )
  )
  or public.has_contractor_room_access(home_floors.home_id, null)
);

drop policy if exists "Users can read layouts for their own homes" on public.room_layouts;
create policy "Users can read layouts for their own homes"
on public.room_layouts
for select
to authenticated
using (
  (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.rooms
      join public.homes on homes.id = rooms.home_id
      where rooms.id = room_layouts.room_id
        and rooms.home_id = room_layouts.home_id
        and rooms.owner_id = auth.uid()
        and homes.owner_id = auth.uid()
    )
  )
  or public.has_contractor_room_access(room_layouts.home_id, room_layouts.room_id)
);

alter table public.user_profiles
  add column if not exists certifications text,
  add column if not exists service_area text,
  add column if not exists website text,
  add column if not exists past_work_summary text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'work-documentation',
  'work-documentation',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'audio/mpeg',
    'audio/mp4',
    'audio/aac',
    'audio/wav',
    'audio/webm',
    'video/webm',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.trade_contacts (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  requester_email text not null,
  requester_name text,
  requester_trade_type text,
  requester_company_name text,
  recipient_id uuid references auth.users(id) on delete set null,
  recipient_email text not null,
  recipient_name text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_email = lower(requester_email)),
  check (recipient_email = lower(recipient_email))
);

alter table public.trade_contacts
  add column if not exists requester_id uuid references auth.users(id) on delete cascade,
  add column if not exists requester_email text,
  add column if not exists requester_name text,
  add column if not exists requester_trade_type text,
  add column if not exists requester_company_name text,
  add column if not exists recipient_id uuid references auth.users(id) on delete set null,
  add column if not exists recipient_email text,
  add column if not exists recipient_name text,
  add column if not exists message text,
  add column if not exists status text not null default 'pending',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.trade_contacts
  drop constraint if exists trade_contacts_status_check;

alter table public.trade_contacts
  add constraint trade_contacts_status_check check (status in ('pending', 'accepted', 'declined', 'blocked'));

create unique index if not exists trade_contacts_request_pair_idx
on public.trade_contacts (requester_id, lower(recipient_email));

create index if not exists trade_contacts_recipient_email_idx on public.trade_contacts(lower(recipient_email));
create index if not exists trade_contacts_recipient_id_idx on public.trade_contacts(recipient_id);
create index if not exists trade_contacts_status_idx on public.trade_contacts(status);

alter table public.trade_contacts enable row level security;

drop policy if exists "Trade contacts are visible to both sides" on public.trade_contacts;
create policy "Trade contacts are visible to both sides"
on public.trade_contacts
for select
to authenticated
using (
  requester_id = auth.uid()
  or recipient_id = auth.uid()
  or lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Trade workers can create contact requests" on public.trade_contacts;
create policy "Trade workers can create contact requests"
on public.trade_contacts
for insert
to authenticated
with check (
  requester_id = auth.uid()
  and requester_email = lower(requester_email)
  and recipient_email = lower(recipient_email)
  and lower(requester_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Trade contact participants can update requests" on public.trade_contacts;
create policy "Trade contact participants can update requests"
on public.trade_contacts
for update
to authenticated
using (
  requester_id = auth.uid()
  or recipient_id = auth.uid()
  or lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  requester_id = requester_id
  and (
    requester_id = auth.uid()
    or recipient_id = auth.uid()
    or lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

create table if not exists public.work_assignments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contractor_id uuid references auth.users(id) on delete set null,
  contractor_email text not null,
  contractor_name text,
  contact_id uuid references public.trade_contacts(id) on delete set null,
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  title text not null,
  description text not null,
  context_notes text,
  priority text not null default 'Normal' check (priority in ('Low', 'Normal', 'High', 'Urgent')),
  status text not null default 'Pending' check (status in ('Pending', 'Accepted', 'In Progress', 'Waiting for User', 'Completed', 'Approved', 'Cancelled')),
  due_date date,
  start_date date,
  accepted_at timestamptz,
  started_at timestamptz,
  waiting_at timestamptz,
  contractor_completed_at timestamptz,
  completion_summary text,
  owner_approved_at timestamptz,
  owner_signature text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (contractor_email = lower(contractor_email))
);

alter table public.work_assignments
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists contractor_id uuid references auth.users(id) on delete set null,
  add column if not exists contractor_email text,
  add column if not exists contractor_name text,
  add column if not exists contact_id uuid references public.trade_contacts(id) on delete set null,
  add column if not exists home_id uuid references public.homes(id) on delete cascade,
  add column if not exists room_id uuid references public.rooms(id) on delete cascade,
  add column if not exists title text not null default '',
  add column if not exists description text not null default '',
  add column if not exists context_notes text,
  add column if not exists priority text not null default 'Normal',
  add column if not exists status text not null default 'Pending',
  add column if not exists due_date date,
  add column if not exists start_date date,
  add column if not exists accepted_at timestamptz,
  add column if not exists started_at timestamptz,
  add column if not exists waiting_at timestamptz,
  add column if not exists contractor_completed_at timestamptz,
  add column if not exists completion_summary text,
  add column if not exists owner_approved_at timestamptz,
  add column if not exists owner_signature text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.work_assignments
  drop constraint if exists work_assignments_priority_check,
  drop constraint if exists work_assignments_status_check;

alter table public.work_assignments
  add constraint work_assignments_priority_check check (priority in ('Low', 'Normal', 'High', 'Urgent')),
  add constraint work_assignments_status_check check (status in ('Pending', 'Accepted', 'In Progress', 'Waiting for User', 'Completed', 'Approved', 'Cancelled'));

create index if not exists work_assignments_owner_id_idx on public.work_assignments(owner_id);
create index if not exists work_assignments_contractor_id_idx on public.work_assignments(contractor_id);
create index if not exists work_assignments_contractor_email_idx on public.work_assignments(lower(contractor_email));
create index if not exists work_assignments_home_id_idx on public.work_assignments(home_id);
create index if not exists work_assignments_room_id_idx on public.work_assignments(room_id);
create index if not exists work_assignments_status_idx on public.work_assignments(status);

alter table public.work_assignments enable row level security;

drop policy if exists "Assignment participants can read assignments" on public.work_assignments;
create policy "Assignment participants can read assignments"
on public.work_assignments
for select
to authenticated
using (
  owner_id = auth.uid()
  or contractor_id = auth.uid()
  or lower(contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Owners can create assignments for their rooms" on public.work_assignments;
create policy "Owners can create assignments for their rooms"
on public.work_assignments
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and contractor_email = lower(contractor_email)
  and exists (
    select 1
    from public.rooms
    join public.homes on homes.id = rooms.home_id
    where rooms.id = work_assignments.room_id
      and rooms.home_id = work_assignments.home_id
      and rooms.owner_id = auth.uid()
      and homes.owner_id = auth.uid()
  )
);

drop policy if exists "Assignment participants can update assignments" on public.work_assignments;
create policy "Assignment participants can update assignments"
on public.work_assignments
for update
to authenticated
using (
  owner_id = auth.uid()
  or contractor_id = auth.uid()
  or lower(contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  owner_id = owner_id
  and (
    owner_id = auth.uid()
    or contractor_id = auth.uid()
    or lower(contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

create table if not exists public.assignment_messages (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.work_assignments(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message_type text not null default 'text' check (message_type in ('text', 'voice', 'file')),
  body text,
  storage_bucket text,
  storage_path text,
  file_name text,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

create index if not exists assignment_messages_assignment_id_idx on public.assignment_messages(assignment_id);
create index if not exists assignment_messages_sender_id_idx on public.assignment_messages(sender_id);

alter table public.assignment_messages enable row level security;

drop policy if exists "Assignment participants can read messages" on public.assignment_messages;
create policy "Assignment participants can read messages"
on public.assignment_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.work_assignments
    where work_assignments.id = assignment_messages.assignment_id
      and (
        work_assignments.owner_id = auth.uid()
        or work_assignments.contractor_id = auth.uid()
        or lower(work_assignments.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

drop policy if exists "Assignment participants can create messages" on public.assignment_messages;
create policy "Assignment participants can create messages"
on public.assignment_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.work_assignments
    where work_assignments.id = assignment_messages.assignment_id
      and (
        work_assignments.owner_id = auth.uid()
        or work_assignments.contractor_id = auth.uid()
        or lower(work_assignments.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create table if not exists public.assignment_work_updates (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.work_assignments(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  contractor_id uuid not null references auth.users(id) on delete cascade,
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  update_type text not null check (update_type in ('Visit note', 'Progress', 'Issue', 'Material', 'Completion', 'Question')),
  work_status text not null default 'In Progress' check (work_status in ('Pending', 'Accepted', 'In Progress', 'Waiting for User', 'Completed')),
  title text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assignment_work_updates_assignment_id_idx on public.assignment_work_updates(assignment_id);
create index if not exists assignment_work_updates_owner_id_idx on public.assignment_work_updates(owner_id);
create index if not exists assignment_work_updates_contractor_id_idx on public.assignment_work_updates(contractor_id);

alter table public.assignment_work_updates enable row level security;

drop policy if exists "Assignment participants can read work updates" on public.assignment_work_updates;
create policy "Assignment participants can read work updates"
on public.assignment_work_updates
for select
to authenticated
using (
  owner_id = auth.uid()
  or contractor_id = auth.uid()
  or exists (
    select 1
    from public.work_assignments
    where work_assignments.id = assignment_work_updates.assignment_id
      and lower(work_assignments.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Contractors can create assignment work updates" on public.assignment_work_updates;
create policy "Contractors can create assignment work updates"
on public.assignment_work_updates
for insert
to authenticated
with check (
  contractor_id = auth.uid()
  and exists (
    select 1
    from public.work_assignments
    where work_assignments.id = assignment_work_updates.assignment_id
      and work_assignments.owner_id = assignment_work_updates.owner_id
      and work_assignments.home_id = assignment_work_updates.home_id
      and work_assignments.room_id = assignment_work_updates.room_id
      and (
        work_assignments.contractor_id = auth.uid()
        or lower(work_assignments.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create table if not exists public.assignment_media (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.work_assignments(id) on delete cascade,
  uploader_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  phase text not null check (phase in ('Before', 'During', 'After', 'Voice', 'Other')),
  title text not null,
  notes text,
  storage_bucket text not null default 'work-documentation',
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create index if not exists assignment_media_assignment_id_idx on public.assignment_media(assignment_id);
create index if not exists assignment_media_owner_id_idx on public.assignment_media(owner_id);
create index if not exists assignment_media_uploader_id_idx on public.assignment_media(uploader_id);
create index if not exists assignment_media_room_id_idx on public.assignment_media(room_id);

alter table public.assignment_media enable row level security;

drop policy if exists "Assignment participants can read media" on public.assignment_media;
create policy "Assignment participants can read media"
on public.assignment_media
for select
to authenticated
using (
  uploader_id = auth.uid()
  or owner_id = auth.uid()
  or exists (
    select 1
    from public.work_assignments
    where work_assignments.id = assignment_media.assignment_id
      and (
        work_assignments.owner_id = auth.uid()
        or work_assignments.contractor_id = auth.uid()
        or lower(work_assignments.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

drop policy if exists "Assignment participants can create media" on public.assignment_media;
create policy "Assignment participants can create media"
on public.assignment_media
for insert
to authenticated
with check (
  uploader_id = auth.uid()
  and storage_bucket = 'work-documentation'
  and exists (
    select 1
    from public.work_assignments
    where work_assignments.id = assignment_media.assignment_id
      and work_assignments.owner_id = assignment_media.owner_id
      and work_assignments.home_id = assignment_media.home_id
      and work_assignments.room_id = assignment_media.room_id
      and (
        work_assignments.owner_id = auth.uid()
        or work_assignments.contractor_id = auth.uid()
        or lower(work_assignments.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

drop policy if exists "Users can upload their own work documentation" on storage.objects;
create policy "Users can upload their own work documentation"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'work-documentation'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can read uploaded work documentation" on storage.objects;
create policy "Users can read uploaded work documentation"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'work-documentation'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1
      from public.assignment_media
      join public.work_assignments on work_assignments.id = assignment_media.assignment_id
      where assignment_media.storage_path = name
        and (
          work_assignments.owner_id = auth.uid()
          or work_assignments.contractor_id = auth.uid()
          or lower(work_assignments.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  )
);

create table if not exists public.assignment_materials (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.work_assignments(id) on delete cascade,
  uploader_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  category text,
  brand text,
  model text,
  color text,
  quantity numeric(10, 2),
  unit text,
  product_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists assignment_materials_assignment_id_idx on public.assignment_materials(assignment_id);
create index if not exists assignment_materials_owner_id_idx on public.assignment_materials(owner_id);
create index if not exists assignment_materials_room_id_idx on public.assignment_materials(room_id);

alter table public.assignment_materials enable row level security;

drop policy if exists "Assignment participants can read materials" on public.assignment_materials;
create policy "Assignment participants can read materials"
on public.assignment_materials
for select
to authenticated
using (
  uploader_id = auth.uid()
  or owner_id = auth.uid()
  or exists (
    select 1
    from public.work_assignments
    where work_assignments.id = assignment_materials.assignment_id
      and (
        work_assignments.owner_id = auth.uid()
        or work_assignments.contractor_id = auth.uid()
        or lower(work_assignments.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

drop policy if exists "Assignment participants can create materials" on public.assignment_materials;
create policy "Assignment participants can create materials"
on public.assignment_materials
for insert
to authenticated
with check (
  uploader_id = auth.uid()
  and exists (
    select 1
    from public.work_assignments
    where work_assignments.id = assignment_materials.assignment_id
      and work_assignments.owner_id = assignment_materials.owner_id
      and work_assignments.home_id = assignment_materials.home_id
      and work_assignments.room_id = assignment_materials.room_id
      and (
        work_assignments.owner_id = auth.uid()
        or work_assignments.contractor_id = auth.uid()
        or lower(work_assignments.contractor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  notification_type text not null,
  title text not null,
  body text,
  assignment_id uuid references public.work_assignments(id) on delete cascade,
  contact_id uuid references public.trade_contacts(id) on delete cascade,
  home_id uuid references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists app_notifications_user_id_idx on public.app_notifications(user_id);
create index if not exists app_notifications_created_at_idx on public.app_notifications(created_at desc);

alter table public.app_notifications enable row level security;

drop policy if exists "Users can read their notifications" on public.app_notifications;
create policy "Users can read their notifications"
on public.app_notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can update their notifications" on public.app_notifications;
create policy "Users can update their notifications"
on public.app_notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Authenticated users can create notifications" on public.app_notifications;
create policy "Authenticated users can create notifications"
on public.app_notifications
for insert
to authenticated
with check (actor_id = auth.uid() or actor_id is null);
