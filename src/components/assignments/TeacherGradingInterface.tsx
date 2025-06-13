
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TeacherGradingInterfaceProps {
  assignmentId: string;
  onClose: () => void;
}

export const TeacherGradingInterface: React.FC<TeacherGradingInterfaceProps> = ({
  assignmentId,
  onClose,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Fetch assignment and submissions
  const { data: assignmentData, isLoading } = useQuery({
    queryKey: ['assignment-grading', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          classes(name),
          submissions:submissions (
            *,
            profiles:student_id (full_name, email),
            assignment_answers:assignment_answers (
              *,
              assignment_questions:question_id (
                question_text,
                question_type,
                points,
                options
              )
            ),
            grades:grades (*)
          ),
          assignment_questions:assignment_questions (
            id,
            question_text,
            question_type,
            points,
            question_order
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Grade submission mutation
  const gradeMutation = useMutation({
    mutationFn: async ({ submissionId, points, feedback }: { submissionId: string; points: number; feedback: string }) => {
      const submission = assignmentData?.submissions.find((s: any) => s.id === submissionId);
      if (!submission) throw new Error('Submission not found');

      const { error } = await supabase
        .from('grades')
        .upsert({
          student_id: submission.student_id,
          assignment_id: assignmentId,
          submission_id: submissionId,
          points_earned: points,
          max_points: assignmentData?.max_points || 0,
          feedback: feedback,
          auto_graded: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-grading'] });
      toast({
        title: 'Success',
        description: 'Grade saved successfully',
      });
      setSelectedSubmission(null);
      setGradeInput('');
      setFeedbackInput('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const openGradingDialog = (submission: any) => {
    setSelectedSubmission(submission);
    const existingGrade = submission.grades?.[0];
    setGradeInput(existingGrade?.points_earned?.toString() || '');
    setFeedbackInput(existingGrade?.feedback || '');
  };

  const submitGrade = () => {
    if (!selectedSubmission || !gradeInput) return;

    gradeMutation.mutate({
      submissionId: selectedSubmission.id,
      points: parseFloat(gradeInput),
      feedback: feedbackInput,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading assignment...</div>;
  }

  if (!assignmentData) {
    return <div className="text-center py-8">Assignment not found</div>;
  }

  const submissions = assignmentData.submissions || [];
  const questions = assignmentData.assignment_questions?.sort((a: any, b: any) => a.question_order - b.question_order) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>{assignmentData.title} - Grading</CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{assignmentData.classes?.name}</span>
            <Badge>{assignmentData.assignment_type}</Badge>
            <span>Max Points: {assignmentData.max_points}</span>
            <span>{submissions.length} Submissions</span>
          </div>
        </CardHeader>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission: any) => {
                const grade = submission.grades?.[0];
                const percentage = grade ? ((grade.points_earned / grade.max_points) * 100).toFixed(1) : null;
                
                return (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{submission.profiles?.full_name}</div>
                          <div className="text-sm text-gray-500">{submission.profiles?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {format(new Date(submission.submitted_at), 'MMM dd, HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={grade ? 'default' : 'secondary'}>
                        {grade ? 'Graded' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {grade ? (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>{grade.points_earned}/{grade.max_points}</span>
                          {percentage && <span className="text-gray-500">({percentage}%)</span>}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not graded</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => openGradingDialog(submission)}
                      >
                        {grade ? 'Edit Grade' : 'Grade'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Grading Dialog */}
      {selectedSubmission && (
        <Dialog open={true} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Grade Submission - {selectedSubmission.profiles?.full_name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Student Answers */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Answers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((question: any, index: number) => {
                    const answer = selectedSubmission.assignment_answers?.find((a: any) => a.question_id === question.id);
                    
                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <Badge variant="outline">{question.points} pts</Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{question.question_text}</p>
                        
                        {question.question_type === 'mcq' && (
                          <div className="space-y-2 mb-3">
                            <p className="text-sm font-medium">Options:</p>
                            {(question.options as string[])?.map((option: string, i: number) => (
                              <div 
                                key={i} 
                                className={`p-2 rounded ${answer?.answer_text === option ? 'bg-blue-100' : 'bg-gray-50'}`}
                              >
                                {String.fromCharCode(65 + i)}. {option}
                                {answer?.answer_text === option && <span className="ml-2 text-blue-600">(Selected)</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {question.question_type !== 'mcq' && (
                          <div className="bg-gray-50 rounded p-3 mb-3">
                            <p className="text-sm font-medium mb-1">Student Answer:</p>
                            <p className="text-sm">{answer?.answer_text || 'No answer provided'}</p>
                          </div>
                        )}
                        
                        {answer?.is_correct !== null && (
                          <div className={`text-sm ${answer.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                            Auto-graded: {answer.is_correct ? '✓ Correct' : '✗ Incorrect'} 
                            ({answer.points_earned}/{question.points} pts)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Grading Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Grade Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Points Earned (out of {assignmentData.max_points})
                    </label>
                    <Input
                      type="number"
                      value={gradeInput}
                      onChange={(e) => setGradeInput(e.target.value)}
                      placeholder="Enter points"
                      max={assignmentData.max_points}
                      min="0"
                      step="0.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Feedback (Optional)
                    </label>
                    <Textarea
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="Provide feedback to the student..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={submitGrade}
                      disabled={!gradeInput || gradeMutation.isPending}
                    >
                      {gradeMutation.isPending ? 'Saving...' : 'Save Grade'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
