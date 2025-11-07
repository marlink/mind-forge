'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PageLoading } from '../components/Loading';
import { EmptyState, ErrorMessage } from '../components/Error';
import { Modal } from '../components/Modal';
import { Select } from '../components/Form';
import { useToast } from '../components/Toast';
import { Navigation } from '../components/Navigation';
import { api } from '../lib/api';

interface KnowledgeStream {
  id: string;
  name: string;
  description: string;
  levels: Array<{ id: string; level: number; title: string; description: string }>;
  _count: { studentStreams: number };
}

interface Student {
  id: string;
  User: { id: string; name: string; email: string };
}

export default function KnowledgeStreamsPage() {
  const toast = useToast();
  const [streams, setStreams] = useState<KnowledgeStream[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<KnowledgeStream | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    fetchStreams();
    fetchUserRole();
  }, []);

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
        } else if (userData.student) {
          setUserRole('STUDENT');
          fetchStudentStreams(userData.student.id);
        }
      }
    } catch (err) {}
  };

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/knowledge-streams');
      if (response.status === 'success') {
        setStreams(response.data.knowledgeStreams || []);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load knowledge streams');
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

  const fetchStudentStreams = async (studentId: string) => {
    try {
      const response = await api.get(`/students/${studentId}/knowledge-streams`);
      if (response.status === 'success') {
        const assignedStreams = response.data.knowledgeStreams || [];
        setStreams((prev) => prev.map((stream) => ({ ...stream, isAssigned: assignedStreams.some((as: any) => as.id === stream.id) })));
      }
    } catch (err) {}
  };

  const handleAssign = async () => {
    if (!selectedStream || !selectedStudent) {
      toast.showToast('Please select both a stream and a student', 'error');
      return;
    }
    try {
      await api.post(`/students/${selectedStudent}/knowledge-streams`, { knowledgeStreamId: selectedStream.id });
      toast.showToast('Knowledge stream assigned successfully', 'success');
      setIsAssignOpen(false);
      setSelectedStream(null);
      setSelectedStudent('');
      fetchStreams();
    } catch (err: any) {
      toast.showToast(err.message || 'Failed to assign knowledge stream', 'error');
    }
  };

  const isFacilitatorOrAdmin = userRole === 'FACILITATOR' || userRole === 'ADMIN';

  if (loading) return <PageLoading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} showBackButton backHref="/dashboard" backLabel="Back to Dashboard" />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Knowledge Streams</h1>
            <p className="text-gray-600 mt-1">Explore learning paths and skill development tracks</p>
          </div>
          <div className="flex items-center space-x-4">
            {isFacilitatorOrAdmin && <Button onClick={() => setIsAssignOpen(true)}>Assign Stream to Student</Button>}
            <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
          </div>
        </div>

        {error ? (
          <ErrorMessage message={error} onRetry={fetchStreams} />
        ) : streams.length === 0 ? (
          <EmptyState title="No knowledge streams" message="Knowledge streams will appear here when available" />
        ) : (
          <div className="grid gap-6">
            {streams.map((stream) => (
              <Card key={stream.id} title={stream.name} headerActions={<span className="text-sm text-gray-600">{stream._count.studentStreams} students assigned</span>}>
                <div className="space-y-4">
                  <p className="text-gray-600">{stream.description}</p>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Levels</h3>
                    <div className="space-y-2">
                      {stream.levels.map((level) => (
                        <div key={level.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start space-x-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">Level {level.level}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold">{level.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal isOpen={isAssignOpen} onClose={() => { setIsAssignOpen(false); setSelectedStream(null); setSelectedStudent(''); }} title="Assign Knowledge Stream to Student" size="lg" footer={<><Button variant="outline" onClick={() => { setIsAssignOpen(false); setSelectedStream(null); setSelectedStudent(''); }}>Cancel</Button><Button onClick={handleAssign} disabled={!selectedStream || !selectedStudent}>Assign</Button></>}>
          <div className="space-y-4">
            <Select label="Knowledge Stream" value={selectedStream?.id || ''} onChange={(e) => { const stream = streams.find((s) => s.id === e.target.value); setSelectedStream(stream || null); }} options={streams.map((stream) => ({ value: stream.id, label: stream.name }))} required />
            <Select label="Student" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} options={students.map((student) => ({ value: student.id, label: `${student.User.name} (${student.User.email})` }))} required />
            {selectedStream && <div className="mt-4 p-4 bg-gray-50 rounded-lg"><h4 className="font-semibold mb-2">{selectedStream.name}</h4><p className="text-sm text-gray-600">{selectedStream.description}</p></div>}
          </div>
        </Modal>
      </div>
    </div>
  );
}
