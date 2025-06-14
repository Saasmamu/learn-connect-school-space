
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  education_background: z.string().optional(),
  years_experience: z.number().min(0).optional(),
  is_featured: z.boolean().optional(),
  specializations: z.array(z.string()).optional(),
  social_media_links: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  onSuccess?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      specializations: [],
      social_media_links: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
      },
      is_featured: false,
    },
  });

  const watchedSpecializations = watch('specializations') || [];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
      return;
    }

    if (data) {
      // Safely parse social_media_links with proper type checking
      const socialLinks = data.social_media_links as Record<string, any> || {};
      const parsedSocialLinks = {
        facebook: typeof socialLinks.facebook === 'string' ? socialLinks.facebook : '',
        instagram: typeof socialLinks.instagram === 'string' ? socialLinks.instagram : '',
        twitter: typeof socialLinks.twitter === 'string' ? socialLinks.twitter : '',
        linkedin: typeof socialLinks.linkedin === 'string' ? socialLinks.linkedin : '',
      };

      reset({
        full_name: data.full_name || '',
        email: data.email || '',
        bio: data.bio || '',
        phone: data.phone || '',
        address: data.address || '',
        date_of_birth: data.date_of_birth || '',
        education_background: data.education_background || '',
        years_experience: data.years_experience || undefined,
        is_featured: data.is_featured || false,
        specializations: data.specializations || [],
        social_media_links: parsedSocialLinks,
      });
      
      if (data.avatar_url) {
        setAvatarPreview(data.avatar_url);
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, avatarFile);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !watchedSpecializations.includes(newSpecialization.trim())) {
      setValue('specializations', [...watchedSpecializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setValue('specializations', watchedSpecializations.filter(s => s !== spec));
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      let avatarUrl = avatarPreview;

      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const updateData = {
        ...data,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarPreview} />
            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <Button type="button" variant="outline" onClick={handleAvatarUploadClick} className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload Photo</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input {...register('full_name')} />
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input {...register('email')} type="email" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input {...register('phone')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <Input {...register('date_of_birth')} type="date" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Textarea {...register('address')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Textarea {...register('bio')} placeholder="Tell us about yourself..." />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information (for teachers) */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Years of Experience</label>
              <Input 
                {...register('years_experience', { valueAsNumber: true })} 
                type="number" 
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Education Background</label>
            <Textarea {...register('education_background')} />
          </div>
          
          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium mb-1">Specializations</label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="Add a specialization"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              />
              <Button type="button" onClick={addSpecialization} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedSpecializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{spec}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSpecialization(spec)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-2">
            <Switch {...register('is_featured')} />
            <label className="text-sm font-medium">Show on public scholars page</label>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <Input {...register('social_media_links.facebook')} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <Input {...register('social_media_links.instagram')} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Twitter</label>
              <Input {...register('social_media_links.twitter')} placeholder="https://twitter.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              <Input {...register('social_media_links.linkedin')} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Updating...' : 'Update Profile'}
      </Button>
    </form>
  );
};
