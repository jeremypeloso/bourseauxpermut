-- Verrou côté base : seules les institutions ouvertes acceptent des profils (le front ne suffit pas).
alter table institutions add column if not exists ouverte boolean not null default false;
update institutions set ouverte = (code = 'PN');   -- ouvrir GN / AP plus tard : update institutions set ouverte = true where code in ('GN','AP');

create or replace function verif_institution_ouverte() returns trigger language plpgsql as $$
begin
  if not exists (select 1 from institutions where code = new.institution and ouverte) then
    raise exception 'Institution % pas encore ouverte', new.institution using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists trg_institution_ouverte on profils;
create trigger trg_institution_ouverte before insert or update of institution on profils for each row execute function verif_institution_ouverte();
