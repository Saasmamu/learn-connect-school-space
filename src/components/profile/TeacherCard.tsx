
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone } from 'lucide-react';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

interface TeacherCardProps {
  id: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  specializations?: string[];
  years_experience?: number;
  education_background?: string;
  social_media_links?: SocialLinks;
  email?: string;
  phone?: string;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
  full_name,
  bio,
  avatar_url,
  specializations = [],
  years_experience,
  education_background,
  social_media_links = {},
  email,
  phone,
}) => {
  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={avatar_url} alt={full_name} />
            <AvatarFallback className="text-lg">
              {full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <h3 className="text-xl font-semibold mb-2">{full_name}</h3>

          {/* Experience */}
          {years_experience && (
            <p className="text-sm text-muted-foreground mb-3">
              {years_experience} years of experience
            </p>
          )}

          {/* Specializations */}
          {specializations.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4 justify-center">
              {specializations.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {specializations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{specializations.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Bio */}
          {bio && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {bio}
            </p>
          )}

          {/* Education */}
          {education_background && (
            <p className="text-xs text-muted-foreground mb-4 italic">
              {education_background}
            </p>
          )}

          {/* Social Links */}
          <div className="flex space-x-2 mb-4">
            {Object.entries(social_media_links).map(([platform, url]) => {
              if (!url) return null;
              const IconComponent = socialIcons[platform as keyof typeof socialIcons];
              return (
                <Button
                  key={platform}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => window.open(url, '_blank')}
                >
                  <IconComponent className="h-4 w-4" />
                </Button>
              );
            })}
          </div>

          {/* Contact Buttons */}
          <div className="flex space-x-2 w-full">
            {email && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(`mailto:${email}`, '_blank')}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
            )}
            {phone && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(`tel:${phone}`, '_blank')}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
