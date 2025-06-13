
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Clock, Users, Bell, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationsList } from '@/components/notifications/NotificationsList';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch student's enrolled classes
  const { data: enrolledClasses = [] } = useQuery({
    queryKey: ['student-classes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('student_classes')
        .select(`
          *,
          classes:class_id (
            id,
            name,
            description,
            grade_level
          )
        `)
        .eq('student_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch student progress
  const { data: progress = [] } = useQuery({
    queryKey: ['student-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          *,
          lessons:lesson_id (title, class_id),
          classes:class_id (name)
        `)
        .eq('student_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate overall progress
  const getOverallProgress = () => {
    if (progress.length === 0) return 0;
    const completedLessons = progress.filter(p => p.is_completed).length;
    return Math.round((completedLessons / progress.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolledClasses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progress.filter(p => p.is_completed).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getOverallProgress()}%</div>
              <Progress value={getOverallProgress()} className="mt-2" />
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
              <Button onClick={() => navigate('/student/classes')} className="h-20 flex-col">
                <BookOpen className="h-6 w-6 mb-2" />
                My Classes
              </Button>
              <Button onClick={() => navigate('/assignments')} className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Assignments
              </Button>
              <Button onClick={() => navigate('/gradebook')} className="h-20 flex-col">
                <GraduationCap className="h-6 w-6 mb-2" />
                Grades
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
                {enrolledClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Yet</h3>
                    <p className="text-gray-600">You haven't been enrolled in any classes yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enrolledClasses.map((enrollment: any) => (
                      <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{enrollment.classes.name}</CardTitle>
                          {enrollment.classes.grade_level && (
                            <p className="text-sm text-gray-600">{enrollment.classes.grade_level}</p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <Button 
                            className="w-full"
                            onClick={() => navigate(`/student/classes/${enrollment.classes.id}/lessons`)}
                          >
                            View Lessons
                          </Button>
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

            {/* Recent Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {progress.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.lessons?.title}</p>
                      <p className="text-xs text-gray-600">{item.classes?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {item.completion_percentage}%
                      </p>
                      <Progress value={item.completion_percentage} className="w-16 h-2" />
                    </div>
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
