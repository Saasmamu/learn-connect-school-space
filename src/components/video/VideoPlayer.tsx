
import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  videoContent: {
    id: string;
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
    duration_seconds?: number;
  };
  lessonId?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoContent, 
  lessonId, 
  className = "" 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);

  // Load watch history on component mount
  useEffect(() => {
    if (user && videoContent.id && lessonId) {
      loadWatchHistory();
    }
  }, [user, videoContent.id, lessonId]);

  // Set up progress tracking interval
  useEffect(() => {
    if (isPlaying && user && lessonId) {
      progressIntervalRef.current = setInterval(() => {
        updateWatchProgress();
      }, 5000); // Update every 5 seconds
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, user, lessonId]);

  const loadWatchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('video_watch_history')
        .select('watch_time_seconds, completed')
        .eq('user_id', user?.id)
        .eq('video_content_id', videoContent.id)
        .eq('lesson_id', lessonId)
        .single();

      if (data && !error) {
        setWatchProgress(data.watch_time_seconds);
        if (videoRef.current) {
          videoRef.current.currentTime = data.watch_time_seconds;
        }
      }
    } catch (error) {
      console.log('No watch history found or error loading:', error);
    }
  };

  const updateWatchProgress = async () => {
    if (!videoRef.current || !user || !lessonId) return;

    const currentTime = Math.floor(videoRef.current.currentTime);
    const isCompleted = duration > 0 && (currentTime / duration) >= 0.9; // 90% completion

    try {
      const { error } = await supabase.rpc('update_video_watch_progress', {
        p_video_content_id: videoContent.id,
        p_lesson_id: lessonId,
        p_watch_time_seconds: currentTime,
        p_completed: isCompleted
      });

      if (error) {
        console.error('Error updating watch progress:', error);
      } else {
        setWatchProgress(currentTime);
        if (isCompleted) {
          toast({
            title: "Video Completed!",
            description: "Great job completing this lesson video.",
          });
        }
      }
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const watchProgressPercentage = duration > 0 ? (watchProgress / duration) * 100 : 0;

  // Check if it's a YouTube video
  const isYouTubeVideo = videoContent.video_url.includes('youtube.com') || videoContent.video_url.includes('youtu.be');

  if (isYouTubeVideo) {
    // For YouTube videos, extract video ID and embed
    const getYouTubeEmbedUrl = (url: string) => {
      const videoId = url.includes('watch?v=') 
        ? url.split('watch?v=')[1].split('&')[0]
        : url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    };

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{videoContent.title}</span>
            {watchProgressPercentage > 0 && (
              <Badge variant="outline">
                {Math.round(watchProgressPercentage)}% watched
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full">
            <iframe
              src={getYouTubeEmbedUrl(videoContent.video_url)}
              title={videoContent.title}
              className="w-full h-full rounded-lg"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </div>
          {videoContent.description && (
            <p className="mt-4 text-gray-600">{videoContent.description}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{videoContent.title}</span>
          {watchProgressPercentage > 0 && (
            <Badge variant="outline">
              {Math.round(watchProgressPercentage)}% watched
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={videoContent.video_url}
            poster={videoContent.thumbnail_url}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="relative">
                <Progress value={progressPercentage} className="h-2" />
                {/* Watch progress indicator */}
                <div 
                  className="absolute top-0 h-2 bg-emerald-500/50 rounded-full"
                  style={{ width: `${watchProgressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-white text-sm mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMuteToggle}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                {watchProgress > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSeek(watchProgress)}
                    className="text-white hover:bg-white/20"
                    title="Resume from last position"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {videoContent.description && (
          <p className="text-gray-600">{videoContent.description}</p>
        )}
      </CardContent>
    </Card>
  );
};
