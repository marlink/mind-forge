'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { PageLoading } from '../../../components/Loading';
import { EmptyState, ErrorMessage } from '../../../components/Error';
import { Modal } from '../../../components/Modal';
import { Input, Textarea } from '../../../components/Form';
import { useToast } from '../../../components/Toast';
import { Navigation } from '../../../components/Navigation';
import { api } from '../../../lib/api';

interface Discussion {
  id: string;
  day: number;
  title: string;
  prompt: string;
  guidance: string;
  expectedOutcomes: string[];
  tags: string[];
  Bootcamp: { id: string; title: string };
}

interface Bootcamp {
  id: string;
  title: string;
}

export default function DiscussionsPage() {
  const params = useParams();
  const toast = useToast();
  const bootcampId = params?.id as string;
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [dayFilter, setDayFilter] = useState('');

  const [formValues, setFormValues] = useState({
    day: '', title: '', prompt: '', guidance: '',
    expectedOutcomes: '', tags: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formValues.day) errors.day = 'Day is required';
    else {
      const dayNum = parseInt(formValues.day, 10);
      if (isNaN(dayNum) || dayNum < 1) errors.day = 'Day must be a positive number';
    }
    if (!formValues.title) errors.title = 'Title is required';
    if (!formValues.prompt) errors.prompt = 'Prompt is required';
    if (!formValues.guidance) errors.guidance = 'Guidance is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormValues({ day: '', title: '', prompt: '', guidance: '', expectedOutcomes: '', tags: '' });
    setFormErrors({});
  };

  useEffect(() => {
    if (bootcampId) {
      fetchBootcamp();
      fetchDiscussions();
      fetchUserRole();
    }
  }, [bootcampId, dayFilter]);

  const fetchUserRole = async () => {
    try {
      const response = await api.get<{ user: { id: string; name: string; email: string; admin?: any; facilitator?: any } }>('/users/me');
      if (response.status === 'success' && response.data?.user) {
        const userData = response.data.user;
        setUser({ id: userData.id, name: userData.name, email: userData.email });
        if (userData.admin) setUserRole('ADMIN');
        else if (userData.facilitator) setUserRole('FACILITATOR');
      }
    } catch (err) {
      // Silently fail - user role is optional for this page
    }
  };

  const fetchBootcamp = async () => {
    try {
      const response = await api.get<{ bootcamp: Bootcamp }>(`/bootcamps/${bootcampId}`);
      if (response.status === 'success' && response.data?.bootcamp) {
        setBootcamp(response.data.bootcamp);
      }
    } catch (err) {
      setError('Failed to load bootcamp');
    }
  };

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const url = dayFilter
        ? `/bootcamps/${bootcampId}/discussions?day=${dayFilter}`
        : `/bootcamps/${bootcampId}/discussions`;
      const response = await api.get<{ discussions: Discussion[] }>(url);
      if (response.status === 'success' && response.data) {
        setDiscussions(response.data.discussions || []);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      const expectedOutcomes = formValues.expectedOutcomes.split('\n').filter((l: string) => l.trim());
      const tags = formValues.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      await api.post(`/bootcamps/${bootcampId}/discussions`, {
        day: parseInt(formValues.day, 10),
        title: formValues.title,
        prompt: formValues.prompt,
        guidance: formValues.guidance,
        expectedOutcomes,
        tags,
      });
      toast.showToast('Discussion topic created successfully', 'success');
      setIsCreateOpen(false);
      resetForm();
      fetchDiscussions();
    } catch (err: any) {
      toast.showToast(err.message || 'Failed to create discussion topic', 'error');
    }
  };

  const handleEdit = (discussion: Discussion) => {
    setEditingDiscussion(discussion);
    setFormValues({
      day: discussion.day.toString(),
      title: discussion.title,
      prompt: discussion.prompt,
      guidance: discussion.guidance,
      expectedOutcomes: discussion.expectedOutcomes.join('\n'),
      tags: discussion.tags.join(', '),
    });
    setIsCreateOpen(true);
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingDiscussion) return;
    try {
      const expectedOutcomes = formValues.expectedOutcomes.split('\n').filter((l: string) => l.trim());
      const tags = formValues.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      await api.put(`/discussions/${editingDiscussion.id}`, {
        day: parseInt(formValues.day, 10),
        title: formValues.title,
        prompt: formValues.prompt,
        guidance: formValues.guidance,
        expectedOutcomes,
        tags,
      });
      toast.showToast('Discussion topic updated successfully', 'success');
      setIsCreateOpen(false);
      setEditingDiscussion(null);
      resetForm();
      fetchDiscussions();
    } catch (err: any) {
      toast.showToast(err.message || 'Failed to update discussion topic', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discussion topic?')) return;
    try {
      await api.delete(`/discussions/${id}`);
      toast.showToast('Discussion topic deleted successfully', 'success');
      fetchDiscussions();
    } catch (err: any) {
      toast.showToast(err.message || 'Failed to delete discussion topic', 'error');
    }
  };

  const isFacilitatorOrAdmin = userRole === 'FACILITATOR' || userRole === 'ADMIN';

  if (loading && !discussions.length) return <PageLoading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50/30">
      <Navigation user={user} showBackButton backHref={`/bootcamps/${bootcampId}`} backLabel="Back to Bootcamp" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-10 animate-in fade-in slide-in-from-top">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-2">Discussion Topics</h1>
            {bootcamp && (
              <p className="text-dark-600 mt-2 text-base sm:text-lg font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                {bootcamp.title}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {isFacilitatorOrAdmin && (
              <Button 
                onClick={() => { setEditingDiscussion(null); resetForm(); setIsCreateOpen(true); }}
                className="w-full sm:w-auto"
                aria-label="Create new discussion topic"
              >
                Create Discussion Topic
              </Button>
            )}
            <Link href={`/bootcamps/${bootcampId}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">Back to Bootcamp</Button>
            </Link>
          </div>
        </div>

        <div className="mb-8 animate-in fade-in slide-in-from-left" style={{ animationDelay: '100ms' }}>
            <Input 
              label="Filter by Day" 
              type="number" 
              value={dayFilter} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDayFilter(e.target.value)} 
              placeholder="Enter day number" 
              className="max-w-xs w-full" 
              aria-label="Filter discussions by day number"
            />
        </div>

        {error ? (
          <ErrorMessage message={error} onRetry={fetchDiscussions} />
        ) : discussions.length === 0 ? (
          <EmptyState title="No discussion topics" message={isFacilitatorOrAdmin ? 'Create your first discussion topic to engage students' : 'No discussion topics available yet'} action={isFacilitatorOrAdmin ? <Button onClick={() => setIsCreateOpen(true)}>Create Discussion Topic</Button> : undefined} />
        ) : (
          <div className="grid gap-6 sm:gap-8">
            {discussions.map((discussion, index) => (
              <Card 
                key={discussion.id} 
                title={
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-primary-500/30">
                      Day {discussion.day}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-dark-800">{discussion.title}</span>
                  </div>
                } 
                headerActions={
                  isFacilitatorOrAdmin && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(discussion)}
                        aria-label={`Edit discussion topic: ${discussion.title}`}
                        className="w-full sm:w-auto"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(discussion.id)}
                        aria-label={`Delete discussion topic: ${discussion.title}`}
                        className="w-full sm:w-auto"
                      >
                        Delete
                      </Button>
                    </div>
                  )
                }
                className="animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50/50 to-primary-100/30 border border-primary-200/50">
                    <h3 className="font-bold text-primary-700 mb-3 text-sm sm:text-base flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Prompt
                    </h3>
                    <p className="text-dark-700 text-sm sm:text-base leading-relaxed font-medium">{discussion.prompt}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-accent-50/50 to-accent-100/30 border border-accent-200/50">
                    <h3 className="font-bold text-accent-700 mb-3 text-sm sm:text-base flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Guidance
                    </h3>
                    <p className="text-dark-700 text-sm sm:text-base leading-relaxed font-medium">{discussion.guidance}</p>
                  </div>
                  {discussion.expectedOutcomes.length > 0 && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-dark-50/50 to-dark-100/30 border border-dark-200/50">
                      <h3 className="font-bold text-dark-700 mb-3 text-sm sm:text-base flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Expected Outcomes
                      </h3>
                      <ul className="space-y-2 text-dark-700 text-sm sm:text-base">
                        {discussion.expectedOutcomes.map((outcome, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary-500 mt-1.5 flex-shrink-0">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="font-medium">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {discussion.tags.length > 0 && (
                    <div>
                      <h3 className="font-bold text-dark-700 mb-3 text-sm sm:text-base flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {discussion.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="px-3 py-1.5 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 rounded-lg text-xs sm:text-sm font-semibold border border-primary-300/50 shadow-sm hover:shadow-md transition-all-premium hover:scale-105"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); setEditingDiscussion(null); resetForm(); }} title={editingDiscussion ? 'Edit Discussion Topic' : 'Create Discussion Topic'} size="lg" footer={<><Button variant="outline" onClick={() => { setIsCreateOpen(false); setEditingDiscussion(null); resetForm(); }}>Cancel</Button><Button onClick={editingDiscussion ? handleUpdate : handleCreate}>{editingDiscussion ? 'Update' : 'Create'}</Button></>}>
          <form className="space-y-4">
            <Input label="Day" type="number" value={formValues.day} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues({ ...formValues, day: e.target.value })} error={formErrors.day} required />
            <Input label="Title" value={formValues.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues({ ...formValues, title: e.target.value })} error={formErrors.title} required />
            <Textarea label="Prompt" value={formValues.prompt} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormValues({ ...formValues, prompt: e.target.value })} error={formErrors.prompt} rows={4} required />
            <Textarea label="Guidance" value={formValues.guidance} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormValues({ ...formValues, guidance: e.target.value })} error={formErrors.guidance} rows={4} required />
            <Textarea label="Expected Outcomes (one per line)" value={formValues.expectedOutcomes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormValues({ ...formValues, expectedOutcomes: e.target.value })} rows={4} helperText="Enter each expected outcome on a new line" />
            <Input label="Tags (comma-separated)" value={formValues.tags} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues({ ...formValues, tags: e.target.value })} helperText="Enter tags separated by commas" />
          </form>
        </Modal>
      </div>
    </div>
  );
}
