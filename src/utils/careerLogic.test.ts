import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProfileCompletion,
  computeOpportunityMatch,
  isValidApplicationTransition,
  generateOutreachDraft,
  normalizeSkill,
  type Opportunity,
} from './careerLogic';

test('calculateProfileCompletion computes 0% for empty profile', () => {
  const result = calculateProfileCompletion({});
  assert.equal(result.percentage, 0);
  assert.ok(result.missingSections.length > 0);
});

test('calculateProfileCompletion computes ~100% for full student profile', () => {
  const result = calculateProfileCompletion({
    fullName: 'Jane Doe',
    email: 'jane@mit.edu',
    university: 'MIT',
    degree: 'B.S. Computer Science',
    graduationYear: 2026,
    technicalSkills: ['Python', 'Docker', 'Distributed Systems'],
    programmingLanguages: ['Python', 'Go'],
    projects: [{ title: 'Mini Raft', description: 'Consensus engine' }],
    githubProfile: 'https://github.com/janedoe',
    resumeUrl: '/uploads/resumes/jane.pdf',
    careerInterests: ['Cloud Computing', 'AI Systems'],
    preferredCompanies: ['Google', 'Microsoft'],
  });
  assert.equal(result.percentage, 100);
  assert.equal(result.missingSections.length, 0);
});

test('normalizeSkill standardizes variations properly', () => {
  assert.equal(normalizeSkill('Node.js'), 'node js');
  assert.equal(normalizeSkill('React-JS '), 'react js');
  assert.equal(normalizeSkill('C++'), 'c++');
});

test('computeOpportunityMatch calculates matching and missing skills accurately', () => {
  const mockOpportunity: Opportunity = {
    id: 'opp-google-swe',
    title: 'Software Engineering Intern, Summer 2027',
    organization: 'Google',
    description: 'Build large-scale distributed systems and search infrastructure.',
    requiredSkills: ['Python', 'Data Structures', 'Distributed Systems', 'Go'],
    eligibilityRequirements: ['Currently enrolled in BS/MS degree'],
    location: 'Mountain View, CA',
    isRemote: false,
    deadline: '2028-01-01',
    officialUrl: 'https://careers.google.com/jobs/results/',
    verifiedSource: 'Google Careers Official Portal',
    verificationStatus: 'verified',
  };

  const studentSkills = ['Python', 'Data Structures', 'Docker'];
  const match = computeOpportunityMatch(studentSkills, mockOpportunity, 2027);

  assert.ok(match.matchScore >= 40);
  assert.ok(match.matchingSkills.includes('Python'));
  assert.ok(match.matchingSkills.includes('Data Structures'));
  assert.ok(match.missingSkills.includes('Distributed Systems'));
  assert.ok(match.missingSkills.includes('Go'));
  assert.equal(match.eligibilityPassed, true);
});

test('isValidApplicationTransition enforces valid application lifecycle rules', () => {
  assert.equal(isValidApplicationTransition('saved', 'interested'), true);
  assert.equal(isValidApplicationTransition('saved', 'preparing'), true);
  assert.equal(isValidApplicationTransition('preparing', 'ready_for_review'), true);
  assert.equal(isValidApplicationTransition('ready_for_review', 'submitted'), true);
  assert.equal(isValidApplicationTransition('submitted', 'interview'), true);
  assert.equal(isValidApplicationTransition('interview', 'accepted'), true);

  // Prohibited illegal jumps
  assert.equal(isValidApplicationTransition('saved', 'accepted'), false);
  assert.equal(isValidApplicationTransition('saved', 'submitted'), false);
});

test('generateOutreachDraft produces targeted subject and respectful body', () => {
  const draft = generateOutreachDraft({
    studentName: 'Alex Rivera',
    university: 'Stanford University',
    professionalName: 'Dr. Sarah Lin',
    professionalRole: 'Staff Research Scientist',
    company: 'Google DeepMind',
    sharedInterests: ['Reinforcement Learning', 'Transformers'],
    purpose: 'research',
  });

  assert.ok(draft.subject.includes('research'));
  assert.ok(draft.body.includes('Alex Rivera'));
  assert.ok(draft.body.includes('Dr. Sarah Lin'));
  assert.ok(draft.body.includes('Google DeepMind'));
});
