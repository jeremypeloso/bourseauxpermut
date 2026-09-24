-- Lancement : 1 mois de Premium offert aux 100 premiers comptes vérifiés (attribué automatiquement à la vérification).
alter table profils add column if not exists premium_offert_le timestamptz;
insert into stats_publiques (cle, valeur) values ('premium_offerts', 0) on conflict do nothing;

create or replace function offrir_premium_lancement() returns trigger language plpgsql security definer as $$
declare n int; quota int := 100; duree interval := interval '1 month';
begin
  -- déclenche uniquement au passage à « vérifié », une seule fois par compte, jamais pour les comptes déjà Premium
  if (new.verifie_carte or new.verifie_mail_pro) and not coalesce(old.verifie_carte, false) and not coalesce(old.verifie_mail_pro, false)
     and new.premium_offert_le is null then
    select count(*) into n from profils where premium_offert_le is not null;
    if n < quota then
      new.premium_offert_le := now();
      new.premium_jusqua := greatest(coalesce(new.premium_jusqua, now()), now()) + duree;
      update stats_publiques set valeur = n + 1, maj = now() where cle = 'premium_offerts';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_premium_lancement on profils;
create trigger trg_premium_lancement before update of verifie_carte, verifie_mail_pro on profils for each row execute function offrir_premium_lancement();
-- Cas d'un profil créé déjà vérifié (vérification carte qui crée la ligne) : même règle à l'insertion
create or replace function offrir_premium_lancement_ins() returns trigger language plpgsql security definer as $$
declare n int;
begin
  if (new.verifie_carte or new.verifie_mail_pro) and new.premium_offert_le is null then
    select count(*) into n from profils where premium_offert_le is not null;
    if n < 100 then new.premium_offert_le := now(); new.premium_jusqua := now() + interval '1 month'; update stats_publiques set valeur = n + 1, maj = now() where cle = 'premium_offerts'; end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_premium_lancement_ins on profils;
create trigger trg_premium_lancement_ins before insert on profils for each row execute function offrir_premium_lancement_ins();
