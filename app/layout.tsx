import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'La Bourse aux permut\'',
  description: 'Ici, personne ne le sait. Annonces de permutation et matching à 2, 3 ou 4 agents. Police nationale, gendarmerie et pénitentiaire à venir.',
  icons: { icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png', sizes: '512x512' }], apple: '/icon.png' },
  openGraph: { title: 'La Bourse aux permut\'', description: 'Ici, personne ne le sait. Annonces de permutation et matching entre collègues.', images: ['/og.jpg'], locale: 'fr_FR', type: 'website' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#EEF2F8' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr"><body className="min-h-full">{children}</body></html>
  );
}
