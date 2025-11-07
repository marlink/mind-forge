'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../Card';
import { Button } from '../Button';
import { LoadingSpinner, LoadingSkeleton } from '../Loading';
import { EmptyState, ErrorMessage } from '../Error';

interface Child {
  id: string;
  User: {
    id: string;
    name: string;
    email: string;
  };
  enrollments: Array<{
    Bootcamp: {
      id: string;
      title: string;
    };
    status: string;
  }>;
}

interface ParentDashboardProps {
  userId: string;
}

export function ParentDashboard({ userId }: ParentDashboardProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChildren();
  }, [userId]);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Note: This endpoint would need to be created to get parent's children
      // For now, we'll use a placeholder approach
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // This would need to include children data from the API
        // For MVP, we'll show a placeholder structure
        setChildren([]);
      }
    } catch (err) {
      setError('Failed to load children data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{children.length}</div>
            <div className="text-sm text-gray-600 mt-1">Children</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {children.reduce((acc, child) => acc + child.enrollments.length, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Enrollments</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {children.reduce(
                (acc, child) =>
                  acc + child.enrollments.filter((e) => e.status === 'ACTIVE').length,
                0
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">Active Bootcamps</div>
          </div>
        </Card>
      </div>

      {/* Children Overview */}
      <Card title="My Children">
        {loading ? (
          <LoadingSkeleton lines={3} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchChildren} />
        ) : children.length > 0 ? (
          <div className="space-y-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{child.User.name}</h3>
                    <p className="text-sm text-gray-600">{child.User.email}</p>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Active Bootcamps:</span>{' '}
                        {child.enrollments.filter((e) => e.status === 'ACTIVE').length}
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/children/${child.User.id}`}>
                    <Button variant="outline" size="sm">View Progress</Button>
                  </Link>
                </div>
                {child.enrollments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-2">Enrollments:</p>
                    <div className="space-y-1">
                      {child.enrollments.slice(0, 3).map((enrollment) => (
                        <div key={enrollment.Bootcamp.id} className="text-sm">
                          <span className="text-gray-700">{enrollment.Bootcamp.title}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            enrollment.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : enrollment.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No children registered"
            message="Children accounts will appear here once they are linked to your account."
          />
        )}
      </Card>

      {/* Recent Communications */}
      <Card title="Recent Communications" headerActions={
        <Link href="/communications">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      }>
        <EmptyState
          title="No messages yet"
          message="Communications with facilitators will appear here."
          action={
            <Link href="/communications">
              <Button size="sm">Go to Inbox</Button>
            </Link>
          }
        />
      </Card>
    </div>
  );
}

