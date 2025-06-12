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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Plus, Search, Edit, Calendar, Award, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  class_id: z.string().min(1, 'Please select a class'),
  lesson_id: z.string().optional(),
  assignment_type: z.enum(['homework', 'quiz', 'project', 'exam']),
  max_points: z.number().min(1, 'Points must be at least 1'),
  due_date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

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

  // Fetch assignments
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments', selectedClass, selectedType],
    queryFn: async () => {
      let query = supabase
        .from('assignments')
        .select(`
          *,
          classes(name),
          lessons(title),
          profiles!assignments_created_by_fkey(full_name),
          submissions(count)
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

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch lessons for selected class
  const { data: classLessons } = useQuery({
    queryKey: ['class-lessons', form.watch('class_id')],
    queryFn: async () => {
      const classId = form.watch('class_id');
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('class_id', classId)
        .order('lesson_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!form.watch('class_id'),
  });

  // Create/Update assignment mutation
  const saveAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: FormData) => {
      const saveData = {
        title: assignmentData.title,
        description: assignmentData.description || null,
        class_id: assignmentData.class_id,
        lesson_id: assignmentData.lesson_id || null,
        assignment_type: assignmentData.assignment_type,
        max_points: assignmentData.max_points,
        due_date: assignmentData.due_date ? new Date(assignmentData.due_date).toISOString() : null,
        created_by: user?.id,
      };

      if (editingAssignment) {
        const { error } = await supabase
          .from('assignments')
          .update(saveData)
          .eq('id', editingAssignment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('assignments')
          .insert(saveData);
        if (error) throw error;
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
    console.log('Form submission values:', values);
    saveAssignmentMutation.mutate(values);
  };

  const openEditDialog = (assignment: any) => {
    setEditingAssignment(assignment);
    form.reset({
      title: assignment.title,
      description: assignment.description || '',
      class_id: assignment.class_id,
      lesson_id: assignment.lesson_id || '',
      assignment_type: assignment.assignment_type,
      max_points: assignment.max_points,
      due_date: assignment.due_date ? format(new Date(assignment.due_date), 'yyyy-MM-dd\'T\'HH:mm') : '',
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
              {user?.role === 'student' ? 'View and submit your assignments' : 'Create and manage assignments'}
            </p>
          </div>
          {canManageAssignments && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => { 
                    setEditingAssignment(null); 
                    form.reset({
                      title: '',
                      description: '',
                      class_id: '',
                      lesson_id: '',
                      assignment_type: 'homework',
                      max_points: 100,
                      due_date: '',
                    }); 
                  }}
                  disabled={!userClasses || userClasses.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}</DialogTitle>
                  <DialogDescription>
                    {editingAssignment ? 'Update assignment information' : 'Create a new assignment for your class'}
                  </DialogDescription>
                </DialogHeader>
                {(!userClasses || userClasses.length === 0) ? (
                  <div className="p-4 text-center">
                    <p className="text-gray-500">No classes available. Please contact an administrator to assign you to classes.</p>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <div className="grid grid-cols-2 gap-4">
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
                      </div>
                      <FormField
                        control={form.control}
                        name="lesson_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Related Lesson (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a lesson" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No specific lesson</SelectItem>
                                {classLessons?.map((lesson) => (
                                  <SelectItem key={lesson.id} value={lesson.id}>
                                    {lesson.title}
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={6} placeholder="Assignment instructions and requirements..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={saveAssignmentMutation.isPending}>
                          {editingAssignment ? 'Update' : 'Create'} Assignment
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Show message if no classes for non-admin users */}
        {canManageAssignments && (!userClasses || userClasses.length === 0) && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">
                {user?.role === 'teacher' ? 'You are not assigned to any classes yet. Please contact an administrator.' : 'No classes created yet.'}
              </p>
              {user?.role === 'admin' && (
                <Button asChild className="mt-4">
                  <Link to="/admin/courses">Create Classes</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

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
                    <TableHead>Submissions</TableHead>
                    {canManageAssignments && <TableHead>Actions</TableHead>}
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
                        <Badge variant={assignment.is_published ? "default" : "secondary"}>
                          {assignment.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-blue-500" />
                          {assignment.submissions?.length || 0}
                        </div>
                      </TableCell>
                      {canManageAssignments && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(assignment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePublishMutation.mutate({
                                assignmentId: assignment.id,
                                isPublished: assignment.is_published
                              })}
                            >
                              {assignment.is_published ? "Unpublish" : "Publish"}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
