
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, Bell, GraduationCap, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationsList } from '@/components/notifications/NotificationsList';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch teacher's assigned classes
  const { data: assignedClasses = [] } = useQuery({
    queryKey: ['teacher-classes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('teacher_classes')
        .select(`
          *,
          classes:class_id (
            id,
            name,
            description,
            grade_level
          )
        `)
        .eq('teacher_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch students count for teacher's classes
  const { data: studentsCount } = useQuery({
    queryKey: ['teacher-students-count', user?.id],
    queryFn: async () => {
      if (!user?.id || assignedClasses.length === 0) return 0;
      
      const classIds = assignedClasses.map(tc => tc.class_id);
      const { count, error } = await supabase
        .from('student_classes')
        .select('id', { count: 'exact' })
        .in('class_id', classIds);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id && assignedClasses.length > 0,
  });

  // Fetch lessons count
  const { data: lessonsCount } = useQuery({
    queryKey: ['teacher-lessons-count', user?.id],
    queryFn: async () => {
      if (!user?.id || assignedClasses.length === 0) return 0;
      
      const classIds = assignedClasses.map(tc => tc.class_id);
      const { count, error } = await supabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .in('class_id', classIds);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id && assignedClasses.length > 0,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">Manage your classes and track student progress</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedClasses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentsCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lessonsCount || 0}</div>
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
              <Button onClick={() => navigate('/teacher/classes')} className="h-20 flex-col">
                <BookOpen className="h-6 w-6 mb-2" />
                My Classes
              </Button>
              <Button onClick={() => navigate('/lessons')} className="h-20 flex-col">
                <GraduationCap className="h-6 w-6 mb-2" />
                Lessons
              </Button>
              <Button onClick={() => navigate('/assignments')} className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Assignments
              </Button>
              <Button onClick={() => navigate('/notifications')} className="h-20 flex-col">
                <Bell className="h-6 w-6 mb-2" />
                Notifications
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Classes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Classes</CardTitle>
              </CardHeader>
              <CardContent>
                {assignedClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Assigned</h3>
                    <p className="text-gray-600">You haven't been assigned to any classes yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedClasses.map((assignment: any) => (
                      <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{assignment.classes.name}</CardTitle>
                          {assignment.classes.grade_level && (
                            <Badge variant="secondary">{assignment.classes.grade_level}</Badge>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {assignment.classes.description && (
                            <p className="text-sm text-gray-600">{assignment.classes.description}</p>
                          )}
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/teacher/classes/${assignment.classes.id}`)}
                            >
                              Manage Class
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/lessons?class=${assignment.classes.id}`)}
                            >
                              View Lessons
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NotificationsList />

            {/* Class Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Class Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignedClasses.slice(0, 3).map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{assignment.classes.name}</p>
                      <p className="text-xs text-gray-600">{assignment.classes.grade_level}</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
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
