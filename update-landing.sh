#!/usr/bin/env bash
# Hors Boîte — mise à jour : page d'accueil publique + inscription à deux voies
# Usage : bash update-landing.sh (à la racine du projet)
set -e

cat > "next.config.mjs" << 'HB_EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
    serverComponentsExternalPackages: ['tesseract.js'],
  },
};
export default nextConfig;
HB_EOF

mkdir -p "app"
cat > "app/page.tsx" << 'HB_EOF'
import Landing from '@/components/Landing';
export default function Home() { return <Landing />; }
HB_EOF

mkdir -p "app"
cat > "app/layout.tsx" << 'HB_EOF'
import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Hors Boîte',
  description: 'Bouger, tenir, partir. Ici, personne ne le sait. Permutation de postes, écoute anonyme, préparation de l\'après. Police, gendarmerie, pénitentiaire.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#EEF2F8' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr"><body className="min-h-full">{children}</body></html>
  );
}
HB_EOF

mkdir -p "app/(app)"
cat > "app/(app)/layout.tsx" << 'HB_EOF'
import TabBar from '@/components/TabBar';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/supabase-server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/');
  return (
    <div className="mx-auto max-w-[430px] min-h-screen flex flex-col">
      <div className="flex-1 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-5">{children}</div>
      <TabBar />
    </div>
  );
}
HB_EOF

mkdir -p "app/login"
cat > "app/login/page.tsx" << 'HB_EOF'
import { redirect } from 'next/navigation';
export default function Login() { redirect('/'); }
HB_EOF

