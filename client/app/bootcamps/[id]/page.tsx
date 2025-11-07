'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PageLoading, LoadingSkeleton } from '../../components/Loading';
import { ErrorMessage, EmptyState } from '../../components/Error';
import { useToast } from '../../components/Toast';

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

  useEffect(() => {
    if (bootcampId) {
      fetchBootcamp();
      fetchSessions();
      fetchDiscussions();
      checkEnrollment();
    }
  }, [bootcampId]);

  const fetchBootcamp = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bootcamps/${bootcampId}`
      );
      const data = await response.json();

      if (data.status === 'success') {
        setBootcamp(data.data.bootcamp);
        setError(null);
      } else {
        setError('Bootcamp not found');
      }
    } catch (err) {
      setError('An error occurred while loading bootcamp details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    setSessionsLoading(true);
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
        setSessions(data.data.sessions || []);
      }
    } catch (err) {
      // Silently fail for sessions
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bootcamps/${bootcampId}/discussions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.status === 'success') {
        setDiscussions(data.data.discussions || []);
      }
    } catch (err) {
      // Silently fail for discussions
    }
  };

  const checkEnrollment = async () => {
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

      if (data.status === 'success' && data.data.user.student) {
        const enrolled = data.data.user.student.enrollments?.some(
          (e: any) => e.Bootcamp.id === bootcampId
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
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bootcamps/${bootcampId}/enroll`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.showToast('Successfully enrolled!', 'success');
        setIsEnrolled(true);
        fetchBootcamp(); // Refresh to update enrollment count
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        toast.showToast(data.message || 'Enrollment failed', 'error');
      }
    } catch (err) {
      toast.showToast('An error occurred during enrollment', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error || !bootcamp) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
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
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Link href="/bootcamps" className="mb-4 inline-block">
          <Button variant="outline" size="sm">← Back to Bootcamps</Button>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-4xl font-bold mb-2">{bootcamp.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{bootcamp.subtitle}</p>

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

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 mb-6">{bootcamp.description}</p>

              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium w-32">Duration:</span>
                  <span className="text-gray-700">{bootcamp.duration}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Age Range:</span>
                  <span className="text-gray-700">{bootcamp.ageRange}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Enrollment:</span>
                  <span className="text-gray-700">
                    {enrollmentCount} / {bootcamp.capacity}
                    {isFull && <span className="ml-2 text-red-600">(Full)</span>}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Card className="mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    ${bootcamp.price}
                  </div>
                  <p className="text-gray-600 mb-4">One-time payment</p>
                  {isEnrolled ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Already Enrolled
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={isFull || enrolling}
                      isLoading={enrolling}
                      className="w-full"
                    >
                      {isFull ? 'Bootcamp Full' : 'Enroll Now'}
                    </Button>
                  )}
                </div>
              </Card>

              <Card title="Facilitator">
                <div>
                  <h3 className="font-semibold text-lg">{bootcamp.Facilitator.User.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{bootcamp.Facilitator.User.email}</p>
                  <p className="text-gray-700 mt-3">{bootcamp.Facilitator.bio}</p>
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
          <Card title="Learning Outcomes" className="mb-6">
            <ul className="space-y-2">
              {bootcamp.learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{outcome}</span>
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
          className="mb-6"
        >
          {sessionsLoading ? (
            <LoadingSkeleton lines={3} />
          ) : sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm font-medium">
                          Day {session.day}
                        </span>
                        <h3 className="font-semibold text-lg">{session.theme}</h3>
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
                    <div className="flex space-x-2">
                      <Link href={`/bootcamps/${bootcampId}/sessions`}>
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                      <Link href={`/bootcamps/${bootcampId}/sessions/${session.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
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
            <div className="flex items-center space-x-2">
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
        >
          {discussions.length > 0 ? (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                          Day {discussion.day}
                        </span>
                        <h3 className="font-semibold">{discussion.title}</h3>
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
