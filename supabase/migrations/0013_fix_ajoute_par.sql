-- services.ajoute_par créait un second lien profils <-> services : PostgREST ne savait plus lequel suivre
-- (lecture du profil avec son affectation → vide → « profil manquant »). On garde la colonne, sans clé étrangère.
alter table services drop constraint if exists services_ajoute_par_fkey;
