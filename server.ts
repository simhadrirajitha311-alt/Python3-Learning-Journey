import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import {
  calculateProfileCompletion,
  computeOpportunityMatch,
  generateOutreachDraft,
  isValidApplicationTransition,
} from './src/utils/careerLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'careerbridge-jwt-super-secret-key-2026';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory persistent database store initialized with the 20 MongoDB collections schemas
const db = {
  users: [
    {
      id: 'usr_demo_student',
      email: 'alex.chen@university.edu',
      passwordHash: bcrypt.hashSync('Student123!', 10),
      role: 'student',
      isVerified: true,
      createdAt: new Date('2026-09-01T10:00:00Z').toISOString(),
    },
    {
      id: 'usr_demo_recruiter',
      email: 'recruiter@google.com',
      passwordHash: bcrypt.hashSync('Recruiter123!', 10),
      role: 'recruiter',
      isVerified: true,
      createdAt: new Date('2026-08-15T09:00:00Z').toISOString(),
    },
  ],
  student_profiles: [
    {
      id: 'sp_demo',
      userId: 'usr_demo_student',
      fullName: 'Alex Chen',
      email: 'alex.chen@university.edu',
      university: 'Carnegie Mellon University',
      degree: 'B.S. Computer Science & AI',
      branch: 'School of Computer Science',
      currentYear: 'Junior (3rd Year)',
      graduationYear: 2027,
      technicalSkills: [
        'Python',
        'TypeScript',
        'Distributed Systems',
        'PyTorch',
        'Docker',
        'PostgreSQL',
        'React',
        'Algorithms & Data Structures',
      ],
      programmingLanguages: ['Python', 'TypeScript', 'C++', 'Go'],
      projects: [
        {
          id: 'proj_1',
          title: 'DistriKV: Raft-based Key-Value Store',
          description:
            'Implemented a distributed, fault-tolerant key-value store with leader election, log replication, and RPC consensus in Go.',
          techStack: ['Go', 'Raft Consensus', 'gRPC', 'Docker'],
          githubUrl: 'https://github.com/alexchen/distri-kv',
        },
        {
          id: 'proj_2',
          title: 'BioMed-BERT: Clinical NLP Triage Model',
          description:
            'Fine-tuned Transformer models for automated medical summary classification with 94.2% F1 score on MIMIC-III benchmark.',
          techStack: ['Python', 'PyTorch', 'HuggingFace', 'FastAPI'],
          githubUrl: 'https://github.com/alexchen/biomed-bert',
        },
      ],
      certifications: ['AWS Certified Solutions Architect - Associate', 'DeepLearning.AI TensorFlow Developer'],
      githubProfile: 'https://github.com/alexchen-dev',
      linkedinProfile: 'https://linkedin.com/in/alexchen-demo',
      portfolioWebsite: 'https://alexchen.dev',
      resumeUrl: '/uploads/resumes/alex_chen_cv_2026.pdf',
      careerInterests: ['Distributed Systems', 'Machine Learning Infrastructure', 'Cloud Engineering'],
      preferredCompanies: ['Google', 'Microsoft', 'OpenAI', 'Anthropic'],
      preferredLocations: ['San Francisco, CA', 'Seattle, WA', 'New York, NY', 'Remote'],
      completionPercentage: 92,
    },
  ],
  professional_profiles: [
    {
      id: 'prof_1',
      fullName: 'Dr. Sarah Lin',
      organization: 'Google',
      role: 'Staff Research Scientist',
      department: 'Google DeepMind',
      location: 'Mountain View, CA & Remote',
      skills: ['Reinforcement Learning', 'Large Language Models', 'Distributed Training', 'PyTorch', 'JAX'],
      mentorshipOpen: true,
      bio: 'Staff Scientist at DeepMind focusing on model reasoning and scalable RL. Passionate about mentoring first-generation university students.',
      verifiedSource: 'Google Research Staff Directory (Verified)',
      verifiedProfileUrl: 'https://research.google/people/sarah-lin/',
      lastVerifiedDate: '2026-10-15',
    },
    {
      id: 'prof_2',
      fullName: 'Marcus Vance',
      organization: 'Microsoft',
      role: 'Principal Software Engineer',
      department: 'Azure Distributed Storage & Core Compute',
      location: 'Redmond, WA',
      skills: ['Distributed Systems', 'C++', 'Rust', 'High-Throughput Storage', 'Kubernetes'],
      mentorshipOpen: true,
      bio: '12+ years at Microsoft leading core storage layers in Azure. Happy to review student projects and discuss distributed systems fundamentals.',
      verifiedSource: 'Microsoft Technical Leadership Roster (Verified)',
      verifiedProfileUrl: 'https://microsoft.com/en-us/research/people/marcus-vance/',
      lastVerifiedDate: '2026-10-20',
    },
    {
      id: 'prof_3',
      fullName: 'Prof. Ananya Gupta',
      organization: 'Stanford University',
      role: 'Associate Professor of Computer Science',
      department: 'AI Lab & Systems Group',
      location: 'Stanford, CA',
      skills: ['Systems for ML', 'Compiler Optimization', 'GPU Architectures', 'CUDA', 'Python'],
      mentorshipOpen: true,
      bio: 'Directing the Scalable Systems research group. Actively recruiting undergraduate summer research fellows.',
      verifiedSource: 'Stanford Faculty Directory (Verified)',
      verifiedProfileUrl: 'https://cs.stanford.edu/people/ananya-gupta',
      lastVerifiedDate: '2026-10-10',
    },
    {
      id: 'prof_4',
      fullName: 'David Thorne',
      organization: 'Google',
      role: 'Senior Software Engineer & Tech Lead',
      department: 'Google Cloud Platform (Kubernetes Engine)',
      location: 'Sunnyvale, CA',
      skills: ['Go', 'Cloud Infrastructure', 'Kubernetes', 'Microservices', 'Distributed Systems'],
      mentorshipOpen: true,
      bio: 'GKE core contributor. Interested in helping students transition from collegiate coursework to production cloud systems.',
      verifiedSource: 'Google Open Source Peer Registry (Verified)',
      verifiedProfileUrl: 'https://opensource.google/projects/kubernetes',
      lastVerifiedDate: '2026-10-25',
    },
    {
      id: 'prof_5',
      fullName: 'Priya Narang',
      organization: 'Microsoft',
      role: 'University Talent Acquisition Partner',
      department: 'Microsoft University Recruiting',
      location: 'Seattle, WA',
      skills: ['Technical Recruiting', 'Interview Prep', 'Resume Optimization', 'Early Career Pathways'],
      mentorshipOpen: true,
      bio: 'Leading hiring for SWE Intern and Explore programs across North America. AMA on crafting resumes that stand out.',
      verifiedSource: 'Microsoft Careers Official Talent Team (Verified)',
      verifiedProfileUrl: 'https://careers.microsoft.com/students',
      lastVerifiedDate: '2026-11-01',
    },
  ],
  opportunities: [
    {
      id: 'opp_1',
      title: 'Software Engineering Intern, Summer 2027',
      organization: 'Google',
      description:
        'Join Google engineers across Mountain View, Seattle, or New York to build scalable, globally distributed services and user-facing applications.',
      eligibilityRequirements: [
        'Currently pursuing a BS, MS, or PhD in Computer Science or related STEM field',
        'Anticipated graduation between December 2027 and June 2028',
        'Experience with one or more general purpose programming languages: Python, C++, Java, or Go',
      ],
      requiredSkills: ['Python', 'Algorithms & Data Structures', 'Distributed Systems', 'Git'],
      location: 'Mountain View, CA / Seattle, WA / New York, NY',
      isRemote: false,
      compensation: '$58 - $65 / hour + Housing Stipend',
      deadline: '2026-12-15',
      officialUrl: 'https://careers.google.com/jobs/results/?q=software%20engineer%20intern',
      verifiedSource: 'Google Careers Official Portal (Feed #G-9921)',
      verificationStatus: 'verified' as const,
      category: 'internship',
    },
    {
      id: 'opp_2',
      title: 'AI Research Fellowship, Summer 2027',
      organization: 'Microsoft',
      description:
        'Collaborate directly with Microsoft Research scientists on frontier AI research, foundation models, and scalable machine learning systems.',
      eligibilityRequirements: [
        'Enrolled in University Computer Science or AI/ML curriculum',
        'Demonstrated project or research foundation in deep learning or ML systems',
        'Strong proficiency in Python and deep learning frameworks (PyTorch or TensorFlow)',
      ],
      requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'Linear Algebra', 'Transformers'],
      location: 'Redmond, WA / Cambridge, MA / Remote Hybrid',
      isRemote: true,
      compensation: '$60 - $70 / hour + Mentorship Grant',
      deadline: '2026-12-30',
      officialUrl: 'https://careers.microsoft.com/professionals/us/en/student-programs',
      verifiedSource: 'Microsoft Research Early Careers Program (Verified)',
      verificationStatus: 'verified' as const,
      category: 'fellowship',
    },
    {
      id: 'opp_3',
      title: 'Google Summer of Code (GSoC) 2027 Contributor',
      organization: 'Google Open Source',
      description:
        'Spend your summer contributing to premier open-source organizations (Linux Foundation, Apache, CNCF, Python Software Foundation) with 1:1 senior mentors.',
      eligibilityRequirements: [
        'Open to university students and early-career developers globally (18+)',
        'Demonstrated git fluency and contribution enthusiasm',
      ],
      requiredSkills: ['Git', 'Python', 'Open Source', 'Documentation', 'Collaboration'],
      location: 'Global Remote',
      isRemote: true,
      compensation: '$1,500 - $3,300 Stipend based on country',
      deadline: '2027-04-02',
      officialUrl: 'https://summerofcode.withgoogle.com/',
      verifiedSource: 'Google Open Source Programs Office (Verified)',
      verificationStatus: 'verified' as const,
      category: 'open_source',
    },
    {
      id: 'opp_4',
      title: 'Undergraduate AI Systems Summer Fellowship',
      organization: 'Stanford AI Lab',
      description:
        'Funded 10-week summer research residency collaborating on high-efficiency ML compilers, GPU kernel optimizations, and multimodal agents.',
      eligibilityRequirements: [
        'Current undergraduate student enrolled at an accredited university',
        'Comfortable with C++ or PyTorch internals',
      ],
      requiredSkills: ['C++', 'PyTorch', 'GPU Architectures', 'Research'],
      location: 'Stanford, CA',
      isRemote: false,
      compensation: '$8,500 Summer Research Fellowship Award',
      deadline: '2027-02-01',
      officialUrl: 'https://ai.stanford.edu/research/fellowships',
      verifiedSource: 'Stanford CS Research Registry (Verified)',
      verificationStatus: 'verified' as const,
      category: 'research',
    },
  ],
  applications: [
    {
      id: 'app_1',
      studentId: 'usr_demo_student',
      opportunityId: 'opp_1',
      opportunityTitle: 'Software Engineering Intern, Summer 2027',
      organization: 'Google',
      status: 'preparing',
      submissionDate: null,
      interviewDate: null,
      notes: 'Reviewed requirements; preparing tailored distributed systems project bullets.',
      updatedAt: new Date().toISOString(),
      documents: {
        coverLetter: '',
        tailoredResumeUrl: '/resumes/alex_google_tailored.pdf',
      },
    },
    {
      id: 'app_2',
      studentId: 'usr_demo_student',
      opportunityId: 'opp_2',
      opportunityTitle: 'AI Research Fellowship, Summer 2027',
      organization: 'Microsoft',
      status: 'ready_for_review',
      submissionDate: null,
      interviewDate: null,
      notes: 'Cover letter drafted highlighting BioMed-BERT project; pending final review.',
      updatedAt: new Date().toISOString(),
      documents: {
        coverLetter:
          'Dear Microsoft Research Fellowship Committee,\n\nI am writing to express my strong enthusiasm for the AI Research Fellowship. Having built BioMed-BERT with PyTorch...',
        tailoredResumeUrl: '/resumes/alex_msft_tailored.pdf',
      },
    },
  ],
  connection_drafts: [
    {
      id: 'draft_1',
      studentId: 'usr_demo_student',
      targetProfessionalId: 'prof_1',
      targetName: 'Dr. Sarah Lin',
      organization: 'Google',
      targetRole: 'Staff Research Scientist',
      purpose: 'research',
      subject: 'Inquiry regarding scalable RL research and early-career pathways',
      content:
        'Hi Dr. Lin,\n\nI have followed your recent work at DeepMind on scalable reinforcement learning with great admiration. As a CS junior at Carnegie Mellon working on distributed systems and NLP models, I would love to learn any perspective you might share on transitioning from academic research to research engineering at Google.\n\nThank you for your time!\n\nBest,\nAlex Chen',
      status: 'draft',
      isApprovedByUser: false,
      approvedAt: null,
      createdAt: new Date().toISOString(),
    },
  ],
  networking_targets: [
    {
      id: 'net_1',
      studentId: 'usr_demo_student',
      professionalId: 'prof_2',
      professionalName: 'Marcus Vance',
      organization: 'Microsoft',
      role: 'Principal Software Engineer',
      relationshipStatus: 'discovered',
      notes: 'Built similar Raft KV store; target for Azure distributed systems discussion.',
      lastContactDate: null,
      nextFollowUpDate: '2026-11-10',
    },
  ],
  agent_tasks: [
    {
      id: 'task_1',
      taskType: 'opportunity_crawler',
      name: 'Google & Microsoft Career Portal Crawler',
      schedule: 'Every 6 hours',
      status: 'running',
      lastRun: new Date(Date.now() - 3600000 * 2).toISOString(),
      nextRun: new Date(Date.now() + 3600000 * 4).toISOString(),
      logs: [
        'Checked careers.google.com API feed: 4 new postings indexed',
        'Checked careers.microsoft.com university pipeline: 2 updates found',
        'Verified eligibility criteria & schema freshness: OK',
      ],
    },
    {
      id: 'task_2',
      taskType: 'deadline_monitor',
      name: 'Application Deadline Monitor',
      schedule: 'Daily at 08:00 UTC',
      status: 'running',
      lastRun: new Date(Date.now() - 3600000 * 14).toISOString(),
      nextRun: new Date(Date.now() + 3600000 * 10).toISOString(),
      logs: [
        'Scanned 12 active student pipeline applications',
        'Google SWE Intern deadline is in 43 days - alert generated',
        'No urgent escalations required',
      ],
    },
    {
      id: 'task_3',
      taskType: 'followup_scheduler',
      name: 'Networking Follow-Up Assistant',
      schedule: 'Daily at 09:30 UTC',
      status: 'paused',
      lastRun: new Date(Date.now() - 3600000 * 24).toISOString(),
      nextRun: 'Paused by user preference',
      logs: ['Paused: Waiting for explicit user approval before drafting next outreach reminders.'],
    },
  ],
  notifications: [
    {
      id: 'notif_1',
      userId: 'usr_demo_student',
      title: 'New Opportunity Match: Google SWE Intern',
      message: 'Your profile matches 85% of the requirements for Google Software Engineering Intern 2027.',
      type: 'new_match',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'notif_2',
      userId: 'usr_demo_student',
      title: 'Action Needed: Review Outreach Draft',
      message: 'AI generated a draft message to Dr. Sarah Lin (Google DeepMind). Review and approve in Approval Center.',
      type: 'approval_pending',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ],
  activity_logs: [
    {
      id: 'log_1',
      userId: 'usr_demo_student',
      action: 'Resume parsed: Extracted 8 technical skills and 2 projects',
      category: 'ai_generation',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'log_2',
      userId: 'usr_demo_student',
      action: 'Opportunity matched: Microsoft AI Research Fellowship (88% match score)',
      category: 'ai_generation',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
  integration_settings: {
    geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    celerySchedulerActive: true,
    emailNotificationsEnabled: true,
    privacyLevel: 'connections_only',
  },
};

// Helper to authenticate JWT
function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For demo simplicity, fallback to demo user if no token
    (req as any).user = db.users[0];
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.users.find((u) => u.id === decoded.id);
    if (!user) {
      (req as any).user = db.users[0];
    } else {
      (req as any).user = user;
    }
    next();
  } catch (err) {
    // If token invalid, default to demo user for seamless preview
    (req as any).user = db.users[0];
    next();
  }
}

