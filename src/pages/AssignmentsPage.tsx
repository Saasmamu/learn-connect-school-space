
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Plus, Search, Edit, Calendar, Award, Users, Play, Eye, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { QuestionBuilder } from '@/components/assignments/QuestionBuilder';
import { AssignmentSubmission } from '@/components/assignments/AssignmentSubmission';
import { GradeView } from '@/components/assignments/GradeView';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  class_id: z.string().min(1, 'Please select a class'),
  lesson_id: z.string().optional(),
  assignment_type: z.enum(['homework', 'quiz', 'project', 'exam']),
  max_points: z.number().min(1, 'Points must be at least 1'),
  due_date: z.string().optional(),
  time_limit_minutes: z.number().optional(),
  grading_mode: z.enum(['manual', 'auto']),
  allow_resubmission: z.boolean(),
  is_required: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'essay' | 'file_upload';
  points: number;
  options?: string[];
  correct_answer?: string;
  question_order: number;
}

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissionDialog, setSubmissionDialog] = useState<string | null>(null);
  const [gradeDialog, setGradeDialog] = useState<{ assignmentId: string; studentId: string } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      class_id: '',
      lesson_id: '',
      assignment_type: 'homework',
      max_points: 100,
      due_date: '',
      time_limit_minutes: 0,
      grading_mode: 'manual',
      allow_resubmission: false,
      is_required: true,
    },
  });

  // Fetch user's classes
  const { data: userClasses, isLoading: classesLoading } = useQuery({
    queryKey: ['user-classes-assignments', user?.role],
    queryFn: async () => {
      if (!user) return [];
      
      if (user?.role === 'admin') {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('name');
        if (error) throw error;
        return data || [];
      } else if (user?.role === 'teacher') {
        const { data, error } = await supabase
          .from('teacher_classes')
          .select('classes(*)')
          .eq('teacher_id', user.id);
        if (error) throw error;
        return data.map(tc => tc.classes).filter(Boolean) || [];
      } else {
        const { data, error } = await supabase
          .from('student_classes')
          .select('classes(*)')
          .eq('student_id', user.id);
        if (error) throw error;
        return data.map(sc => sc.classes).filter(Boolean) || [];
      }
    },
    enabled: !!user,
  });

  // Fetch assignments with grades for students
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments', selectedClass, selectedType, user?.role],
    queryFn: async () => {
      let query = supabase
        .from('assignments')
        .select(`
          *,
          classes(name),
          lessons(title),
          profiles!assignments_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
      }

      if (selectedType !== 'all') {
        query = query.eq('assignment_type', selectedType);
      }

      if (user?.role === 'student') {
        query = query.eq('is_published', true);
      }

      const { data: assignmentData, error } = await query;
      if (error) throw error;

      // For students, also fetch their grades and submissions
      if (user?.role === 'student' && assignmentData) {
        const assignmentIds = assignmentData.map(a => a.id);
        
        const { data: grades } = await supabase
          .from('grades')
          .select('assignment_id, points_earned, max_points, percentage')
          .eq('student_id', user.id)
          .in('assignment_id', assignmentIds);

        const { data: submissions } = await supabase
          .from('submissions')
          .select('assignment_id, status, submitted_at')
          .eq('student_id', user.id)
          .in('assignment_id', assignmentIds);

        return assignmentData.map(assignment => ({
          ...assignment,
          grade: grades?.find(g => g.assignment_id === assignment.id),
          submission: submissions?.find(s => s.assignment_id === assignment.id),
        }));
      }

      return assignmentData;
    },
    enabled: !!user,
  });

  // Create/Update assignment mutation
  const saveAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: FormData) => {
      const saveData = {
        title: assignmentData.title,
        description: assignmentData.description || null,
        class_id: assignmentData.class_id,
        lesson_id: assignmentData.lesson_id && assignmentData.lesson_id !== 'none' ? assignmentData.lesson_id : null,
        assignment_type: assignmentData.assignment_type,
        max_points: assignmentData.max_points,
        due_date: assignmentData.due_date ? new Date(assignmentData.due_date).toISOString() : null,
        time_limit_minutes: assignmentData.time_limit_minutes || null,
        grading_mode: assignmentData.grading_mode,
        allow_resubmission: assignmentData.allow_resubmission,
        is_required: assignmentData.is_required,
        created_by: user?.id,
      };

      let assignmentId: string;

      if (editingAssignment) {
        const { error } = await supabase
          .from('assignments')
          .update(saveData)
          .eq('id', editingAssignment.id);
        if (error) throw error;
        assignmentId = editingAssignment.id;
      } else {
        const { data, error } = await supabase
          .from('assignments')
          .insert(saveData)
          .select()
          .single();
        if (error) throw error;
        assignmentId = data.id;
      }

      // Save questions
      if (questions.length > 0) {
        // Delete existing questions if editing
        if (editingAssignment) {
          await supabase
            .from('assignment_questions')
            .delete()
            .eq('assignment_id', assignmentId);
        }

        const questionData = questions.map((q, index) => ({
          assignment_id: assignmentId,
          question_text: q.question_text,
          question_type: q.question_type,
          points: q.points,
          options: q.options ? JSON.stringify(q.options) : null,
          correct_answer: q.correct_answer || null,
          question_order: index,
        }));

        const { error: questionsError } = await supabase
          .from('assignment_questions')
          .insert(questionData);

        if (questionsError) throw questionsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({
        title: "Success",
        description: editingAssignment ? "Assignment updated successfully" : "Assignment created successfully",
      });
      setIsDialogOpen(false);
      setEditingAssignment(null);
      setQuestions([]);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ assignmentId, isPublished }: { assignmentId: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from('assignments')
        .update({ is_published: !isPublished })
        .eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({
        title: "Success",
        description: "Assignment status updated",
      });
    },
  });

  const onSubmit = (values: FormData) => {
    saveAssignmentMutation.mutate(values);
  };

  const openEditDialog = (assignment: any) => {
    setEditingAssignment(assignment);
    form.reset({
      title: assignment.title,
      description: assignment.description || '',
      class_id: assignment.class_id,
      lesson_id: assignment.lesson_id || 'none',
      assignment_type: assignment.assignment_type,
      max_points: assignment.max_points,
      due_date: assignment.due_date ? format(new Date(assignment.due_date), 'yyyy-MM-dd\'T\'HH:mm') : '',
      time_limit_minutes: assignment.time_limit_minutes || 0,
      grading_mode: assignment.grading_mode || 'manual',
      allow_resubmission: assignment.allow_resubmission || false,
      is_required: assignment.is_required ?? true,
    });
    setIsDialogOpen(true);
  };

  const filteredAssignments = assignments?.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.classes?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const canManageAssignments = user?.role === 'admin' || user?.role === 'teacher';

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'homework': return 'bg-blue-100 text-blue-800';
      case 'quiz': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'exam': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (assignment: any) => {
    if (user?.role !== 'student') return null;
    
    if (assignment.submission) {
      if (assignment.grade) {
        return <Badge variant="default">Graded</Badge>;
      }
      return <Badge variant="secondary">Submitted</Badge>;
    }
    
    if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    return <Badge variant="outline">Pending</Badge>;
  };

  if (classesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">Loading classes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
            <p className="text-gray-600">
              {user?.role === 'student' ? 'View and complete your assignments' : 'Create and manage assignments'}
            </p>
          </div>
          {canManageAssignments && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => { 
                    setEditingAssignment(null); 
                    setQuestions([]);
                    form.reset(); 
                  }}
                  disabled={!userClasses || userClasses.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
                  <DialogDescription>
                    {editingAssignment ? 'Update assignment information' : 'Create a new assignment with questions'}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="class_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {userClasses?.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="assignment_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="homework">Homework</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="project">Project</SelectItem>
                                <SelectItem value="exam">Exam</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Algebra Problem Set 1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} placeholder="Assignment instructions..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="max_points"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Points</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                placeholder="100" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time_limit_minutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Limit (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                placeholder="0 for no limit" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="due_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="grading_mode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grading Mode</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="auto">Auto (for MCQ)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="allow_resubmission"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Allow Resubmission</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="is_required"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Required Submission</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Questions Builder */}
                    <QuestionBuilder questions={questions} onQuestionsChange={setQuestions} />

                    <DialogFooter>
                      <Button type="submit" disabled={saveAssignmentMutation.isPending}>
                        {editingAssignment ? 'Update' : 'Create'} Assignment
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {userClasses?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="homework">Homework</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredAssignments.length}
                </div>
                <div className="text-sm text-gray-600">Total Assignments</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Assignments
            </CardTitle>
            <CardDescription>
              {user?.role === 'student' ? 'Your assigned work' : 'Manage class assignments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    {user?.role === 'student' && <TableHead>Grade</TableHead>}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assignment.title}</div>
                          <div className="text-sm text-gray-500">{assignment.description?.substring(0, 100)}...</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.classes?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(assignment.assignment_type)}>
                          {assignment.assignment_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-1 text-yellow-500" />
                          {assignment.max_points}
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.due_date ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                          </div>
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(assignment) || (
                          <Badge variant={assignment.is_published ? "default" : "secondary"}>
                            {assignment.is_published ? "Published" : "Draft"}
                          </Badge>
                        )}
                      </TableCell>
                      {user?.role === 'student' && (
                        <TableCell>
                          {assignment.grade ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setGradeDialog({ assignmentId: assignment.id, studentId: user.id })}
                            >
                              {assignment.grade.percentage?.toFixed(1)}%
                            </Button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex space-x-2">
                          {user?.role === 'student' && !assignment.submission && (
                            <Button
                              size="sm"
                              onClick={() => setSubmissionDialog(assignment.id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Take
                            </Button>
                          )}
                          {canManageAssignments && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(assignment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Assignment Submission Dialog */}
        {submissionDialog && (
          <Dialog open={true} onOpenChange={() => setSubmissionDialog(null)}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <AssignmentSubmission 
                assignmentId={submissionDialog} 
                onClose={() => setSubmissionDialog(null)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Grade View Dialog */}
        {gradeDialog && (
          <Dialog open={true} onOpenChange={() => setGradeDialog(null)}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <GradeView 
                assignmentId={gradeDialog.assignmentId}
                studentId={gradeDialog.studentId}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
