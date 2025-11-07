'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../../components/Card';
import { Button } from '../../../../components/Button';
import { Input, Select } from '../../../../components/Form';
import { PageLoading } from '../../../../components/Loading';
import { ErrorMessage } from '../../../../components/Error';
import { useToast } from '../../../../components/Toast';
import { useForm, validators } from '../../../../lib/useForm';
import { api } from '../../../../lib/api';

interface SessionFormData {
  day: number;
  theme: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface Bootcamp {
  id: string;
  title: string;
}

export default function NewSessionPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const bootcampId = params?.id as string;
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingDays, setExistingDays] = useState<number[]>([]);

  useEffect(() => {
    if (bootcampId) {
      fetchBootcamp();
      fetchExistingSessions();
    }
  }, [bootcampId]);

  const fetchBootcamp = async () => {
    try {
      const response = await api.get(`/api/bootcamps/${bootcampId}`);
      if (response.status === 'success') {
        setBootcamp(response.data.bootcamp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bootcamp');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingSessions = async () => {
    try {
      const response = await api.get(`/api/bootcamps/${bootcampId}/sessions`);
      if (response.status === 'success') {
        const sessions = response.data.sessions || [];
        const days = sessions.map((s: any) => s.day);
        setExistingDays(days);
      }
    } catch (err) {
      // Silently fail - not critical
    }
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useForm<SessionFormData>({
    initialValues: {
      day: 1,
      theme: '',
      date: '',
      startTime: '09:00',
      endTime: '17:00',
    },
    validationRules: {
      day: [
        validators.required('Day number is required'),
        validators.min(1, 'Day must be at least 1'),
      ],
      theme: [validators.required('Theme is required')],
      date: [validators.required('Date is required')],
      startTime: [validators.required('Start time is required')],
      endTime: [validators.required('End time is required')],
    },
    onSubmit: async (formValues) => {
      try {
        // Convert date and time to ISO datetime string
        const dateTime = new Date(`${formValues.date}T${formValues.startTime}:00`);
        const isoDateTime = dateTime.toISOString();

        const payload = {
          ...formValues,
          date: isoDateTime,
        };

        const response = await api.post(`/api/bootcamps/${bootcampId}/sessions`, payload);

        if (response.status === 'success') {
          toast.showToast('Session created successfully!', 'success');
          router.push(`/bootcamps/${bootcampId}/sessions`);
        }
      } catch (error: any) {
        toast.showToast(
          error.message || 'Failed to create session',
          'error'
        );
        throw error;
      }
    },
  });

  // Generate day options (1-30)
  const dayOptions = Array.from({ length: 30 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Day ${i + 1}${existingDays.includes(i + 1) ? ' (already exists)' : ''}`,
  }));

  const isDayTaken = existingDays.includes(values.day);

  if (loading) {
    return <PageLoading />;
  }

  if (error && !bootcamp) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <ErrorMessage
            title="Failed to load bootcamp"
            message={error}
            showHomeLink={true}
          />
          <Link href="/bootcamps" className="mt-4 inline-block">
            <Button variant="outline">← Back to Bootcamps</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Link href={`/bootcamps/${bootcampId}/sessions`} className="mb-4 inline-block">
          <Button variant="outline" size="sm">← Back to Sessions</Button>
        </Link>

        <Card title="Create New Session">
          {bootcamp && (
            <div className="mb-6 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Bootcamp</p>
              <p className="text-lg font-semibold text-primary-900">{bootcamp.title}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Day Number"
                name="day"
                value={values.day.toString()}
                onChange={(e) => {
                  setFieldValue('day', parseInt(e.target.value, 10));
                }}
                onBlur={handleBlur}
                error={touched.day ? errors.day : undefined}
                required
                options={dayOptions}
                helperText={isDayTaken ? 'Warning: A session for this day already exists' : undefined}
              />

              <Input
                label="Theme"
                name="theme"
                value={values.theme}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.theme ? errors.theme : undefined}
                placeholder="e.g., Introduction to Problem Solving"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Date"
                name="date"
                type="date"
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.date ? errors.date : undefined}
                min={today}
                required
              />

              <Input
                label="Start Time"
                name="startTime"
                type="time"
                value={values.startTime}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.startTime ? errors.startTime : undefined}
                required
              />

              <Input
                label="End Time"
                name="endTime"
                type="time"
                value={values.endTime}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.endTime ? errors.endTime : undefined}
                required
              />
            </div>

            {isDayTaken && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ A session for Day {values.day} already exists. You can still create this session, but consider using a different day number.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Link href={`/bootcamps/${bootcampId}/sessions`}>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting} disabled={isDayTaken}>
                Create Session
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