// -----------------------------------------------------------------------------
// REST API ROUTES (/api/v1/...)
// -----------------------------------------------------------------------------

// 1. AUTHENTICATION
app.post('/api/v1/auth/register/', (req: Request, res: Response) => {
  const { email, password, role = 'student', fullName = '' } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const userId = `usr_${Date.now()}`;
  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);

  if (role === 'student') {
    db.student_profiles.push({
      id: `sp_${Date.now()}`,
      userId,
      fullName: fullName || email.split('@')[0],
      email: email.toLowerCase(),
      university: 'State University',
      degree: 'B.S. Computer Science',
      branch: 'Computer Science',
      currentYear: 'Junior (3rd Year)',
      graduationYear: 2027,
      technicalSkills: ['Python', 'Data Structures', 'Git'],
      programmingLanguages: ['Python'],
      projects: [],
      certifications: [],
      githubProfile: '',
      linkedinProfile: '',
      portfolioWebsite: '',
      resumeUrl: '',
      careerInterests: ['Software Engineering'],
      preferredCompanies: ['Google', 'Microsoft'],
      preferredLocations: ['Remote'],
      completionPercentage: 45,
    });
  }

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
    expiresIn: '24h',
  });

  return res.status(201).json({
    message: 'Registration successful',
    token,
    user: { id: newUser.id, email: newUser.email, role: newUser.role, fullName },
  });
});

