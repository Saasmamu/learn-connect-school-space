
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, GraduationCap, BookOpen, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { ClassAssignments } from '@/components/admin/ClassAssignments';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [studentsRes, teachersRes, classesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'teacher'),
        supabase.from('classes').select('id', { count: 'exact' }),
      ]);

      return {
        students: studentsRes.count || 0,
        teachers: teachersRes.count || 0,
        classes: classesRes.count || 0,
      };
    },
  });

  const { data: recentActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_classes')
        .select(`
          id,
          enrolled_at,
          profiles:student_id (full_name),
          classes:class_id (name)
        `)
        .order('enrolled_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your Islamic school system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.students || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.teachers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.classes || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => navigate('/admin/students')} className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Manage Students
              </Button>
              <Button onClick={() => navigate('/admin/teachers')} className="h-20 flex-col">
                <GraduationCap className="h-6 w-6 mb-2" />
                Manage Teachers
              </Button>
              <Button onClick={() => navigate('/admin/courses')} className="h-20 flex-col">
                <BookOpen className="h-6 w-6 mb-2" />
                Manage Classes
              </Button>
              <Button onClick={() => navigate('/notifications')} className="h-20 flex-col">
                <Bell className="h-6 w-6 mb-2" />
                Notifications
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Class Assignments */}
          <div className="lg:col-span-2">
            <ClassAssignments />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NotificationsList />

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities?.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{activity.profiles?.full_name}</p>
                      <p className="text-sm text-gray-600">{activity.classes?.name}</p>
                    </div>
                    <Badge variant="secondary">
                      {new Date(activity.enrolled_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