mkdir -p "app/auth/callback"
cat > "app/auth/callback/route.ts" << 'HB_EOF'
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/** Retour du lien magique : échange le code contre une session, puis redirige (next) ou onboarding/accueil. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const next = req.nextUrl.searchParams.get('next');
  const sb = supabaseServer();
  if (code) await sb.auth.exchangeCodeForSession(code);
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/', req.url));
  const { data: profil } = await sb.from('profils').select('verifie_carte, verifie_mail_pro').eq('id', user.id).maybeSingle();
  if (next && next.startsWith('/')) return NextResponse.redirect(new URL(next, req.url));
  return NextResponse.redirect(new URL(profil ? '/accueil' : '/onboarding', req.url));
}
HB_EOF

mkdir -p "app/onboarding"
cat > "app/onboarding/page.tsx" << 'HB_EOF'
'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Etape = 0 | 1 | 2 | 3 | 4;
const INSTITUTIONS = [
  { code: 'PN', t: 'Police nationale', s: 'CEA, CC, CCD · mouvements généraux et profilés · barème à points', c: 'from-[#4C86FF] to-[#1B4FD6]' },
  { code: 'GN', t: 'Gendarmerie nationale', s: 'Sous-officiers, GAV, officiers · plan annuel de mutation · logement en caserne', c: 'from-[#2F4A8A] to-[#0F1B33]' },
  { code: 'AP', t: 'Administration pénitentiaire', s: 'Surveillants, gradés, officiers, CPIP · campagnes de mobilité Justice', c: 'from-[#7A3E9D] to-[#4B1F6B]' },
];
const PROMESSES = [
  ['Identité masquée', 'Vos nom, matricule et service ne sont jamais affichés avant une acceptation mutuelle.'],
  ['Aucun annuaire, aucune recherche par nom', 'Vous ne voyez que vos propres correspondances. Vos collègues ne peuvent pas vous trouver.'],
  ['Matricule haché, carte pro jamais stockée', 'La photo sert à vérifier, puis elle est détruite. Il ne reste qu\'une empreinte non réversible.'],
  ['Aucun accès pour l\'administration, la hiérarchie ou les syndicats', 'Données hébergées en Europe, chiffrées, jamais vendues, sans publicité.'],
  ['Suppression totale en un geste', 'Compte, souhaits, historique de matching : tout disparaît immédiatement.'],
];

function OnboardingInner() {
  const r = useRouter();
  const sp = useSearchParams();
  const voie = sp.get('voie') === '2' ? 2 : 1;
  const [etape, setEtape] = useState<Etape>(0);
  const [inst, setInst] = useState('PN');
  const [lecture, setLecture] = useState<any>(null);
  const [email, setEmail] = useState(sp.get('pro') ?? '');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Crée le profil minimal s'il n'existe pas
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return r.replace('/login');
      const { data } = await sb.from('profils').select('institution, verifie_carte, verifie_mail_pro').eq('id', user.id).maybeSingle();
      if (data) { setInst(data.institution); if (data.verifie_carte || data.verifie_mail_pro) r.replace('/accueil'); }
    })();
  }, [r]);

  const choisirInstitution = async () => {
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    await sb.from('profils').upsert({ id: user!.id, institution: inst }, { onConflict: 'id', ignoreDuplicates: true });
    setEtape(1);
  };

  const envoyerCarte = async (f: File) => {
    setBusy(true); setMsg(null);
    const fd = new FormData(); fd.append('image', f);
    const res = await fetch('/api/verify/card', { method: 'POST', body: fd }).then(x => x.json());
    setBusy(false);
    if (res.ok) setLecture(res); else setMsg(res.message ?? 'Lecture impossible');
  };

  const envoyerMail = async () => {
    setBusy(true); setMsg(null);
    const res = await fetch('/api/verify/mail-pro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', email }) }).then(x => x.json());
    setBusy(false); setMsg(res.ok ? 'Code envoyé sur votre boîte pro. Il reste valable 7 jours.' : res.message);
  };
  const confirmer = async () => {
    setBusy(true); setMsg(null);
    const res = await fetch('/api/verify/mail-pro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'confirm', code }) }).then(x => x.json());
    setBusy(false); if (res.ok) setEtape(4); else setMsg(res.message);
  };

  const Dots = () => <div className="flex justify-center gap-1.5 my-3">{[0,1,2,3,4].map(i => <i key={i} className={`h-2 rounded-full ${i === etape ? 'w-5 bg-bleu' : 'w-2 bg-[#D5D9E2]'}`} />)}</div>;

  return (
    <main className="flex-1 flex flex-col px-5 pt-[max(12px,env(safe-area-inset-top))] pb-6">
      <Dots />
      {etape === 0 && (<>
        <Image src="/porte.png" alt="" width={90} height={110} className="mx-auto drop-shadow-xl" />
        <h1 className="h1 text-center mt-3">Vous êtes…</h1>
        <p className="sub text-center mt-2">Chaque institution est un couloir séparé : on ne permute qu&apos;avec ses collègues. Ce choix ne pourra pas être modifié après vérification.</p>
        <div className="flex flex-col gap-3 mt-5">
          {INSTITUTIONS.map(i => (
            <button key={i.code} onClick={() => setInst(i.code)} className={`flex items-center gap-3 text-left bg-white rounded-xl2 p-4 border-2 ${inst === i.code ? 'border-bleu bg-[#E6EEFF]' : 'border-[#E6E9F0]'}`}>
              <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${i.c} text-white font-extrabold flex items-center justify-center`}>{i.code}</span>
              <span><b className="block text-navy">{i.t}</b><small className="sub">{i.s}</small></span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button className="btn-dark mt-4" onClick={choisirInstitution}>Continuer</button>
      </>)}

      {etape === 1 && (<>
        <Image src="/porte.png" alt="" width={90} height={110} className="mx-auto drop-shadow-xl" />
        <h1 className="h1 text-center mt-3">Personne ne saura<br />que vous cherchez</h1>
        <p className="sub text-center mt-2">Hors Boîte a été conçue par un ancien fonctionnaire de police, pour les policiers, les gendarmes et les personnels pénitentiaires. La discrétion administrative n&apos;est pas une option, c&apos;est la base.</p>
        <div className="card mt-4">
          {PROMESSES.map(([t, s]) => (
            <div key={t} className="flex gap-3 py-2.5 border-t border-[#E6E9F0] first:border-t-0">
              <span className="w-6 h-6 rounded-full bg-[#DFF7EB] text-[#16804F] text-[12px] font-extrabold flex items-center justify-center shrink-0">✓</span>
              <span><b className="block text-navy text-[13.5px]">{t}</b><span className="sub">{s}</span></span>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <button className="btn-dark mt-4" onClick={() => setEtape(voie === 2 ? 3 : 2)}>Je comprends, continuer</button>
      </>)}

      {etape === 2 && (<>
        <h1 className="h1">Vérification<br /><span className="text-bleu">Votre carte pro</span></h1>
        <p className="sub mt-2">Carte de police, carte militaire gendarmerie ou carte pénitentiaire. La photo est analysée puis détruite dans la seconde, elle n&apos;est jamais enregistrée.</p>
        <input ref={file} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && envoyerCarte(e.target.files[0])} />
        {!lecture ? (
          <>
            <button className="btn mt-5" onClick={() => file.current?.click()} disabled={busy}>{busy ? 'Analyse en cours…' : 'Prendre la carte en photo'}</button>
            {msg && <p className="text-[12.5px] text-[#C8323B] mt-3">{msg}</p>}
            <button className="btn-ghost mt-2" onClick={() => setEtape(3)}>Je préfère vérifier par mon adresse pro</button>
          </>
        ) : (
          <div className="card mt-5">
            <div className="flex justify-between items-center"><b className="text-[14px]">Lecture automatique</b><span className="pill-mint">Réussie</span></div>
            <div className="flex flex-wrap gap-1.5 mt-3 text-[12.5px]">
              <span className="bg-[#F5F7FB] rounded-lg px-2.5 py-1.5"><b className="text-[#6F7789] font-semibold mr-1">Nom</b>{lecture.nom}</span>
              <span className="bg-[#F5F7FB] rounded-lg px-2.5 py-1.5"><b className="text-[#6F7789] font-semibold mr-1">Prénom</b>{lecture.prenom}</span>
              <span className="bg-[#F5F7FB] rounded-lg px-2.5 py-1.5"><b className="text-[#6F7789] font-semibold mr-1">Matricule</b>{lecture.matricule_masque}</span>
            </div>
            <p className="sub mt-3">Le matricule est transformé en empreinte irréversible. La photo a été détruite.</p>
            <button className="btn mt-3" onClick={() => setEtape(4)}>C'est vérifié, continuer</button>
            <button className="btn-ghost mt-2" onClick={() => setEtape(3)}>Ajouter aussi mon adresse pro (badge « Vérifié deux fois »)</button>
          </div>
        )}
      </>)}

      {etape === 3 && (<>
        <h1 className="h1">{voie === 2 ? 'Vérification' : 'Vérification 2 sur 2'}<br /><span className="text-bleu">Votre adresse pro</span></h1>
        <p className="sub mt-2">Votre boîte nominative, pas celle de l&apos;unité. Police : @interieur.gouv.fr. Gendarmerie : @gendarmerie.interieur.gouv.fr. Pénitentiaire : @justice.fr. Le code est à lire au service, valable 7 jours.</p>
        <input className="field mt-5" type="email" placeholder="prenom.nom@interieur.gouv.fr" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="btn-ghost mt-2" onClick={envoyerMail} disabled={busy || !email.includes('@')}>Envoyer le code</button>
        <input className="field mt-4 text-center text-[22px] tracking-[6px] font-extrabold" inputMode="numeric" placeholder="000000" value={code} onChange={e => setCode(e.target.value)} />
        {msg && <p className="text-[12.5px] text-navy mt-3">{msg}</p>}
        <button className="btn mt-3" onClick={confirmer} disabled={busy || code.replace(/\s/g, '').length !== 6}>Confirmer le code</button>
        <button className="btn-ghost mt-2" onClick={() => setEtape(2)}>Je préfère photographier ma carte pro</button>
        <button className="btn-ghost mt-2" onClick={() => r.push('/profil')}>Plus tard, je remplis mes souhaits</button>
      </>)}

      {etape === 4 && (<>
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#3ED18B] to-[#149A5E] mx-auto flex items-center justify-center text-white text-3xl font-extrabold mt-2">✓</div>
        <h1 className="h1 text-center mt-4">Compte vérifié</h1>
        <p className="sub text-center mt-2">Ce que Hors Boîte conserve de vous, et rien d&apos;autre.</p>
        <div className="card mt-4">
          <div className="kv"><span>Nom et prénom</span><b>Chiffrés, table séparée</b></div>
          <div className="kv"><span>Matricule</span><b>Empreinte uniquement</b></div>
          <div className="kv"><span>Photo de la carte</span><b className="text-[#16804F]">{lecture ? 'Détruite' : 'Jamais demandée'}</b></div>
          <div className="kv"><span>Adresse pro</span><b>Chiffrée</b></div>
          <div className="kv"><span>Corps, grade, affectation</span><b>Pour le matching</b></div>
        </div>
        <div className="flex-1" />
        <button className="btn-dark mt-4" onClick={() => r.push('/profil')}>Renseigner mes souhaits</button>
      </>)}
    </main>
  );
}

export default function Onboarding() {
  return <Suspense><OnboardingInner /></Suspense>;
}
HB_EOF

mkdir -p "app/api/verify/mail-pro"
cat > "app/api/verify/mail-pro/route.ts" << 'HB_EOF'
import { NextRequest, NextResponse } from 'next/server';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';
import { decrypt, encrypt, hashCode } from '@/lib/crypto';
import { envoyerCodePro } from '@/lib/email';

export const runtime = 'nodejs';

function normalise(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
}

/** POST { action:'send', email } | { action:'confirm', code } */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const body = await req.json();
  const admin = supabaseAdmin();

  if (body.action === 'send') {
    const email: string = String(body.email ?? '').trim().toLowerCase();
    const [local, domaine] = email.split('@');
    if (!local || !domaine) return NextResponse.json({ ok: false, message: 'Adresse invalide.' });

    const { data: profil } = await admin.from('profils').select('institution').eq('id', user.id).single();
    const { data: inst } = await admin.from('institutions').select('domaines_mail').eq('code', profil?.institution).single();
    if (!inst?.domaines_mail?.includes(domaine)) {
      return NextResponse.json({ ok: false, message: 'Le domaine ne correspond pas à votre institution. Utilisez votre adresse nominative, pas celle de l\'unité.' });
    }
    // Cohérence avec le nom lu sur la carte
    const { data: ident } = await admin.from('identites').select('nom_enc, prenom_enc').eq('profil_id', user.id).maybeSingle();
    if (ident && decrypt(ident.nom_enc)) {
      // Voie 1 + 2 : l'adresse doit correspondre au nom lu sur la carte
      const nom = normalise(decrypt(ident.nom_enc)), prenom = normalise(decrypt(ident.prenom_enc));
      const l = normalise(local);
      if (!(l.includes(nom) && l.includes(prenom.slice(0, 3)))) {
        return NextResponse.json({ ok: false, message: 'L\'adresse ne semble pas être la vôtre (prénom.nom attendu).' });
      }
    } else if (!/^[a-z]+[.\-][a-z\-]+\d*$/.test(normalise(local).length ? local : '')) {
      // Voie 2 seule : on exige au moins la forme prenom.nom (pas une boîte fonctionnelle)
      return NextResponse.json({ ok: false, message: 'Utilisez votre adresse nominative (prenom.nom@…), pas une boîte de service.' });
    }
    if (!ident) {
      // Voie 2 seule : prénom.nom déduits de l'adresse pour la révélation ultérieure
      const [pre, nomAdr] = local.split(/[.\-]/);
      await admin.from('identites').insert({ profil_id: user.id, nom_enc: encrypt((nomAdr ?? '').toUpperCase()), prenom_enc: encrypt(pre ?? ''), mail_pro_enc: encrypt(email) });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await admin.from('codes_mail_pro').upsert({
      profil_id: user.id, code_hash: hashCode(code), expire_le: new Date(Date.now() + 7 * 86400e3).toISOString(), tentatives: 0,
    });
    await admin.from('identites').update({ mail_pro_enc: encrypt(email) }).eq('profil_id', user.id);
    await envoyerCodePro(email, code.slice(0, 3) + ' ' + code.slice(3));
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'confirm') {
    const code = String(body.code ?? '').replace(/\s+/g, '');
    const { data: row } = await admin.from('codes_mail_pro').select('*').eq('profil_id', user.id).single();
    if (!row || new Date(row.expire_le) < new Date()) return NextResponse.json({ ok: false, message: 'Code expiré, demandez-en un nouveau.' });
    if (row.tentatives >= 5) return NextResponse.json({ ok: false, message: 'Trop de tentatives.' });
    if (row.code_hash !== hashCode(code)) {
      await admin.from('codes_mail_pro').update({ tentatives: row.tentatives + 1 }).eq('profil_id', user.id);
      return NextResponse.json({ ok: false, message: 'Code incorrect.' });
    }
    await admin.from('codes_mail_pro').delete().eq('profil_id', user.id);
    await admin.from('profils').update({ verifie_mail_pro: true, verifie_le: new Date().toISOString() }).eq('id', user.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'action inconnue' }, { status: 400 });
}
HB_EOF

