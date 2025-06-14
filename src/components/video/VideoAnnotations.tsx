
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Bookmark, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoAnnotationsProps {
  videoContentId: string;
  currentTimestamp: number;
  onSeekTo: (timestamp: number) => void;
}

interface Annotation {
  id: string;
  timestamp_seconds: number;
  content: string;
  annotation_type: 'note' | 'question' | 'bookmark';
  user_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export const VideoAnnotations: React.FC<VideoAnnotationsProps> = ({
  videoContentId,
  currentTimestamp,
  onSeekTo
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    content: '',
    type: 'note' as 'note' | 'question' | 'bookmark'
  });

  // Fetch annotations
  const { data: annotations, isLoading } = useQuery({
    queryKey: ['video-annotations', videoContentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_annotations')
        .select(`
          *,
          profiles!inner(full_name)
        `)
        .eq('video_content_id', videoContentId)
        .order('timestamp_seconds', { ascending: true });
      
      if (error) throw error;
      return data as Annotation[];
    }
  });

  // Add annotation mutation
  const addAnnotationMutation = useMutation({
    mutationFn: async (annotation: {
      content: string;
      type: 'note' | 'question' | 'bookmark';
      timestamp: number;
    }) => {
      const { error } = await supabase
        .from('video_annotations')
        .insert({
          video_content_id: videoContentId,
          user_id: user?.id,
          timestamp_seconds: Math.floor(annotation.timestamp),
          content: annotation.content,
          annotation_type: annotation.type
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-annotations', videoContentId] });
      toast({
        title: "Success",
        description: "Annotation added successfully"
      });
      setIsAdding(false);
      setNewAnnotation({ content: '', type: 'note' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete annotation mutation
  const deleteAnnotationMutation = useMutation({
    mutationFn: async (annotationId: string) => {
      const { error } = await supabase
        .from('video_annotations')
        .delete()
        .eq('id', annotationId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-annotations', videoContentId] });
      toast({
        title: "Success",
        description: "Annotation deleted successfully"
      });
    }
  });

  const handleAddAnnotation = () => {
    if (!newAnnotation.content.trim()) return;
    
    addAnnotationMutation.mutate({
      content: newAnnotation.content,
      type: newAnnotation.type,
      timestamp: currentTimestamp
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <HelpCircle className="h-4 w-4" />;
      case 'bookmark':
        return <Bookmark className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getAnnotationColor = (type: string) => {
    switch (type) {
      case 'question':
        return 'text-blue-600';
      case 'bookmark':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading annotations...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Video Annotations</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={!user}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new annotation */}
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                At {formatTime(Math.floor(currentTimestamp))}
              </span>
              <Select
                value={newAnnotation.type}
                onValueChange={(value: 'note' | 'question' | 'bookmark') =>
                  setNewAnnotation(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="bookmark">Bookmark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Add your annotation..."
              value={newAnnotation.content}
              onChange={(e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value }))}
              rows={3}
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleAddAnnotation}
                disabled={!newAnnotation.content.trim() || addAnnotationMutation.isPending}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Existing annotations */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {annotations && annotations.length > 0 ? (
            annotations.map((annotation) => (
              <div key={annotation.id} className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={getAnnotationColor(annotation.annotation_type)}>
                        {getAnnotationIcon(annotation.annotation_type)}
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto font-medium text-blue-600"
                        onClick={() => onSeekTo(annotation.timestamp_seconds)}
                      >
                        {formatTime(annotation.timestamp_seconds)}
                      </Button>
                      <Badge variant="outline" className="capitalize">
                        {annotation.annotation_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{annotation.content}</p>
                    <p className="text-xs text-gray-500">
                      By {annotation.profiles?.full_name || 'Anonymous'} • {' '}
                      {new Date(annotation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {annotation.user_id === user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAnnotationMutation.mutate(annotation.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              No annotations yet. Add your first note!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
