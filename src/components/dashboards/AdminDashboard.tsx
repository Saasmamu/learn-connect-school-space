
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Book,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  UserCheck,
  FileText,
  MessageSquare,
  Settings
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const systemStats = [
    { title: 'Total Students', value: '1,247', change: '+12%', icon: Users, color: 'text-blue-600' },
    { title: 'Active Teachers', value: '45', change: '+2%', icon: UserCheck, color: 'text-green-600' },
    { title: 'Total Courses', value: '28', change: '+3%', icon: Book, color: 'text-purple-600' },
    { title: 'Monthly Revenue', value: '$24,680', change: '+18%', icon: DollarSign, color: 'text-emerald-600' },
  ];

  const recentPayments = [
    { student: 'Ahmad Ali', amount: '$150', status: 'completed', date: '2 hours ago' },
    { student: 'Fatima Hassan', amount: '$150', status: 'completed', date: '4 hours ago' },
    { student: 'Omar Ibrahim', amount: '$150', status: 'pending', date: '6 hours ago' },
    { student: 'Aisha Mohamed', amount: '$150', status: 'failed', date: '1 day ago' },
  ];

  const systemAlerts = [
    { type: 'warning', message: 'Server maintenance scheduled for tonight', time: '1 hour ago' },
    { type: 'info', message: 'New teacher registration: Dr. Khalid Ahmed', time: '3 hours ago' },
    { type: 'error', message: 'Payment gateway timeout reported', time: '5 hours ago' },
    { type: 'success', message: 'Weekly backup completed successfully', time: '1 day ago' },
  ];

  const monthlyData = [
    { month: 'Jan', students: 1100, revenue: 22000 },
    { month: 'Feb', students: 1150, revenue: 23000 },
    { month: 'Mar', students: 1200, revenue: 24000 },
    { month: 'Apr', students: 1247, revenue: 24680 },
  ];

  const pendingApprovals = [
    { type: 'Teacher Application', name: 'Dr. Amina Rashid', department: 'Islamic Studies' },
    { type: 'Course Proposal', name: 'Advanced Tajweed', department: 'Quran Studies' },
    { type: 'Fee Waiver Request', name: 'Yusuf Ahmed', department: 'Financial Aid' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Assalamu Alaikum, Admin {user?.name}!
              </h1>
              <p className="text-red-100">
                System Overview and Management Dashboard
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge variant="secondary" className="bg-red-500 text-white">
                  System Administrator
                </Badge>
                <div className="flex items-center text-red-100">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">All Systems Online</span>
                </div>
              </div>
            </div>
            <Avatar className="h-16 w-16 border-4 border-red-400">
              <AvatarFallback className="bg-red-200 text-red-800 text-lg">
                {user?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {systemStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change} from last month</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  System Alerts
                </CardTitle>
                <CardDescription>Recent system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.map((alert, index) => (
                    <div key={index} className="flex items-start space-x-4 p-3 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        alert.type === 'error' ? 'bg-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-500' :
                        alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                      <Badge variant={
                        alert.type === 'error' ? 'destructive' :
                        alert.type === 'warning' ? 'default' :
                        alert.type === 'success' ? 'default' : 'secondary'
                      }>
                        {alert.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Recent Payments
                </CardTitle>
                <CardDescription>Latest payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-100">
                            {payment.student.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{payment.student}</p>
                          <p className="text-xs text-gray-600">{payment.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{payment.amount}</p>
                        <Badge variant={
                          payment.status === 'completed' ? 'default' :
                          payment.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <Link to="/admin/payments">View All Payments</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Overview Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Monthly Growth Overview
                </CardTitle>
                <CardDescription>Student enrollment and revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chart visualization would be implemented here</p>
                    <p className="text-sm text-gray-400">Integration with recharts library</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/admin/students">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Students
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/admin/teachers">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Manage Teachers
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/admin/courses">
                    <Book className="mr-2 h-4 w-4" />
                    Course Management
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/admin/payments">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Reports
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/admin/analytics">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analytics
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals.map((approval, index) => (
                    <div key={index} className="border-l-4 border-orange-200 pl-4">
                      <h4 className="font-semibold text-sm">{approval.type}</h4>
                      <p className="text-xs text-gray-600">{approval.name}</p>
                      <p className="text-xs text-gray-500">{approval.department}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="default" className="text-xs h-6">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-6">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Database</span>
                    <Badge variant="default" className="bg-green-100 text-green-700">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Payment Gateway</span>
                    <Badge variant="default" className="bg-green-100 text-green-700">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Video Platform</span>
                    <Badge variant="default" className="bg-green-100 text-green-700">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>File Storage</span>
                    <Badge variant="default" className="bg-green-100 text-green-700">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Email Service</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Maintenance</Badge>
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
