'use client';
import { useRouter } from 'next/navigation';
import MotDePasse from '@/components/MotDePasse';
export default function Page() {
  const r = useRouter();
  return <div className="max-w-[520px] mx-auto bg-white border border-[#E6E9F0] rounded-3xl p-6 md:p-8"><MotDePasse titre="Nouveau mot de passe" onDone={() => r.push('/compte')} /></div>;
}
