# CareerBridge AI - System Architecture

CareerBridge AI is an AI-powered Career Networking and Opportunity Automation Platform connecting students and aspiring software engineers with Google and Microsoft engineers, university professors, research scholars, recruiters, and top-tier internship programs.

## 1. High-Level Architecture Overview

```
+------------------------------------------------------------------------+
|                              CLIENT LAYER                              |
|   React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion   |
|   (Interactive Dashboard, Profile, Discovery, CRM, AI Chat, Tracker)   |
+-----------------------------------+------------------------------------+
                                    | HTTPS / REST JSON (JWT Bearer)
                                    v
+-----------------------------------+------------------------------------+
|                         APPLICATION GATEWAY                            |
|             Port 3000 Express Server / Django REST Framework           |
|  - JWT Authentication & RBAC (Student, Educator, Professional, Recruiter)|
|  - Rate Limiting, Audit Logging & Input Sanitization                   |
|  - File Upload Handler (PDF/DOCX Resume parsing)                       |
+--------+------------------+------------------+-----------------+-------+
         |                  |                  |                 |
         v                  v                  v                 v
+----------------+ +----------------+ +----------------+ +---------------+
| ACCOUNTS &     | | OPPORTUNITY    | | AI PEOPLE      | | NETWORKING CRM|
| PROFILES       | | ENGINE         | | DISCOVERY      | | & APPROVAL    |
| - Profile Comp | | - Google/MSFT  | | - Mentors/Engs | | - Human-in-  |
| - Skills Graph | | - GSoC / Feeds | | - Relevance    | |   the-loop    |
+--------+-------+ +--------+-------+ +--------+-------+ +-------+-------+
         |                  |                  |                 |
         +------------------+------------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
|  GOOGLE GEMINI AI     |                       | MONGODB ATLAS / PYMONGO|
|  (gemini-2.5-flash)   |                       | 20 Schemas / Collections
|  - Resume Analysis    |                       | - users, student_prof |
|  - Opportunity Match  |                       | - opportunities, crm  |
|  - Personalized Pitch |                       | - applications, tasks |
|  - Career Assistant   |                       +-----------+-----------+
+-----------------------+                                   |
                                                            v
                                                +-----------------------+
                                                | CELERY & REDIS WORKERS|
                                                | - Deadline Monitoring |
                                                | - Profile Reminders   |
                                                | - Follow-up Automation|
                                                | - Emergency Killswitch|
                                                +-----------------------+
```

## 2. Frontend / Backend Communication
- Base API: `/api/v1/`
- Authentication: Stateless JWT Access (`Bearer <token>`) with automatic token renewal and refresh mechanisms.
- File Streaming: Resumes uploaded via `multipart/form-data` with MIME validation (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
- Error Uniformity: Standardized JSON envelope:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "timestamp": "2026-11-02T05:00:00Z"
  }
  ```

## 3. Human-in-the-Loop AI Governance
To protect student reputation and adhere strictly to anti-spam policies:
- AI networking drafts are **NEVER sent automatically**.
- All messages require student review and explicit "Approve & Copy/Send" action in the Message Approval Center.
- No scraping of restricted LinkedIn sessions or harvesting private contact records.
- All opportunity links link to official company domains (`careers.google.com`, `careers.microsoft.com`, `summerofcode.withgoogle.com`).
