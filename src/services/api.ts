import type {
  AuthResponse,
  StudentProfile,
  ProfileCompletion,
  ProfessionalProfile,
  Opportunity,
  ConnectionDraft,
  NetworkingTarget,
  ApplicationItem,
  AutomationTask,
  NotificationItem,
} from '../types';

const BASE_URL = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('careerbridge_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = 'Request failed';
    try {
      const errData = await res.json();
      errMessage = errData.error || errData.message || errMessage;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string): Promise<AuthResponse> =>
    request('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (email: string, password: string, role = 'student', fullName = ''): Promise<{ token: string; user: any }> =>
    request('/auth/register/', { method: 'POST', body: JSON.stringify({ email, password, role, fullName }) }),

  getMe: (): Promise<{ id: string; email: string; role: string; profile?: StudentProfile }> =>
    request('/auth/me/'),

  // Profiles
  getProfile: (): Promise<{ profile: StudentProfile; completion: ProfileCompletion }> =>
    request('/profiles/me/'),

  updateProfile: (profile: Partial<StudentProfile>): Promise<{ profile: StudentProfile; completion: ProfileCompletion }> =>
    request('/profiles/me/', { method: 'PUT', body: JSON.stringify(profile) }),

  uploadResume: async (file: File): Promise<{ message: string; fileName: string; extractedSkills: string[]; aiScore: number; profile: StudentProfile }> => {
    const formData = new FormData();
    formData.append('resume', file);
    const token = localStorage.getItem('careerbridge_token');
    const res = await fetch(`${BASE_URL}/profiles/resume/upload/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload resume');
    return res.json();
  },

  // People Discovery
  getPeople: (params?: { company?: string; role?: string; search?: string }): Promise<{ count: number; people: ProfessionalProfile[] }> => {
    const query = new URLSearchParams();
    if (params?.company) query.set('company', params.company);
    if (params?.role) query.set('role', params.role);
    if (params?.search) query.set('search', params.search);
    return request(`/people/?${query.toString()}`);
  },

  getPerson: (id: string): Promise<ProfessionalProfile> =>
    request(`/people/${id}/`),

  // Opportunities
  getOpportunities: (params?: { organization?: string; category?: string; search?: string; remote?: boolean }): Promise<{ count: number; opportunities: Opportunity[] }> => {
    const query = new URLSearchParams();
    if (params?.organization) query.set('organization', params.organization);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.remote) query.set('remote', 'true');
    return request(`/opportunities/?${query.toString()}`);
  },

  // Networking & Approval
  getDrafts: (): Promise<{ drafts: ConnectionDraft[] }> =>
    request('/networking/drafts/'),

  createDraft: (payload: { targetProfessionalId: string; purpose: string; subject?: string; content?: string }): Promise<ConnectionDraft> =>
    request('/networking/drafts/', { method: 'POST', body: JSON.stringify(payload) }),

  updateDraft: (id: string, payload: { subject?: string; content?: string }): Promise<{ message: string; draft: ConnectionDraft }> =>
    request(`/networking/drafts/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),

  approveDraft: (id: string): Promise<{ message: string; draft: ConnectionDraft }> =>
    request(`/networking/drafts/${id}/approve/`, { method: 'POST' }),

  getNetworking: (): Promise<{ targets: NetworkingTarget[]; drafts: ConnectionDraft[] }> =>
    request('/networking/'),

  // Applications
  getApplications: (): Promise<{ applications: ApplicationItem[] }> =>
    request('/applications/'),

  saveApplication: (opportunityId: string): Promise<ApplicationItem> =>
    request('/applications/', { method: 'POST', body: JSON.stringify({ opportunityId }) }),

  updateApplication: (id: string, payload: Partial<ApplicationItem>): Promise<{ message: string; application: ApplicationItem }> =>
    request(`/applications/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // AI Engine
  generateNetworkingMessage: (payload: { professionalId: string; purpose?: string; customNotes?: string }): Promise<{ source: string; subject: string; body: string }> =>
    request('/ai/networking-message/', { method: 'POST', body: JSON.stringify(payload) }),

  generateCoverLetter: (payload: { opportunityId: string; companyName?: string; roleTitle?: string }): Promise<{ coverLetter: string }> =>
    request('/ai/cover-letter/', { method: 'POST', body: JSON.stringify(payload) }),

  chatCareerAssistant: (payload: { message: string; history?: Array<{ sender: string; text: string }> }): Promise<{ reply: string }> =>
    request('/ai/chat/', { method: 'POST', body: JSON.stringify(payload) }),

  // Automation
  getTasks: (): Promise<{ tasks: AutomationTask[] }> =>
    request('/automation/tasks/'),

  pauseTask: (id: string): Promise<{ message: string; task: AutomationTask }> =>
    request(`/automation/tasks/${id}/pause/`, { method: 'POST' }),

  resumeTask: (id: string): Promise<{ message: string; task: AutomationTask }> =>
    request(`/automation/tasks/${id}/resume/`, { method: 'POST' }),

  emergencyStop: (): Promise<{ message: string }> =>
    request('/automation/emergency-stop/', { method: 'POST' }),

  // Analytics & Notifications
  getAnalyticsOverview: (): Promise<any> =>
    request('/analytics/overview/'),

  getNotifications: (): Promise<{ notifications: NotificationItem[] }> =>
    request('/notifications/'),
};
