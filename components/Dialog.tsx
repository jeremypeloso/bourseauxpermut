'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

type Opts = { titre: string; texte?: string; ok?: string; annuler?: string; danger?: boolean };
type Ctx = { confirmer: (o: Opts) => Promise<boolean>; notifier: (texte: string, type?: 'ok' | 'erreur') => void };
const DialogCtx = createContext<Ctx>({ confirmer: async () => false, notifier: () => {} });
export const useDialog = () => useContext(DialogCtx);

/** Fenêtres de confirmation et notifications aux couleurs du site, à la place de confirm() / alert() du navigateur. */
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dlg, setDlg] = useState<Opts | null>(null); const res = useRef<(v: boolean) => void>();
  const [toast, setToast] = useState<{ t: string; type: 'ok' | 'erreur' } | null>(null); const timer = useRef<any>();
  const confirmer = useCallback((o: Opts) => new Promise<boolean>(r => { res.current = r; setDlg(o); }), []);
  const notifier = useCallback((t: string, type: 'ok' | 'erreur' = 'ok') => { setToast({ t, type }); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), 2600); }, []);
  const fermer = (v: boolean) => { res.current?.(v); setDlg(null); };
  return (
    <DialogCtx.Provider value={{ confirmer, notifier }}>
      {children}
      {dlg && (
        <div className="fixed inset-0 z-[70] bg-navy/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && fermer(false)} role="dialog" aria-modal>
          <div className="bg-white rounded-3xl w-full max-w-[440px] p-6 shadow-[0_30px_80px_-30px_rgba(15,27,51,.6)]">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${dlg.danger ? 'bg-[#FFE6E8] text-[#C8323B]' : 'bg-[#E6EEFF] text-bleud'}`}>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={dlg.danger ? 'M12 8v5M12 17h.01M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z' : 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z'} /></svg>
            </div>
            <h3 className="text-[18px] font-extrabold text-navy">{dlg.titre}</h3>
            {dlg.texte && <p className="text-[14px] text-[#3B4457] mt-1.5">{dlg.texte}</p>}
            <div className="flex gap-2 mt-5">
              <button className="btn-ghost !py-3" onClick={() => fermer(false)}>{dlg.annuler ?? 'Annuler'}</button>
              <button className={`btn !py-3 ${dlg.danger ? 'bg-[#C8323B]' : ''}`} onClick={() => fermer(true)} autoFocus>{dlg.ok ?? 'Confirmer'}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className={`fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-7 z-[80] px-4 py-3 rounded-xl text-[13.5px] font-semibold shadow-lg ${toast.type === 'erreur' ? 'bg-[#C8323B] text-white' : 'bg-navy text-white'}`}>{toast.t}</div>}
    </DialogCtx.Provider>
  );
}
