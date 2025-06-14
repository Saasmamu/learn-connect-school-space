
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadAssignmentProps {
  assignmentId: string;
  submissionId?: string;
  isTeacherView?: boolean;
  onSubmissionUpdate?: () => void;
}

interface AssignmentFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  profiles?: {
    full_name: string;
  };
}

export const FileUploadAssignment: React.FC<FileUploadAssignmentProps> = ({
  assignmentId,
  submissionId,
  isTeacherView = false,
  onSubmissionUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch assignment files
  const { data: files, isLoading } = useQuery({
    queryKey: ['assignment-files', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignment_files')
        .select(`
          *,
          profiles!assignment_files_uploaded_by_profiles_id_fkey(full_name)
        `)
        .eq('assignment_id', assignmentId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data as AssignmentFile[];
    }
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${assignmentId}/${user?.id}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('assignment-files')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assignment-files')
        .getPublicUrl(fileName);
      
      // Save file record
      const { error: dbError } = await supabase
        .from('assignment_files')
        .insert({
          assignment_id: assignmentId,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          uploaded_by: user?.id
        });
      
      if (dbError) throw dbError;
      
      return { fileName, publicUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-files', assignmentId] });
      toast({
        title: "Success",
        description: "File uploaded successfully"
      });
      setUploading(false);
      setUploadProgress(0);
      onSubmissionUpdate?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      setUploading(false);
      setUploadProgress(0);
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('assignment_files')
        .delete()
        .eq('id', fileId)
        .eq('uploaded_by', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-files', assignmentId] });
      toast({
        title: "Success",
        description: "File deleted successfully"
      });
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    uploadFileMutation.mutate(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading files...</div>;
  }

  const userFiles = files?.filter(file => file.uploaded_by === user?.id) || [];
  const allFiles = files || [];

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!isTeacherView && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Assignment Files</CardTitle>
            <CardDescription>
              Upload your assignment files (Max 10MB per file)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400">
                    <Upload className="h-4 w-4" />
                    <span>Choose File</span>
                  </div>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                />
              </div>
              
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isTeacherView ? 'All Submitted Files' : 'Your Files'}
          </CardTitle>
          <CardDescription>
            {isTeacherView 
              ? 'Files submitted by all students'
              : 'Files you have uploaded for this assignment'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(isTeacherView ? allFiles : userFiles).length > 0 ? (
              (isTeacherView ? allFiles : userFiles).map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.file_name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{formatFileSize(file.file_size)}</span>
                        {isTeacherView && (
                          <>
                            <span>•</span>
                            <span>by {file.profiles?.full_name || 'Anonymous'}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {file.uploaded_by === user?.id && !isTeacherView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFileMutation.mutate(file.id)}
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
                {isTeacherView ? 'No files submitted yet' : 'No files uploaded yet'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
