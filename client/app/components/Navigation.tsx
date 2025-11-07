'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from './Button';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NavigationProps {
  user?: User | null;
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
}

export function Navigation({ 
  user, 
  showBackButton = false, 
  backHref,
  backLabel = 'Back'
}: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const navigationLinks = user ? [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/bootcamps', label: 'Bootcamps' },
    { href: '/communications', label: 'Communications' },
  ] : [
    { href: '/', label: 'Home' },
    { href: '/bootcamps', label: 'Bootcamps' },
    { href: '/login', label: 'Login' },
    { href: '/register', label: 'Register' },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            {showBackButton && backHref && (
              <Link href={backHref}>
                <Button variant="outline" size="sm" className="mr-2">
                  ← {backLabel}
                </Button>
              </Link>
            )}
            <Link href={user ? '/dashboard' : '/'} className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">MindForge</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(link.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <div className="h-6 w-px bg-gray-300 mx-2" />
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{user.name}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {user.role}
                  </span>
                  <Button variant="secondary" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
              aria-label="Toggle menu"
            >
              <svg
                className={`h-6 w-6 transition-transform ${isMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-in slide-in-from-top duration-200">
            <div className="space-y-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    block px-4 py-2 rounded-md text-base font-medium transition-colors
                    ${isActive(link.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="px-4 py-2">
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {user.role}
                      </span>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleLogout} className="w-full mt-2">
                      Logout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

