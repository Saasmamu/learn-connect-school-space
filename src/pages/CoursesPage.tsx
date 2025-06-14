
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Play,
  BookOpen,
  Award,
  Calendar,
  CheckCircle
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'quran', label: 'Quran Studies' },
    { value: 'arabic', label: 'Arabic Language' },
    { value: 'islamic-studies', label: 'Islamic Studies' },
    { value: 'hadith', label: 'Hadith Studies' },
    { value: 'fiqh', label: 'Islamic Jurisprudence' }
  ];

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  // Fetch public courses from database
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id (
            full_name
          ),
          course_enrollments (count),
          course_lessons (count)
        `)
        .eq('is_published', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="absolute inset-0 islamic-pattern opacity-20"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            Islamic Courses
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover our comprehensive collection of Islamic education courses designed to deepen 
            your knowledge and strengthen your faith.
          </p>
          <Badge className="text-lg px-6 py-2 bg-emerald-100 text-emerald-700">
            {courses.length}+ Courses Available • {courses.reduce((total, course) => total + (course.course_enrollments?.[0]?.count || 0), 0)}+ Students Enrolled
          </Badge>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course: any) => (
              <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-emerald-600" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'All Levels'}
                    </Badge>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm ml-1 text-gray-600">4.8</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                        {course.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'IN'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{course.profiles?.full_name || 'Instructor'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-4">
                    {course.description || 'Comprehensive course designed to enhance your Islamic knowledge.'}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{course.duration || '8 weeks'}</span>
                      </div>
                      <div className="flex items-center">
                        <Play className="h-4 w-4 mr-1" />
                        <span>{course.course_lessons?.[0]?.count || 0} lessons</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course.course_enrollments?.[0]?.count || 0} students</span>
                      </div>
                      <div className="text-emerald-600 font-semibold">
                        {course.price ? `$${course.price}` : 'Free'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center text-xs text-gray-600">
                      <CheckCircle className="h-3 w-3 text-emerald-500 mr-1" />
                      <span>Certificate upon completion</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <CheckCircle className="h-3 w-3 text-emerald-500 mr-1" />
                      <span>Access to instructor</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <CheckCircle className="h-3 w-3 text-emerald-500 mr-1" />
                      <span>Lifetime access</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      Enroll Now
                    </Button>
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Our academic advisors can help you choose the right courses for your learning journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Consultation
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-emerald-600">
              Contact Academic Advisor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
