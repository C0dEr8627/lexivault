-- LexiVault Phase 3 schema: tables, constraints, RLS, and storage strategy.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  gemini_api_key text not null,
  langsmith_api_key text not null default '',
  langsmith_project text not null default '',
  pinecone_api_key text not null default '',
  pinecone_index_name text not null default '',
  gemini_model text not null default 'gemini-2.5-flash',
  embedding_model text not null default 'gemini-embedding-001',
  system_prompt text not null default 'You are a helpful assistant. Answer only from the provided context. If the answer is not in the documents, say you do not know.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_configs_user_id_key unique (user_id),
  constraint user_configs_gemini_model_check check (gemini_model = 'gemini-2.5-flash'),
  constraint user_configs_embedding_model_check check (embedding_model = 'gemini-embedding-001')
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  status text not null default 'processing',
  processing_stage text,
  processing_message text,
  client_upload_id text,
  is_active boolean not null default true,
  chunk_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_status_check check (status in ('processing', 'ready', 'failed', 'deleted')),
  constraint documents_processing_stage_check check (processing_stage in ('uploading', 'loading', 'parsing', 'chunking', 'embedding') or processing_stage is null),
  constraint documents_chunk_count_check check (chunk_count >= 0)
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  chunk_index integer not null,
  content text not null,
  token_count integer,
  pinecone_vector_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint document_chunks_chunk_index_check check (chunk_index >= 0),
  constraint document_chunks_token_count_check check (token_count is null or token_count >= 0),
  constraint document_chunks_pinecone_vector_id_key unique (pinecone_vector_id),
  constraint document_chunks_document_chunk_key unique (document_id, chunk_index)
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null,
  content text not null,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint chat_messages_role_check check (role in ('user', 'assistant', 'system'))
);

create index if not exists idx_user_configs_user_id on public.user_configs (user_id);
create index if not exists idx_documents_user_id on public.documents (user_id);
create index if not exists idx_documents_status on public.documents (status);
create index if not exists idx_documents_is_active on public.documents (is_active);
create index if not exists idx_document_chunks_document_id on public.document_chunks (document_id);
create index if not exists idx_document_chunks_user_id on public.document_chunks (user_id);
create index if not exists idx_chat_sessions_user_id on public.chat_sessions (user_id);
create index if not exists idx_chat_messages_session_id on public.chat_messages (session_id);
create index if not exists idx_chat_messages_user_id on public.chat_messages (user_id);

drop trigger if exists set_user_configs_updated_at on public.user_configs;
create trigger set_user_configs_updated_at
before update on public.user_configs
for each row execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists set_chat_sessions_updated_at on public.chat_sessions;
create trigger set_chat_sessions_updated_at
before update on public.chat_sessions
for each row execute function public.set_updated_at();

alter table public.user_configs enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "user_configs_select_own" on public.user_configs;
create policy "user_configs_select_own"
on public.user_configs
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_configs_insert_own" on public.user_configs;
create policy "user_configs_insert_own"
on public.user_configs
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_configs_update_own" on public.user_configs;
create policy "user_configs_update_own"
on public.user_configs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_configs_delete_own" on public.user_configs;
create policy "user_configs_delete_own"
on public.user_configs
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
on public.documents
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
on public.documents
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own"
on public.documents
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own"
on public.documents
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "document_chunks_select_own" on public.document_chunks;
create policy "document_chunks_select_own"
on public.document_chunks
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "document_chunks_insert_own" on public.document_chunks;
create policy "document_chunks_insert_own"
on public.document_chunks
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.documents d
    where d.id = document_id
      and d.user_id = auth.uid()
  )
);

drop policy if exists "document_chunks_update_own" on public.document_chunks;
create policy "document_chunks_update_own"
on public.document_chunks
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "document_chunks_delete_own" on public.document_chunks;
create policy "document_chunks_delete_own"
on public.document_chunks
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "chat_sessions_select_own" on public.chat_sessions;
create policy "chat_sessions_select_own"
on public.chat_sessions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "chat_sessions_insert_own" on public.chat_sessions;
create policy "chat_sessions_insert_own"
on public.chat_sessions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "chat_sessions_update_own" on public.chat_sessions;
create policy "chat_sessions_update_own"
on public.chat_sessions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "chat_sessions_delete_own" on public.chat_sessions;
create policy "chat_sessions_delete_own"
on public.chat_sessions
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own"
on public.chat_messages
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
on public.chat_messages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.chat_sessions s
    where s.id = session_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "chat_messages_update_own" on public.chat_messages;
create policy "chat_messages_update_own"
on public.chat_messages
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "chat_messages_delete_own" on public.chat_messages;
create policy "chat_messages_delete_own"
on public.chat_messages
for delete
to authenticated
using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

drop policy if exists "documents_bucket_read_own" on storage.objects;
create policy "documents_bucket_read_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "documents_bucket_insert_own" on storage.objects;
create policy "documents_bucket_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "documents_bucket_update_own" on storage.objects;
create policy "documents_bucket_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "documents_bucket_delete_own" on storage.objects;
create policy "documents_bucket_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
