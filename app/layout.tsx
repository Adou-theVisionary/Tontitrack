import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SelecteurThemePublic } from '@/components/theme/SelecteurThemePublic';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'TontiTrack — Vos finances, en confiance',
  description: 'Gérez vos finances personnelles et vos tontines simplement.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppProvider>{children}</AppProvider>
          <SelecteurThemePublic />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
