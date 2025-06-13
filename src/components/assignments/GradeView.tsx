
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface GradeViewProps {
  assignmentId: string;
  studentId: string;
}

export const GradeView: React.FC<GradeViewProps> = ({ assignmentId, studentId }) => {
  const { data: grade, isLoading } = useQuery({
    queryKey: ['grade', assignmentId, studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          assignments:assignment_id (
            title,
            assignment_type,
            max_points
          ),
          submissions:submission_id (
            submitted_at,
            time_spent_minutes
          )
        `)
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: answers } = useQuery({
    queryKey: ['assignment-answers', assignmentId, studentId],
    queryFn: async () => {
      if (!grade?.submission_id) return [];
      
      const { data, error } = await supabase
        .from('assignment_answers')
        .select(`
          *,
          assignment_questions:question_id (
            question_text,
            question_type,
            points,
            options
          )
        `)
        .eq('submission_id', grade.submission_id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!grade?.submission_id,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading grade...</div>;
  }

  if (!grade) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No grade available yet</p>
        </CardContent>
      </Card>
    );
  }

  const percentage = grade.percentage || 0;
  const getGradeColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600';
    if (percent >= 80) return 'text-blue-600';
    if (percent >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLetter = (percent: number) => {
    if (percent >= 90) return 'A';
    if (percent >= 80) return 'B';
    if (percent >= 70) return 'C';
    if (percent >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-6">
      {/* Grade Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Grade for {grade.assignments?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getGradeColor(percentage)}`}>
                {getGradeLetter(percentage)}
              </div>
              <div className="text-sm text-gray-500">Letter Grade</div>
            </div>
            
            <div className="text-center">
              <div className={`text-4xl font-bold ${getGradeColor(percentage)}`}>
                {percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Percentage</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {grade.points_earned}/{grade.max_points}
              </div>
              <div className="text-sm text-gray-500">Points</div>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={percentage} className="h-3" />
          </div>

          {grade.submissions?.submitted_at && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Submitted: {format(new Date(grade.submissions.submitted_at), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <Badge variant={grade.auto_graded ? 'default' : 'secondary'}>
                {grade.auto_graded ? 'Auto Graded' : 'Manual Grade'}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Feedback */}
      {grade.feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Teacher Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{grade.feedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Question Breakdown */}
      {answers && answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {answers.map((answer, index) => (
                <div key={answer.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Badge variant={answer.is_correct ? 'default' : 'destructive'}>
                      {answer.points_earned}/{answer.assignment_questions?.points} pts
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{answer.assignment_questions?.question_text}</p>
                  
                  <div className="bg-gray-50 rounded p-2">
                    <span className="text-sm font-medium">Your Answer: </span>
                    <span className="text-sm">{answer.answer_text}</span>
                  </div>
                  
                  {answer.assignment_questions?.question_type === 'mcq' && answer.is_correct !== null && (
                    <div className={`mt-2 text-sm ${answer.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                      {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
