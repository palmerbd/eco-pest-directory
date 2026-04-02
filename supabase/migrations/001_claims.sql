-- Dance Directory: Claims Table
create table if not exists public.claims (
  id            uuid primary key default gen_random_uuid(),
  studio_id     integer not null,
  studio_slug   text    not null,
  studio_title  text    not null,
  owner_name    text    not null,
  owner_email   text    not null,
  owner_phone   text    not null,
  user_id       uuid    references auth.users(id) on delete set null,
  status        text    not null default 'pending'
                        check (status in ('pending','verified','approved','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists claims_studio_slug_unique
  on public.claims (studio_slug) where status in ('pending', 'verified', 'approved');

create index if not exists claims_user_id_idx on public.claims (user_id);
create index if not exists claims_studio_slug_idx on public.claims (studio_slug);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger claims_set_updated_at
  before update on public.claims
  for each row execute function public.set_updated_at();

alter table public.claims enable row level security;

create policy "owners can view own claims" on public.claims for select
  using (auth.uid() = user_id);

create policy "authenticated users can insert claims" on public.claims for insert
  with check (auth.uid() = user_id);
