'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../Card';
import { Button } from '../Button';
import { LoadingSpinner, LoadingSkeleton } from '../Loading';
import { EmptyState, ErrorMessage } from '../Error';
import { ProgressChart, SkillDistribution } from '../ProgressChart';

interface Enrollment {
  Bootcamp: {
    id: string;
    title: string;
    status: string;
  };
  status: string;
}

interface ProgressRecord {
  id: string;
  skill: string;
  level: string;
  assessmentDate: string;
  bootcampId?: string;
  Bootcamp?: {
    title: string;
  };
}

interface StudentDashboardProps {
  userId: string;
  studentId?: string;
  enrollments?: Enrollment[];
}

export function StudentDashboard({ userId, studentId, enrollments = [] }: StudentDashboardProps) {
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchProgress();
    } else {
      setLoading(false);
    }
  }, [studentId]);

  const fetchProgress = async () => {
    if (!studentId) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/students/${studentId}/progress`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setProgress(data.data.progress || []);
        }
      }
    } catch (err) {
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const activeBootcamps = enrollments.filter(e => e.status === 'ACTIVE');
  const completedBootcamps = enrollments.filter(e => e.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{activeBootcamps.length}</div>
            <div className="text-sm text-gray-600 mt-1">Active Bootcamps</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{completedBootcamps.length}</div>
            <div className="text-sm text-gray-600 mt-1">Completed</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{progress.length}</div>
            <div className="text-sm text-gray-600 mt-1">Progress Records</div>
          </div>
        </Card>
      </div>

      {/* Active Bootcamps */}
      <Card title="My Active Bootcamps">
        {loading ? (
          <LoadingSkeleton lines={3} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchProgress} />
        ) : activeBootcamps.length > 0 ? (
          <div className="space-y-4">
            {activeBootcamps.map((enrollment) => (
              <div
                key={enrollment.Bootcamp.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{enrollment.Bootcamp.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Status: {enrollment.status}</p>
                  </div>
                  <Link href={`/bootcamps/${enrollment.Bootcamp.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active bootcamps"
            message="Browse bootcamps to enroll in your first learning journey!"
            action={
              <Link href="/bootcamps">
                <Button>Browse Bootcamps</Button>
              </Link>
            }
          />
        )}
      </Card>

      {/* Progress Visualization */}
      {progress.length > 0 && (
        <Card title="Progress Overview">
          <ProgressChart progress={progress} />
        </Card>
      )}

      {/* Skill Distribution */}
      {progress.length > 0 && (
        <Card title="Skill Distribution">
          <SkillDistribution progress={progress} />
        </Card>
      )}

      {/* Recent Progress */}
      <Card title="Recent Progress">
        {loading ? (
          <LoadingSkeleton lines={3} />
        ) : progress.length > 0 ? (
          <div className="space-y-3">
            {progress.slice(0, 5).map((record) => (
              <div key={record.id} className="border-l-4 border-primary-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{record.skill}</p>
                    <p className="text-sm text-gray-600">
                      Level: {record.level}
                      {record.Bootcamp && ` • ${record.Bootcamp.title}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(record.assessmentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No progress records yet"
            message="Your progress will appear here as you complete assessments."
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
          title="No recent communications"
          message="Your messages and notifications will appear here."
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

