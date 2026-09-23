import Link from 'next/link';
import Image from 'next/image';

/** Page publique minimale (le vrai site vitrine peut vivre ailleurs). */
export default function Home() {
  return (
    <main className="flex-1 flex flex-col justify-center px-6 py-10">
      <Image src="/logo.png" alt="Hors Boîte" width={280} height={80} className="mx-auto" priority />
      <h1 className="h1 text-center mt-8">Bouger, tenir, partir.<br /><span className="text-[#6F7789]">Ici, personne ne le sait.</span></h1>
      <p className="sub text-center mt-4">Permutation de postes entre collègues, écoute anonyme, préparation de l&apos;après. Police, gendarmerie, pénitentiaire. Conçue par un ancien fonctionnaire de police.</p>
      <Link href="/login" className="btn-dark mt-8">Entrer</Link>
      <p className="text-center text-[11px] text-[#A3AAB8] mt-6">Aucune donnée vendue. Aucun accès pour l&apos;administration. Hébergé en Europe.</p>
    </main>
  );
}
