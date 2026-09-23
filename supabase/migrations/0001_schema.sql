-- =====================================================================
-- Hors Boîte — schéma v1 (police, gendarmerie, pénitentiaire)
-- Principe : la table lue par le matching ne contient aucune identité.
-- L'identité vit dans une table séparée, chiffrée côté serveur (Next.js),
-- révélée uniquement quand tous les agents d'un cycle ont accepté.
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Référentiels
-- ---------------------------------------------------------------------
create table institutions (
  code text primary key,               -- 'PN', 'GN', 'AP'
  libelle text not null,
  domaines_mail text[] not null        -- domaines pro acceptés
);
insert into institutions values
 ('PN','Police nationale', array['interieur.gouv.fr']),
 ('GN','Gendarmerie nationale', array['gendarmerie.interieur.gouv.fr']),
 ('AP','Administration pénitentiaire', array['justice.fr','justice.gouv.fr']);

create table corps (
  code text primary key, institution text not null references institutions(code), libelle text not null
);
insert into corps values
 ('CEA','PN','Corps d''encadrement et d''application'),('CC','PN','Corps de commandement'),('CCD','PN','Corps de conception et de direction'),
 ('SOG','GN','Sous-officiers de gendarmerie'),('GAV','GN','Gendarmes adjoints volontaires'),('OFF','GN','Officiers'),
 ('SURV','AP','Surveillants'),('CPIP','AP','Conseillers pénitentiaires d''insertion et de probation'),('OFFAP','AP','Officiers pénitentiaires');

create table grades (
  code text primary key, corps text not null references corps(code), libelle text not null, rang smallint not null
);
insert into grades values
 ('GPX','CEA','Gardien de la paix',1),('BRG','CEA','Brigadier',2),('BRC','CEA','Brigadier-chef',3),('MAJ','CEA','Major',4),
 ('GEN','SOG','Gendarme',1),('MDL','SOG','Maréchal des logis-chef',2),('ADJ','SOG','Adjudant',3),('ADC','SOG','Adjudant-chef',4),
 ('SUR','SURV','Surveillant',1),('SUB','SURV','Surveillant brigadier',2),('PRE','SURV','Premier surveillant',3),('MAJP','SURV','Major',4);

create table services (
  id serial primary key,
  institution text not null references institutions(code),
  ville text not null,
  departement text not null,           -- '06', '974'
  type text not null,                  -- 'CSP','CRS','BTA','PSIG','MA','CD'...
  libelle text not null,
  outre_mer boolean not null default false,
  lat numeric, lng numeric
);
create index on services(institution, departement);

-- ---------------------------------------------------------------------
-- Profils (AUCUNE identité)
-- ---------------------------------------------------------------------
create table profils (
  id uuid primary key references auth.users(id) on delete cascade,
  institution text not null references institutions(code),
  corps text references corps(code),
  grade text references grades(code),
  service_id int references services(id),
  type_service text,                   -- 'SP jour','SP nuit','BAC','OP','brigade','détention'...
  anciennete_poste_mois int not null default 0,
  depart_des date,
  cimm_departement text,               -- CIMM déclaré (outre-mer)
  accepte_cycles boolean not null default true,
  accepte_souhait_2_3 boolean not null default true,
  accepte_changer_service boolean not null default false,
  verifie_carte boolean not null default false,
  verifie_mail_pro boolean not null default false,
  verifie_le timestamptz,
  premium_jusqua timestamptz,
  stripe_customer_id text,
  canal_acquisition text,              -- 'peps','facebook','syndicat','collegue'...
  created_at timestamptz not null default now()
);

create table souhaits (
  id bigserial primary key,
  profil_id uuid not null references profils(id) on delete cascade,
  rang smallint not null check (rang between 1 and 5),
  service_id int references services(id),
  departement text,                    -- alternative : tout le département
  contrainte_type_service text,
  unique (profil_id, rang)
);