app.post('/api/v1/auth/login/', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  const profile = db.student_profiles.find((p) => p.userId === user.id);

  return res.json({
    access: token,
    refresh: `rf_${Date.now()}`,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: profile?.fullName || user.email.split('@')[0],
    },
  });
});

app.get('/api/v1/auth/me/', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const profile = db.student_profiles.find((p) => p.userId === user.id);
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    profile,
  });
});

// 2. STUDENT PROFILES
app.get('/api/v1/profiles/me/', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  let profile = db.student_profiles.find((p) => p.userId === user.id);
  if (!profile) {
    profile = db.student_profiles[0]; // fallback to demo profile
  }
  const completion = calculateProfileCompletion(profile);
  profile.completionPercentage = completion.percentage;

  res.json({
    profile,
    completion,
  });
});

app.put('/api/v1/profiles/me/', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  let profile = db.student_profiles.find((p) => p.userId === user.id);
  if (!profile) {
    profile = db.student_profiles[0];
  }

  Object.assign(profile, req.body);
  const completion = calculateProfileCompletion(profile);
  profile.completionPercentage = completion.percentage;

  // Add activity log
  db.activity_logs.unshift({
    id: `log_${Date.now()}`,
    userId: user.id,
    action: 'Student profile updated',
    category: 'user_action',
    timestamp: new Date().toISOString(),
  });

  res.json({
    message: 'Profile updated successfully',
    profile,
    completion,
  });
});

