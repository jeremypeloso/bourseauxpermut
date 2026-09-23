/** Bandeau 3114, présent sur chaque écran du module Écoute. Non négociable. */
export default function Urgence() {
  return (
    <div className="urg">
      <span className="text-[24px] font-extrabold text-coral tracking-tight">3114</span>
      <span className="flex-1"><b className="block text-[13px] text-navy">Vous êtes en danger ou en détresse ?</b><span className="sub">Numéro national, gratuit, 24 h/24, confidentiel. Ou le 15.</span></span>
      <a href="tel:3114" className="bg-coral text-white font-bold text-[13px] rounded-xl px-3 py-2.5">Appeler</a>
    </div>
  );
}
