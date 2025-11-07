'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner, LoadingSkeleton } from '../components/Loading';
import { EmptyState, ErrorMessage } from '../components/Error';
import { Modal } from '../components/Modal';
import { Input, Textarea, Select } from '../components/Form';
import { useToast } from '../components/Toast';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchCommunications();
    fetchUnreadCount();
  }, [router, filter]);

  const fetchCommunications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = filter === 'unread'
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/communications?status=SENT`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/communications`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          let comms = data.data.communications || [];
          
          // Filter unread if needed
          if (filter === 'unread') {
            const userId = localStorage.getItem('userId');
            comms = comms.filter((comm: Communication) => 
              !comm.readReceipts.some(r => r.userId === userId)
            );
          }
          
          setCommunications(comms);
          setError(null);
        }
      }
    } catch (err) {
      setError('Failed to load communications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/communications/unread`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setUnreadCount(data.data.unreadCount || 0);
        }
      }
    } catch (err) {
      // Silently fail for unread count
    }
  };

  const markAsRead = async (commId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/communications/${commId}/read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.showToast('Marked as read', 'success');
        fetchCommunications();
        fetchUnreadCount();
      }
    } catch (err) {
      toast.showToast('Failed to mark as read', 'error');
    }
  };

  const handleCompose = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get recipient IDs from form (simplified - would need user search in real app)
      const recipientIds = formData.get('recipientIds')?.toString().split(',').filter(Boolean) || [];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/communications`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: formData.get('type'),
            recipientIds,
            subject: formData.get('subject'),
            content: formData.get('content'),
            status: formData.get('status') || 'SENT',
          }),
        }
      );

      if (response.ok) {
        toast.showToast('Message sent successfully', 'success');
        setIsComposeOpen(false);
        fetchCommunications();
      } else {
        toast.showToast('Failed to send message', 'error');
      }
    } catch (err) {
      toast.showToast('Failed to send message', 'error');
    }
  };

  const isUnread = (comm: Communication) => {
    const userId = localStorage.getItem('userId');
    return !comm.readReceipts.some(r => r.userId === userId);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Communications</h1>
            <p className="text-gray-600 mt-1">Manage your messages and notifications</p>
          </div>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {unreadCount} unread
              </span>
            )}
            <Button onClick={() => setIsComposeOpen(true)}>Compose</Button>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex space-x-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === 'sent' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('sent')}
          >
            Sent
          </Button>
        </div>

        {/* Communications List */}
        {loading ? (
          <Card>
            <LoadingSkeleton lines={5} />
          </Card>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCommunications} />
        ) : communications.length > 0 ? (
          <div className="space-y-4">
            {communications.map((comm) => (
              <Card
                key={comm.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  isUnread(comm) ? 'border-l-4 border-primary-500' : ''
                }`}
                onClick={() => {
                  setSelectedComm(comm);
                  setIsModalOpen(true);
                  if (isUnread(comm)) {
                    markAsRead(comm.id);
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {isUnread(comm) && (
                        <span className="h-2 w-2 bg-primary-500 rounded-full"></span>
                      )}
                      <h3 className="font-semibold">{comm.subject}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
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
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
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
        ) : (
          <Card>
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
          </Card>
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

