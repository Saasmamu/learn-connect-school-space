
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Video, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface VideoContent {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  upload_status: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  video_count?: number;
}

interface PlaylistItem {
  id: string;
  video_content_id: string;
  sort_order: number;
  video_content: VideoContent;
}

export const VideoPlaylistManager: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const { toast } = useToast();

  // Form states
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    fetchPlaylists();
    fetchVideos();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('video_playlists')
        .select(`
          *,
          video_playlist_items(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const playlistsWithCount = data?.map(playlist => ({
        ...playlist,
        video_count: playlist.video_playlist_items?.[0]?.count || 0
      })) || [];

      setPlaylists(playlistsWithCount);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load playlists',
        variant: 'destructive',
      });
    }
  };

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('video_content')
        .select('*')
        .eq('upload_status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaylistItems = async (playlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('video_playlist_items')
        .select(`
          *,
          video_content(*)
        `)
        .eq('playlist_id', playlistId)
        .order('sort_order');

      if (error) throw error;
      setPlaylistItems(data || []);
    } catch (error) {
      console.error('Error fetching playlist items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load playlist items',
        variant: 'destructive',
      });
    }
  };

  const createPlaylist = async () => {
    try {
      const { data, error } = await supabase
        .from('video_playlists')
        .insert({
          name: playlistName,
          description: playlistDescription,
          is_public: isPublic,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Playlist created successfully',
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to create playlist',
        variant: 'destructive',
      });
    }
  };

  const updatePlaylist = async () => {
    if (!editingPlaylist) return;

    try {
      const { error } = await supabase
        .from('video_playlists')
        .update({
          name: playlistName,
          description: playlistDescription,
          is_public: isPublic,
        })
        .eq('id', editingPlaylist.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Playlist updated successfully',
      });

      setEditingPlaylist(null);
      resetForm();
      fetchPlaylists();
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update playlist',
        variant: 'destructive',
      });
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from('video_playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Playlist deleted successfully',
      });

      fetchPlaylists();
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
        setPlaylistItems([]);
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete playlist',
        variant: 'destructive',
      });
    }
  };

  const addVideoToPlaylist = async (videoId: string) => {
    if (!selectedPlaylist) return;

    try {
      const maxOrder = Math.max(...playlistItems.map(item => item.sort_order), -1);
      
      const { error } = await supabase
        .from('video_playlist_items')
        .insert({
          playlist_id: selectedPlaylist.id,
          video_content_id: videoId,
          sort_order: maxOrder + 1
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Video added to playlist',
      });

      fetchPlaylistItems(selectedPlaylist.id);
    } catch (error) {
      console.error('Error adding video to playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add video to playlist',
        variant: 'destructive',
      });
    }
  };

  const removeVideoFromPlaylist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('video_playlist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Video removed from playlist',
      });

      if (selectedPlaylist) {
        fetchPlaylistItems(selectedPlaylist.id);
      }
    } catch (error) {
      console.error('Error removing video from playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove video from playlist',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setPlaylistName('');
    setPlaylistDescription('');
    setIsPublic(false);
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setPlaylistName(playlist.name);
    setPlaylistDescription(playlist.description || '');
    setIsPublic(playlist.is_public);
    setIsCreateDialogOpen(true);
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    fetchPlaylistItems(playlist.id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading playlists...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Video Playlist Manager</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Playlist name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label htmlFor="isPublic">Make playlist public</label>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={editingPlaylist ? updatePlaylist : createPlaylist}
                  disabled={!playlistName.trim()}
                >
                  {editingPlaylist ? 'Update' : 'Create'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingPlaylist(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Playlists List */}
        <Card>
          <CardHeader>
            <CardTitle>My Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlaylist?.id === playlist.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectPlaylist(playlist)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{playlist.name}</h3>
                      {playlist.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {playlist.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">
                          {playlist.video_count} videos
                        </Badge>
                        {playlist.is_public ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPlaylist(playlist);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(playlist.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {playlists.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No playlists yet. Create your first playlist!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Playlist Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPlaylist ? selectedPlaylist.name : 'Select a Playlist'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPlaylist ? (
              <div className="space-y-4">
                {/* Current Videos in Playlist */}
                <div>
                  <h4 className="font-medium mb-2">Videos in Playlist</h4>
                  <div className="space-y-2">
                    {playlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 border rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <Video className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {item.video_content.title}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeVideoFromPlaylist(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {playlistItems.length === 0 && (
                      <p className="text-gray-500 text-sm">No videos in this playlist yet.</p>
                    )}
                  </div>
                </div>

                {/* Available Videos to Add */}
                <div>
                  <h4 className="font-medium mb-2">Add Videos</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {videos
                      .filter(video => !playlistItems.some(item => item.video_content_id === video.id))
                      .map((video) => (
                        <div
                          key={video.id}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4" />
                            <span className="text-sm">{video.title}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addVideoToPlaylist(video.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a playlist from the left to manage its content.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
