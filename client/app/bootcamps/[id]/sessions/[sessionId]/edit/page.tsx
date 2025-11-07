'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../../../components/Card';
import { Button } from '../../../../../components/Button';
import { Input, Select } from '../../../../../components/Form';
import { PageLoading } from '../../../../../components/Loading';
import { ErrorMessage } from '../../../../../components/Error';
import { useToast } from '../../../../../components/Toast';
import { useForm, validators } from '../../../../../lib/useForm';
import { api } from '../../../../../lib/api';

interface SessionFormData {
  day: number;
  theme: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface Session {
  id: string;
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

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const bootcampId = params?.id as string;
  const sessionId = params?.sessionId as string;
  const [session, setSession] = useState<Session | null>(null);
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingDays, setExistingDays] = useState<number[]>([]);

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

        const response = await api.put(`/api/sessions/${sessionId}`, payload);

        if (response.status === 'success') {
          toast.showToast('Session updated successfully!', 'success');
          router.push(`/bootcamps/${bootcampId}/sessions/${sessionId}`);
        }
      } catch (error: any) {
        toast.showToast(
          error.message || 'Failed to update session',
          'error'
        );
        throw error;
      }
    },
  });

  useEffect(() => {
    if (bootcampId && sessionId) {
      fetchSession();
      fetchBootcamp();
      fetchExistingSessions();
    }
  }, [bootcampId, sessionId]);

  const fetchSession = async () => {
    try {
      const response = await api.get<{ session: any }>(`/api/sessions/${sessionId}`);
      if (response.status === 'success' && response.data?.session) {
        const sessionData = response.data.session;
        setSession(sessionData);
        
        // Pre-populate form with session data
        const sessionDate = new Date(sessionData.date);
        const dateStr = sessionDate.toISOString().split('T')[0];
        const startTime = sessionData.startTime.substring(0, 5); // Extract HH:MM from HH:MM:SS
        const endTime = sessionData.endTime.substring(0, 5);
        
        setFieldValue('day', sessionData.day);
        setFieldValue('theme', sessionData.theme);
        setFieldValue('date', dateStr);
        setFieldValue('startTime', startTime);
        setFieldValue('endTime', endTime);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const fetchBootcamp = async () => {
    try {
      const response = await api.get<{ bootcamp: any }>(`/api/bootcamps/${bootcampId}`);
      if (response.status === 'success' && response.data?.bootcamp) {
        setBootcamp(response.data.bootcamp);
      }
    } catch (err: any) {
      // Silently fail - not critical
    }
  };

  const fetchExistingSessions = async () => {
    try {
      const response = await api.get<{ sessions: Array<{ id: string; day: number }> }>(`/api/bootcamps/${bootcampId}/sessions`);
      if (response.status === 'success' && response.data) {
        const sessions = response.data.sessions || [];
        // Exclude current session's day from existing days
        const days = sessions
          .filter((s) => s.id !== sessionId)
          .map((s) => s.day);
        setExistingDays(days);
      }
    } catch (err) {
      // Silently fail - not critical
    }
  };

  // Generate day options (1-30)
  const dayOptions = Array.from({ length: 30 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Day ${i + 1}${existingDays.includes(i + 1) ? ' (already exists)' : ''}`,
  }));

  const isDayTaken = existingDays.includes(values.day);

  if (loading) {
    return <PageLoading />;
  }

  if (error && !session) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <ErrorMessage
            title="Failed to load session"
            message={error}
            showHomeLink={true}
          />
          <Link href={`/bootcamps/${bootcampId}/sessions`} className="mt-4 inline-block">
            <Button variant="outline">← Back to Sessions</Button>
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
        <Link href={`/bootcamps/${bootcampId}/sessions/${sessionId}`} className="mb-4 inline-block">
          <Button variant="outline" size="sm">← Back to Session</Button>
        </Link>

        <Card title="Edit Session">
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
                  ⚠️ A session for Day {values.day} already exists. You can still update this session, but consider using a different day number.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Link href={`/bootcamps/${bootcampId}/sessions/${sessionId}`}>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting} disabled={isDayTaken}>
                Update Session
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

