import type { Metadata } from 'next';
import { Inter, Playfair_Display, IBM_Plex_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ptBR } from '@clerk/localizations';
import { UserSync } from '@/components/user-sync';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Espectro',
  description: 'Compare como diferentes veículos cobrem a mesma história.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
        <body>
          <UserSync />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
