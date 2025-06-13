
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, FileUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AssignmentSubmissionProps {
  assignmentId: string;
  onClose: () => void;
}

export const AssignmentSubmission: React.FC<AssignmentSubmissionProps> = ({
  assignmentId,
  onClose,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime] = useState(new Date());

  // Fetch assignment details
  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment-details', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          assignment_questions:assignment_questions (
            id,
            question_text,
            question_type,
            points,
            options,
            question_order
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Check existing submission
  const { data: existingSubmission } = useQuery({
    queryKey: ['existing-submission', assignmentId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          assignment_answers:assignment_answers (*)
        `)
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Timer effect
  useEffect(() => {
    if (assignment?.time_limit_minutes && !existingSubmission) {
      const endTime = new Date(startTime.getTime() + assignment.time_limit_minutes * 60000);
      
      const timer = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          submitAssignment();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [assignment, existingSubmission]);

  // Submit assignment mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: user.id,
          status: 'submitted',
          started_at: startTime.toISOString(),
          time_spent_minutes: Math.floor((new Date().getTime() - startTime.getTime()) / 60000),
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Save answers
      const answerData = Object.entries(answers).map(([questionId, answer]) => ({
        submission_id: submission.id,
        question_id: questionId,
        answer_text: answer,
      }));

      if (answerData.length > 0) {
        const { error: answersError } = await supabase
          .from('assignment_answers')
          .insert(answerData);

        if (answersError) throw answersError;

        // Calculate grade for auto-graded assignments
        if (assignment?.grading_mode === 'auto') {
          await supabase.rpc('calculate_submission_grade', { submission_uuid: submission.id });
        }
      }

      return submission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['existing-submission'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({
        title: 'Success',
        description: 'Assignment submitted successfully!',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const submitAssignment = () => {
    submitMutation.mutate();
  };

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading assignment...</div>;
  }

  if (!assignment) {
    return <div className="text-center py-8">Assignment not found</div>;
  }

  if (existingSubmission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Assignment Already Submitted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            You submitted this assignment on {format(new Date(existingSubmission.submitted_at), 'MMM dd, yyyy HH:mm')}
          </p>
          <Button onClick={onClose}>Close</Button>
        </CardContent>
      </Card>
    );
  }

  const questions = assignment.assignment_questions?.sort((a, b) => a.question_order - b.question_order) || [];
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{assignment.title}</CardTitle>
              <p className="text-gray-600 mt-2">{assignment.description}</p>
            </div>
            <div className="text-right space-y-2">
              <Badge className="ml-2">{assignment.assignment_type}</Badge>
              <div className="text-sm text-gray-500">
                Total Points: {totalPoints}
              </div>
            </div>
          </div>
          
          {timeLeft !== null && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Time Remaining: {formatTime(timeLeft)}
                </span>
              </div>
              <Progress 
                value={(timeLeft / (assignment.time_limit_minutes * 60)) * 100} 
                className="h-2"
              />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Questions */}
      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-base">
              Question {index + 1} ({question.points} point{question.points !== 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{question.question_text}</p>

            {question.question_type === 'mcq' && (
              <div className="space-y-2">
                {(question.options as string[])?.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => updateAnswer(question.id, e.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'short_answer' && (
              <Input
                value={answers[question.id] || ''}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                placeholder="Enter your answer..."
              />
            )}

            {question.question_type === 'essay' && (
              <Textarea
                value={answers[question.id] || ''}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                placeholder="Write your essay here..."
                rows={8}
              />
            )}

            {question.question_type === 'file_upload' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">File upload functionality coming soon</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Submit Button */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={submitAssignment}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? 'Submitting...' : 'Submit Assignment'}
        </Button>
      </div>
    </div>
  );
};
