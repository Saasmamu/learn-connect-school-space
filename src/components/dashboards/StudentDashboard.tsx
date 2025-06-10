
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Book,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Play,
  TrendingUp,
  Users,
  Award,
  CreditCard,
  Bell
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const upcomingClasses = [
    { subject: 'Quran Studies', time: '10:00 AM', teacher: 'Ustaz Ahmed', room: 'Virtual Room 1' },
    { subject: 'Arabic Grammar', time: '2:00 PM', teacher: 'Dr. Fatima', room: 'Virtual Room 3' },
    { subject: 'Islamic History', time: '4:00 PM', teacher: 'Ustaz Omar', room: 'Virtual Room 2' },
  ];

  const recentAssignments = [
    { title: 'Surah Al-Fatiha Recitation', subject: 'Quran Studies', dueDate: 'Tomorrow', status: 'pending' },
    { title: 'Essay on Prophet\'s Life', subject: 'Islamic History', dueDate: 'Friday', status: 'submitted' },
    { title: 'Arabic Vocabulary Quiz', subject: 'Arabic', dueDate: 'Next Week', status: 'pending' },
  ];

  const courses = [
    { title: 'Quran Studies', progress: 75, lessons: 12, completed: 9 },
    { title: 'Arabic Language', progress: 60, lessons: 20, completed: 12 },
    { title: 'Islamic History', progress: 45, lessons: 15, completed: 7 },
    { title: 'Hadith Studies', progress: 30, lessons: 10, completed: 3 },
  ];

  const announcements = [
    { title: 'Ramadan Schedule Changes', time: '2 hours ago', type: 'important' },
    { title: 'New Islamic Library Resources', time: '1 day ago', type: 'info' },
    { title: 'Parent-Teacher Meeting', time: '3 days ago', type: 'event' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Assalamu Alaikum, {user?.name}!
              </h1>
              <p className="text-emerald-100">
                Welcome back to your learning journey. May Allah bless your studies.
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge variant="secondary" className="bg-emerald-500 text-white">
                  {user?.class}
                </Badge>
                <div className="flex items-center text-emerald-100">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-sm">Honor Student</span>
                </div>
              </div>
            </div>
            <Avatar className="h-16 w-16 border-4 border-emerald-400">
              <AvatarFallback className="bg-emerald-200 text-emerald-800 text-lg">
                {user?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Book className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Lessons</p>
                  <p className="text-2xl font-bold">31</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold">A-</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Classes Today</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Today's Classes
                </CardTitle>
                <CardDescription>Your schedule for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.map((class_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Book className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{class_.subject}</h3>
                          <p className="text-sm text-gray-600">{class_.teacher} • {class_.room}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">{class_.time}</p>
                        <Button size="sm" className="mt-2">
                          <Play className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Course Progress
                </CardTitle>
                <CardDescription>Track your learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {courses.map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{course.title}</h3>
                        <span className="text-sm text-gray-600">
                          {course.completed}/{course.lessons} lessons
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{course.progress}% complete</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/courses">Continue Learning</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/lessons">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Lessons
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/assignments">
                    <FileText className="mr-2 h-4 w-4" />
                    View Assignments
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/grades">
                    <Award className="mr-2 h-4 w-4" />
                    Check Grades
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/payments">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Fees
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/messaging">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Recent Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAssignments.map((assignment, index) => (
                    <div key={index} className="border-l-4 border-emerald-200 pl-4">
                      <h4 className="font-semibold text-sm">{assignment.title}</h4>
                      <p className="text-xs text-gray-600">{assignment.subject}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Due: {assignment.dueDate}</span>
                        <Badge 
                          variant={assignment.status === 'submitted' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <Link to="/assignments">View All</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement, index) => (
                    <div key={index} className="border-l-4 border-yellow-200 pl-4">
                      <h4 className="font-semibold text-sm">{announcement.title}</h4>
                      <p className="text-xs text-gray-500">{announcement.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
