import Link from 'next/link';
import Image from 'next/image';
import CarteFrance from '@/components/CarteFrance';
import CompteurLive from '@/components/CompteurLive';
import { supabaseServer, currentUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function Accueil() {
  const sb = supabaseServer();
  const user = (await currentUser())!;
  const { data: profil } = await sb.from('profils').select('institution, premium_jusqua, services(ville, lat, lng), souhaits(rang, services(ville, lat, lng))').eq('id', user.id).single();
  const premium = !!profil?.premium_jusqua && new Date(profil.premium_jusqua) > new Date();
  const { data: corrs } = await sb.from('v_mes_correspondances').select('id, type, score, created_at, est_moi, ville_actuelle, ville_cible').order('score', { ascending: false });
  const dernier = corrs?.find(c => c.est_moi);
  const nb = new Set((corrs ?? []).map(c => c.id)).size;
  const { data: cal } = await sb.from('calendriers').select('libelle, cloture').eq('institution', profil?.institution).order('cloture').limit(2);
  const { data: refs } = await sb.from('referents').select('id').eq('disponible', true);
  // Halos : comptage par ville des profils vérifiés (vue agrégée à ajouter en v1.1 ; ici les souhaits de démo)
  const me: any = (profil as any)?.services; const wish: any = (profil as any)?.souhaits?.find((s: any) => s.rang === 1)?.services;
  const points = [me && { lat: me.lat, lng: me.lng, label: me.ville, cls: 'me' as const }, wish && { lat: wish.lat, lng: wish.lng, label: wish.ville, cls: 'wish' as const }].filter(Boolean) as any[];
  const halos = [{ lat: 48.86, lng: 2.35, n: 1240 }, { lat: 45.76, lng: 4.83, n: 310 }, { lat: 43.30, lng: 5.37, n: 180 }, { lat: 50.63, lng: 3.06, n: 260 }, { lat: 44.84, lng: -0.58, n: 95 }, { lat: 47.22, lng: -1.55, n: 120 }, { lat: 48.58, lng: 7.75, n: 140 }];

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <Image src="/logo.png" alt="Hors Boîte" width={150} height={40} priority />
        <span className={premium ? 'pill-mint' : 'pill-bleu'}>{premium ? 'Premium' : 'Gratuit'}</span>
      </div>
      <Link href="/permut" className="block relative rounded-xl3 overflow-hidden bg-gradient-to-b from-[#DCE5F5] to-[#E9EEF7] p-3 pb-2 shadow-[0_14px_34px_-16px_rgba(15,27,51,.22)]">
        <div className="absolute left-3 top-3 bg-white/90 rounded-xl px-2.5 py-1.5 text-[10.5px] text-[#6F7789] leading-relaxed z-10">
          <i className="inline-block w-2 h-2 rounded-full bg-bleu mr-1.5 align-middle" />Vous<br /><i className="inline-block w-2 h-2 rounded-full bg-mint mr-1.5 align-middle" />Votre souhait
        </div>
        <div className="absolute right-3 top-3 bg-navy text-white rounded-xl px-2.5 py-1.5 text-[10.5px] text-right leading-tight z-10"><b className="block text-[16px] text-[#8FF0C0]"><CompteurLive initial={halos.reduce((s, h) => s + h.n, 0)} /></b>collègues en recherche<br />en ce moment</div>
        <CarteFrance points={points} halos={halos} cycle={me && wish ? [[me.lng, me.lat], [wish.lng, wish.lat]] : undefined} />
      </Link>

      {dernier ? (
        <Link href={`/permut/${dernier.id}`} className="card block mt-3">
          <div className="flex justify-between items-center"><b className="text-[15px] text-navy">{dernier.type === 'directe' ? 'Une permutation directe est possible' : `Un cycle à ${dernier.type === 'cycle3' ? 3 : 4} s'est fermé pour vous`}</b><span className="pill-mint">{dernier.score} %</span></div>
          <div className="sub mt-1">{dernier.ville_actuelle} → {dernier.ville_cible} · {nb} correspondance{nb > 1 ? 's' : ''} au total</div>
          {!premium && <span className="pill-amber mt-2">Reçu avec 48 h de retard · les Premium sont prévenus en premier</span>}
        </Link>
      ) : (
        <div className="card mt-3"><b className="text-[15px] text-navy">Rien de neuf</b><div className="sub mt-1">Vos souhaits sont actifs. Le matching tourne toutes les heures.</div></div>
      )}

      <div className="flex gap-2.5 mt-3">
        <Link href="/ecoute" className="flex-1 rounded-2xl px-3 py-3.5 text-white font-bold bg-gradient-to-br from-[#3ED18B] to-[#149A5E] shadow-lg leading-tight">Parler<small className="block text-[10.5px] font-semibold opacity-85">{refs?.length ?? 0} collègue{(refs?.length ?? 0) > 1 ? 's' : ''} dispo</small></Link>
        <Link href="/apres" className="flex-1 rounded-2xl px-3 py-3.5 text-white font-bold bg-gradient-to-br from-[#A66BFF] to-[#6C3BC9] shadow-lg leading-tight">L&apos;après<small className="block text-[10.5px] font-semibold opacity-85">Préparer sans le dire</small></Link>
      </div>
      <Link href="/points" className="flex justify-between items-center mt-3 bg-white rounded-2xl px-3.5 py-3 text-[12.5px] text-[#6F7789]"><span>Mes points de mutation</span><b className="text-navy">Simuler ›</b></Link>
      {(cal ?? []).map(c => <div key={c.libelle} className="flex justify-between items-center mt-2 bg-white rounded-2xl px-3.5 py-3 text-[12.5px] text-[#6F7789]"><span>{c.libelle}</span><b className="text-navy">Clôture le {new Date(c.cloture).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</b></div>)}
    </>
  );
}
