-- Annonces d'exemple (marquées « Exemple », non répondables, effacées au fur et à mesure des vraies).
-- À exécuter après 0006. Remplacez l'email par celui de votre compte admin.
-- Réexécutable : supprime les exemples existants puis les recrée.

-- Plusieurs exemples peuvent appartenir au même compte : l'unicité ne porte que sur les vraies annonces
drop index if exists annonces_une_active;
create unique index if not exists annonces_une_active on annonces(profil_id) where statut = 'active' and not demo;

create or replace function svc(p_inst text, p_ville text, p_dep text, p_type text, p_libelle text, p_lat numeric, p_lng numeric) returns int language plpgsql as $$
declare v int;
begin
  select id into v from services where institution = p_inst and ville = p_ville and type = p_type limit 1;
  if v is null then
    insert into services (institution, ville, departement, type, libelle, outre_mer, lat, lng)
    values (p_inst, p_ville, p_dep, p_type, p_libelle, p_dep like '97%' or p_dep like '98%', p_lat, p_lng) returning id into v;
  end if;
  return v;
end $$;

do $$
declare uid uuid; d0 timestamptz := now();
begin
  select id into uid from auth.users where email = 'jeremy.peloso@gmail.com';   -- ← votre compte
  if uid is null then raise exception 'compte admin introuvable'; end if;
  delete from annonces where demo;

  insert into annonces (profil_id, institution, corps, grade, service_id, type_service, anciennete_poste_mois, depart_des, cibles, commentaire_structure, demo, created_at) values
  -- Police nationale
  (uid,'PN','CEA','GPX', svc('PN','Nice','06','CSP','CSP Nice',43.70,7.27), 'Sécurité publique · nuit 4/2', 84, '2027-03-01',
    '[{"ville":"Toulouse","departement":"31"},{"ville":"Montpellier","departement":"34"},{"ville":"Béziers","departement":"34"}]', '{"accepte_cycles":true}', true, d0 - interval '2 hours'),
  (uid,'PN','CEA','GPX', svc('PN','Paris','75','DSPAP','DSPAP Paris 18e',48.89,2.35), 'Sécurité publique · jour', 72, '2027-09-01',
    '[{"ville":"Saint-Denis","departement":"974"},{"ville":"Saint-Pierre","departement":"974"}]', '{"accepte_cycles":true,"cimm":true}', true, d0 - interval '1 day'),
  (uid,'PN','CEA','BRIG', svc('PN','Montfavet','84','CRS','CRS 60 Montfavet',43.94,4.87), 'CRS', 108, null,
    '[{"ville":"Lyon","departement":"69"},{"ville":"Grenoble","departement":"38"}]', '{"accepte_cycles":true}', true, d0 - interval '3 days'),
  (uid,'PN','CEA','GPX', svc('PN','Lille','59','CSP','CSP Lille',50.63,3.06), 'BAC · nuit', 60, '2027-01-01',
    '[{"ville":"Rennes","departement":"35"},{"ville":"Nantes","departement":"44"},{"ville":"Vannes","departement":"56"}]', '{"accepte_cycles":true}', true, d0 - interval '4 days'),
  (uid,'PN','CEA','BC', svc('PN','Marseille','13','CSP','CSP Marseille',43.30,5.37), 'Sécurité publique · jour', 156, '2027-06-01',
    '[{"ville":"Bordeaux","departement":"33"},{"ville":"Bayonne","departement":"64"}]', '{"accepte_cycles":false}', true, d0 - interval '5 days'),
  (uid,'PN','CEA','GPX', svc('PN','Strasbourg','67','CSP','CSP Strasbourg',48.58,7.75), 'Police aux frontières', 48, '2027-04-01',
    '[{"ville":"Nice","departement":"06"},{"ville":"Toulon","departement":"83"}]', '{"accepte_cycles":true}', true, d0 - interval '6 days'),
  -- Gendarmerie nationale
  (uid,'GN','SOG','GEN', svc('GN','Bayonne','64','BTA','BTA Bayonne',43.49,-1.47), 'Brigade territoriale', 60, '2027-08-01',
    '[{"ville":"Brest","departement":"29"},{"ville":"Vannes","departement":"56"},{"ville":"Rennes","departement":"35"}]', '{"accepte_cycles":true,"logement":"libéré"}', true, d0 - interval '1 day'),
  (uid,'GN','SOG','MDC', svc('GN','Lille','59','PSIG','PSIG Lille',50.63,3.06), 'PSIG', 96, '2027-09-01',
    '[{"ville":"Toulouse","departement":"31"},{"ville":"Montpellier","departement":"34"}]', '{"accepte_cycles":true}', true, d0 - interval '5 days'),
  (uid,'GN','SOG','GEN', svc('GN','Cayenne','973','BTA','BTA Cayenne',4.93,-52.33), 'Brigade territoriale', 36, '2027-08-01',
    '[{"ville":"Nantes","departement":"44"},{"ville":"La Rochelle","departement":"17"}]', '{"accepte_cycles":true}', true, d0 - interval '7 days'),
  (uid,'GN','SOG','GEN', svc('GN','Annecy','74','BMO','BMO Annecy',45.90,6.13), 'Brigade motorisée', 84, null,
    '[{"ville":"Ajaccio","departement":"2A"},{"ville":"Bastia","departement":"2B"}]', '{"accepte_cycles":false}', true, d0 - interval '8 days'),
  -- Administration pénitentiaire
  (uid,'AP','SURV','SURV', svc('AP','Fleury-Mérogis','91','MA','MA Fleury-Mérogis',48.63,2.36), 'Détention', 36, '2027-03-01',
    '[{"ville":"Toulouse","departement":"31"},{"ville":"Bordeaux","departement":"33"}]', '{"accepte_cycles":true,"conjoint":true}', true, d0 - interval '1 day'),
  (uid,'AP','SURV','SURV', svc('AP','Baumettes','13','CP','CP Marseille-Baumettes',43.24,5.40), 'Détention · nuit', 120, '2027-05-01',
    '[{"ville":"Lyon","departement":"69"},{"ville":"Villefranche","departement":"69"}]', '{"accepte_cycles":true}', true, d0 - interval '6 days');

  raise notice '12 annonces d''exemple créées';
end $$;
