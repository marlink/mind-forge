'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../../../../components/Card';
import { Button } from '../../../../components/Button';
import { PageLoading } from '../../../../components/Loading';
import { ErrorMessage, EmptyState } from '../../../../components/Error';
import { Modal } from '../../../../components/Modal';
import { Input, Textarea } from '../../../../components/Form';
import { useToast } from '../../../../components/Toast';
import { useForm, validators } from '../../../../lib/useForm';
import { api } from '../../../../lib/api';
import { Navigation } from '../../../../components/Navigation';

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
  const params = useParams();
  const bootcampId = params?.id as string;
  const sessionId = params?.sessionId as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (sessionId) {
      fetchSession();
      fetchUserRole();
    }
  }, [sessionId]);

  const fetchUserRole = async () => {
    try {
      const response = await api.get<{ user: any }>('/users/me');
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

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ session: Session }>(`/sessions/${sessionId}`);

      if (response.status === 'success' && response.data?.session) {
        setSession(response.data.session);
        setError(null);
      } else {
        setError('Session not found');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading session details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsEditModalOpen(true);
  };

  const handleUpdateActivity = async (updatedData: Partial<Activity>) => {
    if (!editingActivity) return;

    try {
      const response = await api.put(
        `/sessions/${sessionId}/activities/${editingActivity.id}`,
        updatedData
      );

      if (response.status === 'success') {
        toast.showToast('Activity updated successfully!', 'success');
        setIsEditModalOpen(false);
        setEditingActivity(null);
        fetchSession(); // Refresh session data
      }
    } catch (error: any) {
      toast.showToast(error.message || 'Failed to update activity', 'error');
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} showBackButton backHref={`/bootcamps/${bootcampId}/sessions`} backLabel="Back to Sessions" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  Day {session.day}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{session.theme}</h1>
              </div>
              <p className="text-lg sm:text-xl text-gray-600 mb-4">
                {session.Bootcamp.title}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {session.startTime} - {session.endTime}
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Facilitator: {session.Bootcamp.Facilitator.User.name}
                </div>
              </div>
            </div>
            {isFacilitatorOrAdmin && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href={`/bootcamps/${bootcampId}/sessions/${sessionId}/edit`}>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Edit Session
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Summary (for facilitators/admins) */}
        {isFacilitatorOrAdmin && session.attendance.length > 0 && (
          <Card title="Attendance Summary" className="mb-6 animate-in fade-in" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{presentCount}</div>
                <div className="text-sm text-gray-600 mt-1">Present</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">{absentCount}</div>
                <div className="text-sm text-gray-600 mt-1">Absent</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{lateCount}</div>
                <div className="text-sm text-gray-600 mt-1">Late</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Attendance Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Time</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {session.attendance.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.Student.User.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">{record.Student.User.email}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
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
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {record.joinTime
                            ? new Date(record.joinTime).toLocaleTimeString()
                            : '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
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
          className="mb-6 animate-in fade-in"
          style={{ animationDelay: '150ms' }}
        >
          {session.activities.length > 0 ? (
            <div className="space-y-6">
              {session.activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="border-l-4 border-primary-500 pl-4 sm:pl-6 pb-6 relative animate-in fade-in"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  {index < session.activities.length - 1 && (
                    <div className="absolute left-[-2px] top-12 bottom-[-24px] w-0.5 bg-gray-200"></div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                          {activity.time}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {activity.type}
                        </span>
                        <h3 className="font-semibold text-base sm:text-lg">{activity.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-3 text-sm sm:text-base">{activity.description}</p>

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
                      <div className="sm:ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditActivity(activity)}
                          className="w-full sm:w-auto"
                          aria-label={`Edit activity: ${activity.title}`}
                        >
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

      {/* Activity Edit Modal */}
      {editingActivity && (
        <ActivityEditModal
          activity={editingActivity}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingActivity(null);
          }}
          onSave={handleUpdateActivity}
        />
      )}
    </div>
  );
}

// Activity Edit Modal Component
interface ActivityEditModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Activity>) => Promise<void>;
}

function ActivityEditModal({ activity, isOpen, onClose, onSave }: ActivityEditModalProps) {
  const [materials, setMaterials] = useState<string[]>(activity.materials || []);
  const [learningObjectives, setLearningObjectives] = useState<string[]>(activity.learningObjectives || []);
  const [studentDeliverables, setStudentDeliverables] = useState<string[]>(activity.studentDeliverables || []);
  const [newMaterial, setNewMaterial] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');

  // Update state when activity changes
  useEffect(() => {
    if (activity) {
      setMaterials(activity.materials || []);
      setLearningObjectives(activity.learningObjectives || []);
      setStudentDeliverables(activity.studentDeliverables || []);
    }
  }, [activity]);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useForm({
    initialValues: {
      time: activity.time,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      facilitatorNotes: activity.facilitatorNotes || '',
    },
    validationRules: {
      time: [validators.required('Time is required')],
      type: [validators.required('Type is required')],
      title: [validators.required('Title is required')],
      description: [validators.required('Description is required')],
    },
    onSubmit: async (formValues) => {
      await onSave({
        ...formValues,
        materials,
        learningObjectives,
        studentDeliverables,
      });
    },
  });

  const addItem = (
    item: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    clearInput: () => void
  ) => {
    if (item.trim()) {
      setter((prev) => [...prev, item.trim()]);
      clearInput();
    }
  };

  const removeItem = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Activity"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Time"
            name="time"
            value={values.time}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.time ? errors.time : undefined}
            placeholder="e.g., 09:00"
            required
          />
          <Input
            label="Type"
            name="type"
            value={values.type}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.type ? errors.type : undefined}
            placeholder="e.g., Lecture, Workshop"
            required
          />
        </div>

        <Input
          label="Title"
          name="title"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.title ? errors.title : undefined}
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.description ? errors.description : undefined}
          rows={4}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Materials
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              placeholder="Add material"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem(newMaterial, setMaterials, () => setNewMaterial(''));
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addItem(newMaterial, setMaterials, () => setNewMaterial(''))}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {materials.map((material, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {material}
                <button
                  type="button"
                  onClick={() => removeItem(idx, setMaterials)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Objectives
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Add objective"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem(newObjective, setLearningObjectives, () => setNewObjective(''));
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addItem(newObjective, setLearningObjectives, () => setNewObjective(''))}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {learningObjectives.map((objective, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {objective}
                <button
                  type="button"
                  onClick={() => removeItem(idx, setLearningObjectives)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Deliverables
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              placeholder="Add deliverable"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem(newDeliverable, setStudentDeliverables, () => setNewDeliverable(''));
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addItem(newDeliverable, setStudentDeliverables, () => setNewDeliverable(''))}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {studentDeliverables.map((deliverable, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                {deliverable}
                <button
                  type="button"
                  onClick={() => removeItem(idx, setStudentDeliverables)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <Textarea
          label="Facilitator Notes (optional)"
          name="facilitatorNotes"
          value={values.facilitatorNotes}
          onChange={handleChange}
          rows={3}
        />
      </div>
    </Modal>
  );
}

