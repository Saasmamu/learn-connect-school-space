import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Calendar, Clock, Users, BookOpen, FileText, Upload, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { QuestionBuilder } from '@/components/assignments/QuestionBuilder';
import { AssignmentSubmission } from '@/components/assignments/AssignmentSubmission';
import { GradeView } from '@/components/assignments/GradeView';

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'essay' | 'file_upload';
  points: number;
  options?: string[];
  correct_answer?: string;
  question_order: number;
}

interface AssignmentWithUserData {
  id: string;
  title: string;
  description?: string;
  assignment_type: string;
  due_date?: string;
  time_limit_minutes?: number;
  class_id: string;
  is_published: boolean;
  allow_resubmission: boolean;
  grading_mode: string;
  is_required: boolean;
  max_points?: number;
  created_at: string;
  created_by: string;
  classes?: {
    name: string;
    grade_level?: string;
  };
  profiles?: {
    full_name: string;
  };
  userSubmission?: any;
  userGrade?: any;
}

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithUserData | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'take' | 'grade'>('list');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignment_type: 'homework',
    due_date: '',
    time_limit_minutes: '',
    class_id: '',
    is_published: false,
    allow_resubmission: false,
    grading_mode: 'manual',
    is_required: true,
    reference_materials: [] as any[],
  });

  // Fetch assignments with submissions and grades
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments', user?.id],
    queryFn: async (): Promise<AssignmentWithUserData[]> => {
      if (!user?.id) return [];

      if (user.role === 'student') {
        // Get assignments for student's classes
        const { data: assignmentData, error } = await supabase
          .from('assignments')
          .select(`
            *,
            classes:class_id (
              name,
              grade_level,
              student_classes!inner (
                student_id
              )
            ),
            profiles:created_by (
              full_name
            )
          `)
          .eq('classes.student_classes.student_id', user.id)
          .eq('is_published', true);

        if (error) throw error;
        
        // Get submissions and grades for each assignment
        const assignmentsWithStatus = await Promise.all(
          (assignmentData || []).map(async (assignment) => {
            const [submissionResult, gradeResult] = await Promise.all([
              supabase
                .from('submissions')
                .select('*')
                .eq('assignment_id', assignment.id)
                .eq('student_id', user.id)
                .order('submitted_at', { ascending: false })
                .limit(1)
                .maybeSingle(),
              supabase
                .from('grades')
                .select('*')
                .eq('assignment_id', assignment.id)
                .eq('student_id', user.id)
                .maybeSingle()
            ]);

            return {
              ...assignment,
              userSubmission: submissionResult.data,
              userGrade: gradeResult.data
            } as AssignmentWithUserData;
          })
        );

        return assignmentsWithStatus;
      } else {
        // For teachers and admins
        let query = supabase
          .from('assignments')
          .select(`
            *,
            classes:class_id (
              name,
              grade_level
            ),
            profiles:created_by (
              full_name
            )
          `);

        if (user.role === 'teacher') {
          query = query.eq('created_by', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as AssignmentWithUserData[];
      }
    },
    enabled: !!user?.id,
  });

  // Fetch classes for assignment creation
  const { data: classes = [] } = useQuery({
    queryKey: ['classes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase.from('classes').select('*');

      if (user.role === 'teacher') {
        const { data, error } = await supabase
          .from('classes')
          .select(`
            *,
            teacher_classes!inner (
              teacher_id
            )
          `)
          .eq('teacher_classes.teacher_id', user.id);

        if (error) throw error;
        return data || [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && user.role !== 'student',
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const { data: assignment, error } = await supabase
        .from('assignments')
        .insert({
          ...assignmentData,
          created_by: user?.id,
          time_limit_minutes: assignmentData.time_limit_minutes ? parseInt(assignmentData.time_limit_minutes) : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create questions if any
      if (questions.length > 0) {
        const questionsToInsert = questions.map(q => ({
          assignment_id: assignment.id,
          question_text: q.question_text,
          question_type: q.question_type,
          question_order: q.question_order,
          points: q.points,
          options: q.options ? JSON.stringify(q.options) : null,
          correct_answer: q.correct_answer,
        }));

        const { error: questionsError } = await supabase
          .from('assignment_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      return assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Assignment created successfully');
    },
    onError: (error) => {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    },
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignment_type: 'homework',
      due_date: '',
      time_limit_minutes: '',
      class_id: '',
      is_published: false,
      allow_resubmission: false,
      grading_mode: 'manual',
      is_required: true,
      reference_materials: [],
    });
    setQuestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.class_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    createAssignmentMutation.mutate(formData);
  };

  const getStatusBadge = (assignment: AssignmentWithUserData) => {
    if (user?.role === 'student') {
      if (assignment.userGrade) {
        return <Badge variant="default">Graded</Badge>;
      }
      if (assignment.userSubmission) {
        return <Badge variant="secondary">Submitted</Badge>;
      }
      const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
      if (isOverdue) {
        return <Badge variant="destructive">Overdue</Badge>;
      }
      return <Badge variant="outline">Pending</Badge>;
    }
    
    return (
      <Badge variant={assignment.is_published ? 'default' : 'secondary'}>
        {assignment.is_published ? 'Published' : 'Draft'}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <BookOpen className="h-4 w-4" />;
      case 'exam':
        return <FileText className="h-4 w-4" />;
      case 'homework':
        return <Upload className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (activeTab === 'all') return true;
    return assignment.assignment_type === activeTab;
  });

  const handleTakeAssignment = (assignment: AssignmentWithUserData) => {
    setSelectedAssignment(assignment);
    setViewMode('take');
  };

  const handleViewGrade = (assignment: AssignmentWithUserData) => {
    setSelectedAssignment(assignment);
    setViewMode('grade');
  };

  if (viewMode === 'take' && selectedAssignment) {
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="outline" 
          onClick={() => setViewMode('list')}
          className="mb-4"
        >
          ← Back to Assignments
        </Button>
        <AssignmentSubmission
          assignmentId={selectedAssignment.id}
          studentId={user?.id || ''}
          onSubmissionComplete={() => {
            setViewMode('list');
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
          }}
        />
      </div>
    );
  }

  if (viewMode === 'grade' && selectedAssignment) {
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="outline" 
          onClick={() => setViewMode('list')}
          className="mb-4"
        >
          ← Back to Assignments
        </Button>
        <GradeView
          assignmentId={selectedAssignment.id}
          studentId={user?.id || ''}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-gray-600">
            {user?.role === 'student' 
              ? 'View and complete your assignments' 
              : 'Manage assignments, quizzes, and exams'
            }
          </p>
        </div>

        {user?.role !== 'student' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="assignment_type">Type</Label>
                    <Select
                      value={formData.assignment_type}
                      onValueChange={(value) => setFormData({ ...formData, assignment_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homework">Homework</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class_id">Class *</Label>
                    <Select
                      value={formData.class_id}
                      onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="time_limit_minutes">Time Limit (minutes)</Label>
                    <Input
                      id="time_limit_minutes"
                      type="number"
                      value={formData.time_limit_minutes}
                      onChange={(e) => setFormData({ ...formData, time_limit_minutes: e.target.value })}
                      placeholder="Leave empty for no limit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="grading_mode">Grading Mode</Label>
                    <Select
                      value={formData.grading_mode}
                      onValueChange={(value) => setFormData({ ...formData, grading_mode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                    />
                    <Label htmlFor="is_published">Publish immediately</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow_resubmission"
                      checked={formData.allow_resubmission}
                      onCheckedChange={(checked) => setFormData({ ...formData, allow_resubmission: checked })}
                    />
                    <Label htmlFor="allow_resubmission">Allow resubmission</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_required"
                      checked={formData.is_required}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                    />
                    <Label htmlFor="is_required">Required</Label>
                  </div>
                </div>

                <QuestionBuilder questions={questions} onQuestionsChange={setQuestions} />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAssignmentMutation.isPending}>
                    {createAssignmentMutation.isPending ? 'Creating...' : 'Create Assignment'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Assignment Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
          <TabsTrigger value="quiz">Quizzes</TabsTrigger>
          <TabsTrigger value="exam">Exams</TabsTrigger>
          <TabsTrigger value="assignment">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No assignments found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        {getTypeIcon(assignment.assignment_type)}
                        <div>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {assignment.classes?.name} • {assignment.profiles?.full_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(assignment)}
                        {user?.role !== 'student' && (
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {assignment.description && (
                      <p className="text-gray-700 mb-4">{assignment.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        {assignment.due_date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                        )}
                        {assignment.time_limit_minutes && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{assignment.time_limit_minutes} min</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{assignment.max_points || 100} points</span>
                        </div>
                      </div>
                      
                      {user?.role === 'student' && (
                        <div className="flex space-x-2">
                          {assignment.userGrade ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewGrade(assignment)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Grade ({assignment.userGrade.percentage?.toFixed(1)}%)
                            </Button>
                          ) : assignment.userSubmission ? (
                            <Badge variant="secondary">Submitted</Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleTakeAssignment(assignment)}
                            >
                              Start Assignment
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
