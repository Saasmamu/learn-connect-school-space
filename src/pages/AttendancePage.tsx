
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Search, Plus, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);

  // Fetch user's classes
  const { data: userClasses } = useQuery({
    queryKey: ['user-classes-attendance', user?.role],
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

  // Fetch students for selected class (for teachers/admins)
  const { data: classStudents } = useQuery({
    queryKey: ['class-students', selectedClass],
    queryFn: async () => {
      if (selectedClass === 'all' || user?.role === 'student') return [];
      
      const { data, error } = await supabase
        .from('student_classes')
        .select('profiles!student_classes_student_id_fkey(id, full_name, email)')
        .eq('class_id', selectedClass);
      
      if (error) throw error;
      return data.map(sc => sc.profiles).filter(Boolean);
    },
    enabled: selectedClass !== 'all' && user?.role !== 'student',
  });

  // Fetch attendance records
  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ['attendance', selectedClass, selectedDate.toDateString(), user?.role],
    queryFn: async () => {
      if (selectedClass === 'all') return [];

      let query = supabase
        .from('attendance')
        .select(`
          *,
          profiles!attendance_student_id_fkey(full_name, email),
          profiles!attendance_marked_by_fkey(full_name)
        `)
        .eq('class_id', selectedClass)
        .eq('attendance_date', format(selectedDate, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false });

      if (user?.role === 'student') {
        query = query.eq('student_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: selectedClass !== 'all',
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status, notes }: { studentId: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          class_id: selectedClass,
          student_id: studentId,
          attendance_date: format(selectedDate, 'yyyy-MM-dd'),
          status,
          notes: notes || null,
          marked_by: user?.id,
        }, {
          onConflict: 'class_id,student_id,attendance_date'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Success",
        description: "Attendance marked successfully",
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

  // Bulk mark attendance
  const markAllPresentMutation = useMutation({
    mutationFn: async () => {
      if (!classStudents) return;
      
      const attendanceRecords = classStudents.map(student => ({
        class_id: selectedClass,
        student_id: student.id,
        attendance_date: format(selectedDate, 'yyyy-MM-dd'),
        status: 'present',
        marked_by: user?.id,
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'class_id,student_id,attendance_date'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Success",
        description: "All students marked as present",
      });
    },
  });

  const getAttendanceForStudent = (studentId: string) => {
    return attendanceRecords?.find(record => record.student_id === studentId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'excused':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canMarkAttendance = user?.role === 'admin' || user?.role === 'teacher';

  // Calculate attendance stats
  const attendanceStats = attendanceRecords ? {
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    excused: attendanceRecords.filter(r => r.status === 'excused').length,
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600">
              {user?.role === 'student' ? 'View your attendance record' : 'Track and manage student attendance'}
            </p>
          </div>
          {canMarkAttendance && selectedClass !== 'all' && (
            <Button 
              onClick={() => markAllPresentMutation.mutate()}
              disabled={markAllPresentMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Present
            </Button>
          )}
        </div>

        {/* Filters and Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Card>
            <CardContent className="p-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Stats */}
        {attendanceStats && canMarkAttendance && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
                  <div className="text-sm text-gray-600">Present</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
                  <div className="text-sm text-gray-600">Absent</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
                  <div className="text-sm text-gray-600">Late</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{attendanceStats.excused}</div>
                  <div className="text-sm text-gray-600">Excused</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              {user?.role === 'student' ? 'My Attendance' : 'Class Attendance'}
            </CardTitle>
            <CardDescription>
              Attendance for {format(selectedDate, 'MMMM dd, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedClass === 'all' ? (
              <div className="text-center py-8 text-gray-500">
                Please select a class to view attendance
              </div>
            ) : user?.role === 'student' ? (
              // Student view - show their own attendance
              <div className="space-y-4">
                {attendanceRecords?.length > 0 ? (
                  attendanceRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Attendance Status</div>
                          <div className="text-sm text-gray-500">
                            Marked by {record.profiles?.full_name || 'System'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-2">
                          <div className="text-sm font-medium">Notes:</div>
                          <div className="text-sm text-gray-600">{record.notes}</div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No attendance record for this date
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              // Teacher/Admin view - show all students
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Marked By</TableHead>
                    {canMarkAttendance && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents?.filter(student =>
                    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((student) => {
                    const attendance = getAttendanceForStudent(student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          {attendance ? (
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(attendance.status)}
                              <Badge className={getStatusColor(attendance.status)}>
                                {attendance.status}
                              </Badge>
                            </div>
                          ) : (
                            <Badge variant="secondary">Not marked</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {attendance?.notes || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {attendance?.profiles?.full_name || '-'}
                        </TableCell>
                        {canMarkAttendance && (
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendanceMutation.mutate({
                                  studentId: student.id,
                                  status: 'present'
                                })}
                                disabled={markAttendanceMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendanceMutation.mutate({
                                  studentId: student.id,
                                  status: 'absent'
                                })}
                                disabled={markAttendanceMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendanceMutation.mutate({
                                  studentId: student.id,
                                  status: 'late'
                                })}
                                disabled={markAttendanceMutation.isPending}
                              >
                                <Clock className="h-4 w-4 text-yellow-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendanceMutation.mutate({
                                  studentId: student.id,
                                  status: 'excused'
                                })}
                                disabled={markAttendanceMutation.isPending}
                              >
                                <AlertCircle className="h-4 w-4 text-blue-500" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