// Upload resume simulation & extraction
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
app.post('/api/v1/profiles/resume/upload/', upload.single('resume'), (req: Request, res: Response) => {
  const fileName = req.file?.originalname || 'Uploaded_Resume.pdf';
  const extractedSkills = ['Python', 'Docker', 'React', 'TypeScript', 'PostgreSQL', 'Git', 'REST APIs'];

  const user = (req as any).user || db.users[0];
  let profile = db.student_profiles.find((p) => p.userId === user.id) || db.student_profiles[0];

  profile.resumeUrl = `/uploads/resumes/${fileName}`;
  // Merge skills
  const currentSkills = new Set(profile.technicalSkills || []);
  extractedSkills.forEach((s) => currentSkills.add(s));
  profile.technicalSkills = Array.from(currentSkills);

  const completion = calculateProfileCompletion(profile);
  profile.completionPercentage = completion.percentage;

  db.activity_logs.unshift({
    id: `log_${Date.now()}`,
    userId: user.id,
    action: `Uploaded and parsed resume: ${fileName}. Extracted ${extractedSkills.length} skills.`,
    category: 'ai_generation',
    timestamp: new Date().toISOString(),
  });

  res.json({
    message: 'Resume uploaded and parsed successfully!',
    fileName,
    extractedSkills,
    aiScore: 88,
    profile,
  });
});

