'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PageLoading, LoadingSkeleton } from '../components/Loading';
import { EmptyState, ErrorMessage } from '../components/Error';
import { Modal } from '../components/Modal';
import { Input, Textarea, Select } from '../components/Form';
import { Navigation } from '../components/Navigation';
import { useToast } from '../components/Toast';
import { api } from '../lib/api';

interface Communication {
  id: string;
  type: 'EMAIL' | 'NOTIFICATION' | 'MESSAGE' | 'ANNOUNCEMENT';
  subject: string;
  content: string;
  status: 'DRAFT' | 'SENT' | 'SCHEDULED';
  Sender: {
    id: string;
    name: string;
    email: string;
  };
  recipients: Array<{
    User: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  readReceipts: Array<{
    userId: string;
    readAt: string;
  }>;
  createdAt: string;
  sentAt?: string;
}

export default function CommunicationsPage() {
  const router = useRouter();
  const toast = useToast();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'sent'>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
    fetchCommunications();
    fetchUnreadCount();
  }, [router, filter]);

  const fetchUser = async () => {
    try {
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

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const url = filter === 'unread'
        ? '/communications?status=SENT'
        : '/communications';
      
      const response = await api.get<{ communications: Communication[] }>(url);
      if (response.status === 'success' && response.data) {
        let comms = response.data.communications || [];
        
        // Filter unread if needed
        if (filter === 'unread' && user) {
          comms = comms.filter((comm: Communication) => 
            !comm.readReceipts.some(r => r.userId === user.id)
          );
        }
        
        setCommunications(comms);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load communications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get<{ unreadCount: number }>('/communications/unread');
      if (response.status === 'success' && response.data) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      // Silently fail for unread count
    }
  };

  const markAsRead = async (commId: string) => {
    try {
      await api.post(`/communications/${commId}/read`);
      toast.showToast('Marked as read', 'success');
      fetchCommunications();
      fetchUnreadCount();
    } catch (err: any) {
      toast.showToast(err.message || 'Failed to mark as read', 'error');
    }
  };

  const handleCompose = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      // Get recipient IDs from form (simplified - would need user search in real app)
      const recipientIds = formData.get('recipientIds')?.toString().split(',').filter(Boolean) || [];

      await api.post('/communications', {
        type: formData.get('type'),
        recipientIds,
        subject: formData.get('subject'),
        content: formData.get('content'),
        status: formData.get('status') || 'SENT',
      });
      
      toast.showToast('Message sent successfully', 'success');
      setIsComposeOpen(false);
      fetchCommunications();
    } catch (err: any) {
      toast.showToast(err.message || 'Failed to send message', 'error');
    }
  };

  const isUnread = (comm: Communication) => {
    if (!user) return false;
    return !comm.readReceipts.some(r => r.userId === user.id);
  };

  if (loading && !communications.length) return <PageLoading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} showBackButton backHref="/dashboard" backLabel="Back to Dashboard" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 animate-in fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Communications</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your messages and notifications</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium self-start sm:self-auto">
                {unreadCount} unread
              </span>
            )}
            <Button 
              onClick={() => setIsComposeOpen(true)}
              className="w-full sm:w-auto"
              aria-label="Compose new message"
            >
              Compose
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2 animate-in fade-in" style={{ animationDelay: '100ms' }}>
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            aria-label="Show all communications"
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            aria-label={`Show ${unreadCount} unread communications`}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === 'sent' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('sent')}
            aria-label="Show sent communications"
          >
            Sent
          </Button>
        </div>

        {/* Communications List */}
        {error ? (
          <ErrorMessage message={error} onRetry={fetchCommunications} />
        ) : communications.length === 0 ? (
          <EmptyState
            title="No communications"
            message={
              filter === 'unread'
                ? 'You have no unread messages.'
                : 'You have no communications yet.'
            }
            action={
              <Button onClick={() => setIsComposeOpen(true)}>Compose Message</Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {communications.map((comm, index) => (
              <Card
                key={comm.id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 animate-in fade-in ${
                  isUnread(comm) ? 'border-l-4 border-primary-500' : ''
                }`}
                style={{ animationDelay: `${150 + index * 50}ms` }}
                onClick={() => {
                  setSelectedComm(comm);
                  setIsModalOpen(true);
                  if (isUnread(comm)) {
                    markAsRead(comm.id);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedComm(comm);
                    setIsModalOpen(true);
                    if (isUnread(comm)) {
                      markAsRead(comm.id);
                    }
                  }
                }}
                aria-label={`View communication: ${comm.subject}`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {isUnread(comm) && (
                        <span className="h-2 w-2 bg-primary-500 rounded-full" aria-label="Unread"></span>
                      )}
                      <h3 className="font-semibold text-sm sm:text-base">{comm.subject}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        comm.type === 'EMAIL'
                          ? 'bg-blue-100 text-blue-800'
                          : comm.type === 'NOTIFICATION'
                          ? 'bg-green-100 text-green-800'
                          : comm.type === 'MESSAGE'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {comm.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      From: {comm.Sender.name} ({comm.Sender.email})
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {comm.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(comm.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* View Communication Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedComm?.subject}
          size="lg"
        >
          {selectedComm && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">From:</span> {selectedComm.Sender.name} (
                  {selectedComm.Sender.email})
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">To:</span>{' '}
                  {selectedComm.recipients.map((r) => r.User.name).join(', ')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(selectedComm.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedComm.content}</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Compose Modal */}
        <Modal
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          title="Compose Message"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="compose-form">
                Send
              </Button>
            </>
          }
        >
          <form id="compose-form" onSubmit={handleCompose} className="space-y-4">
            <Select
              label="Type"
              name="type"
              required
              options={[
                { value: 'EMAIL', label: 'Email' },
                { value: 'MESSAGE', label: 'Message' },
                { value: 'NOTIFICATION', label: 'Notification' },
                { value: 'ANNOUNCEMENT', label: 'Announcement' },
              ]}
            />
            <Input
              label="Recipient IDs (comma-separated)"
              name="recipientIds"
              placeholder="user-id-1, user-id-2"
              required
              helperText="Enter user IDs separated by commas"
            />
            <Input label="Subject" name="subject" required />
            <Textarea
              label="Message"
              name="content"
              rows={6}
              required
            />
            <Select
              label="Status"
              name="status"
              options={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SENT', label: 'Send Now' },
              ]}
            />
          </form>
        </Modal>
      </div>
    </div>
  );
}

