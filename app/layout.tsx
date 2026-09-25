import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'La Bourse aux permut\'',
  description: 'Ici, personne ne le sait. Annonces de permutation et matching à 2, 3 ou 4 agents. Police nationale, gendarmerie et pénitentiaire à venir.',
  icons: { icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png', sizes: '512x512' }], apple: '/icon.png' },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://labourseauxpermut.fr'),
  openGraph: { title: 'La Bourse aux permut\' · C\'est ouvert', description: 'Annonces de permutation anonymes et matching à 2, 3 ou 4 agents. Identités révélées après accord de tous. Police nationale.', url: '/', siteName: 'La Bourse aux permut\'', images: [{ url: '/og.jpg?v=2', width: 1200, height: 630, alt: 'La Bourse aux permut\', c\'est ouvert' }], locale: 'fr_FR', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'La Bourse aux permut\' · C\'est ouvert', description: 'Annonces de permutation anonymes et matching entre collègues.', images: ['/og.jpg?v=2'] },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#EEF2F8' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr"><body className="min-h-full">{children}</body></html>
  );
}
