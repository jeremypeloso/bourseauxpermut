create or replace view v_mes_correspondances with (security_invoker = false) as
select c.id, c.type, c.score, c.statut, c.detail, c.created_at,
       m.position, m.vers_service_id, m.reponse, (m.profil_id = auth.uid()) as est_moi,
       p.corps, p.grade, p.type_service, p.anciennete_poste_mois,
       s.ville as ville_actuelle, sv.ville as ville_cible
from correspondances c
join correspondance_membres m on m.correspondance_id = c.id
join profils p on p.id = m.profil_id
left join services s on s.id = p.service_id
left join services sv on sv.id = m.vers_service_id
where exists (
  select 1 from correspondance_membres me
  join profils moi on moi.id = me.profil_id
  where me.correspondance_id = c.id and me.profil_id = auth.uid()
    and (me.notifie_le <= now() or (moi.premium_jusqua is not null and moi.premium_jusqua > now()))
);
grant select on v_mes_correspondances to authenticated;
