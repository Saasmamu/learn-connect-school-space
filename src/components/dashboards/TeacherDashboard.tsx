
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Book,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Video,
  Play
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  const myClasses = [
    { name: 'Class 10A - Quran Studies', students: 25, time: '10:00 AM', room: 'Virtual Room 1' },
    { name: 'Class 9B - Arabic Grammar', students: 30, time: '2:00 PM', room: 'Virtual Room 3' },
    { name: 'Class 11A - Islamic History', students: 22, time: '4:00 PM', room: 'Virtual Room 2' },
  ];

  const pendingTasks = [
    { title: 'Grade Quran Recitation Assignments', count: 15, priority: 'high' },
    { title: 'Upload Week 5 Lesson Materials', count: 1, priority: 'medium' },
    { title: 'Review Student Progress Reports', count: 8, priority: 'low' },
    { title: 'Prepare Midterm Exam Questions', count: 1, priority: 'high' },
  ];

  const recentActivity = [
    { student: 'Ahmad Ali', action: 'Submitted Assignment', subject: 'Quran Studies', time: '2 hours ago' },
    { student: 'Fatima Hassan', action: 'Attended Virtual Class', subject: 'Arabic Grammar', time: '4 hours ago' },
    { student: 'Omar Ibrahim', action: 'Downloaded Materials', subject: 'Islamic History', time: '6 hours ago' },
  ];

  const classPerformance = [
    { subject: 'Quran Studies', avgGrade: 'A-', completion: 92 },
    { subject: 'Arabic Grammar', avgGrade: 'B+', completion: 85 },
    { subject: 'Islamic History', avgGrade: 'A', completion: 88 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Assalamu Alaikum, Ustaz {user?.name}!
              </h1>
              <p className="text-blue-100">
                Ready to inspire and educate your students today?
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  {user?.subjects?.join(', ')}
                </Badge>
                <div className="flex items-center text-blue-100">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">77 Students</span>
                </div>
              </div>
            </div>
            <Avatar className="h-16 w-16 border-4 border-blue-400">
              <AvatarFallback className="bg-blue-200 text-blue-800 text-lg">
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
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">77</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Book className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Class Grade</p>
                  <p className="text-2xl font-bold">A-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Today's Classes
                </CardTitle>
                <CardDescription>Your teaching schedule for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myClasses.map((class_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{class_.name}</h3>
                          <p className="text-sm text-gray-600">{class_.students} students • {class_.room}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{class_.time}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4 mr-1" />
                            Start Class
                          </Button>
                          <Button size="sm" variant="ghost">
                            Materials
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Class Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Class Performance Overview
                </CardTitle>
                <CardDescription>Monitor your students' progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {classPerformance.map((performance, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{performance.subject}</h3>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">Avg Grade: {performance.avgGrade}</span>
                          <Badge variant="secondary">{performance.completion}% Completion</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${performance.completion}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Student Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Recent Student Activity
                </CardTitle>
                <CardDescription>Latest actions from your students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border-l-4 border-blue-200">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {activity.student.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.student}</p>
                        <p className="text-xs text-gray-600">{activity.action} - {activity.subject}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
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
                  <Link to="/teacher/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Lesson
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/teacher/assignments">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/attendance">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Take Attendance
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/teacher/gradebook">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Grade Book
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/messaging">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Students
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasks.map((task, index) => (
                    <div key={index} className="border-l-4 border-orange-200 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{task.title}</h4>
                          <p className="text-xs text-gray-600">{task.count} item(s)</p>
                        </div>
                        <Badge 
                          variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  View All Tasks
                </Button>
              </CardContent>
            </Card>

            {/* This Week's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Monday</span>
                    <span className="text-blue-600">3 Classes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tuesday</span>
                    <span className="text-blue-600">2 Classes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wednesday</span>
                    <span className="text-blue-600">3 Classes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thursday</span>
                    <span className="text-blue-600">2 Classes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Friday</span>
                    <span className="text-gray-500">No Classes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
