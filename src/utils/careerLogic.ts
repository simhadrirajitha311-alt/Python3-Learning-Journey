/**
 * Pure business logic for CareerBridge AI.
 * Decoupled from UI to enable fast unit testing via node:test.
 */

export interface StudentProfile {
  fullName: string;
  email: string;
  university?: string;
  degree?: string;
  branch?: string;
  currentYear?: string;
  graduationYear?: number;
  technicalSkills: string[];
  programmingLanguages: string[];
  projects: Array<{ title: string; description: string; techStack?: string[] }>;
  certifications?: string[];
  githubProfile?: string;
  linkedinProfile?: string;
  portfolioWebsite?: string;
  resumeUrl?: string;
  careerInterests: string[];
  preferredCompanies: string[];
  preferredLocations?: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  requiredSkills: string[];
  eligibilityRequirements: string[];
  location: string;
  isRemote: boolean;
  deadline: string;
  officialUrl: string;
  verifiedSource: string;
  verificationStatus: 'verified' | 'official_feed' | 'partner';
}

export interface MatchResult {
  matchScore: number; // 0 to 100
  matchingSkills: string[];
  missingSkills: string[];
  eligibilityPassed: boolean;
  reasoning: string;
}

/**
 * Calculates student profile completeness as a percentage (0 - 100).
 */
export function calculateProfileCompletion(profile: Partial<StudentProfile>): {
  percentage: number;
  missingSections: string[];
  suggestions: string[];
} {
  const checks: Array<{ name: string; weight: number; passed: boolean; tip: string }> = [
    {
      name: 'Basic Information',
      weight: 15,
      passed: Boolean(profile.fullName && profile.email),
      tip: 'Provide your full name and university email address.',
    },
    {
      name: 'Education & Graduation',
      weight: 15,
      passed: Boolean(profile.university && profile.degree && profile.graduationYear),
      tip: 'Add your university, degree program, and anticipated graduation year.',
    },
    {
      name: 'Technical Skills',
      weight: 20,
      passed: Boolean(profile.technicalSkills && profile.technicalSkills.length >= 3),
      tip: 'List at least 3 core technical skills to unlock accurate matching.',
    },
    {
      name: 'Programming Languages',
      weight: 10,
      passed: Boolean(profile.programmingLanguages && profile.programmingLanguages.length >= 1),
      tip: 'Specify your primary programming languages (e.g. Python, TypeScript).',
    },
    {
      name: 'Projects Showcase',
      weight: 15,
      passed: Boolean(profile.projects && profile.projects.length >= 1),
      tip: 'Add at least one notable software or research project with details.',
    },
    {
      name: 'Professional Links',
      weight: 10,
      passed: Boolean(profile.githubProfile || profile.linkedinProfile),
      tip: 'Link your GitHub or LinkedIn profile to build credibility.',
    },
    {
      name: 'Resume File',
      weight: 10,
      passed: Boolean(profile.resumeUrl),
      tip: 'Upload your latest PDF resume for automated parsing.',
    },
    {
      name: 'Career & Company Preferences',
      weight: 5,
      passed: Boolean(profile.careerInterests && profile.careerInterests.length >= 1),
      tip: 'Set target career interests (e.g., AI/ML, Distributed Systems).',
    },
  ];

  let percentage = 0;
  const missingSections: string[] = [];
  const suggestions: string[] = [];

  for (const check of checks) {
    if (check.passed) {
      percentage += check.weight;
    } else {
      missingSections.push(check.name);
      suggestions.push(check.tip);
    }
  }

  return {
    percentage: Math.min(100, Math.max(0, percentage)),
    missingSections,
    suggestions,
  };
}

/**
 * Normalizes skill strings for reliable matching (case-insensitive, trims, removes punctuation).
 */
export function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[._\-\s]+/g, ' ');
}

/**
 * Computes skill overlap and matching score between student skills and opportunity requirements.
 */
