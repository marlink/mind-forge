'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../../../../components/Card';
import { Button } from '../../../../components/Button';
import { PageLoading, LoadingSkeleton } from '../../../../components/Loading';
import { ErrorMessage, EmptyState } from '../../../../components/Error';
import { useToast } from '../../../../components/Toast';

interface Activity {
  id: string;
  time: string;
  type: string;
  title: string;
  description: string;
  materials: string[];
  learningObjectives: string[];
  facilitatorNotes?: string;
  studentDeliverables: string[];
}

interface AttendanceRecord {
  id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  joinTime?: string;
  leaveTime?: string;
  engagementScore?: number;
  Student: {
    User: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface Session {
  id: string;
  day: number;
  theme: string;
  date: string;
  startTime: string;
  endTime: string;
  activities: Activity[];
  Bootcamp: {
    id: string;
    title: string;
    Facilitator: {
      User: {
        id: string;
        name: string;
        email: string;
      };
    };
  };
  attendance: AttendanceRecord[];
}

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const bootcampId = params?.id as string;
  const sessionId = params?.sessionId as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
      fetchUserRole();
    }
  }, [sessionId]);

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

  const fetchSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sessions/${sessionId}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        setSession(data.data.session);
        setError(null);
      } else {
        setError('Session not found');
      }
    } catch (err) {
      setError('An error occurred while loading session details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error || !session) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <ErrorMessage
            title="Failed to load session"
            message={error || 'Session not found'}
            showHomeLink={true}
          />
          <Link href={`/bootcamps/${bootcampId}`} className="mt-4 inline-block">
            <Button variant="outline">← Back to Bootcamp</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isFacilitatorOrAdmin = userRole === 'FACILITATOR' || userRole === 'ADMIN';
  const presentCount = session.attendance.filter(a => a.status === 'PRESENT').length;
  const absentCount = session.attendance.filter(a => a.status === 'ABSENT').length;
  const lateCount = session.attendance.filter(a => a.status === 'LATE').length;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Link href={`/bootcamps/${bootcampId}`} className="mb-4 inline-block">
          <Button variant="outline" size="sm">← Back to Bootcamp</Button>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  Day {session.day}
                </span>
                <h1 className="text-4xl font-bold">{session.theme}</h1>
              </div>
              <p className="text-xl text-gray-600 mb-4">
                {session.Bootcamp.title}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(session.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {session.startTime} - {session.endTime}
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Facilitator: {session.Bootcamp.Facilitator.User.name}
                </div>
              </div>
            </div>
            {isFacilitatorOrAdmin && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Edit Session
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Summary (for facilitators/admins) */}
        {isFacilitatorOrAdmin && session.attendance.length > 0 && (
          <Card title="Attendance Summary" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{presentCount}</div>
                <div className="text-sm text-gray-600 mt-1">Present</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{absentCount}</div>
                <div className="text-sm text-gray-600 mt-1">Absent</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{lateCount}</div>
                <div className="text-sm text-gray-600 mt-1">Late</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Attendance Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {session.attendance.map((record) => (
                      <tr key={record.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.Student.User.name}
                            </div>
                            <div className="text-sm text-gray-500">{record.Student.User.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              record.status === 'PRESENT'
                                ? 'bg-green-100 text-green-800'
                                : record.status === 'LATE'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {record.joinTime
                            ? new Date(record.joinTime).toLocaleTimeString()
                            : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {record.engagementScore !== null && record.engagementScore !== undefined
                            ? `${record.engagementScore}%`
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {/* Activities Timeline */}
        <Card
          title="Session Activities"
          headerActions={
            session.activities.length > 0 && (
              <span className="text-sm text-gray-600">{session.activities.length} activities</span>
            )
          }
          className="mb-6"
        >
          {session.activities.length > 0 ? (
            <div className="space-y-6">
              {session.activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="border-l-4 border-primary-500 pl-6 pb-6 relative"
                >
                  {index < session.activities.length - 1 && (
                    <div className="absolute left-[-2px] top-12 bottom-[-24px] w-0.5 bg-gray-200"></div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                          {activity.time}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {activity.type}
                        </span>
                        <h3 className="font-semibold text-lg">{activity.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-3">{activity.description}</p>

                      {activity.learningObjectives && activity.learningObjectives.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Learning Objectives:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {activity.learningObjectives.map((objective, idx) => (
                              <li key={idx}>{objective}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activity.materials && activity.materials.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Materials:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {activity.materials.map((material, idx) => (
                              <li key={idx}>{material}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activity.studentDeliverables && activity.studentDeliverables.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Student Deliverables:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {activity.studentDeliverables.map((deliverable, idx) => (
                              <li key={idx}>{deliverable}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {isFacilitatorOrAdmin && activity.facilitatorNotes && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <h4 className="text-sm font-medium text-yellow-800 mb-1">Facilitator Notes:</h4>
                          <p className="text-sm text-yellow-700">{activity.facilitatorNotes}</p>
                        </div>
                      )}
                    </div>
                    {isFacilitatorOrAdmin && (
                      <div className="ml-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No activities scheduled"
              message="Activities will appear here once they are added to the session."
            />
          )}
        </Card>
      </div>
    </div>
  );
}

