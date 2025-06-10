
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  avatar?: string;
  class?: string;
  subjects?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('school_portal_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication - in real app, this would call your auth API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Determine role based on email for demo
      let role: 'admin' | 'teacher' | 'student' = 'student';
      if (email.includes('admin')) role = 'admin';
      else if (email.includes('teacher')) role = 'teacher';
      
      const userData: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role,
        class: role === 'student' ? 'Class 10A' : undefined,
        subjects: role === 'teacher' ? ['Mathematics', 'Physics'] : undefined,
      };
      
      setUser(userData);
      localStorage.setItem('school_portal_user', JSON.stringify(userData));
    } catch (error) {
      throw new Error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const userData: User = {
        id: Date.now().toString(),
        email,
        name,
        role: role as 'admin' | 'teacher' | 'student',
        class: role === 'student' ? 'Class 10A' : undefined,
        subjects: role === 'teacher' ? ['Mathematics'] : undefined,
      };
      
      setUser(userData);
      localStorage.setItem('school_portal_user', JSON.stringify(userData));
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('school_portal_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
