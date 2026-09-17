alter table public.user_configs
  add column if not exists langsmith_api_key text not null default '';

alter table public.user_configs
  add column if not exists langsmith_project text not null default '';
