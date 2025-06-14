
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Users,
  BookOpen,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch instructor's courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_enrollments (count),
          course_lessons (count)
        `)
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 mt-2">Manage and track your created courses</p>
            </div>
            <Button onClick={() => navigate('/admin/courses/create')} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Course
            </Button>
          </div>
        </div>
      </section>

      {/* Search and Stats */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search your courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Total: {courses.length}</span>
              <span>Published: {courses.filter(c => c.is_published).length}</span>
              <span>Public: {courses.filter(c => c.is_public).length}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No courses found' : 'No courses created yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria.' 
                  : 'Start by creating your first course to share knowledge with students.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/admin/courses/create')} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course: any) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2">
                        {course.is_published ? (
                          <Badge variant="default" className="bg-green-100 text-green-700">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                        {course.is_public && (
                          <Badge variant="outline">Public</Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{course.course_enrollments?.[0]?.count || 0} students</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span>{course.course_lessons?.[0]?.count || 0} lessons</span>
                        </div>
                      </div>
                      
                      {course.category && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">Category:</span>
                          <span className="ml-2">{course.category}</span>
                        </div>
                      )}

                      {course.price && (
                        <div className="text-emerald-600 font-semibold">
                          ${course.price}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
