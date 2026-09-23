import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Hors Boîte',
  description: 'Bouger, tenir, partir. Ici, personne ne le sait.',
  robots: { index: false }, // discrétion : l'app n'est pas indexée, seul le site vitrine l'est
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#EEF2F8' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-full">
        <div className="mx-auto max-w-[430px] min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
