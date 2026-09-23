create table if not exists favoris (
  profil_id uuid not null references profils(id) on delete cascade,
  annonce_id uuid not null references annonces(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profil_id, annonce_id)
);
alter table favoris enable row level security;
create policy fav_owner on favoris for all to authenticated using (profil_id = auth.uid()) with check (profil_id = auth.uid());
