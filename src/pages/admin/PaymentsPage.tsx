
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Search, DollarSign, TrendingUp, Calendar, Filter } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock payment data - in real app, this would come from Supabase
  const mockPayments = [
    {
      id: 1,
      student: { name: 'Ahmad Ali', email: 'ahmad@example.com' },
      amount: 150,
      status: 'completed',
      date: '2024-01-15T10:30:00Z',
      method: 'Credit Card',
      reference: 'PAY-001-2024',
      description: 'Monthly Tuition Fee - January 2024'
    },
    {
      id: 2,
      student: { name: 'Fatima Hassan', email: 'fatima@example.com' },
      amount: 150,
      status: 'completed',
      date: '2024-01-14T14:20:00Z',
      method: 'Bank Transfer',
      reference: 'PAY-002-2024',
      description: 'Monthly Tuition Fee - January 2024'
    },
    {
      id: 3,
      student: { name: 'Omar Ibrahim', email: 'omar@example.com' },
      amount: 150,
      status: 'pending',
      date: '2024-01-13T09:15:00Z',
      method: 'Credit Card',
      reference: 'PAY-003-2024',
      description: 'Monthly Tuition Fee - January 2024'
    },
    {
      id: 4,
      student: { name: 'Aisha Mohamed', email: 'aisha@example.com' },
      amount: 150,
      status: 'failed',
      date: '2024-01-12T16:45:00Z',
      method: 'Credit Card',
      reference: 'PAY-004-2024',
      description: 'Monthly Tuition Fee - January 2024'
    },
    {
      id: 5,
      student: { name: 'Yusuf Ahmed', email: 'yusuf@example.com' },
      amount: 75,
      status: 'completed',
      date: '2024-01-11T11:30:00Z',
      method: 'Cash',
      reference: 'PAY-005-2024',
      description: 'Registration Fee'
    },
  ];

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = mockPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = mockPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const failedAmount = mockPayments
    .filter(p => p.status === 'failed')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600">Monitor and manage student payments</p>
          </div>
          <Button>
            <DollarSign className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${totalRevenue}</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-600">${pendingAmount}</p>
                  <p className="text-xs text-gray-500">{mockPayments.filter(p => p.status === 'pending').length} payments</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Payments</p>
                  <p className="text-2xl font-bold text-red-600">${failedAmount}</p>
                  <p className="text-xs text-gray-500">{mockPayments.filter(p => p.status === 'failed').length} failed</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round((mockPayments.filter(p => p.status === 'completed').length / mockPayments.length) * 100)}%
                  </p>
                  <p className="text-xs text-blue-600">+5% improvement</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-none shadow-none focus:ring-0">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Transactions
            </CardTitle>
            <CardDescription>
              Complete history of student payments and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {payment.student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{payment.student.name}</div>
                          <div className="text-sm text-gray-500">{payment.student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">${payment.amount}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {payment.reference}
                      </code>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-gray-600">
                        {payment.description}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
