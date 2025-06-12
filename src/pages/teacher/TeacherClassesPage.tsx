
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Book, Users, Calendar, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherClassesPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch teacher's assigned classes
  const { data: teacherClasses, isLoading } = useQuery({
    queryKey: ['teacher-classes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_classes')
        .select(`
          *,
          classes(
            id,
            name,
            grade_level,
            description
          )
        `)
        .eq('teacher_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && user?.role === 'teacher',
  });

  // Fetch student count for each class
  const { data: studentCounts } = useQuery({
    queryKey: ['class-student-counts'],
    queryFn: async () => {
      if (!teacherClasses?.length) return {};
      
      const classIds = teacherClasses.map(tc => tc.class_id);
      const { data, error } = await supabase
        .from('student_classes')
        .select('class_id')
        .in('class_id', classIds);
      
      if (error) throw error;
      
      // Count students per class
      const counts: Record<string, number> = {};
      data.forEach(sc => {
        counts[sc.class_id] = (counts[sc.class_id] || 0) + 1;
      });
      
      return counts;
    },
    enabled: !!teacherClasses?.length,
  });

  if (user?.role !== 'teacher') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600">Manage your assigned classes and students</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Book className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold">{teacherClasses?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">
                    {studentCounts ? Object.values(studentCounts).reduce((a, b) => a + b, 0) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Classes</p>
                  <p className="text-2xl font-bold">{teacherClasses?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="mr-2 h-5 w-5" />
              Your Assigned Classes
            </CardTitle>
            <CardDescription>
              Classes you are currently teaching
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : teacherClasses?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No classes assigned yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherClasses?.map((teacherClass) => (
                    <TableRow key={teacherClass.id}>
                      <TableCell>
                        <div className="font-medium">{teacherClass.classes?.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{teacherClass.classes?.grade_level}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {studentCounts?.[teacherClass.class_id] || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {teacherClass.classes?.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/lessons?class=${teacherClass.class_id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Lessons
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/assignments?class=${teacherClass.class_id}`}>
                              <Plus className="h-4 w-4 mr-1" />
                              Add Assignment
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
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
