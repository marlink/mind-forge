'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudentDashboard } from '../components/dashboards/StudentDashboard';
import { ParentDashboard } from '../components/dashboards/ParentDashboard';
import { FacilitatorDashboard } from '../components/dashboards/FacilitatorDashboard';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { Button } from '../components/Button';
import { PageLoading } from '../components/Loading';
import { ErrorMessage } from '../components/Error';
import { Navigation } from '../components/Navigation';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  student?: {
    id: string;
    enrollments: Array<{
      Bootcamp: {
        id: string;
        title: string;
        status: string;
      };
      status: string;
    }>;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
  }, [router]);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.get('/users/me');
      if (response.status === 'success') {
        setUser(response.data.user);
        setError(null);
      } else {
        setError('Failed to load user data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={null} />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <ErrorMessage
            title="Failed to load dashboard"
            message={error || 'User not found'}
            onRetry={fetchUser}
            showHomeLink={true}
          />
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'STUDENT':
        return (
          <StudentDashboard
            userId={user.id}
            studentId={user.student?.id}
            enrollments={user.student?.enrollments || []}
          />
        );
      case 'PARENT':
        return <ParentDashboard userId={user.id} />;
      case 'FACILITATOR':
        return <FacilitatorDashboard userId={user.id} />;
      case 'ADMIN':
        return <AdminDashboard userId={user.id} />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-6 animate-in fade-in">
            <p className="text-gray-600">Dashboard for role "{user.role}" is not yet implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{ id: user.id, name: user.name, email: user.email }} />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 animate-in fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back, {user.name}!</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <Link href="/bootcamps" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">Browse Bootcamps</Button>
            </Link>
            <Button variant="secondary" onClick={handleLogout} className="w-full sm:w-auto" aria-label="Logout">
              Logout
            </Button>
          </div>
        </div>

        {/* Role-based Dashboard */}
        <div id="main-content">{renderDashboard()}</div>
      </div>
    </div>
  );
}