export function computeOpportunityMatch(
  studentSkills: string[],
  opportunity: Opportunity,
  studentGraduationYear?: number
): MatchResult {
  const normalizedStudentSkills = new Set(
    (studentSkills || []).map(normalizeSkill)
  );

  const reqSkills = opportunity.requiredSkills || [];
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of reqSkills) {
    const normReq = normalizeSkill(req);
    let matched = false;
    for (const s of normalizedStudentSkills) {
      if (s === normReq || s.includes(normReq) || normReq.includes(s)) {
        matched = true;
        break;
      }
    }
    if (matched) {
      matchingSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const skillMatchRatio = reqSkills.length > 0 ? matchingSkills.length / reqSkills.length : 0.8;
  let rawScore = Math.round(skillMatchRatio * 85);

  // Bonus if student has extra skills or projects
  if (normalizedStudentSkills.size >= 6) {
    rawScore += 10;
  }

  // Check deadline eligibility
  let eligibilityPassed = true;
  if (opportunity.deadline) {
    const deadlineDate = new Date(opportunity.deadline);
    if (!isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < Date.now()) {
      eligibilityPassed = false;
    }
  }

  const finalScore = Math.min(99, Math.max(15, rawScore));
  let reasoning = '';
  if (finalScore >= 80) {
    reasoning = `Strong fit: You match ${matchingSkills.length} of ${reqSkills.length} key required technical skills (${matchingSkills.join(', ')}).`;
  } else if (finalScore >= 50) {
    reasoning = `Moderate fit: You have foundation in ${matchingSkills.join(', ') || 'related areas'}, but could strengthen: ${missingSkills.slice(0, 3).join(', ')}.`;
  } else {
    reasoning = `Emerging fit: Consider learning ${missingSkills.slice(0, 3).join(', ')} to boost alignment.`;
  }

  return {
    matchScore: finalScore,
    matchingSkills,
    missingSkills,
    eligibilityPassed,
    reasoning,
  };
}

/**
 * Validates valid state transitions for job/internship applications.
 * Prevents invalid workflows like transitioning directly from 'saved' to 'accepted'.
 */
export const ALLOWED_APPLICATION_TRANSITIONS: Record<string, string[]> = {
  saved: ['interested', 'preparing', 'withdrawn'],
  interested: ['preparing', 'withdrawn'],
  preparing: ['ready_for_review', 'withdrawn'],
  ready_for_review: ['submitted', 'preparing', 'withdrawn'],
  submitted: ['under_review', 'interview', 'rejected', 'withdrawn'],
  under_review: ['interview', 'rejected', 'withdrawn'],
  interview: ['accepted', 'rejected', 'under_review'],
  rejected: ['saved'], // user can archive or retry
  accepted: [],
  withdrawn: ['saved'],
};

export function isValidApplicationTransition(currentStatus: string, nextStatus: string): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_APPLICATION_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
}

/**
 * Generates tailored outreach message prompts and fallback copy for networking.
 */
export function generateOutreachDraft(params: {
  studentName: string;
  university?: string;
  professionalName: string;
  professionalRole: string;
  company: string;
  sharedInterests: string[];
  purpose: 'mentorship' | 'referral' | 'research' | 'connection';
}): { subject: string; body: string; callToAction: string } {
  const { studentName, university, professionalName, professionalRole, company, sharedInterests, purpose } = params;
  const interestText = sharedInterests.length > 0 ? sharedInterests.slice(0, 2).join(' and ') : 'distributed systems and AI';
  const schoolText = university ? ` at ${university}` : '';

  let subject = `Connecting regarding ${interestText} engineering`;
  let intro = `Hi ${professionalName}, I noticed your impressive engineering work as a ${professionalRole} at ${company}.`;
  let cta = `Would you have 10-15 minutes for a quick virtual coffee to share any perspective on breaking into the field?`;

  if (purpose === 'mentorship') {
    subject = `Aspiring engineer seeking mentorship & guidance in ${interestText}`;
    intro = `Hi ${professionalName}, I am currently a computer science student${schoolText} passionate about ${interestText}.`;
    cta = `I would be deeply grateful for any brief advice or 15-minute conversation on navigating technical growth at ${company}.`;
  } else if (purpose === 'research') {
    subject = `Inquiry regarding research directions in ${interestText}`;
    intro = `Dear Professor/Dr. ${professionalName}, I have been following your published research on ${interestText}.`;
    cta = `I would love to learn if your lab is exploring research internships or collaboration for aspiring student researchers.`;
  } else if (purpose === 'referral') {
    subject = `Career inquiry regarding engineering opportunities at ${company}`;
    intro = `Hi ${professionalName}, I have been preparing for software engineering roles at ${company} and recently built projects utilizing ${interestText}.`;
    cta = `If you have a brief moment to review my background or offer guidance on the hiring process, I'd greatly appreciate it.`;
  }

  const body = `${intro}\n\nI have been building hands-on projects around ${interestText} and admire ${company}'s technical impact.\n\n${cta}\n\nThank you for your time and guidance!\n\nBest regards,\n${studentName}`;

  return {
    subject,
    body,
    callToAction: cta,
  };
}
