'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PageLoading, LoadingSkeleton } from '../components/Loading';
import { EmptyState, ErrorMessage } from '../components/Error';
import { Navigation } from '../components/Navigation';
import { useToast } from '../components/Toast';
import { api } from '../lib/api';

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
  Facilitator: {
    User: {
      name: string;
    };
  };
  _count: {
    enrollments: number;
  };
}

export default function BootcampsPage() {
  const router = useRouter();
  const toast = useToast();
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    fetchBootcamps();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await api.get<{ user: { id: string; name: string; email: string } }>('/users/me');
      if (response.status === 'success' && response.data?.user) {
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

  const fetchBootcamps = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ bootcamps: Bootcamp[] }>('/bootcamps');
      if (response.status === 'success' && response.data) {
        setBootcamps(response.data.bootcamps);
        setError(null);
      } else {
        setError('Failed to load bootcamps');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading bootcamps');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (bootcampId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.showToast('Please log in to enroll', 'info');
      router.push('/login');
      return;
    }

    setEnrolling(bootcampId);
    try {
      await api.post(`/bootcamps/${bootcampId}/enroll`);
      toast.showToast('Successfully enrolled!', 'success');
      fetchBootcamps(); // Refresh list
    } catch (err: any) {
      toast.showToast(err.message || 'Enrollment failed', 'error');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Bootcamp Catalog</h1>
            <p className="text-gray-600">Discover intensive learning experiences</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} lines={8} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Bootcamp Catalog</h1>
          <p className="text-gray-600">Discover intensive learning experiences</p>
        </div>

        {error ? (
          <ErrorMessage message={error} onRetry={fetchBootcamps} />
        ) : bootcamps.length === 0 ? (
          <EmptyState
            title="No bootcamps available"
            message="Check back soon for new learning opportunities"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {bootcamps.map((bootcamp, index) => {
              const isFull = bootcamp.enrollmentCount >= bootcamp.capacity;
              const enrollmentCount = bootcamp.enrollmentCount || bootcamp._count?.enrollments || 0;
              return (
                <Card
                  key={bootcamp.id}
                  className="hover:shadow-lg transition-all duration-300 animate-in fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col h-full">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-2">{bootcamp.title}</h2>
                    <p className="text-gray-600 mb-3 text-sm sm:text-base">{bootcamp.subtitle}</p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-grow">
                      {bootcamp.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex flex-wrap items-center text-sm text-gray-600 gap-2">
                        <span className="font-medium">Duration:</span>
                        <span>{bootcamp.duration}</span>
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-gray-600 gap-2">
                        <span className="font-medium">Format:</span>
                        <span>{bootcamp.format.join(', ')}</span>
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-gray-600 gap-2">
                        <span className="font-medium">Age Range:</span>
                        <span>{bootcamp.ageRange}</span>
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-gray-600 gap-2">
                        <span className="font-medium">Facilitator:</span>
                        <span>{bootcamp.Facilitator.User.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-gray-600 gap-2">
                        <span className="font-medium">Enrolled:</span>
                        <span>
                          {enrollmentCount} / {bootcamp.capacity}
                          {isFull && <span className="ml-1 text-red-600 font-medium">(Full)</span>}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-auto pt-4 border-t border-gray-200">
                      <span className="text-2xl font-bold text-primary-600">
                        ${bootcamp.price}
                      </span>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link href={`/bootcamps/${bootcamp.id}`} className="flex-1 sm:flex-none">
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleEnroll(bootcamp.id)}
                          disabled={isFull || enrolling === bootcamp.id}
                          isLoading={enrolling === bootcamp.id}
                          size="sm"
                          className="w-full sm:w-auto"
                          aria-label={isFull ? 'Bootcamp is full' : `Enroll in ${bootcamp.title}`}
                        >
                          {isFull ? 'Full' : 'Enroll'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

