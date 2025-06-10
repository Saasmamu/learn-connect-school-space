
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

  const courses = [
    {
      id: 1,
      title: "Quran Recitation with Tajweed",
      instructor: "Ustaz Ahmed Hassan",
      category: "quran",
      level: "beginner",
      duration: "6 months",
      lessons: 24,
      students: 1250,
      rating: 4.9,
      price: "$150",
      description: "Learn proper Quranic recitation with Tajweed rules and beautiful pronunciation.",
      features: ["Live sessions", "One-on-one feedback", "Certificate upon completion"],
      image: "/placeholder-quran.jpg"
    },
    {
      id: 2,
      title: "Arabic Grammar Fundamentals",
      instructor: "Dr. Fatima Al-Zahra",
      category: "arabic",
      level: "beginner",
      duration: "4 months",
      lessons: 32,
      students: 890,
      rating: 4.8,
      price: "$120",
      description: "Master the fundamentals of Arabic grammar to understand the Quran better.",
      features: ["Interactive exercises", "Grammar worksheets", "Progress tracking"],
      image: "/placeholder-arabic.jpg"
    },
    {
      id: 3,
      title: "Islamic History: Golden Age",
      instructor: "Dr. Omar Ibn Rashid",
      category: "islamic-studies",
      level: "intermediate",
      duration: "8 months",
      lessons: 40,
      students: 670,
      rating: 4.7,
      price: "$180",
      description: "Explore the golden age of Islamic civilization and its contributions to the world.",
      features: ["Historical documents", "Interactive maps", "Discussion forums"],
      image: "/placeholder-history.jpg"
    },
    {
      id: 4,
      title: "Hadith Studies: Sahih Bukhari",
      instructor: "Sheikh Khalid Ibrahim",
      category: "hadith",
      level: "advanced",
      duration: "12 months",
      lessons: 60,
      students: 450,
      rating: 4.9,
      price: "$250",
      description: "In-depth study of Sahih Bukhari with authentic chain of narration.",
      features: ["Scholarly commentary", "Research projects", "Expert guidance"],
      image: "/placeholder-hadith.jpg"
    },
    {
      id: 5,
      title: "Islamic Jurisprudence (Fiqh)",
      instructor: "Dr. Abdullah Malik",
      category: "fiqh",
      level: "advanced",
      duration: "10 months",
      lessons: 50,
      students: 320,
      rating: 4.8,
      price: "$220",
      description: "Comprehensive study of Islamic jurisprudence and legal principles.",
      features: ["Case studies", "Legal analysis", "Practical applications"],
      image: "/placeholder-fiqh.jpg"
    },
    {
      id: 6,
      title: "Memorization Techniques (Hifz)",
      instructor: "Ustaza Aisha Rahman",
      category: "quran",
      level: "intermediate",
      duration: "Ongoing",
      lessons: "Unlimited",
      students: 780,
      rating: 4.9,
      price: "$200",
      description: "Effective techniques for Quran memorization with retention strategies.",
      features: ["Memory techniques", "Daily schedules", "Progress monitoring"],
      image: "/placeholder-hifz.jpg"
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

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
            50+ Courses Available • 18,000+ Students Enrolled
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
            {filteredCourses.map((course) => (
              <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-emerald-600" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </Badge>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm ml-1 text-gray-600">{course.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                        {course.instructor.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{course.instructor}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-4">
                    {course.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Play className="h-4 w-4 mr-1" />
                        <span>{course.lessons} lessons</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course.students.toLocaleString()} students</span>
                      </div>
                      <div className="text-emerald-600 font-semibold">
                        {course.price}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    {course.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-emerald-500 mr-1" />
                        <span>{feature}</span>
                      </div>
                    ))}
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
