-- Signalements d'annonces par les membres, traités dans l'admin
create table if not exists signalements (
  id uuid primary key default gen_random_uuid(),
  annonce_id uuid references annonces(id) on delete cascade,
  par uuid references profils(id) on delete set null,
  motif text not null,             -- identifiante | hors_sujet | doublon | autre
  commentaire text,
  statut text not null default 'ouvert',   -- ouvert | traite | rejete
  created_at timestamptz not null default now()
);
alter table signalements enable row level security;   -- service_role uniquement (API)
