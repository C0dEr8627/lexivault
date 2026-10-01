-- Allow current Gemini 3 text-generation models while preserving existing
-- Gemini 2.5 configurations for projects that still have access to them.
alter table public.user_configs
  alter column gemini_model set default 'gemini-3.8-flash';

alter table public.user_configs
  drop constraint if exists user_configs_gemini_model_check;

alter table public.user_configs
  add constraint user_configs_gemini_model_check
  check (
    gemini_model in (
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.5-pro'
    )
  );
