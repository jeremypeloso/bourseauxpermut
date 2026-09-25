import { supabaseAdmin } from '@/lib/supabase-server';
import { Bouton } from '../Actions';
import { Table, d, Pill } from '../Table';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const MOTIFS: Record<string, string> = { identifiante: 'Identifiante', hors_sujet: 'Hors sujet', doublon: 'Doublon', autre: 'Autre' };
export default async function Signalements() {
  const a = supabaseAdmin();
  const { data: rows } = await a.from('signalements').select('id, motif, commentaire, statut, created_at, annonce_id, par, annonces(grade, statut, services(ville))').order('created_at', { ascending: false });
  const { data: { users } } = await a.auth.admin.listUsers({ perPage: 1000 });
  const mail = (id?: string | null) => id ? users.find(u => u.id === id)?.email ?? id.slice(0, 8) : '—';
  const R = (rows ?? []).map((s: any) => [
    <span key="a">{s.annonces ? <Link href={`/annonces/${s.annonce_id}`} className="font-bold text-navy underline">{s.annonces.grade} · {s.annonces.services?.ville}</Link> : <i className="text-[#6F7789]">annonce supprimée</i>}<br /><small className="text-[#6F7789]">{d(s.created_at)} · par {mail(s.par)}</small></span>,
    <span key="m"><b>{MOTIFS[s.motif] ?? s.motif}</b>{s.commentaire && <><br /><small className="text-[#3B4457]">« {s.commentaire} »</small></>}</span>,
    <Pill key="s" ok={s.statut === 'traite'} t={s.statut} warn={s.statut === 'ouvert'} />,
    <span key="ac" className="flex flex-wrap gap-1">{s.statut === 'ouvert' && <><Bouton action="signalement_traiter" id={s.id} label="Retirer l'annonce" danger extra={{ retirer: true, annonce_id: s.annonce_id }} confirm="Retirer l'annonce et clore le signalement ?" /><Bouton action="signalement_traiter" id={s.id} label="Clore sans retirer" /><Bouton action="signalement_rejeter" id={s.id} label="Rejeter" /></>}</span>,
  ]);
  const ouverts = (rows ?? []).filter(r => r.statut === 'ouvert').length;
  return <><h1 className="text-[22px] font-extrabold text-navy mb-1">Signalements</h1><p className="text-[13px] text-[#6F7789] mb-4">{ouverts} à traiter. Engagement affiché aux membres : examen sous 24 h.</p><Table cols={['Annonce', 'Motif', 'Statut', 'Actions']} rows={R} /></>;
}
