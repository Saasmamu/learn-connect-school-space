
import React from 'react';
import { Bell, BellRing, Clock, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'assignment':
      return <Users className="h-4 w-4" />;
    case 'grade':
      return <BookOpen className="h-4 w-4" />;
    case 'announcement':
      return <BellRing className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export const NotificationsList: React.FC = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type || 'general')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      {notification.type && (
                        <Badge variant="secondary" className="text-xs">
                          {notification.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
