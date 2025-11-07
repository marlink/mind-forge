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
import { Navigation } from '../../../components/Navigation';
import { useToast } from '../../../components/Toast';
import { api } from '../../../lib/api';

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
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
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
    try {
      const response = await api.get<{ user: { id: string; name: string; email: string; admin?: any; facilitator?: any; parent?: any; student?: any } }>('/users/me');
      if (response.status === 'success' && response.data?.user) {
        const userData = response.data.user;
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
        });
        if (userData.admin) setUserRole('ADMIN');
        else if (userData.facilitator) setUserRole('FACILITATOR');
        else if (userData.parent) setUserRole('PARENT');
        else if (userData.student) setUserRole('STUDENT');
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchBootcamp = async () => {
    try {
      const response = await api.get<{ bootcamp: Bootcamp }>(`/bootcamps/${bootcampId}`);
      if (response.status === 'success' && response.data?.bootcamp) {
        setBootcamp(response.data.bootcamp);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ sessions: Session[] }>(`/bootcamps/${bootcampId}/sessions`);

      if (response.status === 'success' && response.data) {
        let fetchedSessions = response.data.sessions || [];
        
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
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading sessions');
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
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} showBackButton backHref={`/bootcamps/${bootcampId}`} backLabel="Back to Bootcamp" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-in fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Sessions
            {bootcamp && (
              <span className="text-xl sm:text-2xl font-normal text-gray-600 ml-2">
                - {bootcamp.title}
              </span>
            )}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">View and manage all sessions for this bootcamp</p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6 animate-in fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    aria-label="Show all sessions"
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'upcoming' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('upcoming')}
                    aria-label="Show upcoming sessions"
                  >
                    Upcoming
                  </Button>
                  <Button
                    variant={filter === 'past' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('past')}
                    aria-label="Show past sessions"
                  >
                    Past
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
                  className="w-full sm:w-40"
                />
              </div>
            </div>
            {isFacilitatorOrAdmin && (
              <Button className="w-full sm:w-auto">Create Session</Button>
            )}
          </div>
        </Card>

        {/* Sessions Table */}
        <Card 
          title={`${sessions.length} Session${sessions.length !== 1 ? 's' : ''}`}
          className="animate-in fade-in"
          style={{ animationDelay: '150ms' }}
        >
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 animate-in fade-in" style={{ animationDelay: '200ms' }}>
            <Card className="hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary-600">{sessions.length}</div>
                <div className="text-sm text-gray-600 mt-1">Total Sessions</div>
              </div>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {sessions.filter((s) => new Date(s.date) >= new Date()).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Upcoming</div>
              </div>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-600">
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

