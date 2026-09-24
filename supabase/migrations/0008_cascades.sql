-- Toute clé étrangère vers profils ou auth.users supprime en cascade :
-- la suppression d'un compte (par l'agent ou par l'admin) doit tout effacer, sans blocage.
do $$
declare r record;
begin
  for r in
    select c.conname, c.conrelid::regclass as tbl, pg_get_constraintdef(c.oid) as def
    from pg_constraint c
    where c.contype = 'f'
      and c.confrelid in ('public.profils'::regclass, 'auth.users'::regclass)
      and c.conrelid::regclass::text not like 'auth.%'
      and pg_get_constraintdef(c.oid) not ilike '%on delete cascade%'
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
    execute format('alter table %s add constraint %I %s on delete cascade', r.tbl, r.conname, r.def);
  end loop;
end $$;
