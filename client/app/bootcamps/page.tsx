'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBootcamps();
  }, []);

  const fetchBootcamps = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bootcamps`);
      const data = await response.json();

      if (data.status === 'success') {
        setBootcamps(data.data.bootcamps);
      } else {
        setError('Failed to load bootcamps');
      }
    } catch (err) {
      setError('An error occurred while loading bootcamps');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (bootcampId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

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
        alert('Successfully enrolled!');
        fetchBootcamps(); // Refresh list
      } else {
        alert(data.message || 'Enrollment failed');
      }
    } catch (err) {
      alert('An error occurred during enrollment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading bootcamps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bootcamp Catalog</h1>
          <p className="text-gray-600">Discover intensive learning experiences</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {bootcamps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No bootcamps available at this time.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bootcamps.map((bootcamp) => (
              <div
                key={bootcamp.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-2">{bootcamp.title}</h2>
                  <p className="text-gray-600 mb-4">{bootcamp.subtitle}</p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {bootcamp.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Duration:</span>
                      <span className="ml-2">{bootcamp.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Format:</span>
                      <span className="ml-2">{bootcamp.format.join(', ')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Age Range:</span>
                      <span className="ml-2">{bootcamp.ageRange}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Facilitator:</span>
                      <span className="ml-2">{bootcamp.Facilitator.User.name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Enrolled:</span>
                      <span className="ml-2">
                        {bootcamp.enrollmentCount || bootcamp._count?.enrollments || 0} / {bootcamp.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-bold text-primary-600">
                      ${bootcamp.price}
                    </span>
                    <div className="space-x-2">
                      <Link
                        href={`/bootcamps/${bootcamp.id}`}
                        className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleEnroll(bootcamp.id)}
                        disabled={bootcamp.enrollmentCount >= bootcamp.capacity}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bootcamp.enrollmentCount >= bootcamp.capacity ? 'Full' : 'Enroll'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

