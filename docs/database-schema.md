# CareerBridge AI - MongoDB Database Schema

The database runs on **MongoDB Atlas** using PyMongo / Mongoose schemas across 20 primary collections with optimized compound indexes.

## The 20 Primary MongoDB Collections

### 1. `users`
- `_id`: ObjectId
- `email`: String (Unique, Indexed)
- `passwordHash`: String (Argon2 / bcrypt)
- `role`: Enum ['student', 'educator', 'professional', 'recruiter', 'admin']
- `isVerified`: Boolean
- `createdAt`: Date
- `updatedAt`: Date

### 2. `student_profiles`
- `_id`: ObjectId
- `userId`: ObjectId (Ref: users, Unique, Indexed)
- `fullName`: String
- `university`: String
- `degree`: String
- `branch`: String
- `currentYear`: String
- `graduationYear`: Number (Indexed)
- `technicalSkills`: Array<String> (Indexed)
- `programmingLanguages`: Array<String>
- `projects`: Array<{ title, description, techStack, githubUrl, liveDemoUrl }>
- `certifications`: Array<{ title, issuer, issueDate, credentialUrl }>
- `githubProfile`: String
- `linkedinProfile`: String
- `portfolioWebsite`: String
- `resumeId`: ObjectId (Ref: resumes)
- `careerInterests`: Array<String>
- `preferredCompanies`: Array<String>
- `preferredLocations`: Array<String>
- `completionPercentage`: Number

### 3. `educator_profiles`
- `_id`: ObjectId
- `userId`: ObjectId (Ref: users)
- `fullName`: String
- `university`: String
- `department`: String
- `academicTitle`: String (Professor, Associate Prof, Dean)
- `researchAreas`: Array<String>
- `acceptingStudentResearchers`: Boolean
- `officeHours`: String

### 4. `professional_profiles`
- `_id`: ObjectId
- `userId`: ObjectId (Ref: users, optional for discovered profiles)
- `fullName`: String
- `organization`: String (Google, Microsoft, etc., Indexed)
- `role`: String (Staff SWE, Senior AI Researcher, Recruiter)
- `department`: String (DeepMind, Azure, Systems)
- `location`: String
- `skills`: Array<String>
- `mentorshipOpen`: Boolean
- `verifiedSource`: String (Official Corporate Directory / Confirmed Public Profile)
- `lastVerifiedDate`: Date

### 5. `organizations`
- `_id`: ObjectId
- `name`: String (Unique, Indexed)
- `domain`: String
- `logoUrl`: String
- `headquarters`: String
- `verifiedCareerPortal`: String

### 6. `skills`
- `_id`: ObjectId
- `name`: String (Unique, Indexed)
- `category`: Enum ['Languages', 'Frameworks', 'Cloud', 'Data & AI', 'DevOps', 'Foundations']
- `synonyms`: Array<String>

### 7. `resumes`
- `_id`: ObjectId
- `userId`: ObjectId (Ref: users)
- `fileName`: String
- `fileSize`: Number
- `mimeType`: String
- `extractedText`: String
- `extractedSkills`: Array<String>
- `aiQualityScore`: Number (0-100)
- `missingSkills`: Array<String>
- `aiFeedback`: String
- `uploadedAt`: Date

### 8. `projects`
- `_id`: ObjectId
- `studentId`: ObjectId
- `title`: String
- `description`: String
- `techStack`: Array<String>
- `highlights`: Array<String>
- `repoUrl`: String

### 9. `opportunities`
- `_id`: ObjectId
- `title`: String (Indexed)
- `organization`: String (Indexed)
- `description`: String
- `eligibilityRequirements`: Array<String>
- `requiredSkills`: Array<String> (Indexed)
- `location`: String
- `isRemote`: Boolean
- `compensation`: String
- `applicationDeadline`: Date (Indexed)
- `officialUrl`: String
- `verifiedSource`: String
- `verificationStatus`: Enum ['verified', 'official_feed', 'partner']