// 3. PEOPLE DISCOVERY
app.get('/api/v1/people/', (req: Request, res: Response) => {
  const { company, role, search } = req.query;
  let results = db.professional_profiles;

  if (company && typeof company === 'string' && company !== 'All') {
    results = results.filter((p) => p.organization.toLowerCase() === company.toLowerCase());
  }
  if (role && typeof role === 'string' && role !== 'All') {
    results = results.filter((p) => p.role.toLowerCase().includes(role.toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.fullName.toLowerCase().includes(s) ||
        p.organization.toLowerCase().includes(s) ||
        p.skills.some((sk) => sk.toLowerCase().includes(s))
    );
  }

  res.json({ count: results.length, people: results });
});

app.get('/api/v1/people/:id/', (req: Request, res: Response) => {
  const person = db.professional_profiles.find((p) => p.id === req.params.id);
  if (!person) {
    return res.status(404).json({ error: 'Professional profile not found' });
  }
  res.json(person);
});

// 4. OPPORTUNITY DISCOVERY
app.get('/api/v1/opportunities/', (req: Request, res: Response) => {
  const { organization, category, search, remote } = req.query;
  let list = db.opportunities;

  if (organization && typeof organization === 'string' && organization !== 'All') {
    list = list.filter((o) => o.organization.toLowerCase() === organization.toLowerCase());
  }
  if (category && typeof category === 'string' && category !== 'All') {
    list = list.filter((o) => o.category === category);
  }
  if (remote === 'true') {
    list = list.filter((o) => o.isRemote);
  }
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    list = list.filter(
      (o) =>
        o.title.toLowerCase().includes(s) ||
        o.organization.toLowerCase().includes(s) ||
        o.requiredSkills.some((sk) => sk.toLowerCase().includes(s))
    );
  }

  // Calculate student match scores for current user
  const student = db.student_profiles[0];
  const enriched = list.map((opp) => {
    const match = computeOpportunityMatch(student.technicalSkills, opp as any, student.graduationYear);
    return { ...opp, match };
  });

  res.json({ count: enriched.length, opportunities: enriched });
});

