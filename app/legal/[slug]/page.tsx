import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const PAGES: Record<string, string> = { 'mentions-legales': 'Mentions légales', confidentialite: 'Politique de confidentialité', cgv: 'Conditions générales' };
export function generateStaticParams() { return Object.keys(PAGES).map(slug => ({ slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) { return { title: `${PAGES[params.slug] ?? 'Légal'} · La Bourse aux permut'` }; }

/** Rendu Markdown minimal (titres, paragraphes, listes, tableaux, gras, liens) sans dépendance. */
function md(src: string) {
  const inline = (t: string) => t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-bleu font-semibold">$1</a>');
  const lines = src.split('\n'); const out: string[] = []; let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^# /.test(l)) { out.push(`<h1 class="text-[30px] font-extrabold tracking-tight text-navy mb-2">${inline(l.slice(2))}</h1>`); i++; continue; }
    if (/^## /.test(l)) { out.push(`<h2 class="text-[19px] font-extrabold text-navy mt-8 mb-2">${inline(l.slice(3))}</h2>`); i++; continue; }
    if (/^\|/.test(l)) { const rows: string[] = []; while (i < lines.length && /^\|/.test(lines[i])) { if (!/^\|\s*-/.test(lines[i])) rows.push(lines[i]); i++; }
      const [h, ...b] = rows.map(r => r.split('|').slice(1, -1).map(c => inline(c.trim())));
      out.push(`<div class="overflow-x-auto my-3"><table class="w-full text-[13px] border border-[#E6E9F0] rounded-xl"><thead><tr>${h.map(c => `<th class="text-left bg-paper px-3 py-2 font-bold text-navy">${c}</th>`).join('')}</tr></thead><tbody>${b.map(r => `<tr class="border-t border-[#E6E9F0] align-top">${r.map(c => `<td class="px-3 py-2">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); continue; }
    if (/^- /.test(l)) { const items: string[] = []; while (i < lines.length && /^- /.test(lines[i])) { items.push(inline(lines[i].slice(2))); i++; } out.push(`<ul class="list-disc pl-5 my-2 space-y-1">${items.map(x => `<li>${x}</li>`).join('')}</ul>`); continue; }
    if (l.trim() === '') { i++; continue; }
    const para: string[] = []; while (i < lines.length && lines[i].trim() !== '' && !/^(#|\||- )/.test(lines[i])) { para.push(lines[i]); i++; }
    out.push(`<p class="my-2 leading-relaxed">${inline(para.join('<br/>'))}</p>`);
  }
  return out.join('');
}

export default function Legal({ params }: { params: { slug: string } }) {
  if (!PAGES[params.slug]) notFound();
  const src = readFileSync(join(process.cwd(), 'content', `${params.slug}.md`), 'utf8');
  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-white border-b border-[#E6E9F0]"><div className="max-w-[860px] mx-auto px-6 h-16 flex items-center justify-between"><Link href="/"><img src="/logo.png" alt="La Bourse aux permut'" className="h-8 w-auto" /></Link><nav className="flex gap-4 text-[13px] font-semibold text-[#6F7789]">{Object.entries(PAGES).map(([s, t]) => <Link key={s} href={`/legal/${s}`} className={s === params.slug ? 'text-navy' : ''}>{t}</Link>)}</nav></div></header>
      <main className="max-w-[860px] mx-auto px-6 py-10"><article className="bg-white border border-[#E6E9F0] rounded-3xl p-6 md:p-10 text-[14.5px] text-[#3B4457]" dangerouslySetInnerHTML={{ __html: md(src) }} /></main>
    </div>
  );
}
