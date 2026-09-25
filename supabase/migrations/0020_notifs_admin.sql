-- Notifications administrateur : la base appelle /api/notif (pg_net) à chaque événement.
-- Renseigner une fois : insert into admin_config values ('site_url','https://labourseauxpermut.fr'), ('cron_secret','<CRON_SECRET>');
create extension if not exists pg_net;
create table if not exists admin_config (cle text primary key, valeur text not null);
alter table admin_config enable row level security;   -- aucune policy : jamais lisible par l'API publique

create or replace function notifier_admin(payload jsonb) returns void language plpgsql security definer as $$
declare u text; s text;
begin
  select valeur into u from admin_config where cle = 'site_url';
  select valeur into s from admin_config where cle = 'cron_secret';
  if u is null or s is null then return; end if;
  perform net.http_post(url := u || '/api/notif', headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || s), body := payload);
end $$;

create or replace function trg_notif_profils() returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then perform notifier_admin(jsonb_build_object('type', 'inscription', 'institution', new.institution));
  elsif (new.verifie_carte or new.verifie_mail_pro) and not coalesce(old.verifie_carte, false) and not coalesce(old.verifie_mail_pro, false) then
    perform notifier_admin(jsonb_build_object('type', 'verification', 'institution', new.institution, 'voie', case when new.verifie_carte then 'carte pro' else 'mail pro' end));
  end if;
  return new;
end $$;
drop trigger if exists trg_notif_profils on profils;
create trigger trg_notif_profils after insert or update of verifie_carte, verifie_mail_pro on profils for each row execute function trg_notif_profils();

create or replace function trg_notif_annonces() returns trigger language plpgsql security definer as $$
declare dep text;
begin
  if new.demo then return new; end if;
  select departement into dep from services where id = new.service_id;
  perform notifier_admin(jsonb_build_object('type', 'annonce', 'grade', new.grade, 'departement', dep, 'cibles', (select string_agg(coalesce(c->>'ville', c->>'departement'), ', ') from jsonb_array_elements(new.cibles) c)));
  return new;
end $$;
drop trigger if exists trg_notif_annonces on annonces;
create trigger trg_notif_annonces after insert on annonces for each row execute function trg_notif_annonces();

create or replace function trg_notif_corr() returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then perform notifier_admin(jsonb_build_object('type', 'correspondance', 'statut', new.statut, 'corr_type', new.type, 'score', new.score));
  elsif new.statut = 'confirmee' and old.statut <> 'confirmee' then perform notifier_admin(jsonb_build_object('type', 'correspondance', 'statut', 'confirmee', 'corr_type', new.type, 'score', new.score));
  end if;
  return new;
end $$;
drop trigger if exists trg_notif_corr on correspondances;
create trigger trg_notif_corr after insert or update of statut on correspondances for each row execute function trg_notif_corr();

create or replace function trg_notif_signalements() returns trigger language plpgsql security definer as $$
begin perform notifier_admin(jsonb_build_object('type', 'signalement', 'motif', new.motif)); return new; end $$;
drop trigger if exists trg_notif_signalements on signalements;
create trigger trg_notif_signalements after insert on signalements for each row execute function trg_notif_signalements();

create or replace function trg_notif_pre() returns trigger language plpgsql security definer as $$
begin perform notifier_admin(jsonb_build_object('type', 'preinscription', 'institution', new.institution, 'departement', new.departement, 'canal', new.canal)); return new; end $$;
drop trigger if exists trg_notif_pre on preinscriptions;
create trigger trg_notif_pre after insert on preinscriptions for each row execute function trg_notif_pre();
