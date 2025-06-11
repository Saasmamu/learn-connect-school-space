
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserCheck, Plus, Search, Book, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TeachersPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Fetch teachers
  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: user?.role === 'admin',
  });

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: user?.role === 'admin',
  });

  // Fetch teacher assignments
  const { data: assignments } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_classes')
        .select(`
          *,
          classes(name, grade_level),
          profiles(full_name, email)
        `);
      
      if (error) throw error;
      return data;
    },
    enabled: user?.role === 'admin',
  });

  // Assign teacher to class mutation
  const assignTeacherMutation = useMutation({
    mutationFn: async ({ teacherId, classId }: { teacherId: string; classId: string }) => {
      const { error } = await supabase
        .from('teacher_classes')
        .insert({
          teacher_id: teacherId,
          class_id: classId,
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toast({
        title: "Success",
        description: "Teacher assigned to class successfully",
      });
      setIsAssignDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove teacher assignment
  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('teacher_classes')
        .delete()
        .eq('id', assignmentId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toast({
        title: "Success",
        description: "Teacher assignment removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredTeachers = teachers?.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getTeacherClasses = (teacherId: string) => {
    return assignments?.filter(assignment => assignment.teacher_id === teacherId) || [];
  };

  const getUnassignedClasses = (teacherId: string) => {
    const teacherClassIds = getTeacherClasses(teacherId).map(assignment => assignment.class_id);
    return classes?.filter(cls => !teacherClassIds.includes(cls.id)) || [];
  };

  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
            <p className="text-gray-600">Manage teacher assignments and classes</p>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {teachers?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Teachers</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {classes?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Classes</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {assignments?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Assignments</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Teachers & Class Assignments
            </CardTitle>
            <CardDescription>
              Manage teacher class assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teachersLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Classes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => {
                    const teacherClasses = getTeacherClasses(teacher.id);
                    return (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-green-100 text-green-700">
                                {teacher.full_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{teacher.full_name}</div>
                              <div className="text-sm text-gray-500">
                                Joined {new Date(teacher.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacherClasses.length > 0 ? (
                              teacherClasses.map((assignment: any) => (
                                <Badge key={assignment.id} variant="secondary" className="text-xs">
                                  {assignment.classes?.name}
                                  <button
                                    onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                                    className="ml-1 text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">No classes assigned</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Assign Class
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Assign Class Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Class to {selectedTeacher?.full_name}</DialogTitle>
              <DialogDescription>
                Select a class to assign to this teacher
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {getUnassignedClasses(selectedTeacher?.id).length > 0 ? (
                getUnassignedClasses(selectedTeacher?.id).map((cls) => (
                  <Button
                    key={cls.id}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => assignTeacherMutation.mutate({
                      teacherId: selectedTeacher.id,
                      classId: cls.id
                    })}
                  >
                    <div className="text-left">
                      <div className="font-medium">{cls.name}</div>
                      <div className="text-sm text-gray-500">{cls.grade_level}</div>
                      <div className="text-xs text-gray-400">{cls.description}</div>
                    </div>
                  </Button>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  All classes are already assigned to this teacher
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
