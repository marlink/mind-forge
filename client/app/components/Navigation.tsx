'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './Button';

interface NavigationProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
}

export function Navigation({ user, showBackButton, backHref, backLabel }: NavigationProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="glass-dark border-b border-white/10 shadow-premium-lg sticky top-0 z-40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-2xl font-bold text-gradient hover:scale-105 transition-transform-smooth">
              MindForge
            </Link>
            {showBackButton && backHref && (
              <Link href={backHref}>
                <Button variant="outline" size="sm">
                  {backLabel || 'Back'}
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <span className="text-sm font-medium text-white/90 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                  {user.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