mkdir -p "app/api/cron/matching"
cat > "app/api/cron/matching/route.ts" << 'HB_EOF'
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { Agent, construireGraphe, scorer, trouverCycles } from '@/lib/matching';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** Appelé par Vercel Cron toutes les heures. Protégé par CRON_SECRET. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'interdit' }, { status: 401 });
  }
  const admin = supabaseAdmin();
  const { data: profils } = await admin
    .from('profils')
    .select('id, institution, corps, grade, service_id, type_service, anciennete_poste_mois, depart_des, accepte_cycles, accepte_souhait_2_3, accepte_changer_service, premium_jusqua, services(departement), souhaits(rang, service_id, departement, contrainte_type_service)')
    .or('verifie_carte.eq.true,verifie_mail_pro.eq.true');

  const agents: Agent[] = (profils ?? []).map((p: any) => ({
    id: p.id, institution: p.institution, corps: p.corps, grade: p.grade, service_id: p.service_id,
    departement: p.services?.departement ?? null, type_service: p.type_service,
    anciennete_poste_mois: p.anciennete_poste_mois, depart_des: p.depart_des,
    accepte_cycles: p.accepte_cycles, accepte_souhait_2_3: p.accepte_souhait_2_3, accepte_changer_service: p.accepte_changer_service,
    premium: !!p.premium_jusqua && new Date(p.premium_jusqua) > new Date(),
    souhaits: p.souhaits ?? [],
  }));
  const map = new Map(agents.map(a => [a.id, a]));
  const cycles = trouverCycles(construireGraphe(agents), map, 4);

  let crees = 0;
  for (const c of cycles) {
    const signature = [...c.ids].sort().join('|');
    const { score, detail } = scorer(c, map);
    if (score < 40) continue;
    const { data: corr, error } = await admin.from('correspondances').insert({
      institution: map.get(c.ids[0])!.institution,
      type: c.ids.length === 2 ? 'directe' : c.ids.length === 3 ? 'cycle3' : 'cycle4',
      score, detail, signature,
    }).select('id').single();
    if (error || !corr) continue; // signature déjà connue
    const now = Date.now();
    const membres = c.ids.map((id, i) => {
      const suivant = map.get(c.ids[(i + 1) % c.ids.length])!;
      const a = map.get(id)!;
      return {
        correspondance_id: corr.id, profil_id: id, position: i + 1, vers_service_id: suivant.service_id,
        // Premium : notifié tout de suite ; gratuit : 48 h plus tard
        notifie_le: new Date(now + (a.premium ? 0 : 48 * 3600e3)).toISOString(),
      };
    });
    await admin.from('correspondance_membres').insert(membres);
    crees++;
  }
  return NextResponse.json({ agents: agents.length, cycles: cycles.length, crees });
}
HB_EOF

