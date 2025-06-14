
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FolderOpen, Plus, Video, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const playlistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  is_public: z.boolean().default(false),
});

type PlaylistFormData = z.infer<typeof playlistSchema>;

interface VideoPlaylistManagerProps {
  className?: string;
}

export const VideoPlaylistManager: React.FC<VideoPlaylistManagerProps> = ({ className = "" }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<any>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const form = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      name: '',
      description: '',
      is_public: false,
    },
  });

  // Fetch playlists
  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ['video-playlists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_playlists')
        .select(`
          *,
          profiles!video_playlists_created_by_fkey(full_name),
          video_playlist_items(
            id,
            video_content(id, title, thumbnail_url, duration_seconds)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch available videos for adding to playlist
  const { data: availableVideos } = useQuery({
    queryKey: ['available-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_content')
        .select('id, title, thumbnail_url, duration_seconds')
        .eq('upload_status', 'completed')
        .order('title');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Create/Update playlist mutation
  const savePlaylistMutation = useMutation({
    mutationFn: async (playlistData: PlaylistFormData) => {
      const saveData = {
        name: playlistData.name,
        description: playlistData.description || null,
        is_public: playlistData.is_public,
        created_by: user?.id,
      };

      if (editingPlaylist) {
        const { error } = await supabase
          .from('video_playlists')
          .update(saveData)
          .eq('id', editingPlaylist.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('video_playlists')
          .insert(saveData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-playlists'] });
      toast({
        title: "Success",
        description: editingPlaylist ? "Playlist updated successfully" : "Playlist created successfully",
      });
      setIsDialogOpen(false);
      setEditingPlaylist(null);
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

  // Add video to playlist mutation
  const addVideoToPlaylistMutation = useMutation({
    mutationFn: async ({ playlistId, videoId }: { playlistId: string; videoId: string }) => {
      // Get the next sort order
      const { data: existingItems } = await supabase
        .from('video_playlist_items')
        .select('sort_order')
        .eq('playlist_id', playlistId)
        .order('sort_order', { ascending: false })
        .limit(1);

      const nextSortOrder = existingItems && existingItems.length > 0 
        ? existingItems[0].sort_order + 1 
        : 0;

      const { error } = await supabase
        .from('video_playlist_items')
        .insert({
          playlist_id: playlistId,
          video_content_id: videoId,
          sort_order: nextSortOrder,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-playlists'] });
      toast({
        title: "Success",
        description: "Video added to playlist",
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

  // Remove video from playlist mutation
  const removeVideoFromPlaylistMutation = useMutation({
    mutationFn: async ({ playlistId, videoId }: { playlistId: string; videoId: string }) => {
      const { error } = await supabase
        .from('video_playlist_items')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('video_content_id', videoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-playlists'] });
      toast({
        title: "Success",
        description: "Video removed from playlist",
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

  const onSubmit = (values: PlaylistFormData) => {
    savePlaylistMutation.mutate(values);
  };

  const openEditDialog = (playlist: any) => {
    setEditingPlaylist(playlist);
    form.reset({
      name: playlist.name,
      description: playlist.description || '',
      is_public: playlist.is_public,
    });
    setIsDialogOpen(true);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canManagePlaylists = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Video Playlists</h2>
          <p className="text-gray-600">Organize videos into curated playlists</p>
        </div>
        {canManagePlaylists && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingPlaylist(null); form.reset(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}</DialogTitle>
                <DialogDescription>
                  {editingPlaylist ? 'Update playlist information' : 'Create a new video playlist'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Playlist Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Islamic History Series" />
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
                          <Textarea {...field} placeholder="Playlist description..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_public"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Public Playlist</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Make this playlist visible to all users
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={savePlaylistMutation.isPending}>
                      {editingPlaylist ? 'Update' : 'Create'} Playlist
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {playlistsLoading ? (
        <div className="text-center py-8">Loading playlists...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists?.map((playlist) => (
            <Card key={playlist.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-lg">{playlist.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {playlist.is_public ? (
                      <Eye className="h-4 w-4 text-green-600" title="Public playlist" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" title="Private playlist" />
                    )}
                    <Badge variant="outline">
                      {playlist.video_playlist_items?.length || 0} videos
                    </Badge>
                  </div>
                </div>
                <CardDescription>{playlist.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playlist.video_playlist_items?.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      {item.video_content?.thumbnail_url ? (
                        <img 
                          src={item.video_content.thumbnail_url} 
                          alt={item.video_content.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <Video className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.video_content?.title}</p>
                        <p className="text-xs text-gray-500">
                          {item.video_content?.duration_seconds 
                            ? formatDuration(item.video_content.duration_seconds)
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                  {playlist.video_playlist_items?.length > 3 && (
                    <p className="text-sm text-gray-500">
                      +{playlist.video_playlist_items.length - 3} more videos
                    </p>
                  )}
                </div>
                
                {canManagePlaylists && playlist.created_by === user?.id && (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(playlist)}
                    >
                      Edit
                    </Button>
                    <p className="text-xs text-gray-500">
                      Created by {playlist.profiles?.full_name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
