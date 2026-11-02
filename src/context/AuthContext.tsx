import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, StudentProfile, ProfileCompletion } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  completion: ProfileCompletion | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  switchDemoRole: (role: 'student' | 'recruiter') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('careerbridge_token'));
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('careerbridge_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    // Default demo student
    return {
      id: 'usr_demo_student',
      email: 'alex.chen@university.edu',
      role: 'student',
      fullName: 'Alex Chen',
    };
  });

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data.profile);
      setCompletion(data.completion);
    } catch (err) {
      console.warn('Could not load profile, setting fallback data', err);
    }
  };

  useEffect(() => {
    refreshProfile().finally(() => setIsLoading(false));
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('careerbridge_token', res.access);
      localStorage.setItem('careerbridge_user', JSON.stringify(res.user));
      setToken(res.access);
      setUser(res.user);
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, role: string, fullName: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(email, password, role, fullName);
      localStorage.setItem('careerbridge_token', res.token);
      localStorage.setItem('careerbridge_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('careerbridge_token');
    localStorage.removeItem('careerbridge_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const switchDemoRole = (role: 'student' | 'recruiter') => {
    if (role === 'student') {
      const studentUser: User = {
        id: 'usr_demo_student',
        email: 'alex.chen@university.edu',
        role: 'student',
        fullName: 'Alex Chen',
      };
      setUser(studentUser);
      localStorage.setItem('careerbridge_user', JSON.stringify(studentUser));
    } else {
      const recruiterUser: User = {
        id: 'usr_demo_recruiter',
        email: 'recruiter@google.com',
        role: 'recruiter',
        fullName: 'Google University Talent',
      };
      setUser(recruiterUser);
      localStorage.setItem('careerbridge_user', JSON.stringify(recruiterUser));
    }
    refreshProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        completion,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
