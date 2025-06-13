
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Users, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentClassesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: enrolledClasses = [], isLoading } = useQuery({
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
            grade_level,
            lessons:lessons (count)
          )
        `)
        .eq('student_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading your classes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-600 mt-2">View your enrolled classes and access lessons</p>
      </div>

      {enrolledClasses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Yet</h3>
            <p className="text-gray-600">You haven't been enrolled in any classes yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledClasses.map((enrollment: any) => (
            <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {enrollment.classes.name}
                </CardTitle>
                {enrollment.classes.grade_level && (
                  <Badge variant="secondary">{enrollment.classes.grade_level}</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollment.classes.description && (
                  <p className="text-gray-600 text-sm">{enrollment.classes.description}</p>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>Enrolled since {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <GraduationCap className="h-4 w-4" />
                  <span>{enrollment.classes.lessons?.[0]?.count || 0} lessons</span>
                </div>

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
    </div>
  );
};
