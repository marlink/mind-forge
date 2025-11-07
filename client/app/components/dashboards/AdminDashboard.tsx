'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../Card';
import { Button } from '../Button';
import { LoadingSkeleton } from '../Loading';
import { ErrorMessage } from '../Error';

interface AdminDashboardProps {
  userId: string;
}

export function AdminDashboard({ userId }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBootcamps: 0,
    totalSessions: 0,
    activeEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch multiple endpoints to get admin stats
      const [usersRes, bootcampsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bootcamps`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (usersRes.ok && bootcampsRes.ok) {
        const usersData = await usersRes.json();
        const bootcampsData = await bootcampsRes.json();
        
        setStats({
          totalUsers: usersData.data?.users?.length || 0,
          totalBootcamps: bootcampsData.data?.bootcamps?.length || 0,
          totalSessions: 0, // Would need sessions endpoint
          activeEnrollments: 0, // Would need enrollments endpoint
        });
      }
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600 mt-1">Total Users</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalBootcamps}</div>
            <div className="text-sm text-gray-600 mt-1">Bootcamps</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.totalSessions}</div>
            <div className="text-sm text-gray-600 mt-1">Sessions</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.activeEnrollments}</div>
            <div className="text-sm text-gray-600 mt-1">Active Enrollments</div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/users">
            <Button className="w-full" variant="outline">Manage Users</Button>
          </Link>
          <Link href="/admin/bootcamps">
            <Button className="w-full" variant="outline">Manage Bootcamps</Button>
          </Link>
          <Link href="/admin/settings">
            <Button className="w-full" variant="outline">System Settings</Button>
          </Link>
        </div>
      </Card>

      {/* System Overview */}
      <Card title="System Overview">
        {loading ? (
          <LoadingSkeleton lines={5} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchStats} />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Total Users</span>
              <span className="text-lg font-semibold">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Total Bootcamps</span>
              <span className="text-lg font-semibold">{stats.totalBootcamps}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Total Sessions</span>
              <span className="text-lg font-semibold">{stats.totalSessions}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Active Enrollments</span>
              <span className="text-lg font-semibold">{stats.activeEnrollments}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

