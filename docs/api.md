# API Documentation

## Base URL

Development: `http://localhost:3001`

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All endpoints return JSON responses in the following format:

**Success Response:**
```json
{
  "status": "success",
  "results": 10,
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "status": "fail" | "error",
  "message": "Error message"
}
```

## Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ email, name, password, role }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
- `GET /api/auth/me` - Get current authenticated user (authenticated)

### Bootcamps

- `GET /api/bootcamps` - Get all bootcamps (public)
  - Query params: `status`, `facilitatorId`, `subject`, `format`
- `GET /api/bootcamps/:id` - Get bootcamp details (public)
- `POST /api/bootcamps` - Create bootcamp (facilitator/admin only)
- `PUT /api/bootcamps/:id` - Update bootcamp (facilitator/admin only, owner only)
  - Body: Same as create, all fields optional
- `POST /api/bootcamps/:id/enroll` - Enroll in bootcamp (authenticated)
- `GET /api/bootcamps/:bootcampId/sessions` - Get all sessions for a bootcamp (public)
- `POST /api/bootcamps/:bootcampId/sessions` - Create session (facilitator/admin only)
- `GET /api/bootcamps/:bootcampId/progress` - Get progress records for a bootcamp (public)

### Sessions

- `GET /api/sessions/:id` - Get session details (public)
- `PUT /api/sessions/:id` - Update session (facilitator/admin only)
- `DELETE /api/sessions/:id` - Delete session (facilitator/admin only)
- `POST /api/sessions/:id/activities` - Add activity to session (facilitator/admin only)
- `PUT /api/sessions/:id/activities/:activityId` - Update activity (facilitator/admin only)
- `DELETE /api/sessions/:id/activities/:activityId` - Delete activity (facilitator/admin only)
- `GET /api/sessions/:id/attendance` - Get attendance records for a session (public)
- `POST /api/sessions/:id/attendance` - Create attendance record (facilitator/admin only)
- `PUT /api/sessions/:id/attendance/:attendanceId` - Update attendance record (facilitator/admin only)

### Progress Tracking

- `GET /api/students/:studentId/progress` - Get progress records for a student (public)
  - Query params: `skill`, `bootcampId`
- `POST /api/progress` - Create progress record (facilitator/admin only)
- `GET /api/bootcamps/:bootcampId/progress` - Get progress records for a bootcamp (public)
  - Query params: `skill`, `studentId`
- `GET /api/rubrics` - Get all assessment rubrics (public)
- `GET /api/rubrics/:skill` - Get rubric for a specific skill (public)

### Knowledge Streams

- `GET /api/knowledge-streams` - Get all knowledge streams (public)
- `GET /api/knowledge-streams/:id` - Get knowledge stream details (public)
- `POST /api/students/:studentId/knowledge-streams` - Assign stream to student (facilitator/admin only)
- `GET /api/students/:studentId/knowledge-streams` - Get streams assigned to student (public)

### Communications

- `POST /api/communications` - Send message/email (authenticated)
  - Body: `{ type, recipientIds[], subject, content, status?, scheduledFor? }`
  - Types: `EMAIL`, `NOTIFICATION`, `MESSAGE`, `ANNOUNCEMENT`
  - Status: `DRAFT`, `SENT`, `SCHEDULED`
- `GET /api/communications` - List communications (authenticated)
  - Query params: `type`, `status`, `page`, `limit`
  - Returns communications where user is sender or recipient
- `GET /api/communications/unread` - Get unread count (authenticated)
  - Query params: `type` (optional)
- `GET /api/communications/:id` - Get communication details (authenticated)
  - Accessible by sender or recipient only
- `PUT /api/communications/:id` - Update communication (sender only)
  - Cannot update if status is SENT
  - Body: `{ type?, recipientIds[]?, subject?, content?, status?, scheduledFor? }`
- `DELETE /api/communications/:id` - Delete communication (sender only)
- `POST /api/communications/:id/read` - Mark as read (recipient only)

### Discussions

- `GET /api/bootcamps/:bootcampId/discussions` - List discussion topics (authenticated)
  - Query params: `day`, `page`, `limit`
- `POST /api/bootcamps/:bootcampId/discussions` - Create discussion topic (facilitator/admin only)
  - Body: `{ day, title, prompt, guidance, expectedOutcomes[], tags[] }`
- `GET /api/discussions/:id` - Get discussion details (authenticated)
- `PUT /api/discussions/:id` - Update discussion (facilitator/admin only)
  - Body: `{ day?, title?, prompt?, guidance?, expectedOutcomes[]?, tags[]? }`
- `DELETE /api/discussions/:id` - Delete discussion (facilitator/admin only)

### Users

- `GET /api/users/me` - Get current user profile (authenticated)
- `PATCH /api/users/me` - Update current user profile (authenticated)
- `GET /api/users` - Get all users (admin only)

## Health Check

- `GET /health` - Server health check

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Notes

- All dates should be in ISO 8601 format
- UUIDs are used for all IDs
- Pagination is available on list endpoints (query params: `page`, `limit`)
- Facilitators can only manage resources for their own bootcamps
- Admins have full access to all resources

---

## Frontend Routes

The frontend application uses Next.js App Router. Here are the main routes:

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/bootcamps` - Bootcamp catalog
- `/bootcamps/[id]` - Bootcamp detail page

### Protected Routes (Require Authentication)
- `/dashboard` - Role-based dashboard (redirects to appropriate dashboard)
- `/communications` - Communication inbox

### Session Routes
- `/bootcamps/[id]/sessions/[sessionId]` - Session detail page
- `/bootcamps/[id]/sessions` - Session list page (filtering, sorting, management)

### Component Documentation
See [Component Documentation](./components.md) for details on reusable UI components.
