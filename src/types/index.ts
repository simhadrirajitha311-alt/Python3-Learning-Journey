export type UserRole = 'student' | 'educator' | 'professional' | 'recruiter' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface StudentProfile {
  id?: string;
  userId: string;
  fullName: string;
  email: string;
  university: string;
  degree: string;
  branch?: string;
  currentYear: string;
  graduationYear: number;
  technicalSkills: string[];
  programmingLanguages: string[];
  projects: Array<{
    id?: string;
    title: string;
    description: string;
    techStack: string[];
    githubUrl?: string;
    liveDemoUrl?: string;
  }>;
  certifications?: string[];
  githubProfile?: string;
  linkedinProfile?: string;
  portfolioWebsite?: string;
  resumeUrl?: string;
  careerInterests: string[];
  preferredCompanies: string[];
  preferredLocations: string[];
  completionPercentage: number;
}

export interface ProfileCompletion {
  percentage: number;
  missingSections: string[];
  suggestions: string[];
}

export interface ProfessionalProfile {
  id: string;
  fullName: string;
  organization: string;
  role: string;
  department: string;
  location: string;
  skills: string[];
  mentorshipOpen: boolean;
  bio: string;
  verifiedSource: string;
  verifiedProfileUrl: string;
  lastVerifiedDate: string;
}

export interface OpportunityMatch {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  eligibilityPassed: boolean;
  reasoning: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  eligibilityRequirements: string[];
  requiredSkills: string[];
  location: string;
  isRemote: boolean;
  compensation: string;
  deadline: string;
  officialUrl: string;
  verifiedSource: string;
  verificationStatus: 'verified' | 'official_feed' | 'partner';
  category: 'internship' | 'fellowship' | 'open_source' | 'research';
  match?: OpportunityMatch;
}

export interface ConnectionDraft {
  id: string;
  studentId: string;
  targetProfessionalId: string;
  targetName: string;
  organization: string;
  targetRole: string;
  purpose: 'mentorship' | 'referral' | 'research' | 'connection';
  subject: string;
  content: string;
  status: 'draft' | 'approved' | 'sent' | 'archived';
  isApprovedByUser: boolean;
  approvedAt: string | null;
  createdAt: string;
}

export interface NetworkingTarget {
  id: string;
  studentId: string;
  professionalId: string;
  professionalName: string;
  organization: string;
  role: string;
  relationshipStatus: 'discovered' | 'drafted' | 'outreached' | 'meeting_scheduled' | 'connected';
  notes: string;
  lastContactDate: string | null;
  nextFollowUpDate: string | null;
}

export type ApplicationStatus =
  | 'saved'
  | 'interested'
  | 'preparing'
  | 'ready_for_review'
  | 'submitted'
  | 'under_review'
  | 'interview'
  | 'rejected'
  | 'accepted'
  | 'withdrawn';

export interface ApplicationItem {
  id: string;
  studentId: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  status: ApplicationStatus;
  submissionDate: string | null;
  interviewDate: string | null;
  notes: string;
  updatedAt: string;
  documents?: {
    coverLetter?: string;
    tailoredResumeUrl?: string;
  };
}

export interface AutomationTask {
  id: string;
  taskType: string;
  name: string;
  schedule: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  lastRun: string;
  nextRun: string;
  logs: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'deadline_alert' | 'approval_pending' | 'new_match' | 'task_completed';
  isRead: boolean;
  createdAt: string;
}
