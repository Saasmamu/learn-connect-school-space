import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Settings, LogOut, User, Book, Calendar, Users, Video } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicNavItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Scholars', href: '/scholars' },
    { name: 'Admissions', href: '/admissions' },
    { name: 'Login', href: '/login' },
  ];

  const getNavItems = () => {
    if (!user) return publicNavItems;

    const baseItems = [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Courses', href: '/courses' },
      { name: 'Lessons', href: '/lessons' },
      { name: 'Video Library', href: '/video-library' },
      { name: 'Scholars', href: '/scholars' },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'My Courses', href: '/my-courses' },
          { name: 'Classes', href: '/admin/courses' },
          { name: 'Create Course', href: '/admin/courses/create' },
          { name: 'Students', href: '/admin/students' },
          { name: 'Teachers', href: '/admin/teachers' },
          { name: 'Assignments', href: '/assignments' },
          { name: 'Gradebook', href: '/gradebook' },
          { name: 'Attendance', href: '/attendance' },
          { name: 'Payments', href: '/admin/payments' },
          { name: 'Analytics', href: '/admin/analytics' },
        ];
      case 'teacher':
        return [
          ...baseItems,
          { name: 'My Courses', href: '/my-courses' },
          { name: 'My Classes', href: '/teacher/classes' },
          { name: 'Create Course', href: '/admin/courses/create' },
          { name: 'Assignments', href: '/assignments' },
          { name: 'Gradebook', href: '/gradebook' },
          { name: 'Attendance', href: '/attendance' },
        ];
      case 'student':
        return [
          ...baseItems,
          { name: 'Assignments', href: '/assignments' },
          { name: 'Grades', href: '/gradebook' },
          { name: 'Payments', href: '/payments' },
        ];
      default:
        return baseItems;
    }
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Book className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              Islamic School Portal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {getNavItems().map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  isActive(item.href)
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-emerald-600 font-medium">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {getNavItems().map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-medium transition-colors hover:text-emerald-600 p-2 rounded ${
                      isActive(item.href)
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {user && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center space-x-3 p-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-gray-700 hover:text-emerald-600 p-2 rounded flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-gray-700 hover:text-emerald-600 p-2 rounded flex items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-sm font-medium text-gray-700 hover:text-emerald-600 p-2 rounded flex items-center w-full text-left"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
