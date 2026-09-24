-- Le tableau de bord Supabase supprime les utilisateurs avec le rôle supabase_auth_admin ; la cascade vers les tables public
-- exige que ce rôle puisse y supprimer, sinon « Database error deleting user ».
grant usage on schema public to supabase_auth_admin;
grant delete, select on all tables in schema public to supabase_auth_admin;
alter default privileges in schema public grant delete, select on tables to supabase_auth_admin;
