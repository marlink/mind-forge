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
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-primary-600">
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
                <span className="text-sm text-gray-600">{user.name}</span>
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