-- ---------------------------------------------------------------------
-- Identité chiffrée (service_role uniquement)
-- ---------------------------------------------------------------------
create table identites (
  profil_id uuid primary key references profils(id) on delete cascade,
  nom_enc text not null, prenom_enc text not null,
  mail_pro_enc text not null, telephone_enc text,
  created_at timestamptz not null default now()
);
create table empreintes_matricule (
  empreinte text primary key,
  profil_id uuid not null unique references profils(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table codes_mail_pro (
  profil_id uuid primary key references profils(id) on delete cascade,
  code_hash text not null, expire_le timestamptz not null, tentatives smallint not null default 0
);
create table parrainages (
  id bigserial primary key,
  parrain_id uuid not null references profils(id),
  filleul_id uuid not null unique references profils(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Matching
-- ---------------------------------------------------------------------
create table correspondances (
  id uuid primary key default gen_random_uuid(),
  institution text not null references institutions(code),
  type text not null check (type in ('directe','cycle3','cycle4')),
  score smallint not null,
  statut text not null default 'proposee' check (statut in ('proposee','en_cours','confirmee','refusee','expiree')),
  detail jsonb not null default '{}',
  signature text not null unique,      -- ids triés, évite les doublons entre passes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table correspondance_membres (
  correspondance_id uuid not null references correspondances(id) on delete cascade,
  profil_id uuid not null references profils(id) on delete cascade,
  position smallint not null,
  vers_service_id int references services(id),
  reponse text not null default 'attente' check (reponse in ('attente','accepte','refuse')),
  notifie_le timestamptz,
  primary key (correspondance_id, profil_id)
);
create index on correspondance_membres(profil_id);
create table correspondances_ignorees (
  profil_id uuid not null references profils(id) on delete cascade,
  correspondance_id uuid not null references correspondances(id) on delete cascade,
  primary key (profil_id, correspondance_id)
);
create table historique_points (
  id bigserial primary key,
  institution text not null references institutions(code),
  service_id int references services(id),
  departement text,
  annee smallint not null, points smallint not null,
  declare_par uuid references profils(id) on delete set null,
  created_at timestamptz not null default now()
);
create table calendriers (
  id serial primary key,
  institution text not null references institutions(code),
  libelle text not null, cloture date not null, url text
);
create table journal_identites (
  id bigserial primary key, profil_id uuid not null, par_fonction text not null,
  correspondance_id uuid, created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Écoute : AUCUNE table liée au profil. Les référents ont leur propre table,
-- les échanges sont éphémères (Supabase Realtime broadcast, rien en base).
-- ---------------------------------------------------------------------
create table referents (
  id uuid primary key default gen_random_uuid(),
  institution text not null references institutions(code),
  presentation text not null,          -- texte anonyme
  disponible boolean not null default false,
  partenaire text,                     -- 'PEPS'
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- L'après : contenus éditoriaux, sans lien profil
-- ---------------------------------------------------------------------
create table apres_voies (
  id serial primary key, institution text references institutions(code),
  titre text not null, statut text not null, texte text not null, ordre smallint not null default 0
);
create table apres_metiers (
  id serial primary key, titre text not null, secteur text not null, deontologie boolean not null default false,
  profils_cibles text[] not null default '{}', ordre smallint not null default 0
);

-- =====================================================================
-- RLS
-- =====================================================================
alter table institutions enable row level security; alter table corps enable row level security;
alter table grades enable row level security; alter table services enable row level security;
alter table calendriers enable row level security; alter table referents enable row level security;
alter table apres_voies enable row level security; alter table apres_metiers enable row level security;
create policy r_inst on institutions for select to authenticated, anon using (true);
create policy r_corps on corps for select to authenticated, anon using (true);
create policy r_grades on grades for select to authenticated, anon using (true);
create policy r_services on services for select to authenticated, anon using (true);
create policy r_cal on calendriers for select to authenticated using (true);
create policy r_ref on referents for select to authenticated, anon using (true);
create policy r_voies on apres_voies for select to authenticated using (true);
create policy r_metiers on apres_metiers for select to authenticated using (true);

alter table profils enable row level security;
create policy p_sel on profils for select to authenticated using (id = auth.uid());
create policy p_ins on profils for insert to authenticated with check (id = auth.uid());
create policy p_upd on profils for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create or replace function garde_colonnes_profil() returns trigger language plpgsql security definer as $$
begin
  if auth.role() = 'authenticated' then
    new.verifie_carte := old.verifie_carte; new.verifie_mail_pro := old.verifie_mail_pro;
    new.verifie_le := old.verifie_le; new.premium_jusqua := old.premium_jusqua;
    new.stripe_customer_id := old.stripe_customer_id; new.institution := old.institution;
  end if;
  return new;
end $$;
create trigger trg_garde_profil before update on profils for each row execute function garde_colonnes_profil();

alter table souhaits enable row level security;
create policy s_all on souhaits for all to authenticated using (profil_id = auth.uid()) with check (profil_id = auth.uid());

-- identites, empreintes, codes : aucune policy => service_role uniquement
alter table identites enable row level security;
alter table empreintes_matricule enable row level security;
alter table codes_mail_pro enable row level security;
alter table parrainages enable row level security;
create policy par_sel on parrainages for select to authenticated using (parrain_id = auth.uid());
alter table journal_identites enable row level security;

alter table correspondances enable row level security;
alter table correspondance_membres enable row level security;
alter table correspondances_ignorees enable row level security;
alter table historique_points enable row level security;
create policy c_sel on correspondances for select to authenticated using (exists (
  select 1 from correspondance_membres m where m.correspondance_id = correspondances.id and m.profil_id = auth.uid() and m.notifie_le is not null));
create policy m_sel on correspondance_membres for select to authenticated using (exists (
  select 1 from correspondance_membres me where me.correspondance_id = correspondance_membres.correspondance_id and me.profil_id = auth.uid() and me.notifie_le is not null));
create policy m_upd on correspondance_membres for update to authenticated using (profil_id = auth.uid()) with check (profil_id = auth.uid());
create policy i_all on correspondances_ignorees for all to authenticated using (profil_id = auth.uid()) with check (profil_id = auth.uid());
create policy h_sel on historique_points for select to authenticated using (true);
create policy h_ins on historique_points for insert to authenticated with check (
  exists (select 1 from profils p where p.id = auth.uid() and p.verifie_carte and p.verifie_mail_pro));

-- Vue anonymisée des correspondances de l'utilisateur
create or replace view v_mes_correspondances with (security_invoker = true) as
select c.id, c.type, c.score, c.statut, c.detail, c.created_at,
       m.position, m.vers_service_id, m.reponse, (m.profil_id = auth.uid()) as est_moi,
       p.corps, p.grade, p.type_service, p.anciennete_poste_mois,
       s.ville as ville_actuelle, sv.ville as ville_cible
from correspondances c
join correspondance_membres m on m.correspondance_id = c.id
join profils p on p.id = m.profil_id
left join services s on s.id = p.service_id
left join services sv on sv.id = m.vers_service_id
where exists (select 1 from correspondance_membres me where me.correspondance_id = c.id and me.profil_id = auth.uid() and me.notifie_le is not null);

-- Données de démo minimales
insert into services (institution, ville, departement, type, libelle, lat, lng) values
 ('PN','Montpellier','34','CSP','CSP Montpellier',43.61,3.88),
 ('PN','Nice','06','CSP','CSP Nice',43.70,7.27),
 ('PN','Toulouse','31','CSP','CSP Toulouse',43.60,1.44),
 ('PN','Marseille','13','CSP','CSP Marseille',43.30,5.37),
 ('PN','Lyon','69','CSP','CSP Lyon',45.76,4.83),
 ('PN','Paris','75','DSPAP','DSPAP Paris',48.86,2.35),
 ('GN','Nice','06','BTA','Brigade de Nice',43.70,7.27),
 ('AP','Fleury-Mérogis','91','MA','Maison d''arrêt de Fleury-Mérogis',48.63,2.36);
insert into calendriers (institution, libelle, cloture) values
 ('PN','Mouvement général CEA','2026-10-28'),('GN','Plan annuel de mutation','2026-11-15'),('AP','Campagne de mobilité surveillants','2026-11-30');
