
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar } from 'lucide-react';

interface StudentCardProps {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  enrolled_classes?: string[];
}

export const StudentCard: React.FC<StudentCardProps> = ({
  full_name,
  email,
  avatar_url,
  phone,
  date_of_birth,
  enrolled_classes = [],
}) => {
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar_url} alt={full_name} />
            <AvatarFallback>
              {full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Student Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{full_name}</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
            
            {/* Age */}
            {date_of_birth && (
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {calculateAge(date_of_birth)} years old
              </p>
            )}

            {/* Enrolled Classes */}
            {enrolled_classes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {enrolled_classes.slice(0, 2).map((className, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {className}
                  </Badge>
                ))}
                {enrolled_classes.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{enrolled_classes.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Contact Actions */}
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`mailto:${email}`, '_blank')}
            >
              <Mail className="h-4 w-4" />
            </Button>
            {phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${phone}`, '_blank')}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
