
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Book, 
  Users, 
  Calendar, 
  Award, 
  Play, 
  FileText, 
  MessageSquare,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

export const Homepage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Book className="h-6 w-6" />,
      title: "Online Learning",
      description: "Access comprehensive Islamic education with modern learning tools"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Teachers",
      description: "Learn from qualified Islamic scholars and certified educators"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Flexible Schedule",
      description: "Study at your own pace with recorded and live sessions"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Certification",
      description: "Earn recognized certificates upon course completion"
    }
  ];

  const courses = [
    {
      title: "Quran Recitation",
      description: "Learn proper Tajweed and Quranic recitation",
      duration: "6 months",
      level: "Beginner",
      students: "1,200+"
    },
    {
      title: "Islamic History",
      description: "Comprehensive study of Islamic civilization",
      duration: "4 months",
      level: "Intermediate",
      students: "800+"
    },
    {
      title: "Arabic Language",
      description: "Master classical and modern Arabic",
      duration: "12 months",
      level: "All Levels",
      students: "2,500+"
    },
    {
      title: "Islamic Jurisprudence",
      description: "Understanding of Fiqh and Islamic law",
      duration: "8 months",
      level: "Advanced",
      students: "600+"
    }
  ];

  const achievements = [
    { number: "18,000+", label: "Students Enrolled" },
    { number: "500+", label: "Qualified Teachers" },
    { number: "50+", label: "Courses Available" },
    { number: "25+", label: "Countries Reached" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-30"></div>
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
            🌟 Welcome to Islamic Learning
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            Islamic Online
            <br />
            Madrasah
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Empowering students with authentic Islamic education through modern technology. 
            Join thousands of learners in their spiritual and academic journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Link to="/register">
                    Start Learning Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link to="/about">Learn More</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Why Choose Our Islamic Institute
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive Islamic education with modern learning methodologies 
              to help you excel in both religious and worldly knowledge.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Achievements</h2>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              Alhamdulillah, We Have Reached Over
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2 text-yellow-400">
                  {achievement.number}
                </div>
                <div className="text-emerald-100">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Our Arabic & Islamic Courses
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive range of Islamic studies designed to 
              deepen your understanding of faith and tradition.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {course.level}
                    </Badge>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {course.description}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Students:</span>
                      <span className="font-medium text-emerald-600">{course.students}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild size="lg">
              <Link to="/courses">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Islamic Learning Journey?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have transformed their lives through authentic Islamic education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/register">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="border-white text-white hover:bg-white hover:text-emerald-600">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
