
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Award, Search, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const gradeSchema = z.object({
  points_earned: z.number().min(0, 'Points must be positive'),
  feedback: z.string().optional(),
});

type GradeFormData = z.infer<typeof gradeSchema>;

// Type guards for better type safety
type StudentGradeData = {
  id: string;
  assignment_id: string;
  student_id: string;
  points_earned: number;
  max_points: number;
  feedback: string;
  graded_at: string;
  assignments: {
    title: string;
    max_points: number;
    classes: {
      name: string;
    };
  };
};

type TeacherSubmissionData = {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  file_url: string;
  submitted_at: string;
  is_late: boolean;
  assignments: {
    id: string;
    title: string;
    max_points: number;
    class_id: string;
    classes: {
      name: string;
    };
  };
  profiles: {
    full_name: string;
    email: string;
  };
  grades: Array<{
    id: string;
    points_earned: number;
    feedback: string;
    graded_at: string;
  }>;
};

const isStudentGradeData = (item: any): item is StudentGradeData => {
  return item && typeof item.graded_at === 'string' && !item.submitted_at;
};

const isTeacherSubmissionData = (item: any): item is TeacherSubmissionData => {
  return item && typeof item.submitted_at === 'string' && item.profiles;
};

export const GradebookPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<string>('all');
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<TeacherSubmissionData | null>(null);

  const gradeForm = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      points_earned: 0,
      feedback: '',
    },
  });

  // Fetch user's classes
  const { data: userClasses } = useQuery({
    queryKey: ['user-classes-gradebook', user?.role],
    queryFn: async () => {
      if (user?.role === 'admin') {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('name');
        if (error) throw error;
        return data;
      } else if (user?.role === 'teacher') {
        const { data, error } = await supabase
          .from('teacher_classes')
          .select('classes(*)')
          .eq('teacher_id', user.id);
        if (error) throw error;
        return data.map(tc => tc.classes).filter(Boolean);
      } else {
        const { data, error } = await supabase
          .from('student_classes')
          .select('classes(*)')
          .eq('student_id', user.id);
        if (error) throw error;
        return data.map(sc => sc.classes).filter(Boolean);
      }
    },
    enabled: !!user,
  });

  // Fetch assignments for selected class
  const { data: assignments } = useQuery({
    queryKey: ['class-assignments-gradebook', selectedClass],
    queryFn: async () => {
      if (selectedClass === 'all') return [];
      
      const { data, error } = await supabase
        .from('assignments')
        .select('id, title, max_points')
        .eq('class_id', selectedClass)
        .eq('is_published', true)
        .order('created_at');
      
      if (error) throw error;
      return data;
    },
    enabled: selectedClass !== 'all',
  });

  // Fetch student grades
  const { data: studentGrades, isLoading: isLoadingStudentGrades } = useQuery({
    queryKey: ['student-grades', selectedClass, user?.id],
    queryFn: async () => {
      if (selectedClass === 'all') return [];

      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          assignments(title, max_points, classes(name))
        `)
        .eq('student_id', user!.id)
        .order('graded_at', { ascending: false });

      if (error) throw error;
      return data as StudentGradeData[];
    },
    enabled: !!user && user.role === 'student' && selectedClass !== 'all',
  });

  // Fetch teacher submissions for grading
  const { data: teacherSubmissions, isLoading: isLoadingTeacherSubmissions } = useQuery({
    queryKey: ['teacher-submissions', selectedClass, selectedAssignment],
    queryFn: async () => {
      if (selectedClass === 'all') return [];

      let query = supabase
        .from('submissions')
        .select(`
          *,
          assignments(id, title, max_points, class_id, classes(name)),
          profiles!submissions_student_id_fkey(full_name, email),
          grades(id, points_earned, feedback, graded_at)
        `)
        .order('submitted_at', { ascending: false });

      if (selectedClass !== 'all') {
        query = query.eq('assignments.class_id', selectedClass);
      }

      if (selectedAssignment !== 'all') {
        query = query.eq('assignment_id', selectedAssignment);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TeacherSubmissionData[];
    },
    enabled: !!user && (user.role === 'teacher' || user.role === 'admin') && selectedClass !== 'all',
  });

  // Grade submission mutation
  const gradeSubmissionMutation = useMutation({
    mutationFn: async (gradeData: GradeFormData) => {
      if (!gradingSubmission) throw new Error('No submission selected');
      
      const { error } = await supabase
        .from('grades')
        .upsert({
          submission_id: gradingSubmission.id,
          assignment_id: gradingSubmission.assignment_id,
          student_id: gradingSubmission.student_id,
          points_earned: gradeData.points_earned,
          max_points: gradingSubmission.assignments.max_points,
          feedback: gradeData.feedback || null,
          graded_by: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] });
      toast({
        title: "Success",
        description: "Grade submitted successfully",
      });
      setIsGradeDialogOpen(false);
      setGradingSubmission(null);
      gradeForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitGrade = (values: GradeFormData) => {
    gradeSubmissionMutation.mutate(values);
  };

  const openGradeDialog = (submission: TeacherSubmissionData) => {
    setGradingSubmission(submission);
    const existingGrade = submission.grades?.[0];
    gradeForm.reset({
      points_earned: existingGrade?.points_earned || 0,
      feedback: existingGrade?.feedback || '',
    });
    setIsGradeDialogOpen(true);
  };

  // Get appropriate data based on user role
  const isStudent = user?.role === 'student';
  const gradesData = isStudent ? studentGrades : teacherSubmissions;
  const isLoading = isStudent ? isLoadingStudentGrades : isLoadingTeacherSubmissions;

  const filteredData = gradesData?.filter(item => {
    const searchText = searchTerm.toLowerCase();
    if (isStudent && isStudentGradeData(item)) {
      return item.assignments?.title?.toLowerCase().includes(searchText);
    } else if (!isStudent && isTeacherSubmissionData(item)) {
      return item.assignments?.title?.toLowerCase().includes(searchText) ||
             item.profiles?.full_name?.toLowerCase().includes(searchText);
    }
    return false;
  }) || [];

  const canGrade = user?.role === 'admin' || user?.role === 'teacher';

  const getGradeColor = (pointsEarned: number, maxPoints: number) => {
    const percentage = (pointsEarned / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateStats = () => {
    if (!teacherSubmissions || isStudent) return null;
    
    const totalSubmissions = teacherSubmissions.length;
    const gradedSubmissions = teacherSubmissions.filter(s => s.grades?.length > 0).length;
    const pendingGrading = totalSubmissions - gradedSubmissions;
    
    return { totalSubmissions, gradedSubmissions, pendingGrading };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
            <p className="text-gray-600">
              {isStudent ? 'View your grades and progress' : 'Grade assignments and track student progress'}
            </p>
          </div>
        </div>

        {/* Stats for teachers/admins */}
        {canGrade && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</div>
                  <div className="text-sm text-gray-600">Total Submissions</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.gradedSubmissions}</div>
                  <div className="text-sm text-gray-600">Graded</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingGrading}</div>
                  <div className="text-sm text-gray-600">Pending Grading</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
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
                  <SelectValue placeholder="Select class" />
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
          {canGrade && (
            <Card>
              <CardContent className="p-4">
                <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignments</SelectItem>
                    {assignments?.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {assignment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Grades/Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              {isStudent ? 'My Grades' : 'Student Submissions & Grades'}
            </CardTitle>
            <CardDescription>
              {isStudent ? 'Your assignment grades and feedback' : 'Grade student submissions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedClass === 'all' ? (
              <div className="text-center py-8 text-gray-500">
                Please select a class to view grades
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {!isStudent && <TableHead>Student</TableHead>}
                    <TableHead>Assignment</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Feedback</TableHead>
                    {canGrade && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={`grade-${item.id}-${index}`}>
                      {!isStudent && isTeacherSubmissionData(item) && (
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.profiles?.full_name}</div>
                            <div className="text-sm text-gray-500">{item.profiles?.email}</div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.assignments?.title}</div>
                          <div className="text-sm text-gray-500">Max: {item.assignments?.max_points} points</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.assignments?.classes?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        {isStudent && isStudentGradeData(item) 
                          ? new Date(item.graded_at).toLocaleDateString()
                          : isTeacherSubmissionData(item)
                          ? new Date(item.submitted_at).toLocaleDateString()
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {(() => {
                          if (isStudent && isStudentGradeData(item) && item.points_earned !== null) {
                            return (
                              <div className={`font-medium ${getGradeColor(item.points_earned, item.assignments?.max_points)}`}>
                                {item.points_earned}/{item.assignments?.max_points}
                                <span className="text-sm text-gray-500 ml-1">
                                  ({Math.round((item.points_earned / item.assignments?.max_points) * 100)}%)
                                </span>
                              </div>
                            );
                          } else if (!isStudent && isTeacherSubmissionData(item) && item.grades?.length > 0) {
                            const grade = item.grades[0];
                            return (
                              <div className={`font-medium ${getGradeColor(grade.points_earned, item.assignments?.max_points)}`}>
                                {grade.points_earned}/{item.assignments?.max_points}
                                <span className="text-sm text-gray-500 ml-1">
                                  ({Math.round((grade.points_earned / item.assignments?.max_points) * 100)}%)
                                </span>
                              </div>
                            );
                          } else {
                            return <Badge variant="secondary">Not graded</Badge>;
                          }
                        })()}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">
                          {(() => {
                            if (isStudent && isStudentGradeData(item)) {
                              return item.feedback || 'No feedback';
                            } else if (!isStudent && isTeacherSubmissionData(item)) {
                              return item.grades?.[0]?.feedback || 'No feedback';
                            }
                            return 'No feedback';
                          })()}
                        </div>
                      </TableCell>
                      {canGrade && isTeacherSubmissionData(item) && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openGradeDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Grade Dialog */}
        <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Grade Assignment</DialogTitle>
              <DialogDescription>
                Grading {gradingSubmission?.assignments?.title} for {gradingSubmission?.profiles?.full_name}
              </DialogDescription>
            </DialogHeader>
            <Form {...gradeForm}>
              <form onSubmit={gradeForm.handleSubmit(onSubmitGrade)} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Student Submission:</h4>
                  <p className="text-sm text-gray-600">
                    {gradingSubmission?.content || 'No text content submitted'}
                  </p>
                </div>
                <FormField
                  control={gradeForm.control}
                  name="points_earned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points Earned (out of {gradingSubmission?.assignments?.max_points})</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          placeholder="0" 
                          max={gradingSubmission?.assignments?.max_points}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={gradeForm.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="Provide feedback for the student..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={gradeSubmissionMutation.isPending}>
                    Submit Grade
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
