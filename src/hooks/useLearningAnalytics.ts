
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useLearningAnalytics = (classId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Record learning activity
  const recordActivity = useMutation({
    mutationFn: async ({
      classId,
      lessonId,
      activityType,
      durationSeconds,
      completionPercentage,
      score,
      metadata
    }: {
      classId: string;
      lessonId?: string;
      activityType: string;
      durationSeconds?: number;
      completionPercentage?: number;
      score?: number;
      metadata?: any;
    }) => {
      const { error } = await supabase.rpc('record_learning_activity', {
        p_class_id: classId,
        p_lesson_id: lessonId,
        p_activity_type: activityType,
        p_duration_seconds: durationSeconds,
        p_completion_percentage: completionPercentage,
        p_score: score,
        p_metadata: metadata
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] });
    }
  });

  // Get performance metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['performance-metrics', user?.id, classId],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .eq('class_id', classId)
        .order('calculation_date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!classId
  });

  // Get learning analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['learning-analytics', user?.id, classId],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('user_id', user?.id)
        .eq('class_id', classId)
        .order('recorded_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!classId
  });

  return {
    recordActivity,
    metrics,
    analytics,
    metricsLoading,
    analyticsLoading
  };
};
