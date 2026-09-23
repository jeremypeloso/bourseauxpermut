-- Vérifié = carte pro OU mail pro (les deux = badge « Vérifié deux fois »)
drop policy if exists h_ins on historique_points;
create policy h_ins on historique_points for insert to authenticated with check (
  exists (select 1 from profils p where p.id = auth.uid() and (p.verifie_carte or p.verifie_mail_pro)));
