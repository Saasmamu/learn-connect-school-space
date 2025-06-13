
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, GraduationCap, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ClassAssignments: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch teachers
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch class assignments
  const { data: classAssignments = [] } = useQuery({
    queryKey: ['class-assignments'],
    queryFn: async () => {
      const { data: studentAssignments, error: studentError } = await supabase
        .from('student_classes')
        .select(`
          id,
          student_id,
          class_id,
          enrolled_at,
          profiles:student_id (full_name, email),
          classes:class_id (name)
        `);

      const { data: teacherAssignments, error: teacherError } = await supabase
        .from('teacher_classes')
        .select(`
          id,
          teacher_id,
          class_id,
          assigned_at,
          profiles:teacher_id (full_name, email),
          classes:class_id (name)
        `);

      if (studentError || teacherError) throw studentError || teacherError;

      return {
        students: studentAssignments || [],
        teachers: teacherAssignments || [],
      };
    },
  });

  // Assign student to class
  const assignStudentMutation = useMutation({
    mutationFn: async ({ studentId, classId }: { studentId: string; classId: string }) => {
      const { error } = await supabase
        .from('student_classes')
        .insert({ student_id: studentId, class_id: classId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-assignments'] });
      setSelectedStudent('');
      setSelectedClass('');
      toast({ title: 'Student assigned to class successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to assign student to class',
        variant: 'destructive' 
      });
    },
  });

  // Assign teacher to class
  const assignTeacherMutation = useMutation({
    mutationFn: async ({ teacherId, classId }: { teacherId: string; classId: string }) => {
      const { error } = await supabase
        .from('teacher_classes')
        .insert({ teacher_id: teacherId, class_id: classId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-assignments'] });
      setSelectedTeacher('');
      setSelectedClass('');
      toast({ title: 'Teacher assigned to class successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to assign teacher to class',
        variant: 'destructive' 
      });
    },
  });

  // Remove assignment
  const removeAssignmentMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'student' | 'teacher' }) => {
      const table = type === 'student' ? 'student_classes' : 'teacher_classes';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-assignments'] });
      toast({ title: 'Assignment removed successfully!' });
    },
  });

  return (
    <div className="space-y-6">
      {/* Assignment Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assign Student */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assign Student to Class
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
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

            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name} ({student.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => assignStudentMutation.mutate({ 
                studentId: selectedStudent, 
                classId: selectedClass 
              })}
              disabled={!selectedClass || !selectedStudent || assignStudentMutation.isPending}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Student
            </Button>
          </CardContent>
        </Card>

        {/* Assign Teacher */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Assign Teacher to Class
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
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

            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.full_name} ({teacher.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => assignTeacherMutation.mutate({ 
                teacherId: selectedTeacher, 
                classId: selectedClass 
              })}
              disabled={!selectedClass || !selectedTeacher || assignTeacherMutation.isPending}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Teacher
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Current Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Student Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {classAssignments.students.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{assignment.profiles?.full_name}</div>
                    <div className="text-sm text-gray-600">{assignment.classes?.name}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAssignmentMutation.mutate({ 
                      id: assignment.id, 
                      type: 'student' 
                    })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teacher Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {classAssignments.teachers.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{assignment.profiles?.full_name}</div>
                    <div className="text-sm text-gray-600">{assignment.classes?.name}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAssignmentMutation.mutate({ 
                      id: assignment.id, 
                      type: 'teacher' 
                    })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
