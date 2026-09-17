alter table public.documents
  add column if not exists processing_stage text;

alter table public.documents
  add column if not exists processing_message text;

alter table public.documents
  add column if not exists client_upload_id text;

alter table public.documents
  drop constraint if exists documents_processing_stage_check;

alter table public.documents
  add constraint documents_processing_stage_check
  check (processing_stage in ('uploading', 'loading', 'parsing', 'chunking', 'embedding') or processing_stage is null);
