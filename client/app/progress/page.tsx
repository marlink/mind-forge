'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PageLoading } from '../components/Loading';
import { EmptyState, ErrorMessage } from '../components/Error';
import { Modal } from '../components/Modal';
import { Input, Textarea, Select } from '../components/Form';
import { useToast } from '../components/Toast';
import { Navigation } from '../components/Navigation';
import { ProgressChart } from '../components/ProgressChart';
import { api } from '../lib/api';

interface ProgressRecord {
  id: string;
  skill: string;
  level: string;
  assessmentDate: string;
  evidence: string;
  nextSteps: string;
  Facilitator: { User: { name: string; email: string } };
  Bootcamp?: { id: string; title: string };
  Session?: { id: string; day: number; theme: string };
}

interface Student {
  id: string;
  User: { id: string; name: string; email: string };
}

interface Bootcamp {
  id: string;
  title: string;
}

interface Session {
  id: string;
  day: number;
  theme: string;
}

export default function ProgressPage() {
  const toast = useToast();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedBootcamp, setSelectedBootcamp] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState('');
  const [bootcampFilter, setBootcampFilter] = useState('');

  const [formValues, setFormValues] = useState({
    studentId: '', bootcampId: '', sessionId: '', skill: '', level: '',
    assessmentDate: '', evidence: '', nextSteps: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formValues.studentId) errors.studentId = 'Student is required';
    if (!formValues.skill) errors.skill = 'Skill is required';
    if (!formValues.level) errors.level = 'Level is required';
    if (!formValues.assessmentDate) errors.assessmentDate = 'Assessment date is required';
    if (!formValues.evidence) errors.evidence = 'Evidence is required';
    if (!formValues.nextSteps) errors.nextSteps = 'Next steps are required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormValues({ studentId: '', bootcampId: '', sessionId: '', skill: '', level: '', assessmentDate: '', evidence: '', nextSteps: '' });
    setFormErrors({});
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (currentStudentId) {
      fetchProgress();
    }
  }, [currentStudentId, skillFilter, bootcampFilter]);

  const fetchUserRole = async () => {
    try {
      const response = await api.get('/users/me');
      if (response.status === 'success') {
        const userData = response.data.user;
        setUser({ id: userData.id, name: userData.name, email: userData.email });
        if (userData.admin) {
          setUserRole('ADMIN');
          fetchStudents();
        } else if (userData.facilitator) {
          setUserRole('FACILITATOR');
          fetchStudents();
          fetchBootcamps();
        } else if (userData.student) {
          setUserRole('STUDENT');
          setCurrentStudentId(userData.student.id);
        }
      }
    } catch (err) {}
  };

  const fetchProgress = async () => {
    if (!currentStudentId) return;
    try {
      setLoading(true);
      let url = `/students/${currentStudentId}/progress`;
      const params = new URLSearchParams();
      if (skillFilter) params.append('skill', skillFilter);
      if (bootcampFilter) params.append('bootcampId', bootcampFilter);
      if (params.toString()) url += `?${params.toString()}`;
      const response = await api.get(url);
      if (response.status === 'success') {
        setProgress(response.data.progress || []);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users');
      if (response.status === 'success') {
        const users = response.data.users || [];
        const studentUsers = users.filter((u: any) => u.student).map((u: any) => ({
          id: u.student.id,
          User: { id: u.id, name: u.name, email: u.email },
        }));
        setStudents(studentUsers);
      }
    } catch (err) {}
  };

  const fetchBootcamps = async () => {
    try {
      const response = await api.get('/bootcamps');
      if (response.status === 'success') {
        setBootcamps(response.data.bootcamps || []);
      }
    } catch (err) {}
  };

  const fetchSessions = async (bootcampId: string) => {
    try {
      const response = await api.get(`/bootcamps/${bootcampId}/sessions`);
      if (response.status === 'success') {
        setSessions(response.data.sessions || []);
      }
    } catch (err) {}
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      await api.post('/progress', {
        studentId: formValues.studentId,
        bootcampId: formValues.bootcampId || undefined,
        sessionId: formValues.sessionId || undefined,
        skill: formValues.skill,
        level: formValues.level,
        assessmentDate: new Date(formValues.assessmentDate).toISOString(),
        evidence: formValues.evidence,
        nextSteps: formValues.nextSteps,
      });
      toast.showToast('Progress record created successfully', 'success');
      setIsCreateOpen(false);
      resetForm();
      if (formValues.studentId === currentStudentId) {
        fetchProgress();
      }
    } catch (err: any) {
      toast.showToast(err.message || 'Failed to create progress record', 'error');
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setCurrentStudentId(studentId);
    setSelectedStudent(studentId);
  };

  const isFacilitatorOrAdmin = userRole === 'FACILITATOR' || userRole === 'ADMIN';

  if (loading && !progress.length) return <PageLoading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} showBackButton backHref="/dashboard" backLabel="Back to Dashboard" />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Progress Tracking</h1>
            <p className="text-gray-600 mt-1">Monitor and record student skill development</p>
          </div>
          <div className="flex items-center space-x-4">
            {isFacilitatorOrAdmin && <Button onClick={() => setIsCreateOpen(true)}>Create Progress Record</Button>}
            <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
          </div>
        </div>

        {isFacilitatorOrAdmin && (
          <Card className="mb-6">
            <Select label="Select Student" value={selectedStudent} onChange={(e) => handleStudentSelect(e.target.value)} options={[{ value: '', label: 'Select a student...' }, ...students.map((student) => ({ value: student.id, label: `${student.User.name} (${student.User.email})` }))]} />
          </Card>
        )}

        {currentStudentId && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Filter by Skill" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} placeholder="Enter skill name" />
            {isFacilitatorOrAdmin && <Select label="Filter by Bootcamp" value={bootcampFilter} onChange={(e) => setBootcampFilter(e.target.value)} options={[{ value: '', label: 'All bootcamps' }, ...bootcamps.map((bootcamp) => ({ value: bootcamp.id, label: bootcamp.title }))]} />}
          </div>
        )}

        {currentStudentId && progress.length > 0 && (
          <div className="mb-6">
            <Card title="Progress Overview">
              <ProgressChart progress={progress} />
            </Card>
          </div>
        )}

        {!currentStudentId ? (
          <EmptyState title="Select a student" message={isFacilitatorOrAdmin ? 'Select a student from the dropdown above to view their progress' : 'No progress data available'} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchProgress} />
        ) : progress.length === 0 ? (
          <EmptyState title="No progress records" message="Progress records will appear here once created" action={isFacilitatorOrAdmin ? <Button onClick={() => setIsCreateOpen(true)}>Create Progress Record</Button> : undefined} />
        ) : (
          <div className="grid gap-6">
            {progress.map((record) => (
              <Card key={record.id} title={`${record.skill} - Level ${record.level}`} headerActions={<span className="text-sm text-gray-600">{new Date(record.assessmentDate).toLocaleDateString()}</span>}>
                <div className="space-y-4">
                  <div><h3 className="font-semibold text-gray-700 mb-2">Evidence</h3><p className="text-gray-600">{record.evidence}</p></div>
                  <div><h3 className="font-semibold text-gray-700 mb-2">Next Steps</h3><p className="text-gray-600">{record.nextSteps}</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    {record.Bootcamp && <div><span className="text-sm font-medium text-gray-700">Bootcamp:</span><p className="text-gray-600">{record.Bootcamp.title}</p></div>}
                    {record.Session && <div><span className="text-sm font-medium text-gray-700">Session:</span><p className="text-gray-600">Day {record.Session.day} - {record.Session.theme}</p></div>}
                    <div><span className="text-sm font-medium text-gray-700">Assessed by:</span><p className="text-gray-600">{record.Facilitator.User.name}</p></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); resetForm(); setSessions([]); }} title="Create Progress Record" size="lg" footer={<><Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); setSessions([]); }}>Cancel</Button><Button onClick={handleCreate}>Create</Button></>}>
          <form className="space-y-4">
            <Select label="Student" value={formValues.studentId} onChange={(e) => { setFormValues({ ...formValues, studentId: e.target.value }); setSelectedStudent(e.target.value); }} error={formErrors.studentId} options={[{ value: '', label: 'Select a student...' }, ...students.map((student) => ({ value: student.id, label: `${student.User.name} (${student.User.email})` }))]} required />
            <Select label="Bootcamp (Optional)" value={formValues.bootcampId} onChange={(e) => { setFormValues({ ...formValues, bootcampId: e.target.value }); if (e.target.value) { fetchSessions(e.target.value); } else { setSessions([]); setFormValues({ ...formValues, sessionId: '' }); } }} options={[{ value: '', label: 'None' }, ...bootcamps.map((bootcamp) => ({ value: bootcamp.id, label: bootcamp.title }))]} />
            {formValues.bootcampId && <Select label="Session (Optional)" value={formValues.sessionId} onChange={(e) => setFormValues({ ...formValues, sessionId: e.target.value })} options={[{ value: '', label: 'None' }, ...sessions.map((session) => ({ value: session.id, label: `Day ${session.day} - ${session.theme}` }))]} />}
            <Input label="Skill" value={formValues.skill} onChange={(e) => setFormValues({ ...formValues, skill: e.target.value })} error={formErrors.skill} required />
            <Select label="Level" value={formValues.level} onChange={(e) => setFormValues({ ...formValues, level: e.target.value })} error={formErrors.level} options={[{ value: '', label: 'Select level...' }, { value: 'BEGINNER', label: 'Beginner' }, { value: 'DEVELOPING', label: 'Developing' }, { value: 'PROFICIENT', label: 'Proficient' }, { value: 'ADVANCED', label: 'Advanced' }, { value: 'EXPERT', label: 'Expert' }]} required />
            <Input label="Assessment Date" type="datetime-local" value={formValues.assessmentDate} onChange={(e) => setFormValues({ ...formValues, assessmentDate: e.target.value })} error={formErrors.assessmentDate} required />
            <Textarea label="Evidence" value={formValues.evidence} onChange={(e) => setFormValues({ ...formValues, evidence: e.target.value })} error={formErrors.evidence} rows={4} required />
            <Textarea label="Next Steps" value={formValues.nextSteps} onChange={(e) => setFormValues({ ...formValues, nextSteps: e.target.value })} error={formErrors.nextSteps} rows={4} required />
          </form>
        </Modal>
      </div>
    </div>
  );
}
