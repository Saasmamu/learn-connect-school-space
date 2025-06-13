
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentLessonsPage: React.FC = () => {
  const { classId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const { data: classData } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('class_id', classId)
        .eq('is_published', true)
        .order('lesson_order');
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['student-progress', user?.id, classId],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('class_id', classId);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!classId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, completed }: { lessonId: string; completed: boolean }) => {
      if (!user?.id) return;

      const existingProgress = progress.find(p => p.lesson_id === lessonId);
      
      if (existingProgress) {
        const { error } = await supabase
          .from('student_progress')
          .update({
            is_completed: completed,
            completion_percentage: completed ? 100 : 0,
            last_accessed: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('student_progress')
          .insert({
            student_id: user.id,
            class_id: classId,
            lesson_id: lessonId,
            is_completed: completed,
            completion_percentage: completed ? 100 : 0,
            last_accessed: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
    },
  });

  const getLessonProgress = (lessonId: string) => {
    return progress.find(p => p.lesson_id === lessonId);
  };

  const getOverallProgress = () => {
    if (lessons.length === 0) return 0;
    const completedLessons = lessons.filter(lesson => 
      getLessonProgress(lesson.id)?.is_completed
    ).length;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/student/classes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          {classData?.name} - Lessons
        </h1>
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Overall Progress:</span>
            <Progress value={getOverallProgress()} className="flex-1 max-w-md" />
            <span className="text-sm font-medium">{getOverallProgress()}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Lessons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lessons.map((lesson, index) => {
                const lessonProgress = getLessonProgress(lesson.id);
                const isCompleted = lessonProgress?.is_completed;
                
                return (
                  <div
                    key={lesson.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedLesson?.id === lesson.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {index + 1}. {lesson.title}
                        </span>
                        {isCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {lesson.duration_minutes && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {lesson.duration_minutes}m
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Lesson Content */}
        <div className="lg:col-span-2">
          {selectedLesson ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedLesson.title}</CardTitle>
                  {getLessonProgress(selectedLesson.id)?.is_completed && (
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedLesson.description && (
                  <p className="text-gray-600">{selectedLesson.description}</p>
                )}

                {selectedLesson.video_url && (
                  <div className="aspect-video">
                    <iframe
                      src={selectedLesson.video_url}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      title={selectedLesson.title}
                    />
                  </div>
                )}

                {selectedLesson.content && (
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={() => updateProgressMutation.mutate({
                      lessonId: selectedLesson.id,
                      completed: !getLessonProgress(selectedLesson.id)?.is_completed
                    })}
                    disabled={updateProgressMutation.isPending}
                  >
                    {getLessonProgress(selectedLesson.id)?.is_completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Incomplete
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Lesson</h3>
                <p className="text-gray-600">Choose a lesson from the list to start learning</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