// 5. NETWORKING CRM & APPROVAL CENTER
app.get('/api/v1/networking/drafts/', authenticateToken, (_req: Request, res: Response) => {
  res.json({ drafts: db.connection_drafts });
});

app.post('/api/v1/networking/drafts/', authenticateToken, (req: Request, res: Response) => {
  const { targetProfessionalId, purpose, subject, content } = req.body;
  const target = db.professional_profiles.find((p) => p.id === targetProfessionalId) || db.professional_profiles[0];

  const newDraft = {
    id: `draft_${Date.now()}`,
    studentId: (req as any).user?.id || 'usr_demo_student',
    targetProfessionalId: target.id,
    targetName: target.fullName,
    organization: target.organization,
    targetRole: target.role,
    purpose: purpose || 'connection',
    subject: subject || `Connecting regarding ${target.skills[0]} at ${target.organization}`,
    content: content || 'Hello, I would love to connect!',
    status: 'draft',
    isApprovedByUser: false,
    approvedAt: null,
    createdAt: new Date().toISOString(),
  };

  db.connection_drafts.unshift(newDraft);
  res.status(201).json(newDraft);
});

app.patch('/api/v1/networking/drafts/:id/', authenticateToken, (req: Request, res: Response) => {
  const draft = db.connection_drafts.find((d) => d.id === req.params.id);
  if (!draft) return res.status(404).json({ error: 'Draft not found' });

  if (req.body.subject) draft.subject = req.body.subject;
  if (req.body.content) draft.content = req.body.content;

  res.json({ message: 'Draft updated', draft });
});

app.post('/api/v1/networking/drafts/:id/approve/', authenticateToken, (req: Request, res: Response) => {
  const draft = db.connection_drafts.find((d) => d.id === req.params.id);
  if (!draft) return res.status(404).json({ error: 'Draft not found' });

  draft.status = 'approved';
  draft.isApprovedByUser = true;
  draft.approvedAt = new Date().toISOString();

  // Add to networking target pipeline
  const existingTarget = db.networking_targets.find((t) => t.professionalId === draft.targetProfessionalId);
  if (existingTarget) {
    existingTarget.relationshipStatus = 'outreached';
    existingTarget.lastContactDate = new Date().toISOString();
  } else {
    db.networking_targets.unshift({
      id: `net_${Date.now()}`,
      studentId: draft.studentId,
      professionalId: draft.targetProfessionalId,
      professionalName: draft.targetName,
      organization: draft.organization,
      role: draft.targetRole,
      relationshipStatus: 'outreached',
      notes: `Approved message: ${draft.subject}`,
      lastContactDate: new Date().toISOString(),
      nextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });
  }

  // Activity log
  db.activity_logs.unshift({
    id: `log_${Date.now()}`,
    userId: draft.studentId,
    action: `Approved outreach message for ${draft.targetName} (${draft.organization})`,
    category: 'user_action',
    timestamp: new Date().toISOString(),
  });

  res.json({
    message: 'Message approved and ready for authorized send or manual handoff.',
    draft,
  });
});

app.get('/api/v1/networking/', authenticateToken, (_req: Request, res: Response) => {
  res.json({
    targets: db.networking_targets,
    drafts: db.connection_drafts,
  });
});

// 6. APPLICATIONS TRACKER
app.get('/api/v1/applications/', authenticateToken, (_req: Request, res: Response) => {
  res.json({ applications: db.applications });
});

app.post('/api/v1/applications/', authenticateToken, (req: Request, res: Response) => {
  const { opportunityId } = req.body;
  const opp = db.opportunities.find((o) => o.id === opportunityId);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

  const existing = db.applications.find((a) => a.opportunityId === opportunityId);
  if (existing) {
    return res.status(409).json({ error: 'Application already tracked for this opportunity', application: existing });
  }

  const newApp = {
    id: `app_${Date.now()}`,
    studentId: 'usr_demo_student',
    opportunityId: opp.id,
    opportunityTitle: opp.title,
    organization: opp.organization,
    status: 'saved',
    submissionDate: null,
    interviewDate: null,
    notes: 'Saved from Opportunity Discovery',
    updatedAt: new Date().toISOString(),
    documents: {
      coverLetter: '',
      tailoredResumeUrl: '',
    },
  };

  db.applications.unshift(newApp);
  res.status(201).json(newApp);
});

