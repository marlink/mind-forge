'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/Button';
import { Input } from '../components/Form';
import { Navigation } from '../components/Navigation';
import { useToast } from '../components/Toast';
import { api } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.status === 'success' && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        toast.showToast('Welcome back!', 'success');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={null} />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-in fade-in">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Sign in to MindForge
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Please sign in to your account.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                className="w-full"
                size="lg"
              >
                Sign in
              </Button>
            </div>

            <div className="text-center">
              <Link
                href="/register"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Don't have an account? Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

