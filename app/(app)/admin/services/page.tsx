import { supabaseAdmin } from '@/lib/supabase-server';
import { Bouton } from '../Actions';
import { Table, d, Pill } from '../Table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Services() {
  const a = supabaseAdmin();
  const { data: rows } = await a.from('services').select('id, institution, ville, departement, type, libelle, valide, ajoute_par, created_at').not('ajoute_par', 'is', null).order('created_at', { ascending: false });
  const { data: { users } } = await a.auth.admin.listUsers({ perPage: 1000 });
  const { data: usages } = await a.from('profils').select('service_id');
  const mail = (id: string) => users.find(u => u.id === id)?.email ?? id.slice(0, 8);
  const R = (rows ?? []).map((s: any) => [
    <span key="t"><b className="text-navy">{s.libelle}</b><br /><small className="text-[#6F7789]">{s.institution} · {s.ville} ({s.departement}) · {s.type} · ajoutée le {d(s.created_at)} par {mail(s.ajoute_par)}</small></span>,
    <span key="u">{(usages ?? []).filter(u => u.service_id === s.id).length} agent(s)</span>,
    <Pill key="v" ok={!!s.valide} t={s.valide ? 'Validée' : 'À contrôler'} warn={!s.valide} />,
    <span key="ac" className="flex gap-1">{!s.valide && <Bouton action="valider_service" id={String(s.id)} label="Valider" />}<Bouton action="supprimer_service" id={String(s.id)} label="Supprimer" danger confirm="Supprimer cette affectation ? Les profils qui l'utilisent perdront leur affectation." /></span>,
  ]);
  return <><h1 className="text-[22px] font-extrabold text-navy mb-1">Affectations ajoutées par les agents</h1><p className="text-[13px] text-[#6F7789] mb-4">Contrôle des libellés : rien d&apos;identifiant, pas de doublon avec le référentiel.</p><Table cols={['Affectation', 'Utilisée par', 'État', 'Actions']} rows={R} /></>;
}
