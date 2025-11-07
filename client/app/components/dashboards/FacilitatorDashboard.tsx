'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../Card';
import { Button } from '../Button';
import { LoadingSpinner, LoadingSkeleton } from '../Loading';
import { EmptyState, ErrorMessage } from '../Error';

interface Bootcamp {
  id: string;
  title: string;
  status: string;
  enrollmentCount: number;
  capacity: number;
  sessions?: Array<{
    id: string;
    day: number;
    date: string;
    theme: string;
  }>;
}

interface FacilitatorDashboardProps {
  userId: string;
}

export function FacilitatorDashboard({ userId }: FacilitatorDashboardProps) {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBootcamps();
  }, [userId]);

  const fetchBootcamps = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bootcamps?facilitatorId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setBootcamps(data.data.bootcamps || []);
        }
      }
    } catch (err) {
      setError('Failed to load bootcamps');
    } finally {
      setLoading(false);
    }
  };

  const activeBootcamps = bootcamps.filter(b => b.status === 'PUBLISHED');
  const draftBootcamps = bootcamps.filter(b => b.status === 'DRAFT');

  // Get upcoming sessions (next 7 days)
  const upcomingSessions = bootcamps
    .flatMap(b => (b.sessions || []).map(s => ({ ...s, bootcampTitle: b.title, bootcampId: b.id })))
    .filter(s => {
      const sessionDate = new Date(s.date);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return sessionDate >= today && sessionDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{bootcamps.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Bootcamps</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{activeBootcamps.length}</div>
            <div className="text-sm text-gray-600 mt-1">Published</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{draftBootcamps.length}</div>
            <div className="text-sm text-gray-600 mt-1">Drafts</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{upcomingSessions.length}</div>
            <div className="text-sm text-gray-600 mt-1">Upcoming Sessions</div>
          </div>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card title="Upcoming Sessions" headerActions={
        <Link href="/dashboard/sessions">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      }>
        {loading ? (
          <LoadingSkeleton lines={3} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchBootcamps} />
        ) : upcomingSessions.length > 0 ? (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{session.bootcampTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Day {session.day}: {session.theme}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/bootcamps/${session.bootcampId}/sessions/${session.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming sessions"
            message="Sessions you've scheduled will appear here."
          />
        )}
      </Card>

      {/* My Bootcamps */}
      <Card title="My Bootcamps" headerActions={
        <Link href="/bootcamps/new">
          <Button size="sm">Create Bootcamp</Button>
        </Link>
      }>
        {loading ? (
          <LoadingSkeleton lines={3} />
        ) : bootcamps.length > 0 ? (
          <div className="space-y-4">
            {bootcamps.map((bootcamp) => (
              <div
                key={bootcamp.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{bootcamp.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        bootcamp.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : bootcamp.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bootcamp.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Enrollment: {bootcamp.enrollmentCount} / {bootcamp.capacity}
                    </p>
                    {bootcamp.sessions && (
                      <p className="text-sm text-gray-600 mt-1">
                        Sessions: {bootcamp.sessions.length}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/bootcamps/${bootcamp.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Link href={`/bootcamps/${bootcamp.id}/sessions`}>
                      <Button variant="outline" size="sm">Sessions</Button>
                    </Link>
                    <Link href={`/bootcamps/${bootcamp.id}/edit`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No bootcamps yet"
            message="Create your first bootcamp to start teaching!"
            action={
              <Link href="/bootcamps/new">
                <Button>Create Bootcamp</Button>
              </Link>
            }
          />
        )}
      </Card>
    </div>
  );
}

