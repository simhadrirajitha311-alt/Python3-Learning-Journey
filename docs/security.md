# CareerBridge AI - Security & Privacy Architecture

CareerBridge AI implements a security-first model designed around student safety, anti-spam ethics, and strict data isolation.

## 1. Authentication & Session Management
- **Stateless JWT Tokens**: HMAC-SHA256 tokens issued upon credentials verification. Access tokens expire in 60 minutes. Refresh tokens are persisted with secure HTTP-only cookies or encrypted Bearer refresh channels.
- **Password Protection**: Passwords hashed using standard `bcrypt` with salt rounds >= 10.
- **Cross-User Data Isolation**: Every resource query filters strictly on `userId === req.user.id`.

## 2. Human-in-the-Loop Safeguards
- **Zero Unsolicited Automation**: The system never sends automated LinkedIn connection requests or bulk emails.
- **Message Review Center**: Every AI-generated connection request, mentorship pitch, or referral note must be approved explicitly by the student.
- **Official Application Handoff**: Where authorized application APIs do not exist, the platform prepares verified documents and directs the user to the verified portal URL.

## 3. Data Sanitization & Input Defense
- Strict MIME type verification on all resume uploads (`application/pdf`, `application/msword`).
- File size caps (max 10MB per resume document).
- HTML/script sanitization to prevent XSS.
- Rate limiting on AI generation endpoints to prevent quota exhaustion and abuse.