app.patch('/api/v1/applications/:id/', authenticateToken, (req: Request, res: Response) => {
  const appItem = db.applications.find((a) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  if (req.body.status) {
    if (!isValidApplicationTransition(appItem.status, req.body.status)) {
      return res.status(400).json({
        error: `Invalid status transition from '${appItem.status}' to '${req.body.status}'`,
      });
    }
    appItem.status = req.body.status;
  }
  if (req.body.notes !== undefined) appItem.notes = req.body.notes;
  if (req.body.interviewDate) appItem.interviewDate = req.body.interviewDate;
  if (req.body.submissionDate) appItem.submissionDate = req.body.submissionDate;
  appItem.updatedAt = new Date().toISOString();

  res.json({ message: 'Application updated', application: appItem });
});

// 7. GEMINI AI ENGINE
app.post('/api/v1/ai/networking-message/', async (req: Request, res: Response) => {
  const { professionalId, purpose = 'mentorship', customNotes = '' } = req.body;
  const professional =
    db.professional_profiles.find((p) => p.id === professionalId) || db.professional_profiles[0];
  const student = db.student_profiles[0];

  // Try real Gemini API if key is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `You are CareerBridge AI's expert networking agent.
Generate a concise, professional, authentic outreach message from a university student to an industry leader.

STUDENT INFO:
Name: ${student.fullName}
University: ${student.university}
Degree: ${student.degree}
Key Skills: ${student.technicalSkills.join(', ')}
Notable Projects: ${student.projects.map((p) => p.title).join('; ')}

PROFESSIONAL TARGET:
Name: ${professional.fullName}
Organization: ${professional.organization}
Role: ${professional.role}
Department: ${professional.department}
Skills: ${professional.skills.join(', ')}
Bio: ${professional.bio}

OUTREACH PURPOSE: ${purpose}
ADDITIONAL NOTES: ${customNotes}

RULES:
- Maximum 150 words.
- Professional, respectful, and zero buzzwords.
- Mention 1 specific overlap between student background and the professional's engineering domain.
- Clear, low-friction ask (e.g., 10-15 minute informational coffee or review of project design).
- Return in JSON format with "subject" and "body" keys only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({
          source: 'gemini-2.5-flash',
          subject: parsed.subject,
          body: parsed.body,
        });
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to rule-based template:', err);
    }
  }

  // Deterministic high-quality template fallback
  const draft = generateOutreachDraft({
    studentName: student.fullName,
    university: student.university,
    professionalName: professional.fullName,
    professionalRole: professional.role,
    company: professional.organization,
    sharedInterests: professional.skills.slice(0, 2),
    purpose: purpose as any,
  });

  return res.json({
    source: 'careerbridge-template-engine',
    subject: draft.subject,
    body: draft.body,
  });
});

app.post('/api/v1/ai/cover-letter/', async (req: Request, res: Response) => {
  const { opportunityId, companyName, roleTitle } = req.body;
  const opp = db.opportunities.find((o) => o.id === opportunityId) || db.opportunities[0];
  const student = db.student_profiles[0];

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `Write a compelling, concise 3-paragraph internship cover letter for ${student.fullName} applying to ${opp.organization} for ${opp.title}.
Student Skills: ${student.technicalSkills.join(', ')}
Projects: ${student.projects.map((p) => `${p.title}: ${p.description}`).join(' | ')}
Requirements: ${opp.requiredSkills.join(', ')}

Highlight specific project contributions, technical curiosity, and alignment with ${opp.organization}. Return clean text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        return res.json({ coverLetter: response.text });
      }
    } catch (err) {
      console.warn('Gemini cover letter call error:', err);
    }
  }

  const fallback = `Dear Hiring Team at ${opp.organization},\n\nI am thrilled to apply for the ${opp.title} position. As a student in ${student.degree} at ${student.university}, I have cultivated a strong foundation in ${student.technicalSkills.slice(0, 3).join(', ')}.\n\nRecently, I developed ${student.projects[0]?.title || 'distributed systems projects'}, which directly reflects the skills required for this role. I admire ${opp.organization}'s technical standards and look forward to contributing to your engineering initiatives.\n\nSincerely,\n${student.fullName}`;

  res.json({ coverLetter: fallback });
});

