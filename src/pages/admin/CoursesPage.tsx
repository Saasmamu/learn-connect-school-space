
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Book, Plus, Search, Edit, Users, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  grade_level: z.string().min(1, 'Grade level is required'),
});

export const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      grade_level: '',
    },
  });

  // Fetch classes with enrollment counts
  const { data: classes, isLoading } = useQuery({
    queryKey: ['admin-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          student_classes(count),
          teacher_classes(
            profiles(full_name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: user?.role === 'admin',
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: z.infer<typeof formSchema>) => {
      const { error } = await supabase
        .from('classes')
        .insert(classData);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] });
      toast({
        title: "Success",
        description: "Class created successfully",
      });
      setIsDialogOpen(false);
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

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: async (classData: z.infer<typeof formSchema>) => {
      const { error } = await supabase
        .from('classes')
        .update(classData)
        .eq('id', editingClass.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] });
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
      setIsDialogOpen(false);
      setEditingClass(null);
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingClass) {
      updateClassMutation.mutate(values);
    } else {
      createClassMutation.mutate(values);
    }
  };

  const openEditDialog = (cls: any) => {
    setEditingClass(cls);
    form.reset({
      name: cls.name,
      description: cls.description || '',
      grade_level: cls.grade_level || '',
    });
    setIsDialogOpen(true);
  };

  const filteredClasses = classes?.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade_level?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600">Manage classes and courses</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingClass(null); form.reset(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
                <DialogDescription>
                  {editingClass ? 'Update class information' : 'Create a new class'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Advanced Mathematics" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="grade_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Grade 10" />
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
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Class description..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createClassMutation.isPending || updateClassMutation.isPending}
                    >
                      {editingClass ? 'Update' : 'Create'} Class
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search classes..."
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
                <div className="text-2xl font-bold text-green-600">
                  {classes?.reduce((sum, cls) => sum + (cls.student_classes?.length || 0), 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Total Enrollments</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {classes?.filter(cls => cls.teacher_classes?.length > 0).length || 0}
                </div>
                <div className="text-sm text-gray-600">Classes with Teachers</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="mr-2 h-5 w-5" />
              All Classes
            </CardTitle>
            <CardDescription>
              Manage course offerings and class information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cls.name}</div>
                          <div className="text-sm text-gray-500">{cls.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cls.grade_level}</Badge>
                      </TableCell>
                      <TableCell>
                        {cls.teacher_classes?.length > 0 ? (
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-sm">
                              {cls.teacher_classes[0].profiles?.full_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No teacher assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-blue-500" />
                          <span>{cls.student_classes?.length || 0} students</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(cls.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(cls)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