mkdir -p "app/(app)/profil"
cat > "app/(app)/profil/Form.tsx" << 'HB_EOF'
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function FormProfil({ profil, souhaits, services, corps, grades }: any) {
  const r = useRouter();
  const sb = supabaseBrowser();
  const [p, setP] = useState({ corps: profil?.corps ?? '', grade: profil?.grade ?? '', service_id: profil?.service_id ?? '', type_service: profil?.type_service ?? '', anciennete_poste_mois: profil?.anciennete_poste_mois ?? 0, depart_des: profil?.depart_des ?? '', cimm_departement: profil?.cimm_departement ?? '', accepte_cycles: profil?.accepte_cycles ?? true, accepte_souhait_2_3: profil?.accepte_souhait_2_3 ?? true, accepte_changer_service: profil?.accepte_changer_service ?? false });
  const [s, setS] = useState<any[]>(souhaits.length ? souhaits : [{ rang: 1, service_id: '' }]);
  const [msg, setMsg] = useState<string | null>(null);
  const verifie = profil?.verifie_carte || profil?.verifie_mail_pro;
  const deuxFois = profil?.verifie_carte && profil?.verifie_mail_pro;

  const save = async () => {
    setMsg(null);
    const { error } = await sb.from('profils').update({ ...p, service_id: p.service_id || null, depart_des: p.depart_des || null, cimm_departement: p.cimm_departement || null }).eq('id', profil.id);
    if (error) return setMsg(error.message);
    await sb.from('souhaits').delete().eq('profil_id', profil.id);
    const rows = s.filter(x => x.service_id).map((x, i) => ({ profil_id: profil.id, rang: i + 1, service_id: +x.service_id, contrainte_type_service: x.contrainte_type_service || null }));
    if (rows.length) { const { error: e2 } = await sb.from('souhaits').insert(rows); if (e2) return setMsg(e2.message); }
    setMsg('Enregistré. Le prochain passage du matching en tiendra compte.'); r.refresh();
  };
  const monter = (i: number) => { if (i === 0) return; const a = [...s]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setS(a); };
  const supprimerCompte = async () => {
    if (!confirm('Supprimer définitivement votre compte et toutes vos données ?')) return;
    await fetch('/api/compte', { method: 'DELETE' }); await sb.auth.signOut(); location.href = '/';
  };
  const Sw = ({ k }: { k: 'accepte_cycles' | 'accepte_souhait_2_3' | 'accepte_changer_service' }) => <button onClick={() => setP({ ...p, [k]: !p[k] })} className={`w-[46px] h-[27px] rounded-full relative transition ${p[k] ? 'bg-bleu' : 'bg-[#D5D9E2]'}`}><span className={`absolute top-[3px] w-[21px] h-[21px] rounded-full bg-white shadow transition-all ${p[k] ? 'left-[22px]' : 'left-[3px]'}`} /></button>;
  const sel = 'field mt-1';

  return (
    <>
      <div className="flex justify-between items-center mb-3"><h1 className="h1">Mon profil</h1><span className={verifie ? 'pill-mint' : 'pill-amber'}>{deuxFois ? 'Vérifié deux fois' : verifie ? 'Vérifié' : 'À vérifier'}</span></div>
      {!verifie && <a href="/onboarding" className="btn mb-3">Terminer la vérification</a>}
      <div className="card">
        <div className="kv"><span>Institution</span><b>{profil?.institution}</b></div>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Corps<select className={sel} value={p.corps} onChange={e => setP({ ...p, corps: e.target.value, grade: '' })}><option value="">—</option>{corps.map((c: any) => <option key={c.code} value={c.code}>{c.libelle}</option>)}</select></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Grade<select className={sel} value={p.grade} onChange={e => setP({ ...p, grade: e.target.value })}><option value="">—</option>{grades.filter((g: any) => g.corps === p.corps).map((g: any) => <option key={g.code} value={g.code}>{g.libelle}</option>)}</select></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Affectation actuelle<select className={sel} value={p.service_id} onChange={e => setP({ ...p, service_id: e.target.value })}><option value="">—</option>{services.map((x: any) => <option key={x.id} value={x.id}>{x.libelle} ({x.departement})</option>)}</select></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Type de service<input className={sel} value={p.type_service} onChange={e => setP({ ...p, type_service: e.target.value })} placeholder="SP jour, BAC nuit, brigade, détention…" /></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Ancienneté dans le poste (mois)<input type="number" className={sel} value={p.anciennete_poste_mois} onChange={e => setP({ ...p, anciennete_poste_mois: +e.target.value })} /></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Départ possible dès<input type="date" className={sel} value={p.depart_des} onChange={e => setP({ ...p, depart_des: e.target.value })} /></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">CIMM déclaré (département, outre-mer)<input className={sel} value={p.cimm_departement} onChange={e => setP({ ...p, cimm_departement: e.target.value })} placeholder="974, 971…" /></label>
      </div>

      <h2 className="text-[15px] font-bold text-navy mt-4 mb-2">Mes souhaits, par ordre</h2>
      <div className="card">
        {s.map((x, i) => (
          <div key={i} className="flex items-center gap-2 py-2 border-t border-[#E6E9F0] first:border-t-0">
            <span className="w-7 h-7 rounded-lg bg-navy text-white text-[12px] font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
            <select className="field py-2" value={x.service_id} onChange={e => { const a = [...s]; a[i] = { ...a[i], service_id: e.target.value }; setS(a); }}><option value="">Choisir…</option>{services.map((y: any) => <option key={y.id} value={y.id}>{y.libelle}</option>)}</select>
            <button onClick={() => monter(i)} className="w-8 h-8 rounded-lg bg-[#F5F7FB] text-[#6F7789]">↑</button>
            <button onClick={() => setS(s.filter((_, j) => j !== i))} className="w-8 h-8 rounded-lg bg-[#F5F7FB] text-[#C8323B]">×</button>
          </div>
        ))}
        {s.length < 5 && <button className="btn-ghost mt-2 py-2.5" onClick={() => setS([...s, { rang: s.length + 1, service_id: '' }])}>Ajouter un souhait</button>}
      </div>

      <h2 className="text-[15px] font-bold text-navy mt-4 mb-2">Réglages du matching</h2>
      <div className="card">
        <div className="kv"><span>Accepter les cycles à 3 et 4</span><Sw k="accepte_cycles" /></div>
        <div className="kv"><span>Accepter un souhait n°2 ou n°3</span><Sw k="accepte_souhait_2_3" /></div>
        <div className="kv"><span>Changer de type de service</span><Sw k="accepte_changer_service" /></div>
      </div>
      {msg && <p className="sub text-center my-2">{msg}</p>}
      <button className="btn mt-2" onClick={save}>Enregistrer</button>

      <h2 className="text-[15px] font-bold text-navy mt-6 mb-2">Discrétion</h2>
      <div className="card">
        <div className="kv"><span>Relire les engagements</span><a href="/onboarding" className="text-bleu">Voir ›</a></div>
        <div className="kv"><span>Se déconnecter</span><button className="text-bleu" onClick={async () => { await sb.auth.signOut(); location.href = '/'; }}>Sortir ›</button></div>
      </div>
      <button className="btn-ghost mt-2 text-[#C8323B] border-[#FFD3D6]" onClick={supprimerCompte}>Supprimer mon compte et toutes mes données</button>
    </>
  );
}
HB_EOF