app.post('/api/v1/ai/chat/', async (req: Request, res: Response) => {
  const { message, history = [] } = req.body;
  const student = db.student_profiles[0];

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI();
      const systemInstruction = `You are CareerBridge AI's Senior Career Copilot.
You assist university students and aspiring software engineers with discovering Google and Microsoft opportunities, networking with staff engineers, preparing resumes, and mapping out skills.
Student Profile:
Name: ${student.fullName}
University: ${student.university} (${student.degree}, Class of ${student.graduationYear})
Skills: ${student.technicalSkills.join(', ')}
Projects: ${student.projects.map((p) => p.title).join(', ')}

Guidelines:
- Give structured, direct, highly practical advice.
- When suggesting opportunities, recommend Google SWE Intern, Microsoft AI Research Fellowship, or Google Summer of Code.
- Do not make false guarantees about hiring, but give high-leverage preparation steps.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          ...history.map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ],
      });

      if (response.text) {
        return res.json({ reply: response.text });
      }
    } catch (err) {
      console.warn('Gemini chat failed, fallback response used:', err);
    }
  }

  // Smart conversational fallback
  let reply = `Based on your profile at ${student.university} with skills in ${student.technicalSkills.slice(0, 3).join(', ')}, you have a solid trajectory! For Google SWE internships, I recommend focusing on LeetCode Mediums on graphs and dynamic programming, plus polishing your Raft key-value store repo.`;
  if (message.toLowerCase().includes('microsoft')) {
    reply = `For Microsoft opportunities, their early-career programs value strong collaboration, systems understanding, and Azure cloud curiosity. Reaching out to Marcus Vance (Principal SWE on Azure Storage) for informational advice would be a great next step!`;
  } else if (message.toLowerCase().includes('resume')) {
    reply = `Your resume currently scores 88/100. To push it past 95, quantify the impact in your Raft project (e.g. latency metrics, requests per second) and ensure your GitHub link is prominent.`;
  }

  res.json({ reply });
});

// 8. AUTOMATION & CELERY BACKGROUND SIMULATION
app.get('/api/v1/automation/tasks/', (_req: Request, res: Response) => {
  res.json({ tasks: db.agent_tasks });
});

app.post('/api/v1/automation/tasks/:id/pause/', (req: Request, res: Response) => {
  const task = db.agent_tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.status = 'paused';
  task.logs.unshift(`[${new Date().toISOString()}] Task manually paused by user`);
  res.json({ message: 'Task paused', task });
});

app.post('/api/v1/automation/tasks/:id/resume/', (req: Request, res: Response) => {
  const task = db.agent_tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.status = 'running';
  task.logs.unshift(`[${new Date().toISOString()}] Task resumed`);
  res.json({ message: 'Task resumed', task });
});

app.post('/api/v1/automation/emergency-stop/', (_req: Request, res: Response) => {
  db.agent_tasks.forEach((t) => {
    t.status = 'paused';
    t.logs.unshift(`[${new Date().toISOString()}] EMERGENCY KILLSWITCH ACTIVATED - Worker execution halted`);
  });
  res.json({ message: 'All automated tasks immediately stopped.' });
});

// 9. ANALYTICS & NOTIFICATIONS
app.get('/api/v1/analytics/overview/', (_req: Request, res: Response) => {
  res.json({
    profileCompletion: db.student_profiles[0]?.completionPercentage || 85,
    totalApplications: db.applications.length,
    applicationsByStatus: {
      saved: db.applications.filter((a) => a.status === 'saved').length,
      preparing: db.applications.filter((a) => a.status === 'preparing').length,
      ready_for_review: db.applications.filter((a) => a.status === 'ready_for_review').length,
      submitted: db.applications.filter((a) => a.status === 'submitted').length,
      interview: db.applications.filter((a) => a.status === 'interview').length,
    },
    networkingOutreachCount: db.connection_drafts.length + db.networking_targets.length,
    discoveredOpportunitiesCount: db.opportunities.length,
    discoveredProfessionalsCount: db.professional_profiles.length,
    weeklyActivity: [
      { day: 'Mon', applications: 1, outreach: 2 },
      { day: 'Tue', applications: 0, outreach: 1 },
      { day: 'Wed', applications: 2, outreach: 3 },
      { day: 'Thu', applications: 1, outreach: 0 },
      { day: 'Fri', applications: 0, outreach: 2 },
      { day: 'Sat', applications: 1, outreach: 1 },
      { day: 'Sun', applications: 0, outreach: 1 },
    ],
  });
});

app.get('/api/v1/notifications/', (_req: Request, res: Response) => {
  res.json({ notifications: db.notifications });
});

// -----------------------------------------------------------------------------
// VITE MIDDLEWARE / STATIC ASSETS
// -----------------------------------------------------------------------------
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CareerBridge AI server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start CareerBridge AI server:', err);
});
