-- Statistiques publiques agrégées, alimentées par trigger, lisibles par tous (anon compris).
-- Jamais de lien avec un profil : uniquement des compteurs.
create table if not exists stats_publiques (
  cle text primary key,
  valeur int not null default 0,
  maj timestamptz not null default now()
);
insert into stats_publiques (cle, valeur) values ('en_recherche', 0), ('cycles_fermes', 0) on conflict do nothing;

alter table stats_publiques enable row level security;
create policy stats_lecture on stats_publiques for select to anon, authenticated using (true);

-- Recalcule le nombre de profils vérifiés ayant au moins un souhait
create or replace function maj_stat_en_recherche() returns trigger language plpgsql security definer as $$
begin
  update stats_publiques set valeur = (
    select count(*) from profils p
    where (p.verifie_carte or p.verifie_mail_pro) and exists (select 1 from souhaits s where s.profil_id = p.id)
  ), maj = now() where cle = 'en_recherche';
  return null;
end $$;
drop trigger if exists trg_stat_profils on profils;
create trigger trg_stat_profils after insert or update or delete on profils for each statement execute function maj_stat_en_recherche();
drop trigger if exists trg_stat_souhaits on souhaits;
create trigger trg_stat_souhaits after insert or update or delete on souhaits for each statement execute function maj_stat_en_recherche();

create or replace function maj_stat_cycles() returns trigger language plpgsql security definer as $$
begin
  update stats_publiques set valeur = (select count(*) from correspondances where statut = 'confirmee'), maj = now() where cle = 'cycles_fermes';
  return null;
end $$;
drop trigger if exists trg_stat_corr on correspondances;
create trigger trg_stat_corr after insert or update on correspondances for each statement execute function maj_stat_cycles();

-- Realtime sur cette table uniquement
alter publication supabase_realtime add table stats_publiques;

-- Halos par département : uniquement au-dessus d'un plancher, pour ne jamais identifier quelqu'un
create or replace view v_halos_departements with (security_invoker = false) as
select s.departement, count(*)::int as n, avg(s.lat)::numeric as lat, avg(s.lng)::numeric as lng
from profils p join services s on s.id = p.service_id
where (p.verifie_carte or p.verifie_mail_pro)
group by s.departement having count(*) >= 10;
grant select on v_halos_departements to anon, authenticated;
