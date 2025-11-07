import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from './components/Toast';

export const metadata: Metadata = {
  title: 'MindForge Learning Program',
  description: 'Stop Teaching for Tests. Start Teaching for Brains.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

