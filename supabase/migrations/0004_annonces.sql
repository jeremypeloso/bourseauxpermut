-- =====================================================================
-- Annonces de permutation ("le bon coin des permut'"), anonymes par construction.
-- Aucune policy de lecture pour les autres agents : la lecture passe par la route
-- serveur /api/annonces qui ne renvoie que ce que le plan autorise
-- (3 en clair pour les gratuits, en-tête seule pour le reste, tout pour Premium).
-- =====================================================================
create table if not exists annonces (
  id uuid primary key default gen_random_uuid(),
  profil_id uuid not null references profils(id) on delete cascade,
  institution text not null references institutions(code),
  corps text, grade text,
  service_id int references services(id),
  type_service text,
  anciennete_poste_mois int not null default 0,
  depart_des date,
  cibles jsonb not null default '[]',            -- [{service_id, ville, departement}] copié des souhaits
  commentaire_structure jsonb not null default '{}', -- champs fermés uniquement (logement, conjoint...), pas de texte libre
  statut text not null default 'active' check (statut in ('active','retiree','aboutie')),
  mise_en_avant_jusqua timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists annonces_une_active on annonces(profil_id) where statut = 'active';
create index if not exists annonces_inst_statut on annonces(institution, statut);

alter table annonces enable row level security;
create policy annonces_owner on annonces for all to authenticated using (profil_id = auth.uid()) with check (profil_id = auth.uid());

-- Réponses à une annonce : trace minimale pour éviter le spam (une réponse par agent et par annonce)
create table if not exists annonce_reponses (
  annonce_id uuid not null references annonces(id) on delete cascade,
  profil_id uuid not null references profils(id) on delete cascade,
  correspondance_id uuid references correspondances(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (annonce_id, profil_id)
);
alter table annonce_reponses enable row level security;
create policy rep_owner on annonce_reponses for select to authenticated using (profil_id = auth.uid());

-- Une annonce se retire d'elle-même quand une correspondance de son auteur est confirmée
create or replace function retirer_annonce_si_aboutie() returns trigger language plpgsql security definer as $$
begin
  if new.statut = 'confirmee' then
    update annonces set statut = 'aboutie', updated_at = now()
    where statut = 'active' and profil_id in (select profil_id from correspondance_membres where correspondance_id = new.id);
  end if;
  return null;
end $$;
drop trigger if exists trg_annonce_aboutie on correspondances;
create trigger trg_annonce_aboutie after update on correspondances for each row execute function retirer_annonce_si_aboutie();

-- Compteur public
insert into stats_publiques (cle, valeur) values ('annonces_actives', 0) on conflict do nothing;
create or replace function maj_stat_annonces() returns trigger language plpgsql security definer as $$
begin
  update stats_publiques set valeur = (select count(*) from annonces where statut = 'active'), maj = now() where cle = 'annonces_actives';
  return null;
end $$;
drop trigger if exists trg_stat_annonces on annonces;
create trigger trg_stat_annonces after insert or update or delete on annonces for each statement execute function maj_stat_annonces();
