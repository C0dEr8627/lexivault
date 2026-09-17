alter table public.user_configs
  add column if not exists pinecone_api_key text not null default '';

alter table public.user_configs
  add column if not exists pinecone_index_name text not null default '';

alter table public.user_configs
  alter column embedding_model set default 'gemini-embedding-001';

alter table public.user_configs
  drop constraint if exists user_configs_embedding_model_check;

alter table public.user_configs
  add constraint user_configs_embedding_model_check check (embedding_model = 'gemini-embedding-001');