### 10. `opportunity_matches`
- `_id`: ObjectId
- `studentId`: ObjectId (Ref: users, Indexed)
- `opportunityId`: ObjectId (Ref: opportunities, Indexed)
- `matchScore`: Number (0-100)
- `matchingSkills`: Array<String>
- `missingSkills`: Array<String>
- `eligibilityPassed`: Boolean
- `aiAnalysis`: String
- `computedAt`: Date

### 11. `networking_targets`
- `_id`: ObjectId
- `studentId`: ObjectId (Ref: users)
- `professionalId`: ObjectId (Ref: professional_profiles)
- `relationshipStatus`: Enum ['discovered', 'drafted', 'outreached', 'meeting_scheduled', 'connected']
- `notes`: String
- `lastContactDate`: Date
- `nextFollowUpDate`: Date

### 12. `connection_drafts`
- `_id`: ObjectId
- `studentId`: ObjectId (Ref: users)
- `targetProfessionalId`: ObjectId (Ref: professional_profiles)
- `purpose`: Enum ['mentorship', 'referral', 'research', 'connection']
- `subject`: String
- `content`: String
- `status`: Enum ['draft', 'approved', 'sent', 'archived']
- `isApprovedByUser`: Boolean
- `approvedAt`: Date

### 13. `outreach_messages`
- `_id`: ObjectId
- `draftId`: ObjectId (Ref: connection_drafts)
- `channel`: Enum ['email', 'linkedin_manual_handoff', 'in_platform']
- `deliveryStatus`: Enum ['dispatched', 'manual_copied', 'failed']
- `sentAt`: Date

### 14. `applications`
- `_id`: ObjectId
- `studentId`: ObjectId (Ref: users, Indexed)
- `opportunityId`: ObjectId (Ref: opportunities, Indexed)
- `status`: Enum ['saved', 'interested', 'preparing', 'ready_for_review', 'submitted', 'under_review', 'interview', 'rejected', 'accepted', 'withdrawn']
- `submissionDate`: Date
- `interviewDate`: Date
- `notes`: String

### 15. `application_documents`
- `_id`: ObjectId
- `applicationId`: ObjectId (Ref: applications)
- `docType`: Enum ['resume_tailored', 'cover_letter', 'essay_response', 'portfolio_link']
- `content`: String
- `fileUrl`: String

### 16. `notifications`
- `_id`: ObjectId
- `userId`: ObjectId (Ref: users, Indexed)
- `title`: String
- `message`: String
- `type`: Enum ['deadline_alert', 'approval_pending', 'new_match', 'task_completed']
- `isRead`: Boolean
- `createdAt`: Date

### 17. `agent_tasks`
- `_id`: ObjectId
- `taskType`: Enum ['opportunity_crawler', 'deadline_monitor', 'weekly_digest', 'skills_matcher']
- `status`: Enum ['scheduled', 'running', 'completed', 'paused', 'failed']
- `lastRun`: Date
- `nextRun`: Date
- `logs`: Array<String>

### 18. `approval_requests`
- `_id`: ObjectId
- `userId`: ObjectId (Ref: users)
- `actionType`: Enum ['outreach_send', 'application_submission', 'data_export']
- `payloadSummary`: String
- `status`: Enum ['pending_user_decision', 'approved', 'rejected']
- `requestedAt`: Date

### 19. `activity_logs`
- `_id`: ObjectId
- `userId`: ObjectId
- `action`: String
- `category`: Enum ['ai_generation', 'user_action', 'celery_worker', 'auth']
- `ipAddress`: String
- `timestamp`: Date

### 20. `integration_settings`
- `_id`: ObjectId
- `userId`: ObjectId
- `geminiApiKeyConfigured`: Boolean
- `celerySchedulerActive`: Boolean
- `emailNotificationsEnabled`: Boolean
- `privacyLevel`: Enum ['public', 'connections_only', 'stealth']
