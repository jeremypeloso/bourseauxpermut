'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import { supabaseBrowser } from '@/lib/supabase-browser';
import MotDePasse from '@/components/MotDePasse';

type Etape = 0 | 1 | 2 | 3 | 4 | 5;
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
  const [mdpOk, setMdpOk] = useState(false);
  const [apercu, setApercu] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Crée le profil minimal s'il n'existe pas
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return r.replace('/');
      setMdpOk(!!user.user_metadata?.mdp);
      const { data } = await sb.from('profils').select('institution, verifie_carte, verifie_mail_pro').eq('id', user.id).maybeSingle();
      if (data) { setInst(data.institution); if (data.verifie_carte || data.verifie_mail_pro) { if (user.user_metadata?.mdp) r.replace('/annonces'); else setEtape(5); } }
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
    try {
      const petite = await reduire(f);
      setApercu(URL.createObjectURL(petite));
      const fd = new FormData(); fd.append('image', petite, 'carte.jpg');
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 55000);
      const r = await fetch('/api/verify/card', { method: 'POST', body: fd, signal: ctrl.signal }); clearTimeout(t);
      const res = await r.json().catch(() => ({ ok: false, message: `Erreur serveur (${r.status})` }));
      if (res.ok) setLecture(res); else setMsg((res.message ?? res.error ?? `Erreur (${r.status})`) + (res.texte_lu ? `\n\n[DEBUG OCR · confiance ${Math.round(res.confiance ?? 0)} %]\n${res.texte_lu}` : ''));
    } catch (e: any) {
      setMsg(e?.name === 'AbortError' ? 'L\'analyse a dépassé 55 secondes. Réessayez avec une photo plus nette et mieux cadrée.' : `Envoi impossible : ${e?.message ?? 'réseau'}`);
    } finally { setBusy(false); setTimeout(() => setApercu(a => { if (a) URL.revokeObjectURL(a); return null; }), 600); }
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

  const Dots = () => <div className="flex justify-center gap-1.5 my-3">{[0,1,2,3,4,5].map(i => <i key={i} className={`h-2 rounded-full ${i === etape ? 'w-5 bg-bleu' : 'w-2 bg-[#D5D9E2]'}`} />)}</div>;

  return (
    <main className="min-h-screen bg-paper flex items-start justify-center md:py-10"><div className="w-full md:max-w-[560px] md:bg-white md:rounded-[26px] md:shadow-[0_20px_60px_-30px_rgba(15,27,51,.35)] flex flex-col px-5 md:px-8 pt-[max(12px,env(safe-area-inset-top))] md:pt-6 pb-6 min-h-screen md:min-h-0">
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
        <p className="sub text-center mt-2">La Bourse aux permut&apos; a été conçue par un ancien fonctionnaire de police, pour les policiers, les gendarmes et les personnels pénitentiaires. La discrétion administrative n&apos;est pas une option, c&apos;est la base.</p>
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
        <p className="sub mt-2">Photographiez le <b className="text-navy">verso</b>, côté identité (nom, prénoms, matricule ou NIGEND), à plat et sans reflet. Carte de police, carte militaire gendarmerie ou carte pénitentiaire. La photo est analysée puis détruite dans la seconde, elle n&apos;est jamais enregistrée.</p>
        <input ref={file} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) envoyerCarte(f); }} />
        {!lecture ? (
          <>
            {busy && apercu && (
              <div className="relative mt-5 rounded-2xl overflow-hidden bg-navy aspect-[1.58] shadow-[0_20px_40px_-20px_rgba(15,27,51,.6)]">
                <img src={apercu} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,27,51,.35),transparent_30%,transparent_70%,rgba(15,27,51,.35))]" />
                {/* coins de cadrage */}
                {['top-3 left-3 border-t-2 border-l-2', 'top-3 right-3 border-t-2 border-r-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map(c => <span key={c} className={`absolute w-6 h-6 border-[#8FF0C0] rounded-sm ${c}`} />)}
                {/* ligne de scan */}
                <div className="absolute left-0 right-0 h-[3px] bg-[#8FF0C0] shadow-[0_0_18px_4px_rgba(143,240,192,.7)] animate-scan" />
                <div className="absolute left-0 right-0 bottom-0 px-4 py-3 text-[12px] text-white/90 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#8FF0C0] animate-pulse" />Lecture en cours… la photo sera détruite à la fin de l&apos;analyse.</div>
              </div>
            )}
            <button className="btn mt-5" onClick={() => file.current?.click()} disabled={busy}>{busy ? 'Analyse en cours, 5 à 15 secondes…' : msg ? 'Reprendre la photo' : 'Photographier le verso de ma carte'}</button>
            {msg && <p className="text-[12.5px] text-[#C8323B] mt-3 whitespace-pre-wrap">{msg}</p>}
            {msg && <p className="sub mt-1">Vous pouvez réessayer autant de fois que nécessaire : rien n&apos;est conservé entre deux essais. Astuce : carte à plat, lumière du jour, cadrage serré, sans reflet.</p>}
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
            <button className="btn-ghost mt-2" onClick={() => { setLecture(null); setMsg(null); file.current?.click(); }}>Ce n'est pas correct, reprendre la photo</button>
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
        <button className="btn-ghost mt-2" onClick={() => r.push('/annonces')}>Plus tard</button>
      </>)}

      {etape === 4 && (<>
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#3ED18B] to-[#149A5E] mx-auto flex items-center justify-center text-white text-3xl font-extrabold mt-2">✓</div>
        <h1 className="h1 text-center mt-4">Compte vérifié</h1>
        <p className="sub text-center mt-2">Ce que La Bourse aux permut&apos; conserve de vous, et rien d&apos;autre.</p>
        <div className="card mt-4">
          <div className="kv"><span>Nom et prénom</span><b>Chiffrés, table séparée</b></div>
          <div className="kv"><span>Matricule</span><b>Empreinte uniquement</b></div>
          <div className="kv"><span>Photo de la carte</span><b className="text-[#16804F]">{lecture ? 'Détruite' : 'Jamais demandée'}</b></div>
          <div className="kv"><span>Adresse pro</span><b>Chiffrée</b></div>
          <div className="kv"><span>Corps, grade, affectation</span><b>Pour le matching</b></div>
        </div>
        <div className="flex-1" />
        <button className="btn-dark mt-4" onClick={() => mdpOk ? r.push('/deposer') : setEtape(5)}>{mdpOk ? 'Déposer mon annonce' : 'Choisir mon mot de passe'}</button>
      </>)}

      {etape === 5 && (<>
        <MotDePasse onDone={() => r.push('/deposer')} />
      </>)}
    </div></main>
  );
}

/** Réduit la photo dans le navigateur avant envoi : 1400 px max, niveaux de gris, JPEG. L'original ne quitte jamais l'appareil. */
async function reduire(f: File): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((ok, ko) => { const i = document.createElement('img'); i.onload = () => ok(i); i.onerror = ko; i.src = URL.createObjectURL(f); });
  const k = Math.min(1, 1400 / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  const ctx = c.getContext('2d')!; ctx.filter = 'grayscale(1) contrast(1.15)'; ctx.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(img.src);
  return await new Promise<Blob>(ok => c.toBlob(b => ok(b ?? f), 'image/jpeg', 0.85));
}

export default function Onboarding() {
  return <Suspense><OnboardingInner /></Suspense>;
}