mkdir -p "components"
cat > "components/AuthModal.tsx" << 'HB_EOF'
'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Mode = 'signup' | 'login';
export default function AuthModal({ open, initial, onClose }: { open: boolean; initial: Mode; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [voie, setVoie] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [pro, setPro] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const envoyer = async () => {
    setBusy(true); setErr(null);
    // La session est toujours ouverte sur l'adresse personnelle : on ne veut jamais
    // qu'un lien de connexion atterrisse sur un poste de service.
    const next = mode === 'signup' ? `/onboarding?voie=${voie}${voie === 2 && pro ? `&pro=${encodeURIComponent(pro)}` : ''}` : '/accueil';
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email, options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) setErr(error.message); else setEnvoye(true);
  };

  const Tab = ({ m, t }: { m: Mode; t: string }) => <button onClick={() => { setMode(m); setEnvoye(false); }} className={`rounded-full px-4 py-2 text-[13px] font-bold ${mode === m ? 'bg-navy text-white' : 'bg-[#F5F7FB] text-[#6F7789]'}`}>{t}</button>;

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-[920px] max-w-full p-7 relative">
        <button className="absolute right-4 top-3 text-2xl text-[#A3AAB8]" onClick={onClose}>×</button>
        <div className="flex gap-1.5"><Tab m="signup" t="Créer mon compte" /><Tab m="login" t="Connexion" /></div>

        {envoye ? (
          <div className="mt-6 text-center py-8"><b className="text-navy text-lg">Lien envoyé sur {email}</b><p className="sub mt-2">Ouvrez-le depuis l&apos;appareil sur lequel vous voulez utiliser Hors Boîte. {mode === 'signup' && voie === 2 ? 'Le code pro vous sera demandé juste après.' : ''}</p></div>
        ) : mode === 'signup' ? (
          <>
            <h3 className="text-[24px] font-extrabold tracking-tight text-navy mt-4">Comment voulez-vous prouver que vous êtes des nôtres ?</h3>
            <div className="grid md:grid-cols-2 gap-4 mt-5">
              {([1, 2] as const).map(v => (
                <button key={v} onClick={() => setVoie(v)} className={`text-left rounded-2xl p-5 border-[1.5px] ${voie === v ? 'border-bleu bg-[#E6EEFF]' : 'border-[#E6E9F0] bg-white'}`}>
                  <div className={`w-11 h-11 rounded-2xl mb-3 flex items-center justify-center bg-gradient-to-br ${v === 1 ? 'from-[#4C86FF] to-[#1B4FD6]' : 'from-[#3ED18B] to-[#149A5E]'}`}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{v === 1 ? <><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="8.5" cy="12" r="2.5" /><path d="M13 10h5M13 14h5" /></> : <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 8l9 6 9-6" /></>}</svg>
                  </div>
                  <b className="block text-navy">{v === 1 ? 'Email perso + carte pro' : 'Email pro + code'}</b>
                  <p className="text-[13px] text-[#6F7789] mt-1">{v === 1 ? 'Un lien de connexion sur votre adresse personnelle, puis la carte pro photographiée et détruite dans la seconde.' : 'Un code à 6 chiffres sur votre boîte nominative de service, dans un mail neutre, valable 7 jours.'}</p>
                  <span className="inline-block mt-2 text-[11px] font-bold px-2 py-1 rounded-full bg-[#DFF7EB] text-[#16804F]">{v === 1 ? 'Le plus discret' : 'Le plus rapide'}</span>
                </button>
              ))}
            </div>
            <div className="mt-5">
              <input className="field" type="email" placeholder="votre.adresse@perso.fr" value={email} onChange={e => setEmail(e.target.value)} />
              {voie === 2 && <input className="field mt-2" type="email" placeholder="prenom.nom@interieur.gouv.fr (adresse pro nominative)" value={pro} onChange={e => setPro(e.target.value)} />}
              <p className="sub mt-2">{voie === 1 ? 'Vous recevrez un lien de connexion, sans mot de passe. La photo de la carte pro se fait à l\'étape suivante, dans l\'app.' : 'Le compte reste sur votre adresse personnelle. Le code partira sur la boîte pro, à lire au service dans les 7 jours. Domaines acceptés : @interieur.gouv.fr, @gendarmerie.interieur.gouv.fr, @justice.fr.'}</p>
              {err && <p className="text-coral text-[12.5px] mt-2">{err}</p>}
              <button className="btn mt-3" onClick={envoyer} disabled={busy || !email.includes('@') || (voie === 2 && !pro.includes('@'))}>{busy ? 'Envoi…' : 'Recevoir mon lien'}</button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-[24px] font-extrabold tracking-tight text-navy mt-4">Connexion</h3>
            <p className="sub mt-1">Votre adresse personnelle, celle du compte. Un lien vous est envoyé, pas de mot de passe.</p>
            <input className="field mt-3" type="email" placeholder="votre.adresse@perso.fr" value={email} onChange={e => setEmail(e.target.value)} />
            {err && <p className="text-coral text-[12.5px] mt-2">{err}</p>}
            <button className="btn mt-3" onClick={envoyer} disabled={busy || !email.includes('@')}>{busy ? 'Envoi…' : 'Recevoir mon lien'}</button>
          </>
        )}
      </div>
    </div>
  );
}
HB_EOF

