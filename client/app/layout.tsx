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
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

