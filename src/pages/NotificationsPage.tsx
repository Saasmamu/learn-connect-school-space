
import React from 'react';
import { Bell, BellRing, Clock, Users, BookOpen, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'assignment':
      return <Users className="h-5 w-5" />;
    case 'grade':
      return <BookOpen className="h-5 w-5" />;
    case 'announcement':
      return <BellRing className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

export const NotificationsPage: React.FC = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: 'Notification deleted successfully' });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      const updates = unreadNotifications.map(n => 
        supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', n.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: 'All notifications marked as read' });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading notifications...</div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              Stay updated with your classes and assignments
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Unread ({unreadNotifications.length})
              </h2>
              <div className="space-y-4">
                {unreadNotifications.map((notification) => (
                  <Card key={notification.id} className="border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type || 'general')}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{notification.title}</h3>
                            <p className="text-gray-700 mt-2">{notification.message}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </div>
                              {notification.type && (
                                <Badge variant="secondary">
                                  {notification.type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Read Notifications */}
          {readNotifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Read ({readNotifications.length})
              </h2>
              <div className="space-y-4">
                {readNotifications.map((notification) => (
                  <Card key={notification.id} className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 opacity-60">
                            {getNotificationIcon(notification.type || 'general')}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg opacity-80">{notification.title}</h3>
                            <p className="text-gray-600 mt-2">{notification.message}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </div>
                              {notification.type && (
                                <Badge variant="outline">
                                  {notification.type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
