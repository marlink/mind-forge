'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PageLoading, LoadingSkeleton } from '../../components/Loading';
import { ErrorMessage, EmptyState } from '../../components/Error';
import { Navigation } from '../../components/Navigation';
import { useToast } from '../../components/Toast';
import { api } from '../../lib/api';

interface Bootcamp {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  format: string[];
  ageRange: string;
  subjects: string[];
  price: number;
  capacity: number;
  enrollmentCount: number;
  learningOutcomes: string[];
  weeklySchedule: any;
  Facilitator: {
    User: {
      name: string;
      email: string;
    };
    bio: string;
    specialties: string[];
  };
  _count: {
    enrollments: number;
  };
}

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
}

interface DiscussionTopic {
  id: string;
  day: number;
  title: string;
  prompt: string;
  tags: string[];
}

export default function BootcampDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const bootcampId = params?.id as string;
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    if (bootcampId) {
      fetchBootcamp();
      fetchSessions();
      fetchDiscussions();
      checkEnrollment();
      fetchUser();
    }
  }, [bootcampId]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await api.get('/users/me');
      if (response.status === 'success') {
        setUser({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
        });
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchBootcamp = async () => {
    try {
      const response = await api.get(`/bootcamps/${bootcampId}`);
      if (response.status === 'success') {
        setBootcamp(response.data.bootcamp);
        setError(null);
      } else {
        setError('Bootcamp not found');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading bootcamp details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const response = await api.get<{ sessions: Session[] }>(`/bootcamps/${bootcampId}/sessions`);
      if (response.status === 'success' && response.data) {
        setSessions(response.data.sessions || []);
      }
    } catch (err) {
      // Silently fail for sessions
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const response = await api.get<{ discussions: DiscussionTopic[] }>(`/bootcamps/${bootcampId}/discussions`);
      if (response.status === 'success' && response.data) {
        setDiscussions(response.data.discussions || []);
      }
    } catch (err) {
      // Silently fail for discussions
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await api.get<{ user: { student?: { enrollments?: Array<{ Bootcamp: { id: string } }> } } }>('/users/me');
      if (response.status === 'success' && response.data?.user?.student) {
        const enrolled = response.data.user.student.enrollments?.some(
          (e) => e.Bootcamp.id === bootcampId
        );
        setIsEnrolled(enrolled || false);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const handleEnroll = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.showToast('Please log in to enroll', 'info');
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      await api.post(`/bootcamps/${bootcampId}/enroll`);
      toast.showToast('Successfully enrolled!', 'success');
      setIsEnrolled(true);
      fetchBootcamp(); // Refresh to update enrollment count
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      toast.showToast(err.message || 'Enrollment failed', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error || !bootcamp) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <ErrorMessage
            title="Failed to load bootcamp"
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

  const isFull = bootcamp.enrollmentCount >= bootcamp.capacity;
  const enrollmentCount = bootcamp.enrollmentCount || bootcamp._count?.enrollments || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} showBackButton backHref="/bootcamps" backLabel="Back to Bootcamps" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6 animate-in fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{bootcamp.title}</h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6">{bootcamp.subtitle}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {bootcamp.format.map((fmt) => (
              <span
                key={fmt}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {fmt}
              </span>
            ))}
            {bootcamp.subjects.map((subject) => (
              <span
                key={subject}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {subject}
              </span>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">{bootcamp.description}</p>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                  <span className="font-medium w-32 text-sm sm:text-base">Duration:</span>
                  <span className="text-gray-700 text-sm sm:text-base">{bootcamp.duration}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                  <span className="font-medium w-32 text-sm sm:text-base">Age Range:</span>
                  <span className="text-gray-700 text-sm sm:text-base">{bootcamp.ageRange}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                  <span className="font-medium w-32 text-sm sm:text-base">Enrollment:</span>
                  <span className="text-gray-700 text-sm sm:text-base">
                    {enrollmentCount} / {bootcamp.capacity}
                    {isFull && <span className="ml-2 text-red-600 font-medium">(Full)</span>}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Card className="mb-6 animate-in fade-in" style={{ animationDelay: '100ms' }}>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">
                    ${bootcamp.price}
                  </div>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">One-time payment</p>
                  {isEnrolled ? (
                    <Button variant="secondary" className="w-full" disabled aria-label="Already enrolled">
                      Already Enrolled
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={isFull || enrolling}
                      isLoading={enrolling}
                      className="w-full"
                      aria-label={isFull ? 'Bootcamp is full' : `Enroll in ${bootcamp.title}`}
                    >
                      {isFull ? 'Bootcamp Full' : 'Enroll Now'}
                    </Button>
                  )}
                </div>
              </Card>

              <Card title="Facilitator" className="animate-in fade-in" style={{ animationDelay: '150ms' }}>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">{bootcamp.Facilitator.User.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{bootcamp.Facilitator.User.email}</p>
                  <p className="text-gray-700 mt-3 text-sm sm:text-base leading-relaxed">{bootcamp.Facilitator.bio}</p>
                  {bootcamp.Facilitator.specialties && bootcamp.Facilitator.specialties.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-600 mb-1">Specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {bootcamp.Facilitator.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Learning Outcomes */}
        {bootcamp.learningOutcomes && bootcamp.learningOutcomes.length > 0 && (
          <Card title="Learning Outcomes" className="mb-6 animate-in fade-in" style={{ animationDelay: '200ms' }}>
            <ul className="space-y-2">
              {bootcamp.learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5" aria-hidden="true">✓</span>
                  <span className="text-gray-700 text-sm sm:text-base">{outcome}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Sessions */}
        <Card
          title="Sessions"
          headerActions={
            sessions.length > 0 ? (
              <Link href={`/bootcamps/${bootcampId}/sessions`}>
                <Button variant="outline" size="sm">View All Sessions</Button>
              </Link>
            ) : undefined
          }
          className="mb-6 animate-in fade-in"
          style={{ animationDelay: '250ms' }}
        >
          {sessionsLoading ? (
            <LoadingSkeleton lines={3} />
          ) : sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 animate-in fade-in"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm font-medium">
                          Day {session.day}
                        </span>
                        <h3 className="font-semibold text-base sm:text-lg">{session.theme}</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime}
                      </p>
                      {session.activities && session.activities.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {session.activities.length} activities scheduled
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/bootcamps/${bootcampId}/sessions/${session.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No sessions scheduled"
              message="Sessions will appear here once they are created by the facilitator."
            />
          )}
        </Card>

        {/* Discussion Topics */}
        <Card
          title="Discussion Topics"
          headerActions={
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {discussions.length > 0 && (
                <span className="text-sm text-gray-600">{discussions.length} topics</span>
              )}
              <Link href={`/bootcamps/${bootcampId}/discussions`}>
                <Button variant="outline" size="sm">
                  {discussions.length > 0 ? 'Manage' : 'View'} Discussions
                </Button>
              </Link>
            </div>
          }
          className="animate-in fade-in"
          style={{ animationDelay: '300ms' }}
        >
          {discussions.length > 0 ? (
            <div className="space-y-4">
              {discussions.map((discussion, index) => (
                <div
                  key={discussion.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 animate-in fade-in"
                  style={{ animationDelay: `${350 + index * 50}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                          Day {discussion.day}
                        </span>
                        <h3 className="font-semibold text-sm sm:text-base">{discussion.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{discussion.prompt}</p>
                      {discussion.tags && discussion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {discussion.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No discussion topics"
              message="Discussion topics will appear here once created"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
