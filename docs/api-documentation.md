# CareerBridge AI - REST API Specification

Base URL: `/api/v1`

All protected endpoints require the HTTP Header:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

## 1. Authentication (`/api/v1/auth/`)
- `POST /auth/register/` - Register a new user (`email`, `password`, `role`: 'student' | 'educator' | 'professional' | 'recruiter')
- `POST /auth/login/` - Authenticate credentials and receive `{ access, refresh, user }`
- `POST /auth/refresh/` - Refresh expired access token using refresh token
- `POST /auth/logout/` - Invalidate session token
- `GET /auth/me/` - Retrieve authenticated user profile and account details

## 2. Student Profiles (`/api/v1/profiles/`)
- `GET /profiles/me/` - Fetch current student profile, skills, projects, and career preferences
- `PUT /profiles/me/` - Update profile attributes, skills, and links
- `POST /profiles/resume/upload/` - Upload PDF/DOCX resume file; runs parsing and skills extraction
- `GET /profiles/me/completion/` - Calculate current completeness score (0-100%) and missing action items

## 3. People Discovery (`/api/v1/people/`)
- `GET /people/` - Filter professionals by `company`, `role`, `skills`, `mentorshipOpen`
- `GET /people/:id/` - Detailed profile with background, publications/projects, and verified source
- `POST /people/match/` - Run AI student-mentor relevance scoring
- `POST /people/:id/draft-message/` - Generate personalized connection/mentorship message with Gemini

## 4. Opportunities (`/api/v1/opportunities/`)
- `GET /opportunities/` - Query verified internships, fellowships, and research roles
- `GET /opportunities/:id/` - View full requirements, eligibility, compensation, official portal URL
- `POST /opportunities/match/` - Match opportunities against student profile skills
- `POST /opportunities/:id/save/` - Bookmark opportunity to student pipeline
- `GET /opportunities/recommended/` - Top algorithmic & AI recommendations for current student

## 5. Networking CRM & Approval Center (`/api/v1/networking/`)
- `GET /networking/` - List targeted professionals, outreach stages, and follow-up deadlines
- `GET /networking/drafts/` - List pending connection drafts
- `POST /networking/drafts/` - Create a custom or AI-assisted connection draft
- `PATCH /networking/drafts/:id/` - Edit subject or message body
- `POST /networking/drafts/:id/approve/` - Explicit user authorization; prepares handoff or dispatches email

## 6. Applications (`/api/v1/applications/`)
- `GET /applications/` - List all student job & internship applications with status
- `POST /applications/` - Create a new application entry
- `GET /applications/:id/` - View application timeline, tailored docs, and notes
- `PATCH /applications/:id/` - Update status (enforcing valid state transitions)
- `POST /applications/:id/prepare/` - Generate tailored cover letter & interview checklist with Gemini
- `POST /applications/:id/request-approval/` - Create human-in-the-loop sign-off before external submission

## 7. AI Engine (`/api/v1/ai/`)
- `POST /ai/resume-analysis/` - Comprehensive resume breakdown with ATS score & missing skills
- `POST /ai/opportunity-match/` - In-depth fit analysis for an opportunity
- `POST /ai/networking-message/` - Gemini prompt-engineered connection pitch
- `POST /ai/cover-letter/` - Custom cover letter tailored to specific job description
- `POST /ai/chat/` - Interactive career assistant chatbot

## 8. Automation & Celery (`/api/v1/automation/`)
- `GET /automation/tasks/` - List scheduled background tasks and execution logs
- `POST /automation/tasks/:id/pause/` - Pause automated job
- `POST /automation/tasks/:id/resume/` - Resume automated job
- `POST /automation/emergency-stop/` - Immediate safety killswitch halting all background workers
