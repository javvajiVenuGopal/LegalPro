import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { Notification } from '../../types';

// Mock data - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'message',
    title: 'New message from Sarah Johnson',
    content: "I've reviewed your documents and have some questions...",
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    relatedId: 'msg_1',
  },
  {
    id: '2',
    userId: '1',
    type: 'appointment',
    title: 'Upcoming Appointment',
    content: 'Reminder: You have a meeting tomorrow at 10:00 AM',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relatedId: 'apt_1',
  },
  {
    id: '3',
    userId: '1',
    type: 'document',
    title: 'New Document Shared',
    content: 'A new document has been shared with you: "Settlement Agreement"',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    relatedId: 'doc_1',
  },
  {
    id: '4',
    userId: '1',
    type: 'case',
    title: 'Case Status Updated',
    content: 'Your case status has been updated to "In Review"',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    relatedId: 'case_1',
  },
  {
    id: '5',
    userId: '1',
    type: 'invoice',
    title: 'Invoice Due Soon',
    content: 'Invoice #1234 is due in 3 days',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    relatedId: 'inv_1',
  },
];

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true
    })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification =>
    filter === 'all' || !notification.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'appointment':
        return '📅';
      case 'document':
        return '📄';
      case 'case':
        return '⚖️';
      case 'invoice':
        return '💰';
      default:
        return '🔔';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with your latest activities</p>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
          >
            <option value="all">All Notifications</option>
                        <option value="unread">Unread Only</option>
          </select>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center text-gray-500">No notifications to show.</div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card key={notification.id} className="border border-gray-200 shadow-sm">
              <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                  <CardTitle className="text-base font-semibold">
                    {notification.title}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <Badge 
                    variant="error">Unread</Badge>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">
                <p className="mb-2">{notification.content}</p>
                <div className="text-xs text-gray-500">
                  {formatDate(notification.createdAt)}
                </div>
                {!notification.isRead && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

};
