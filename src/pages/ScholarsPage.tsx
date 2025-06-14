
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeacherCard } from '@/components/profile/TeacherCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  specializations?: string[];
  years_experience?: number;
  education_background?: string;
  social_media_links?: any;
  email?: string;
  phone?: string;
}

export const ScholarsPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [allSpecializations, setAllSpecializations] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm, selectedSpecialization]);

  const fetchFeaturedTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .eq('is_featured', true);

      if (error) throw error;

      setTeachers(data || []);
      
      // Extract all specializations
      const specs = new Set<string>();
      data?.forEach(teacher => {
        if (teacher.specializations) {
          teacher.specializations.forEach((spec: string) => specs.add(spec));
        }
      });
      setAllSpecializations(Array.from(specs));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teachers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = teachers;

    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specializations?.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(teacher =>
        teacher.specializations?.includes(selectedSpecialization)
      );
    }

    setFilteredTeachers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="h-16 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Our Scholars & Teachers</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Meet our dedicated team of Islamic scholars and educators who are committed to 
          providing quality Islamic education and guidance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{teachers.length}</p>
              <p className="text-sm text-muted-foreground">Featured Teachers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Award className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{allSpecializations.length}</p>
              <p className="text-sm text-muted-foreground">Specializations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Search className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{filteredTeachers.length}</p>
              <p className="text-sm text-muted-foreground">Results Found</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, bio, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="md:w-64">
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full p-2 border border-input bg-background rounded-md"
              >
                <option value="">All Specializations</option>
                {allSpecializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Search: {searchTerm}</span>
                <button onClick={() => setSearchTerm('')} className="ml-1 text-xs">×</button>
              </Badge>
            )}
            {selectedSpecialization && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Specialization: {selectedSpecialization}</span>
                <button onClick={() => setSelectedSpecialization('')} className="ml-1 text-xs">×</button>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or clear the filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <TeacherCard key={teacher.id} {...teacher} />
          ))}
        </div>
      )}
    </div>
  );
};
