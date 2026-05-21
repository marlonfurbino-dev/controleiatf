-- Tabelas para o módulo Diagnóstico de Gestação (DG)
-- Execute no Supabase Dashboard → SQL Editor

create table if not exists public.dg_fazendas (
  id            text        primary key,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  nome          text        not null,
  proprietario  text        default '',
  cidade        text        default '',
  telefone      text        default '',
  data_inseminacao date,
  data_dg          date,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.dg_fazendas enable row level security;
create policy "user_own_dg_fazendas"
  on public.dg_fazendas
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.dg_animais (
  id            text        primary key,
  fazenda_dg_id text        not null references public.dg_fazendas(id) on delete cascade,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  nome          text        not null,
  status        text,       -- 'P' | 'V' | null
  created_at    timestamptz default now()
);

alter table public.dg_animais enable row level security;
create policy "user_own_dg_animais"
  on public.dg_animais
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
