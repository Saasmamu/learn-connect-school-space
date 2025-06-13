
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TrendingUp, FileText, Users, Award } from 'lucide-react';
import { format } from 'date-fns';
import { TeacherGradingInterface } from '@/components/assignments/TeacherGradingInterface';

export const TeacherGradebookPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  // Fetch teacher's assignments with submission counts
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['teacher-assignments-grading', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          classes:class_id (name),
          submissions:submissions (
            id,
            student_id,
            submitted_at,
            grades:grades (id, points_earned, max_points)
          )
        `)
        .eq('created_by', user.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate submission and grading stats
      return data.map(assignment => ({
        ...assignment,
        total_submissions: assignment.submissions?.length || 0,
        graded_submissions: assignment.submissions?.filter((s: any) => s.grades?.length > 0).length || 0,
        average_grade: assignment.submissions?.length > 0 
          ? assignment.submissions
              .filter((s: any) => s.grades?.length > 0)
              .reduce((sum: number, s: any) => sum + (s.grades[0]?.points_earned || 0), 0) / 
            Math.max(assignment.submissions.filter((s: any) => s.grades?.length > 0).length, 1)
          : 0
      }));
    },
    enabled: !!user?.id,
  });

  if (user?.role !== 'teacher') {
    return <div>Access denied</div>;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'homework': return 'bg-blue-100 text-blue-800';
      case 'quiz': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'exam': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAssignments = assignments?.length || 0;
  const totalSubmissions = assignments?.reduce((sum, a) => sum + a.total_submissions, 0) || 0;
  const pendingGrades = assignments?.reduce((sum, a) => sum + (a.total_submissions - a.graded_submissions), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Book</h1>
            <p className="text-gray-600">Manage student grades and assessments</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Grades</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingGrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Grading Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalSubmissions > 0 ? Math.round(((totalSubmissions - pendingGrades) / totalSubmissions) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Assignments to Grade
            </CardTitle>
            <CardDescription>
              Click on an assignment to grade student submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading assignments...</div>
            ) : assignments?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No published assignments yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Graded</TableHead>
                    <TableHead>Avg Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments?.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assignment.title}</div>
                          <div className="text-sm text-gray-500">
                            {assignment.max_points} points
                          </div>
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
                        {assignment.due_date ? (
                          format(new Date(assignment.due_date), 'MMM dd, yyyy')
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{assignment.total_submissions}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{assignment.graded_submissions}</span>
                          <span className="text-gray-500">
                            ({assignment.total_submissions > 0 
                              ? Math.round((assignment.graded_submissions / assignment.total_submissions) * 100) 
                              : 0}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.graded_submissions > 0 ? (
                          <span className="font-medium">
                            {assignment.average_grade.toFixed(1)}/{assignment.max_points}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => setSelectedAssignment(assignment.id)}
                          disabled={assignment.total_submissions === 0}
                        >
                          Grade
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Grading Dialog */}
        {selectedAssignment && (
          <Dialog open={true} onOpenChange={() => setSelectedAssignment(null)}>
            <DialogContent className="sm:max-w-[95vw] max-h-[95vh] overflow-y-auto">
              <TeacherGradingInterface 
                assignmentId={selectedAssignment}
                onClose={() => setSelectedAssignment(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
