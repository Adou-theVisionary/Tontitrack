import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/contexts/AppContext';

export const metadata: Metadata = {
  title: 'TontiTrack — Vos finances, en confiance',
  description: 'Gérez vos finances personnelles et vos tontines simplement.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
