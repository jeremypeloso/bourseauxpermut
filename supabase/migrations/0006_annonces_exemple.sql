-- Annonces d'exemple (clairement marquées), qui s'effacent à mesure que les vraies arrivent.
alter table annonces add column if not exists demo boolean not null default false;

-- Les compteurs publics ne comptent que le réel
create or replace function maj_stat_annonces() returns trigger language plpgsql security definer as $$
begin
  update stats_publiques set valeur = (select count(*) from annonces where statut = 'active' and not demo), maj = now() where cle = 'annonces_actives';
  return null;
end $$;

-- Exemples : à créer avec le compte admin (profil_id = votre propre id), demo = true.
-- Exemple d'insertion (adapter service_id aux ids réels de la table services) :
-- insert into annonces (profil_id, institution, corps, grade, service_id, type_service, anciennete_poste_mois, depart_des, cibles, demo)
-- values ('<VOTRE_UUID>', 'PN', 'CEA', 'GPX', 2, 'Sécurité publique · nuit', 84, '2027-03-01', '[{"ville":"Toulouse","departement":"31"},{"ville":"Montpellier","departement":"34"}]', true);
