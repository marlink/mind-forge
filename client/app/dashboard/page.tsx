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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        setUser(data.data.user);
        setError(null);
      } else {
        setError('Failed to load user data');
      }
    } catch (err) {
      setError('Failed to connect to server');
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
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Dashboard for role "{user.role}" is not yet implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/bootcamps">
              <Button variant="outline">Browse Bootcamps</Button>
            </Link>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Role-based Dashboard */}
        {renderDashboard()}
      </div>
    </div>
  );
}

