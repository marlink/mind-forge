'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { PageLoading } from '../../../components/Loading';
import { ErrorMessage, EmptyState } from '../../../components/Error';
import { Table } from '../../../components/Table';
import { Select } from '../../../components/Form';
import { useToast } from '../../../components/Toast';

interface Session {
  id: string;
  day: number;
  theme: string;
  date: string;
  startTime: string;
  endTime: string;
  activities: Array<{
    id: string;
    time: string;
    title: string;
    type: string;
  }>;
  _count: {
    attendance: number;
  };
}

interface Bootcamp {
  id: string;
  title: string;
}

export default function SessionsListPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const bootcampId = params?.id as string;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'day' | 'date'>('day');

  useEffect(() => {
    if (bootcampId) {
      fetchBootcamp();
      fetchSessions();
      fetchUserRole();
    }
  }, [bootcampId, filter]);

  const fetchUserRole = async () => {
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
        const user = data.data.user;
        if (user.admin) setUserRole('ADMIN');
        else if (user.facilitator) setUserRole('FACILITATOR');
        else if (user.parent) setUserRole('PARENT');
        else if (user.student) setUserRole('STUDENT');
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchBootcamp = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bootcamps/${bootcampId}`
      );
      const data = await response.json();

      if (data.status === 'success') {
        setBootcamp(data.data.bootcamp);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bootcamps/${bootcampId}/sessions`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        let fetchedSessions = data.data.sessions || [];
        
        // Apply filter
        const now = new Date();
        if (filter === 'upcoming') {
          fetchedSessions = fetchedSessions.filter((s: Session) => new Date(s.date) >= now);
        } else if (filter === 'past') {
          fetchedSessions = fetchedSessions.filter((s: Session) => new Date(s.date) < now);
        }

        // Apply sorting
        fetchedSessions.sort((a: Session, b: Session) => {
          if (sortBy === 'day') {
            return a.day - b.day;
          } else {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
        });

        setSessions(fetchedSessions);
        setError(null);
      } else {
        setError('Failed to load sessions');
      }
    } catch (err) {
      setError('An error occurred while loading sessions');
    } finally {
      setLoading(false);
    }
  };

  const isFacilitatorOrAdmin = userRole === 'FACILITATOR' || userRole === 'ADMIN';

  if (loading) {
    return <PageLoading />;
  }

  if (error && !bootcamp) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <ErrorMessage
            title="Failed to load sessions"
            message={error || 'Bootcamp not found'}
            showHomeLink={true}
          />
          <Link href="/bootcamps" className="mt-4 inline-block">
            <Button variant="outline">← Back to Bootcamps</Button>
          </Link>
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: 'day',
      header: 'Day',
      render: (session: Session) => (
        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm font-medium">
          Day {session.day}
        </span>
      ),
    },
    {
      key: 'theme',
      header: 'Theme',
      render: (session: Session) => (
        <div>
          <div className="font-semibold">{session.theme}</div>
          <div className="text-sm text-gray-500">
            {session.activities?.length || 0} activities
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date & Time',
      render: (session: Session) => (
        <div>
          <div className="text-sm font-medium">
            {new Date(session.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <div className="text-xs text-gray-500">
            {session.startTime} - {session.endTime}
          </div>
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Attendance',
      render: (session: Session) => (
        <span className="text-sm text-gray-600">
          {session._count?.attendance || 0} students
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (session: Session) => {
        const sessionDate = new Date(session.date);
        const now = new Date();
        const isPast = sessionDate < now;
        const isToday = sessionDate.toDateString() === now.toDateString();

        if (isPast) {
          return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Past</span>;
        } else if (isToday) {
          return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Today</span>;
        } else {
          return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Upcoming</span>;
        }
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (session: Session) => (
        <div className="flex space-x-2">
          <Link href={`/bootcamps/${bootcampId}/sessions/${session.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          {isFacilitatorOrAdmin && (
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Link href={`/bootcamps/${bootcampId}`} className="mb-4 inline-block">
          <Button variant="outline" size="sm">← Back to Bootcamp</Button>
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">
            Sessions
            {bootcamp && (
              <span className="text-2xl font-normal text-gray-600 ml-2">
                - {bootcamp.title}
              </span>
            )}
          </h1>
          <p className="text-gray-600">View and manage all sessions for this bootcamp</p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <div className="flex space-x-2">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'upcoming' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('upcoming')}
                  >
                    Upcoming
                  </Button>
                  <Button
                    variant={filter === 'past' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('past')}
                  >
                    Past
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'day' | 'date');
                    fetchSessions();
                  }}
                  options={[
                    { value: 'day', label: 'Day Number' },
                    { value: 'date', label: 'Date' },
                  ]}
                  className="w-40"
                />
              </div>
            </div>
            {isFacilitatorOrAdmin && (
              <Button>Create Session</Button>
            )}
          </div>
        </Card>

        {/* Sessions Table */}
        <Card title={`${sessions.length} Session${sessions.length !== 1 ? 's' : ''}`}>
          {error ? (
            <ErrorMessage message={error} onRetry={fetchSessions} />
          ) : sessions.length > 0 ? (
            <Table
              data={sessions}
              columns={columns}
              keyExtractor={(session) => session.id}
              onRowClick={(session) => {
                router.push(`/bootcamps/${bootcampId}/sessions/${session.id}`);
              }}
              hover={true}
              striped={true}
            />
          ) : (
            <EmptyState
              title="No sessions found"
              message={
                filter === 'upcoming'
                  ? 'No upcoming sessions scheduled.'
                  : filter === 'past'
                  ? 'No past sessions found.'
                  : 'No sessions have been created for this bootcamp yet.'
              }
              action={
                isFacilitatorOrAdmin ? (
                  <Button>Create First Session</Button>
                ) : undefined
              }
            />
          )}
        </Card>

        {/* Summary Stats */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{sessions.length}</div>
                <div className="text-sm text-gray-600 mt-1">Total Sessions</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {sessions.filter((s) => new Date(s.date) >= new Date()).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Upcoming</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {sessions.filter((s) => new Date(s.date) < new Date()).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Past</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

