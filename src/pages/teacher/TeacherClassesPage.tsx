
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, GraduationCap, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherClassesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: assignedClasses = [], isLoading } = useQuery({
    queryKey: ['teacher-classes-detailed', user?.id],
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
            grade_level,
            created_at,
            student_classes (count),
            lessons (count)
          )
        `)
        .eq('teacher_id', user.id);

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
        <p className="text-gray-600 mt-2">Manage your assigned classes and track student progress</p>
      </div>

      {assignedClasses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Assigned</h3>
            <p className="text-gray-600">You haven't been assigned to any classes yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedClasses.map((assignment: any) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {assignment.classes.name}
                </CardTitle>
                {assignment.classes.grade_level && (
                  <Badge variant="secondary">{assignment.classes.grade_level}</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {assignment.classes.description && (
                  <p className="text-gray-600 text-sm">{assignment.classes.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{assignment.classes.student_classes?.[0]?.count || 0} students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <GraduationCap className="h-4 w-4" />
                    <span>{assignment.classes.lessons?.[0]?.count || 0} lessons</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/lessons?class=${assignment.classes.id}`)}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Manage Lessons
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/assignments?class=${assignment.classes.id}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Assignments
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Assigned on {new Date(assignment.assigned_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
