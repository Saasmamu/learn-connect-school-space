
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Video, Plus, Search, Upload, Play, Clock, Eye, FolderOpen, MessageCircle, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoAnnotations } from '@/components/video/VideoAnnotations';
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics';

const videoSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  video_url: z.string().url('Please enter a valid URL'),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  duration_seconds: z.number().min(1).optional(),
  video_quality: z.enum(['SD', 'HD', '4K']).optional(),
});

type VideoFormData = z.infer<typeof videoSchema>;

interface VideoWithProfile {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  video_quality: string;
  upload_status: string;
  created_at: string;
  profiles?: Array<{
    full_name: string;
  }>;
  video_processing_jobs?: Array<{
    processing_status: string;
    progress_percentage: number;
  }>;
}

export const VideoLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { recordActivity } = useLearningAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoWithProfile | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoWithProfile | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration_seconds: 0,
      video_quality: 'HD',
    },
  });

  // Fetch video content based on user role
  const { data: videos, isLoading } = useQuery({
    queryKey: ['video-content', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('video_content')
        .select(`
          *,
          profiles!video_content_uploaded_by_fkey(full_name),
          video_processing_jobs(processing_status, progress_percentage)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('upload_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VideoWithProfile[];
    },
    enabled: !!user,
  });

  // Create/Update video mutation
  const saveVideoMutation = useMutation({
    mutationFn: async (videoData: VideoFormData) => {
      const saveData = {
        title: videoData.title,
        description: videoData.description || null,
        video_url: videoData.video_url,
        thumbnail_url: videoData.thumbnail_url || null,
        duration_seconds: videoData.duration_seconds || null,
        video_quality: videoData.video_quality || 'HD',
        uploaded_by: user?.id,
        upload_status: 'completed',
      };

      if (editingVideo) {
        const { error } = await supabase
          .from('video_content')
          .update(saveData)
          .eq('id', editingVideo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('video_content')
          .insert(saveData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-content'] });
      toast({
        title: "Success",
        description: editingVideo ? "Video updated successfully" : "Video added successfully",
      });
      setIsDialogOpen(false);
      setEditingVideo(null);
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

  const onSubmit = (values: VideoFormData) => {
    saveVideoMutation.mutate(values);
  };

  const openEditDialog = (video: VideoWithProfile) => {
    setEditingVideo(video);
    form.reset({
      title: video.title,
      description: video.description || '',
      video_url: video.video_url || '',
      thumbnail_url: video.thumbnail_url || '',
      duration_seconds: video.duration_seconds || 0,
      video_quality: (video.video_quality || 'HD') as 'SD' | 'HD' | '4K',
    });
    setIsDialogOpen(true);
  };

  const handleVideoPlay = (video: VideoWithProfile) => {
    setSelectedVideo(video);
    
    // Record video watch activity
    recordActivity.mutate({
      classId: 'video-library', // Use a default class ID for video library
      activityType: 'video_watch',
      metadata: { video_id: video.id, video_title: video.title }
    });
  };

  const handleVideoTimeUpdate = (time: number) => {
    setCurrentVideoTime(time);
  };

  const filteredVideos = videos?.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const canManageVideos = user?.role === 'admin' || user?.role === 'teacher';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Video Library</h1>
            <p className="text-gray-600">
              {user?.role === 'student' ? 'Interactive video learning with annotations and progress tracking' : 'Manage video content with advanced features'}
            </p>
          </div>
          {canManageVideos && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingVideo(null); form.reset(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Video
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
                  <DialogDescription>
                    {editingVideo ? 'Update video information' : 'Add a new video to the library'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Introduction to Arabic Grammar" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="video_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://youtube.com/watch?v=..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration_seconds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (seconds)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                placeholder="3600" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="video_quality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video Quality</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select quality" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SD">SD (480p)</SelectItem>
                                <SelectItem value="HD">HD (720p)</SelectItem>
                                <SelectItem value="4K">4K (2160p)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="thumbnail_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thumbnail URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/thumbnail.jpg" />
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
                            <Textarea {...field} placeholder="Video description..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={saveVideoMutation.isPending}>
                        {editingVideo ? 'Update' : 'Add'} Video
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Enhanced Video Player and Annotations */}
        {selectedVideo && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedVideo.title}</span>
                <Button
                  variant="outline"
                  onClick={() => setSelectedVideo(null)}
                >
                  Close Player
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="player" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="player">Video Player</TabsTrigger>
                  <TabsTrigger value="annotations">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Annotations
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Progress
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="player" className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Play className="h-16 w-16 mx-auto mb-4" />
                      <p>Video Player Placeholder</p>
                      <p className="text-sm text-gray-300">
                        In a real implementation, this would be a video player component
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => window.open(selectedVideo.video_url, '_blank')}
                      >
                        Open Video
                      </Button>
                    </div>
                  </div>
                  {selectedVideo.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-700">{selectedVideo.description}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="annotations">
                  <VideoAnnotations
                    videoContentId={selectedVideo.id}
                    currentTimestamp={currentVideoTime}
                    onSeekTo={(timestamp) => {
                      setCurrentVideoTime(timestamp);
                      // In a real video player, this would seek to the timestamp
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Video Progress Analytics</CardTitle>
                      <CardDescription>
                        Track your learning progress for this video
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Watch Time</span>
                          <Badge variant="outline">
                            {formatDuration(currentVideoTime)} / {formatDuration(selectedVideo.duration_seconds || 0)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Completion</span>
                          <Badge variant="outline">
                            {selectedVideo.duration_seconds ? 
                              Math.round((currentVideoTime / selectedVideo.duration_seconds) * 100) : 0}%
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>💡 Add annotations to remember key points</p>
                          <p>📊 Your progress is automatically tracked</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Videos</SelectItem>
                  <SelectItem value="completed">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {filteredVideos.length}
                </div>
                <div className="text-sm text-gray-600">Total Videos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(filteredVideos.reduce((acc, video) => acc + (video.duration_seconds || 0), 0) / 3600)}h
                </div>
                <div className="text-sm text-gray-600">Total Duration</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Videos Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5" />
              Enhanced Video Content
            </CardTitle>
            <CardDescription>
              {user?.role === 'student' ? 'Interactive video content with annotations and progress tracking' : 'Manage your enhanced video library'}
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
                    <TableHead>Duration</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <div className="flex items-start space-x-3">
                          {video.thumbnail_url ? (
                            <img 
                              src={video.thumbnail_url} 
                              alt={video.title}
                              className="w-16 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <Video className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{video.title}</div>
                            <div className="text-sm text-gray-500">{video.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {video.duration_seconds ? formatDuration(video.duration_seconds) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{video.video_quality}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          video.upload_status === 'completed' ? "default" : 
                          video.upload_status === 'processing' ? "secondary" : 
                          "destructive"
                        }>
                          {video.upload_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {video.profiles && video.profiles.length > 0 ? video.profiles[0].full_name : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {new Date(video.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVideoPlay(video)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          {canManageVideos && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(video)}
                            >
                              Edit
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
      </div>
    </div>
  );
};
