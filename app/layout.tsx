import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'La Bourse aux permut\'',
  description: 'Bouger, tenir, partir. Ici, personne ne le sait. Permutation de postes, écoute anonyme, préparation de l\'après. Police, gendarmerie, pénitentiaire.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#EEF2F8' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr"><body className="min-h-full">{children}</body></html>
  );
}
