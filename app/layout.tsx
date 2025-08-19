import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from './components/LanguageProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CS2 Suspect Monitor',
  description: 'CS2作弊嫌疑人监控系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}