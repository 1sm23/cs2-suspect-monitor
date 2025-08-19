import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from './components/LanguageProvider';

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
      <body className="font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}