mkdir -p "components"
cat > "components/Landing.tsx" << 'HB_EOF'
'use client';
import { useState } from 'react';
import Image from 'next/image';
import AuthModal from './AuthModal';
import CarteFrance from './CarteFrance';

const HALOS = [{ lat: 48.86, lng: 2.35, n: 1240 }, { lat: 45.76, lng: 4.83, n: 310 }, { lat: 43.30, lng: 5.37, n: 180 }, { lat: 50.63, lng: 3.06, n: 260 }, { lat: 44.84, lng: -0.58, n: 95 }, { lat: 47.22, lng: -1.55, n: 120 }, { lat: 48.58, lng: 7.75, n: 140 }, { lat: 48.11, lng: -1.68, n: 60 }, { lat: 49.44, lng: 1.1, n: 70 }, { lat: 45.19, lng: 5.72, n: 60 }];

export default function Landing() {
  const [modal, setModal] = useState<null | 'signup' | 'login'>(null);
  const Btn = ({ m, t, cls = '' }: { m: 'signup' | 'login'; t: string; cls?: string }) => <button onClick={() => setModal(m)} className={cls}>{t}</button>;

  return (
    <div className="w-full text-[#141A26]">
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-[#E6E9F0]">
        <div className="max-w-[1180px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Image src="/logo.png" alt="Hors Boîte" width={150} height={38} priority />
          <nav className="hidden md:flex gap-7 text-[14px] font-semibold text-[#6F7789]"><a href="#modules">Ce que ça fait</a><a href="#comment">Comment on entre</a><a href="#discretion">Discrétion</a><a href="#tarif">Tarif</a></nav>
          <div className="flex gap-2"><Btn m="login" t="Connexion" cls="btn-ghost !w-auto !py-3" /><Btn m="signup" t="Créer mon compte" cls="btn !w-auto !py-3" /></div>
        </div>
      </header>

      <section className="bg-[radial-gradient(900px_500px_at_15%_0%,#DCE6FA,transparent_60%),linear-gradient(180deg,#fff,#EEF2F8)] py-16">
        <div className="max-w-[1180px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-navy text-white text-[12px] font-bold px-3 py-1.5 rounded-full"><i className="w-2 h-2 rounded-full bg-[#8FF0C0]" />Police · Gendarmerie · Pénitentiaire</span>
            <h1 className="text-[44px] md:text-[56px] font-extrabold tracking-[-2px] leading-[1.02] text-navy mt-5">Bouger, tenir, partir.<br /><span className="text-[#6F7789]">Ici, personne ne le sait.</span></h1>
            <p className="text-[18px] text-[#3B4457] max-w-[56ch] mt-4">L&apos;app qui trouve le collègue avec qui échanger votre poste, qui vous met en relation avec un pair quand ça ne va pas, et qui vous aide à préparer l&apos;après si un jour la question se pose. Sans la hiérarchie. Sans les syndicats. Sans trace.</p>
            <div className="flex flex-wrap gap-3 mt-7"><Btn m="signup" t="Créer mon compte" cls="btn !w-auto !px-7 !py-4 text-[16px]" /><Btn m="login" t="J'ai déjà un compte" cls="btn-ghost !w-auto !px-7 !py-4 text-[16px]" /></div>
            <div className="flex flex-wrap gap-5 mt-6 text-[13px] text-[#6F7789]">{['Identité masquée', 'Carte pro jamais stockée', 'Gratuit pour commencer', 'Conçu par un ancien policier'].map(t => <span key={t}><span className="text-mint font-extrabold mr-1.5">✓</span>{t}</span>)}</div>
          </div>
          <div className="relative rounded-[30px] bg-gradient-to-b from-[#DCE5F5] to-[#E9EEF7] p-6 shadow-[0_30px_60px_-30px_rgba(15,27,51,.45)]">
            <div className="absolute right-5 top-5 bg-navy text-white rounded-2xl px-3.5 py-2.5 text-[11px] text-right leading-tight z-10"><b className="block text-[22px] text-[#8FF0C0]">2 405</b>collègues en recherche<br />ce mois-ci</div>
            <CarteFrance halos={HALOS} points={[{ lat: 43.61, lng: 3.88, label: 'Montpellier', cls: 'me' }, { lat: 43.70, lng: 7.27, label: 'Nice', cls: 'wish' }, { lat: 43.60, lng: 1.44, label: 'Toulouse', cls: 'other' }]} cycle={[[3.88, 43.61], [7.27, 43.70], [1.44, 43.60]]} />
            <div className="absolute left-5 bottom-5 bg-white rounded-2xl px-3.5 py-2.5 text-[12.5px] text-navy shadow-lg max-w-[260px]"><b className="block">Un cycle à 3 s&apos;est fermé</b>Montpellier → Nice → Toulouse. Chacun obtient son souhait n°1.</div>
          </div>
        </div>
      </section>

      <div className="bg-navy text-[#A9B7D6] text-[13.5px] py-4"><div className="max-w-[1180px] mx-auto px-6 flex flex-wrap justify-center gap-8"><span><b className="text-white">Permutation</b> à 2, 3 ou 4 collègues</span><span><b className="text-white">Écoute</b> anonyme, gratuite, avec PEPS-SOS</span><span><b className="text-white">L&apos;après</b> préparé sans que la boîte le sache</span></div></div>

      <section id="modules" className="py-20"><div className="max-w-[1180px] mx-auto px-6">
        <h2 className="text-[36px] font-extrabold tracking-[-1.2px] text-navy">Trois choses, et rien d&apos;autre.</h2>
        <p className="text-[16px] text-[#6F7789] max-w-[62ch] mt-2">Chaque module répond à un moment de carrière. Chacun est cloisonné des deux autres : ce que vous faites dans l&apos;un n&apos;apparaît jamais dans les autres.</p>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {[
            ['from-[#4C86FF] to-[#1B4FD6]', 'Bouger', 'bg-[#E6EEFF] text-bleud', 'Permuter son poste', 'Vous voulez Nice, un collègue de Nice veut Toulouse, un collègue de Toulouse veut Montpellier. Personne ne le sait, sauf notre algorithme, qui ferme le cycle et vous prévient.', ['Échanges à 2, 3 ou 4, toutes les heures', 'Score de compatibilité, points de friction', 'Identités révélées seulement quand tous ont accepté', 'Courriers de permutation prêts à signer']],
            ['from-[#3ED18B] to-[#149A5E]', 'Tenir · gratuit', 'bg-[#DFF7EB] text-[#16804F]', 'Parler à un collègue', 'Quand ça ne va pas, parler à quelqu\'un qui connaît le métier, sans passer par le service médical ni la hiérarchie. Des pairs-aidants formés, en partenariat avec PEPS-SOS.', ['Pseudo aléatoire, sans lien avec votre compte', 'Échanges éphémères, rien n\'est conservé', 'Le 3114 sur chaque écran', 'Accessible sans abonnement, sans vérification']],
            ['from-[#A66BFF] to-[#6C3BC9]', 'Partir', 'bg-[#F1E8FF] text-[#6C3BC9]', 'Préparer l\'après', 'Y penser n\'engage à rien. Disponibilité, détachement, rupture conventionnelle, démission : ce que vous gardez, ce que vous touchez, et ce que vaut votre expérience dehors.', ['Les voies de sortie, sans jargon', 'Votre parcours traduit pour un recruteur', 'Métiers où votre profil est recherché', 'Parler à un ancien déjà parti']],
          ].map(([g, tag, tagc, h, p, li]: any) => (
            <div key={h} className="bg-white border border-[#E6E9F0] rounded-3xl p-7 shadow-[0_14px_34px_-20px_rgba(15,27,51,.2)]">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g} mb-4`} />
              <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-2 ${tagc}`}>{tag}</span>
              <h3 className="text-[22px] font-extrabold tracking-tight text-navy">{h}</h3>
              <p className="text-[14.5px] text-[#3B4457] mt-2">{p}</p>
              <ul className="mt-3 text-[13.5px] text-[#6F7789] space-y-1">{li.map((x: string) => <li key={x} className="pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-bleu">{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </div></section>

      <section id="comment" className="py-20 bg-paper"><div className="max-w-[1180px] mx-auto px-6">
        <h2 className="text-[36px] font-extrabold tracking-[-1.2px] text-navy">Comment on entre</h2>
        <p className="text-[16px] text-[#6F7789] max-w-[62ch] mt-2">L&apos;app est réservée aux agents. Il faut prouver une fois que vous en êtes, de la façon qui vous arrange. Dans les deux cas, rien de ce que vous montrez n&apos;est conservé.</p>
        <div className="grid md:grid-cols-2 gap-5 mt-10">
          <div className="bg-white rounded-3xl p-7 border-[1.5px] border-bleu"><span className="inline-block bg-navy text-white text-[12px] font-extrabold px-3 py-1 rounded-full mb-3">Voie 1</span><h3 className="text-[20px] font-extrabold text-navy">Email personnel + carte pro</h3><p className="text-[14.5px] text-[#3B4457] mt-2">Vous n&apos;avez pas envie que quoi que ce soit passe par votre messagerie de service.</p><ol className="list-decimal ml-5 mt-4 text-[14px] text-[#3B4457] space-y-1"><li>Vous créez le compte avec votre adresse perso (lien de connexion, pas de mot de passe)</li><li>Vous photographiez votre carte professionnelle dans l&apos;app</li><li>Elle est lue, puis détruite dans la seconde. Il ne reste qu&apos;une empreinte du matricule, impossible à inverser</li></ol><div className="mt-4 bg-[#F5F7FB] rounded-xl px-3 py-2.5 text-[12.5px] text-[#6F7789]">Le plus discret. Aucun mail ne transite par la boîte.</div></div>
          <div className="bg-white rounded-3xl p-7 border-[1.5px] border-[#E6E9F0]"><span className="inline-block bg-navy text-white text-[12px] font-extrabold px-3 py-1 rounded-full mb-3">Voie 2</span><h3 className="text-[20px] font-extrabold text-navy">Email professionnel + code</h3><p className="text-[14.5px] text-[#3B4457] mt-2">Vous préférez ne rien photographier.</p><ol className="list-decimal ml-5 mt-4 text-[14px] text-[#3B4457] space-y-1"><li>Vous saisissez votre adresse nominative en @interieur.gouv.fr, @gendarmerie.interieur.gouv.fr ou @justice.fr</li><li>Un code à 6 chiffres part sur cette boîte, dans un mail neutre qui ne dit rien de l&apos;app</li><li>Vous le saisissez au service, dans les 7 jours. Votre adresse pro est ensuite chiffrée et ne sert plus qu&apos;à ça</li></ol><div className="mt-4 bg-[#F5F7FB] rounded-xl px-3 py-2.5 text-[12.5px] text-[#6F7789]">Le plus rapide. Rien à photographier, rien à stocker.</div></div>
        </div>
        <p className="text-center text-[12.5px] text-[#6F7789] mt-5">Vous pouvez faire les deux : c&apos;est le badge « Vérifié deux fois », qui rassure les collègues avec qui vous permuterez.</p>
      </div></section>

      <section id="discretion" className="py-20"><div className="max-w-[1180px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-[36px] font-extrabold tracking-[-1.2px] text-navy">Ce qu&apos;on ne saura jamais</h2>
          <p className="text-[16px] text-[#6F7789] mt-2">La discrétion administrative n&apos;est pas une option. C&apos;est la raison d&apos;être de l&apos;app.</p>
          <div className="mt-5">{[['Identité masquée', 'Nom, matricule, service : jamais affichés avant une acceptation mutuelle.'], ['Aucun annuaire, aucune recherche par nom', 'Vous ne voyez que vos correspondances. Vos collègues ne peuvent pas vous trouver.'], ['Carte pro détruite, matricule haché', 'La photo sert à vérifier, puis elle disparaît. Il ne reste qu\'une empreinte non réversible.'], ['Aucun accès pour l\'administration, la hiérarchie ou les syndicats', 'Hébergé en Europe, chiffré, jamais vendu, sans publicité.'], ['Suppression totale en un geste', 'Compte, souhaits, historique : tout disparaît immédiatement.']].map(([b, s]) => <div key={b} className="flex gap-3.5 py-3.5 border-t border-[#E6E9F0] first:border-t-0"><span className="w-7 h-7 rounded-full bg-[#DFF7EB] text-[#16804F] font-extrabold text-[13px] flex items-center justify-center shrink-0">✓</span><span><b className="block text-navy">{b}</b><span className="text-[13.5px] text-[#6F7789]">{s}</span></span></div>)}</div>
        </div>
        <div className="bg-navy text-white rounded-[28px] p-9"><p className="text-[20px] leading-[1.45]">« J&apos;ai passé des années dans la boîte. Je sais ce qu&apos;on ne dit pas au service : qu&apos;on veut partir, qu&apos;on ne dort plus, qu&apos;on regarde ailleurs. Hors Boîte, c&apos;est l&apos;endroit où on peut le dire sans que ça remonte. »</p><small className="block mt-4 text-[#A9B7D6] text-[13px]">Le fondateur, ancien fonctionnaire de police</small></div>
      </div></section>

      <section id="tarif" className="py-20 bg-paper"><div className="max-w-[1180px] mx-auto px-6">
        <h2 className="text-[36px] font-extrabold tracking-[-1.2px] text-navy">Gratuit pour commencer. 9,99 € quand ça devient concret.</h2>
        <div className="grid md:grid-cols-2 gap-5 mt-10 max-w-[820px]">
          <div className="bg-white rounded-3xl p-7 border-[1.5px] border-[#E6E9F0]"><b>Gratuit</b><div className="text-[40px] font-extrabold tracking-tight">0 €</div><ul className="mt-3 text-[14px] space-y-1.5">{['Profil, souhaits, vérification', 'Savoir que des correspondances existent', 'Écoute entre collègues, sans limite', 'Fiches et voies de sortie de L\'après'].map(t => <li key={t} className="flex gap-2"><span className="text-mint font-extrabold">✓</span>{t}</li>)}<li className="flex gap-2 opacity-50"><span>–</span>Détail et mise en relation (alertes avec 48 h de retard)</li></ul></div>
          <div className="rounded-3xl p-7 text-white bg-gradient-to-br from-navy2 to-navy"><b>Premium</b><div className="text-[40px] font-extrabold tracking-tight">9,99 €<small className="text-[14px] text-[#A9B7D6] font-semibold"> / mois</small></div><ul className="mt-3 text-[14px] space-y-1.5">{['Matching à 2, 3 et 4 agents, en continu', 'Alertes immédiates', 'Mise en relation illimitée', 'Simulateur de points, historique par ville', 'Courriers prêts à signer, CV traduit', '1 € par mois reversé à l\'écoute entre collègues'].map(t => <li key={t} className="flex gap-2"><span className="text-[#8FF0C0] font-extrabold">✓</span>{t}</li>)}</ul><p className="text-[12.5px] text-[#A9B7D6] mt-4">Sans engagement. Résiliable en un geste dès votre mutation obtenue.</p></div>
        </div>
        <div className="flex items-center gap-5 bg-white rounded-2xl px-6 py-5 mt-10"><span className="text-[32px] font-extrabold text-coral tracking-tight">3114</span><div><b className="block text-navy">Vous êtes en danger ou en détresse ?</b><span className="text-[13.5px] text-[#6F7789]">Numéro national de prévention du suicide, gratuit, 24 h/24, confidentiel. L&apos;écoute dans Hors Boîte est une écoute entre pairs, pas un service d&apos;urgence.</span></div></div>
      </div></section>

      <footer className="border-t border-[#E6E9F0] py-7 text-[13px] text-[#6F7789]"><div className="max-w-[1180px] mx-auto px-6 flex flex-wrap justify-between gap-3"><span>© Hors Boîte · PELOSO CORPORATION · Hébergé en Europe</span><span className="flex gap-4"><a href="#">Confidentialité</a><a href="#">CGV</a><a href="#">Mentions légales</a><a href="mailto:contact@horsboite.fr">contact@horsboite.fr</a></span></div></footer>

      <AuthModal open={!!modal} initial={modal ?? 'signup'} onClose={() => setModal(null)} />
    </div>
  );
}
HB_EOF

mkdir -p "supabase/migrations"
cat > "supabase/migrations/0002_verification_ou.sql" << 'HB_EOF'
-- Vérifié = carte pro OU mail pro (les deux = badge « Vérifié deux fois »)
drop policy if exists h_ins on historique_points;
create policy h_ins on historique_points for insert to authenticated with check (
  exists (select 1 from profils p where p.id = auth.uid() and (p.verifie_carte or p.verifie_mail_pro)));
HB_EOF

echo "Fichiers mis à jour."
echo "À faire dans Supabase > SQL Editor : exécuter supabase/migrations/0002_verification_ou.sql"