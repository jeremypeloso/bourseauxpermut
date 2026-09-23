-- Pré-inscriptions avant lancement : email perso + institution + département, rien d'autre.
create table if not exists preinscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  institution text references institutions(code),
  departement text,
  canal text,                              -- 'peps', 'facebook', 'syndicat', 'collegue', 'autre'
  invite_le timestamptz,                   -- date d'envoi de l'invitation à l'ouverture
  created_at timestamptz not null default now()
);
alter table preinscriptions enable row level security;   -- aucune policy : service_role uniquement

insert into stats_publiques (cle, valeur) values ('preinscrits', 0) on conflict do nothing;
create or replace function maj_stat_preinscrits() returns trigger language plpgsql security definer as $$
begin
  update stats_publiques set valeur = (select count(*) from preinscriptions), maj = now() where cle = 'preinscrits';
  return null;
end $$;
drop trigger if exists trg_stat_preinscrits on preinscriptions;
create trigger trg_stat_preinscrits after insert or delete on preinscriptions for each statement execute function maj_stat_preinscrits();

-- Halos publics par département (plancher 10) : réutilisés à l'ouverture
create or replace view v_halos_preinscrits with (security_invoker = false) as
select departement, count(*)::int as n from preinscriptions where departement is not null group by departement having count(*) >= 10;
grant select on v_halos_preinscrits to anon, authenticated;
