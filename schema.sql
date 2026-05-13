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
