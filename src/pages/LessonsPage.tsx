
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
import { BookOpen, Plus, Search, Edit, Play, Clock, Users, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoPlayer } from '@/components/video/VideoPlayer';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  content: z.string().optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  video_content_id: z.string().optional(),
  duration_minutes: z.number().min(1).optional(),
  class_id: z.string().min(1, 'Please select a class'),
  lesson_order: z.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

export const LessonsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [previewingVideo, setPreviewingVideo] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      video_url: '',
      video_content_id: '',
      duration_minutes: 60,
      class_id: '',
      lesson_order: 0,
    },
  });

  // Fetch user's classes based on role
  const { data: userClasses } = useQuery({
    queryKey: ['user-classes', user?.role],
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

  // Fetch available video content for lessons
  const { data: videoContent } = useQuery({
    queryKey: ['video-content-for-lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_content')
        .select('id, title, duration_seconds, thumbnail_url')
        .eq('upload_status', 'completed')
        .order('title');
      if (error) throw error;
      return data;
    },
    enabled: !!user && (user.role === 'admin' || user.role === 'teacher'),
  });

  // Fetch lessons based on user role and selected class
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', selectedClass],
    queryFn: async () => {
      let query = supabase
        .from('lessons')
        .select(`
          *,
          classes(name),
          profiles!lessons_created_by_fkey(full_name),
          video_content(id, title, video_url, thumbnail_url, duration_seconds)
        `)
        .order('lesson_order', { ascending: true });

      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
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

  // Create/Update lesson mutation
  const saveLessonMutation = useMutation({
    mutationFn: async (lessonData: FormData) => {
      const saveData = {
        title: lessonData.title,
        class_id: lessonData.class_id,
        video_url: lessonData.video_url || null,
        video_content_id: lessonData.video_content_id || null,
        description: lessonData.description || null,
        content: lessonData.content || null,
        duration_minutes: lessonData.duration_minutes,
        lesson_order: lessonData.lesson_order,
        created_by: user?.id,
      };

      if (editingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update(saveData)
          .eq('id', editingLesson.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert(saveData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast({
        title: "Success",
        description: editingLesson ? "Lesson updated successfully" : "Lesson created successfully",
      });
      setIsDialogOpen(false);
      setEditingLesson(null);
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

  // Publish/Unpublish lesson mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ lessonId, isPublished }: { lessonId: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: !isPublished })
        .eq('id', lessonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast({
        title: "Success",
        description: "Lesson status updated",
      });
    },
  });

  const onSubmit = (values: FormData) => {
    saveLessonMutation.mutate(values);
  };

  const openEditDialog = (lesson: any) => {
    setEditingLesson(lesson);
    form.reset({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      video_content_id: lesson.video_content_id || '',
      duration_minutes: lesson.duration_minutes || 60,
      class_id: lesson.class_id,
      lesson_order: lesson.lesson_order || 0,
    });
    setIsDialogOpen(true);
  };

  const filteredLessons = lessons?.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.classes?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const canManageLessons = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lesson Management</h1>
            <p className="text-gray-600">
              {user?.role === 'student' ? 'Access your course lessons' : 'Manage course content and lessons'}
            </p>
          </div>
          {canManageLessons && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingLesson(null); form.reset(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lesson
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
                  <DialogDescription>
                    {editingLesson ? 'Update lesson information' : 'Create a new lesson for your class'}
                  </DialogDescription>
                </DialogHeader>
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
                          <FormLabel>Lesson Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Introduction to Algebra" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="lesson_order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lesson Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                placeholder="0" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="duration_minutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                placeholder="60" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="video_content_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Content (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a video" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No video</SelectItem>
                              {videoContent?.map((video) => (
                                <SelectItem key={video.id} value={video.id}>
                                  {video.title}
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
                      name="video_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL (Optional - if not using video content)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://youtube.com/watch?v=..." />
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
                            <Textarea {...field} placeholder="Lesson description..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lesson Content</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={8} placeholder="Write your lesson content here..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={saveLessonMutation.isPending}>
                        {editingLesson ? 'Update' : 'Create'} Lesson
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search lessons..."
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
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredLessons.length}
                </div>
                <div className="text-sm text-gray-600">Total Lessons</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Lessons
            </CardTitle>
            <CardDescription>
              {user?.role === 'student' ? 'Your available lessons' : 'Manage course lessons and content'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Video</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    {canManageLessons && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-medium">#{lesson.lesson_order}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lesson.title}</div>
                          <div className="text-sm text-gray-500">{lesson.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lesson.classes?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {lesson.duration_minutes || 0} min
                        </div>
                      </TableCell>
                      <TableCell>
                        {lesson.video_content ? (
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm text-emerald-600">Attached</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewingVideo(lesson.video_content)}
                            >
                              Preview
                            </Button>
                          </div>
                        ) : lesson.video_url ? (
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-600">External</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No video</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={lesson.is_published ? "default" : "secondary"}>
                          {lesson.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>{lesson.profiles?.full_name}</TableCell>
                      {canManageLessons && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(lesson)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePublishMutation.mutate({
                                lessonId: lesson.id,
                                isPublished: lesson.is_published
                              })}
                            >
                              {lesson.is_published ? "Unpublish" : "Publish"}
                            </Button>
                            {(lesson.video_url || lesson.video_content) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (lesson.video_content) {
                                    setPreviewingVideo(lesson.video_content);
                                  } else if (lesson.video_url) {
                                    window.open(lesson.video_url, '_blank');
                                  }
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
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

        {/* Video Preview Dialog */}
        {previewingVideo && (
          <Dialog open={!!previewingVideo} onOpenChange={() => setPreviewingVideo(null)}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Video Preview</DialogTitle>
              </DialogHeader>
              <VideoPlayer
                videoContent={previewingVideo}
                className="w-full"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
