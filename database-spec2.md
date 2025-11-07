# MindForge Learning Program - Structured Database Specification

> **Document Type**: Database Specification  
> **Purpose**: LLM/AI-optimized structured format for database schema and TypeScript types  
> **Version**: 2.0 (Structured Format)

---

## METADATA

**Document Title**: Database Specification for MindForge Learning Program  
**Scope**: Database schema (Prisma) and TypeScript type definitions  
**Database System**: PostgreSQL with Prisma ORM  
**Target Audience**: Developers, database administrators, AI systems  
**Document Purpose**: Complete database specification for platform development

---

## 1. DATABASE SPECIFICATION OVERVIEW

### 1.1 Specification Options

| Option | Description | Format | Use Case |
|-------|-------------|--------|----------|
| **Option B** | TypeScript Types/Interfaces | TypeScript interfaces | Frontend/type definitions |
| **Option C** | Database Schema + TypeScript Types | Prisma schema + generated types | Full-stack development |

### 1.2 Database Technology Stack

**Database**: PostgreSQL  
**ORM**: Prisma  
**Type Generation**: Automatic from Prisma schema  
**Language**: TypeScript

---

## 2. CORE ENTITY TYPES (OPTION B)

### 2.1 User Entity Types

#### Base User Interface

**File**: `users.ts`

```typescript
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

**Base User Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **name** | string | User's full name |
| **email** | string | Email address |
| **createdAt** | Date | Account creation date |
| **updatedAt** | Date | Last update timestamp |
| **isActive** | boolean | Account active status |

---

#### Student Interface

**Extends**: BaseUser

```typescript
export interface Student extends BaseUser {
  age: number;
  grade: string;
  interests: string[];
  learningStyle: string;
  knowledgeStreamIds: string[];
  completedBootcampIds: string[];
  upcomingBootcampIds: string[];
  parentId?: string;
  progress: {
    criticalThinking: number;
    communication: number;
    problemSolving: number;
    [key: string]: number;
  };
}
```

**Student-Specific Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **age** | number | Student age |
| **grade** | string | Current grade level |
| **interests** | string[] | Array of interest tags |
| **learningStyle** | string | Preferred learning style |
| **knowledgeStreamIds** | string[] | Associated knowledge streams |
| **completedBootcampIds** | string[] | Completed bootcamp IDs |
| **upcomingBootcampIds** | string[] | Upcoming bootcamp IDs |
| **parentId** | string? | Optional parent reference |
| **progress** | object | Skill progress metrics |

**Progress Object Structure**:

| Skill | Type | Description |
|-------|------|-------------|
| **criticalThinking** | number | Critical thinking score |
| **communication** | number | Communication score |
| **problemSolving** | number | Problem-solving score |
| **[key: string]** | number | Additional dynamic skills |

---

#### Parent Interface

**Extends**: BaseUser

```typescript
export interface Parent extends BaseUser {
  childrenIds: string[];
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}
```

**Parent-Specific Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **childrenIds** | string[] | Array of child student IDs |
| **subscriptionStatus** | enum | Subscription status |
| **notificationPreferences** | object | Notification channel preferences |

**Subscription Status Values**:
- `'active'`: Active subscription
- `'inactive'`: Inactive subscription
- `'trial'`: Trial period

**Notification Preferences**:

| Channel | Type | Description |
|---------|------|-------------|
| **email** | boolean | Email notifications enabled |
| **sms** | boolean | SMS notifications enabled |
| **push** | boolean | Push notifications enabled |

---

#### Facilitator Interface

**Extends**: BaseUser

```typescript
export interface Facilitator extends BaseUser {
  specialties: string[];
  bio: string;
  rating: number;
  bootcampIdsLed: string[];
  availability: {
    days: string[];
    timeSlots: TimeSlot[];
  };
}
```

**Facilitator-Specific Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **specialties** | string[] | Subject specialties |
| **bio** | string | Facilitator biography |
| **rating** | number | Average rating |
| **bootcampIdsLed** | string[] | Bootcamps led by facilitator |
| **availability** | object | Availability schedule |

**TimeSlot Interface**:

```typescript
export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}
```

**Availability Structure**:

| Field | Type | Description |
|-------|------|-------------|
| **days** | string[] | Available days of week |
| **timeSlots** | TimeSlot[] | Available time slots |

---

#### Admin Interface

**Extends**: BaseUser

```typescript
export interface Admin extends BaseUser {
  permissions: string[];
  department: string;
}
```

**Admin-Specific Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **permissions** | string[] | Admin permission list |
| **department** | string | Department assignment |

---

### 2.2 Bootcamp Entity Types

#### Bootcamp Interface

**File**: `bootcamps.ts`

```typescript
export interface Bootcamp {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  format: ('in-person' | 'online' | 'hybrid')[];
  ageRange: string;
  subjects: string[];
  facilitatorId: string;
  schedule: string;
  capacity: number;
  price: number;
  learningOutcomes: string[];
  weeklySchedule: DailySchedule[];
  prerequisites: string[];
  status: 'draft' | 'published' | 'archived';
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Bootcamp Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **title** | string | Bootcamp title |
| **subtitle** | string | Bootcamp subtitle |
| **description** | string | Detailed description |
| **duration** | string | Program duration |
| **format** | enum[] | Delivery formats |
| **ageRange** | string | Target age range |
| **subjects** | string[] | Subject areas |
| **facilitatorId** | string | Lead facilitator ID |
| **schedule** | string | Schedule description |
| **capacity** | number | Maximum enrollment |
| **price** | number | Program price |
| **learningOutcomes** | string[] | Expected outcomes |
| **weeklySchedule** | DailySchedule[] | Weekly schedule |
| **prerequisites** | string[] | Prerequisites |
| **status** | enum | Publication status |
| **enrollmentCount** | number | Current enrollment |
| **createdAt** | Date | Creation timestamp |
| **updatedAt** | Date | Update timestamp |

**Format Values**:
- `'in-person'`: In-person delivery
- `'online'`: Online delivery
- `'hybrid'`: Hybrid delivery

**Status Values**:
- `'draft'`: Draft status
- `'published'`: Published status
- `'archived'`: Archived status

---

#### DailySchedule Interface

```typescript
export interface DailySchedule {
  day: number; // 1-5 for Mon-Fri
  theme: string;
  activities: Activity[];
}
```

**DailySchedule Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **day** | number | Day number (1-5) |
| **theme** | string | Day theme |
| **activities** | Activity[] | Daily activities |

---

#### Activity Interface

```typescript
export interface Activity {
  time: string; // HH:MM-HH:MM format
  type: 'Interactive Lecture' | 'Group Exercise' | 'Peer Teaching' | 'Individual Work' | 'Assessment';
  title: string;
  description: string;
  materials: string[]; // File names/URLs
  learningObjectives: string[];
}
```

**Activity Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **time** | string | Time range (HH:MM-HH:MM) |
| **type** | enum | Activity type |
| **title** | string | Activity title |
| **description** | string | Activity description |
| **materials** | string[] | Material URLs/files |
| **learningObjectives** | string[] | Learning objectives |

**Activity Type Values**:
- `'Interactive Lecture'`: Lecture format
- `'Group Exercise'`: Group activities
- `'Peer Teaching'`: Peer teaching sessions
- `'Individual Work'`: Individual assignments
- `'Assessment'`: Assessment activities

---

### 2.3 Knowledge Stream Entity Types

#### KnowledgeStream Interface

**File**: `knowledge-streams.ts`

```typescript
export interface KnowledgeStream {
  id: string;
  name: string;
  description: string;
  color: string; // For UI visualization
  icon: string;  // Icon identifier
  levels: KnowledgeLevel[];
  createdAt: Date;
  updatedAt: Date;
}
```

**KnowledgeStream Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **name** | string | Stream name |
| **description** | string | Stream description |
| **color** | string | UI color code |
| **icon** | string | Icon identifier |
| **levels** | KnowledgeLevel[] | Stream levels |
| **createdAt** | Date | Creation timestamp |
| **updatedAt** | Date | Update timestamp |

---

#### KnowledgeLevel Interface

```typescript
export interface KnowledgeLevel {
  level: number;
  title: string;
  bootcampIds: string[];
  skills: string[];
  prerequisites: number[]; // Level numbers that must be completed first
  nextLevel: number | null;
  estimatedCompletionTime: string; // e.g., "2-3 months"
}
```

**KnowledgeLevel Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **level** | number | Level number |
| **title** | string | Level title |
| **bootcampIds** | string[] | Associated bootcamps |
| **skills** | string[] | Skills at this level |
| **prerequisites** | number[] | Required prior levels |
| **nextLevel** | number \| null | Next level number |
| **estimatedCompletionTime** | string | Time estimate |

---

### 2.4 Session Entity Types

#### Session Interface

**File**: `sessions.ts`

```typescript
export interface Session {
  id: string;
  bootcampId: string;
  day: number;
  theme: string;
  date: Date;
  startTime: string;
  endTime: string;
  activities: SessionActivity[];
  attendance: AttendanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Session Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **bootcampId** | string | Parent bootcamp ID |
| **day** | number | Day number |
| **theme** | string | Session theme |
| **date** | Date | Session date |
| **startTime** | string | Start time |
| **endTime** | string | End time |
| **activities** | SessionActivity[] | Session activities |
| **attendance** | AttendanceRecord[] | Attendance records |
| **createdAt** | Date | Creation timestamp |
| **updatedAt** | Date | Update timestamp |

---

#### SessionActivity Interface

```typescript
export interface SessionActivity {
  id: string;
  sessionId: string;
  time: string;
  type: string;
  title: string;
  description: string;
  materials: string[];
  learningObjectives: string[];
  facilitatorNotes: string;
  studentDeliverables: string[];
}
```

**SessionActivity Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **sessionId** | string | Parent session ID |
| **time** | string | Activity time |
| **type** | string | Activity type |
| **title** | string | Activity title |
| **description** | string | Activity description |
| **materials** | string[] | Material URLs |
| **learningObjectives** | string[] | Learning objectives |
| **facilitatorNotes** | string | Facilitator notes |
| **studentDeliverables** | string[] | Required deliverables |

---

#### AttendanceRecord Interface

```typescript
export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
  joinTime?: Date;
  leaveTime?: Date;
  engagementScore?: number; // 1-100
}
```

**AttendanceRecord Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **studentId** | string | Student identifier |
| **status** | enum | Attendance status |
| **joinTime** | Date? | Join timestamp |
| **leaveTime** | Date? | Leave timestamp |
| **engagementScore** | number? | Engagement score (1-100) |

**Status Values**:
- `'present'`: Student present
- `'absent'`: Student absent
- `'late'`: Student late

---

### 2.5 Progress Tracking Entity Types

#### ProgressRecord Interface

**File**: `progress-tracking.ts`

```typescript
export interface ProgressRecord {
  id: string;
  studentId: string;
  bootcampId: string;
  sessionId?: string;
  skill: string;
  level: 'Novice' | 'Developing' | 'Proficient' | 'Expert';
  assessmentDate: Date;
  facilitatorId: string;
  evidence: string; // Description of observed behavior
  nextSteps: string;
  createdAt: Date;
}
```

**ProgressRecord Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **studentId** | string | Student identifier |
| **bootcampId** | string | Bootcamp identifier |
| **sessionId** | string? | Optional session identifier |
| **skill** | string | Skill being assessed |
| **level** | enum | Skill level |
| **assessmentDate** | Date | Assessment date |
| **facilitatorId** | string | Assessor identifier |
| **evidence** | string | Evidence description |
| **nextSteps** | string | Recommended next steps |
| **createdAt** | Date | Creation timestamp |

**Level Values**:
- `'Novice'`: Beginning level
- `'Developing'`: Developing level
- `'Proficient'`: Proficient level
- `'Expert'`: Expert level

---

#### AssessmentRubric Interface

```typescript
export interface AssessmentRubric {
  id: string;
  skill: string;
  levels: RubricLevel[];
  assessmentActivities: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

**AssessmentRubric Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **skill** | string | Skill name |
| **levels** | RubricLevel[] | Rubric levels |
| **assessmentActivities** | string[] | Assessment activities |
| **createdAt** | Date | Creation timestamp |
| **updatedAt** | Date | Update timestamp |

---

#### RubricLevel Interface

```typescript
export interface RubricLevel {
  level: string;
  description: string;
  criteria: string[];
}
```

**RubricLevel Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **level** | string | Level identifier |
| **description** | string | Level description |
| **criteria** | string[] | Assessment criteria |

---

### 2.6 Communication Entity Types

#### Communication Interface

**File**: `communications.ts`

```typescript
export interface Communication {
  id: string;
  type: 'email' | 'notification' | 'message' | 'announcement';
  senderId: string;
  recipientIds: string[];
  subject: string;
  content: string;
  status: 'draft' | 'sent' | 'scheduled';
  scheduledFor?: Date;
  sentAt?: Date;
  readReceipts: ReadReceipt[];
  createdAt: Date;
}
```

**Communication Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **type** | enum | Communication type |
| **senderId** | string | Sender identifier |
| **recipientIds** | string[] | Recipient IDs |
| **subject** | string | Message subject |
| **content** | string | Message content |
| **status** | enum | Message status |
| **scheduledFor** | Date? | Scheduled send time |
| **sentAt** | Date? | Actual send time |
| **readReceipts** | ReadReceipt[] | Read receipts |
| **createdAt** | Date | Creation timestamp |

**Type Values**:
- `'email'`: Email communication
- `'notification'`: Push notification
- `'message'`: Direct message
- `'announcement'`: Announcement

**Status Values**:
- `'draft'`: Draft status
- `'sent'`: Sent status
- `'scheduled'`: Scheduled status

---

#### ReadReceipt Interface

```typescript
export interface ReadReceipt {
  userId: string;
  readAt: Date;
}
```

**ReadReceipt Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **userId** | string | User identifier |
| **readAt** | Date | Read timestamp |

---

### 2.7 Payment Entity Types

#### Payment Interface

**File**: `payments.ts`

```typescript
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  bootcampId?: string;
  subscriptionId?: string;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Payment Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **userId** | string | User identifier |
| **amount** | number | Payment amount |
| **currency** | string | Currency code |
| **paymentMethod** | enum | Payment method |
| **status** | enum | Payment status |
| **bootcampId** | string? | Associated bootcamp |
| **subscriptionId** | string? | Associated subscription |
| **transactionId** | string | Transaction identifier |
| **createdAt** | Date | Creation timestamp |
| **updatedAt** | Date | Update timestamp |

**Payment Method Values**:
- `'credit_card'`: Credit card payment
- `'bank_transfer'`: Bank transfer
- `'paypal'`: PayPal payment

**Status Values**:
- `'pending'`: Pending payment
- `'completed'`: Completed payment
- `'failed'`: Failed payment
- `'refunded'`: Refunded payment

---

#### Subscription Interface

```typescript
export interface Subscription {
  id: string;
  userId: string;
  plan: 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'cancelled' | 'expired';
  autoRenew: boolean;
  createdAt: Date;
}
```

**Subscription Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **userId** | string | User identifier |
| **plan** | enum | Subscription plan |
| **startDate** | Date | Start date |
| **endDate** | Date | End date |
| **status** | enum | Subscription status |
| **autoRenew** | boolean | Auto-renewal enabled |
| **createdAt** | Date | Creation timestamp |

**Plan Values**:
- `'monthly'`: Monthly plan
- `'quarterly'`: Quarterly plan
- `'annual'`: Annual plan

**Status Values**:
- `'active'`: Active subscription
- `'cancelled'`: Cancelled subscription
- `'expired'`: Expired subscription

---

### 2.8 Content Entity Types

#### TeachingExample Interface

**File**: `content.ts`

```typescript
export interface TeachingExample {
  id: string;
  concept: string;
  abstractDescription: string;
  concreteAnalogy: string;
  visualAid?: string; // URL to image
  discussionQuestions: string[];
  subjectArea: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}
```

**TeachingExample Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **concept** | string | Concept name |
| **abstractDescription** | string | Abstract description |
| **concreteAnalogy** | string | Concrete analogy |
| **visualAid** | string? | Visual aid URL |
| **discussionQuestions** | string[] | Discussion questions |
| **subjectArea** | string | Subject area |
| **difficultyLevel** | enum | Difficulty level |
| **createdAt** | Date | Creation timestamp |
| **updatedAt** | Date | Update timestamp |

**Difficulty Level Values**:
- `'beginner'`: Beginner level
- `'intermediate'`: Intermediate level
- `'advanced'`: Advanced level

---

#### DiscussionTopic Interface

```typescript
export interface DiscussionTopic {
  id: string;
  bootcampId: string;
  day: number;
  title: string;
  prompt: string;
  guidance: string;
  expectedOutcomes: string[];
  tags: string[];
  createdAt: Date;
}
```

**DiscussionTopic Fields**:

| Field | Type | Description |
|-------|------|-------------|
| **id** | string | Unique identifier |
| **bootcampId** | string | Bootcamp identifier |
| **day** | number | Day number |
| **title** | string | Topic title |
| **prompt** | string | Discussion prompt |
| **guidance** | string | Facilitator guidance |
| **expectedOutcomes** | string[] | Expected outcomes |
| **tags** | string[] | Topic tags |
| **createdAt** | Date | Creation timestamp |

---

## 3. DATABASE SCHEMA (OPTION C - PRISMA)

### 3.1 Prisma Configuration

**File**: `schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Configuration Summary**:

| Component | Value | Description |
|-----------|-------|-------------|
| **Generator** | prisma-client-js | Prisma Client generator |
| **Provider** | postgresql | Database provider |
| **URL** | env("DATABASE_URL") | Connection string from env |

---

### 3.2 Core Models

#### User Model

```prisma
model User {
  id            String     @id @default(uuid())
  email         String     @unique
  name          String
  role          Role
  isActive      Boolean    @default(true)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  Student       Student?
  Parent        Parent?
  Facilitator   Facilitator?
  Admin         Admin?
  Communications Communication[] @relation("Sender")
  ReadReceipts  ReadReceipt[]
  Payments      Payment[]
  Subscriptions Subscription[]
}
```

**User Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **email** | String | @unique | Unique email |
| **name** | String | | User name |
| **role** | Role | | User role enum |
| **isActive** | Boolean | @default(true) | Active status |
| **createdAt** | DateTime | @default(now()) | Creation timestamp |
| **updatedAt** | DateTime | @updatedAt | Update timestamp |

**Relations**:
- One-to-one: Student, Parent, Facilitator, Admin
- One-to-many: Communications, ReadReceipts, Payments, Subscriptions

---

#### Role Enum

```prisma
enum Role {
  STUDENT
  PARENT
  FACILITATOR
  ADMIN
}
```

**Role Values**:
- `STUDENT`: Student role
- `PARENT`: Parent role
- `FACILITATOR`: Facilitator role
- `ADMIN`: Admin role

---

#### Student Model

```prisma
model Student {
  id                   String     @id @default(uuid())
  userId               String     @unique
  age                  Int
  grade                String
  interests            String[]
  learningStyle        String
  parentId             String?
  progress             Json
  completedBootcamps   Enrollment[] @relation("CompletedBootcamps")
  upcomingBootcamps    Enrollment[] @relation("UpcomingBootcamps")
  knowledgeStreams     StudentKnowledgeStream[]
  progressRecords      ProgressRecord[]
  attendanceRecords    AttendanceRecord[]
  User                 User       @relation(fields: [userId], references: [id])
  Parent               Parent?    @relation(fields: [parentId], references: [id])
}
```

**Student Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **userId** | String | @unique | User reference |
| **age** | Int | | Student age |
| **grade** | String | | Grade level |
| **interests** | String[] | | Interest array |
| **learningStyle** | String | | Learning style |
| **parentId** | String? | | Optional parent reference |
| **progress** | Json | | Progress metrics |

**Relations**:
- Many-to-one: User, Parent
- One-to-many: completedBootcamps, upcomingBootcamps, knowledgeStreams, progressRecords, attendanceRecords

---

#### Parent Model

```prisma
model Parent {
  id         String   @id @default(uuid())
  userId     String   @unique
  children   Student[]
  subscriptionStatus String @default("trial")
  notificationPreferences Json
  User       User     @relation(fields: [userId], references: [id])
}
```

**Parent Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **userId** | String | @unique | User reference |
| **subscriptionStatus** | String | @default("trial") | Subscription status |
| **notificationPreferences** | Json | | Notification preferences |

**Relations**:
- Many-to-one: User
- One-to-many: children (Student[])

---

#### Facilitator Model

```prisma
model Facilitator {
  id              String     @id @default(uuid())
  userId          String     @unique
  specialties     String[]
  bio             String
  rating          Float
  availability    Json
  bootcampsLed    Bootcamp[]
  User            User       @relation(fields: [userId], references: [id])
  progressRecords ProgressRecord[]
}
```

**Facilitator Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **userId** | String | @unique | User reference |
| **specialties** | String[] | | Specialty array |
| **bio** | String | | Biography |
| **rating** | Float | | Average rating |
| **availability** | Json | | Availability schedule |

**Relations**:
- Many-to-one: User
- One-to-many: bootcampsLed, progressRecords

---

#### Admin Model

```prisma
model Admin {
  id         String @id @default(uuid())
  userId     String @unique
  permissions String[]
  department String
  User       User   @relation(fields: [userId], references: [id])
}
```

**Admin Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **userId** | String | @unique | User reference |
| **permissions** | String[] | | Permission array |
| **department** | String | | Department name |

**Relations**:
- Many-to-one: User

---

### 3.3 Bootcamp Models

#### Bootcamp Model

```prisma
model Bootcamp {
  id                String         @id @default(uuid())
  title             String
  subtitle          String
  description       String
  duration          String
  format            BootcampFormat[]
  ageRange          String
  subjects          String[]
  facilitatorId     String
  schedule          String
  capacity          Int
  price             Float
  learningOutcomes  String[]
  weeklySchedule    Json
  prerequisites     String[]
  status            BootcampStatus @default(DRAFT)
  enrollmentCount   Int            @default(0)
  enrollments       Enrollment[]
  sessions          Session[]
  discussionTopics  DiscussionTopic[]
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  Facilitator       Facilitator    @relation(fields: [facilitatorId], references: [id])
}
```

**Bootcamp Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **title** | String | | Bootcamp title |
| **subtitle** | String | | Bootcamp subtitle |
| **description** | String | | Description |
| **duration** | String | | Duration |
| **format** | BootcampFormat[] | | Format array |
| **ageRange** | String | | Age range |
| **subjects** | String[] | | Subject array |
| **facilitatorId** | String | | Facilitator reference |
| **schedule** | String | | Schedule |
| **capacity** | Int | | Max capacity |
| **price** | Float | | Price |
| **learningOutcomes** | String[] | | Outcomes array |
| **weeklySchedule** | Json | | Weekly schedule |
| **prerequisites** | String[] | | Prerequisites |
| **status** | BootcampStatus | @default(DRAFT) | Status |
| **enrollmentCount** | Int | @default(0) | Enrollment count |

**Relations**:
- Many-to-one: Facilitator
- One-to-many: enrollments, sessions, discussionTopics

---

#### BootcampFormat Enum

```prisma
enum BootcampFormat {
  IN_PERSON
  ONLINE
  HYBRID
}
```

**Format Values**:
- `IN_PERSON`: In-person delivery
- `ONLINE`: Online delivery
- `HYBRID`: Hybrid delivery

---

#### BootcampStatus Enum

```prisma
enum BootcampStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**Status Values**:
- `DRAFT`: Draft status
- `PUBLISHED`: Published status
- `ARCHIVED`: Archived status

---

#### Enrollment Model

```prisma
model Enrollment {
  id         String     @id @default(uuid())
  studentId  String
  bootcampId String
  status     EnrollmentStatus @default(ACTIVE)
  enrolledAt DateTime   @default(now())
  completedAt DateTime?
  Student    Student    @relation(fields: [studentId], references: [id])
  Bootcamp   Bootcamp   @relation(fields: [bootcampId], references: [id])
  
  @@unique([studentId, bootcampId])
}
```

**Enrollment Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **studentId** | String | | Student reference |
| **bootcampId** | String | | Bootcamp reference |
| **status** | EnrollmentStatus | @default(ACTIVE) | Enrollment status |
| **enrolledAt** | DateTime | @default(now()) | Enrollment date |
| **completedAt** | DateTime? | | Completion date |

**Unique Constraint**: `@@unique([studentId, bootcampId])`

**Relations**:
- Many-to-one: Student, Bootcamp

---

#### EnrollmentStatus Enum

```prisma
enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}
```

**Status Values**:
- `ACTIVE`: Active enrollment
- `COMPLETED`: Completed enrollment
- `CANCELLED`: Cancelled enrollment

---

### 3.4 Knowledge Stream Models

#### KnowledgeStream Model

```prisma
model KnowledgeStream {
  id          String          @id @default(uuid())
  name        String
  description String
  color       String
  icon        String
  levels      KnowledgeLevel[]
  studentStreams StudentKnowledgeStream[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}
```

**KnowledgeStream Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **name** | String | | Stream name |
| **description** | String | | Description |
| **color** | String | | UI color |
| **icon** | String | | Icon identifier |
| **createdAt** | DateTime | @default(now()) | Creation timestamp |
| **updatedAt** | DateTime | @updatedAt | Update timestamp |

**Relations**:
- One-to-many: levels, studentStreams

---

#### KnowledgeLevel Model

```prisma
model KnowledgeLevel {
  id              String   @id @default(uuid())
  level           Int
  title           String
  skills          String[]
  prerequisites   Int[]
  nextLevel       Int?
  estimatedCompletionTime String
  knowledgeStreamId String
  bootcampIds     String[]
  KnowledgeStream KnowledgeStream @relation(fields: [knowledgeStreamId], references: [id])
}
```

**KnowledgeLevel Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **level** | Int | | Level number |
| **title** | String | | Level title |
| **skills** | String[] | | Skills array |
| **prerequisites** | Int[] | | Prerequisites |
| **nextLevel** | Int? | | Next level |
| **estimatedCompletionTime** | String | | Time estimate |
| **knowledgeStreamId** | String | | Stream reference |
| **bootcampIds** | String[] | | Bootcamp IDs |

**Relations**:
- Many-to-one: KnowledgeStream

---

#### StudentKnowledgeStream Model

```prisma
model StudentKnowledgeStream {
  id              String @id @default(uuid())
  studentId       String
  knowledgeStreamId String
  Student         Student        @relation(fields: [studentId], references: [id])
  KnowledgeStream KnowledgeStream @relation(fields: [knowledgeStreamId], references: [id])
  
  @@unique([studentId, knowledgeStreamId])
}
```

**StudentKnowledgeStream Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **studentId** | String | | Student reference |
| **knowledgeStreamId** | String | | Stream reference |

**Unique Constraint**: `@@unique([studentId, knowledgeStreamId])`

**Relations**:
- Many-to-one: Student, KnowledgeStream

---

### 3.5 Session Models

#### Session Model

```prisma
model Session {
  id           String           @id @default(uuid())
  bootcampId   String
  day          Int
  theme        String
  date         DateTime
  startTime    String
  endTime      String
  activities   SessionActivity[]
  attendance   AttendanceRecord[]
  Bootcamp     Bootcamp         @relation(fields: [bootcampId], references: [id])
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}
```

**Session Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **bootcampId** | String | | Bootcamp reference |
| **day** | Int | | Day number |
| **theme** | String | | Session theme |
| **date** | DateTime | | Session date |
| **startTime** | String | | Start time |
| **endTime** | String | | End time |
| **createdAt** | DateTime | @default(now()) | Creation timestamp |
| **updatedAt** | DateTime | @updatedAt | Update timestamp |

**Relations**:
- Many-to-one: Bootcamp
- One-to-many: activities, attendance

---

#### SessionActivity Model

```prisma
model SessionActivity {
  id                  String   @id @default(uuid())
  sessionId           String
  time                String
  type                String
  title               String
  description         String
  materials           String[]
  learningObjectives  String[]
  facilitatorNotes    String?
  studentDeliverables String[]
  Session             Session  @relation(fields: [sessionId], references: [id])
}
```

**SessionActivity Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **sessionId** | String | | Session reference |
| **time** | String | | Activity time |
| **type** | String | | Activity type |
| **title** | String | | Activity title |
| **description** | String | | Description |
| **materials** | String[] | | Materials array |
| **learningObjectives** | String[] | | Objectives array |
| **facilitatorNotes** | String? | | Optional notes |
| **studentDeliverables** | String[] | | Deliverables array |

**Relations**:
- Many-to-one: Session

---

#### AttendanceRecord Model

```prisma
model AttendanceRecord {
  id          String   @id @default(uuid())
  sessionId   String
  studentId   String
  status      AttendanceStatus
  joinTime    DateTime?
  leaveTime   DateTime?
  engagementScore Int?
  Session     Session  @relation(fields: [sessionId], references: [id])
  Student     Student  @relation(fields: [studentId], references: [id])
  
  @@unique([sessionId, studentId])
}
```

**AttendanceRecord Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **sessionId** | String | | Session reference |
| **studentId** | String | | Student reference |
| **status** | AttendanceStatus | | Attendance status |
| **joinTime** | DateTime? | | Join timestamp |
| **leaveTime** | DateTime? | | Leave timestamp |
| **engagementScore** | Int? | | Engagement score |

**Unique Constraint**: `@@unique([sessionId, studentId])`

**Relations**:
- Many-to-one: Session, Student

---

#### AttendanceStatus Enum

```prisma
enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}
```

**Status Values**:
- `PRESENT`: Student present
- `ABSENT`: Student absent
- `LATE`: Student late

---

### 3.6 Progress Tracking Models

#### ProgressRecord Model

```prisma
model ProgressRecord {
  id             String     @id @default(uuid())
  studentId      String
  bootcampId     String?
  sessionId      String?
  skill          String
  level          String
  assessmentDate DateTime
  facilitatorId  String
  evidence       String
  nextSteps      String
  Student        Student    @relation(fields: [studentId], references: [id])
  Facilitator    Facilitator @relation(fields: [facilitatorId], references: [id])
  Bootcamp       Bootcamp?  @relation(fields: [bootcampId], references: [id])
  Session        Session?   @relation(fields: [sessionId], references: [id])
  createdAt      DateTime   @default(now())
}
```

**ProgressRecord Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **studentId** | String | | Student reference |
| **bootcampId** | String? | | Optional bootcamp reference |
| **sessionId** | String? | | Optional session reference |
| **skill** | String | | Skill name |
| **level** | String | | Skill level |
| **assessmentDate** | DateTime | | Assessment date |
| **facilitatorId** | String | | Facilitator reference |
| **evidence** | String | | Evidence description |
| **nextSteps** | String | | Next steps |
| **createdAt** | DateTime | @default(now()) | Creation timestamp |

**Relations**:
- Many-to-one: Student, Facilitator
- Many-to-one (optional): Bootcamp, Session

---

#### AssessmentRubric Model

```prisma
model AssessmentRubric {
  id                  String       @id @default(uuid())
  skill               String       @unique
  levels              RubricLevel[]
  assessmentActivities String[]
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
}
```

**AssessmentRubric Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **skill** | String | @unique | Skill name (unique) |
| **assessmentActivities** | String[] | | Activities array |
| **createdAt** | DateTime | @default(now()) | Creation timestamp |
| **updatedAt** | DateTime | @updatedAt | Update timestamp |

**Relations**:
- One-to-many: levels

---

#### RubricLevel Model

```prisma
model RubricLevel {
  id           String @id @default(uuid())
  level        String
  description  String
  criteria     String[]
  rubricId     String
  AssessmentRubric AssessmentRubric @relation(fields: [rubricId], references: [id])
}
```

**RubricLevel Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **level** | String | | Level identifier |
| **description** | String | | Level description |
| **criteria** | String[] | | Criteria array |
| **rubricId** | String | | Rubric reference |

**Relations**:
- Many-to-one: AssessmentRubric

---

### 3.7 Communication Models

#### Communication Model

```prisma
model Communication {
  id           String     @id @default(uuid())
  type         CommunicationType
  senderId     String
  subject      String
  content      String
  status       CommunicationStatus
  scheduledFor DateTime?
  sentAt       DateTime?
  recipients   CommunicationRecipient[]
  readReceipts ReadReceipt[]
  Sender       User       @relation("Sender", fields: [senderId], references: [id])
  createdAt    DateTime   @default(now())
}
```

**Communication Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **type** | CommunicationType | | Communication type |
| **senderId** | String | | Sender reference |
| **subject** | String | | Message subject |
| **content** | String | | Message content |
| **status** | CommunicationStatus | | Message status |
| **scheduledFor** | DateTime? | | Scheduled send time |
| **sentAt** | DateTime? | | Actual send time |
| **createdAt** | DateTime | @default(now()) | Creation timestamp |

**Relations**:
- Many-to-one: Sender (User)
- One-to-many: recipients, readReceipts

---

#### CommunicationType Enum

```prisma
enum CommunicationType {
  EMAIL
  NOTIFICATION
  MESSAGE
  ANNOUNCEMENT
}
```

**Type Values**:
- `EMAIL`: Email communication
- `NOTIFICATION`: Push notification
- `MESSAGE`: Direct message
- `ANNOUNCEMENT`: Announcement

---

#### CommunicationStatus Enum

```prisma
enum CommunicationStatus {
  DRAFT
  SENT
  SCHEDULED
}
```

**Status Values**:
- `DRAFT`: Draft status
- `SENT`: Sent status
- `SCHEDULED`: Scheduled status

---

#### CommunicationRecipient Model

```prisma
model CommunicationRecipient {
  id             String @id @default(uuid())
  communicationId String
  recipientId    String
  Communication  Communication @relation(fields: [communicationId], references: [id])
  User           User         @relation("Recipient", fields: [recipientId], references: [id])
  
  @@unique([communicationId, recipientId])
}
```

**CommunicationRecipient Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **communicationId** | String | | Communication reference |
| **recipientId** | String | | Recipient reference |

**Unique Constraint**: `@@unique([communicationId, recipientId])`

**Relations**:
- Many-to-one: Communication, User

---

#### ReadReceipt Model

```prisma
model ReadReceipt {
  id             String   @id @default(uuid())
  communicationId String
  userId         String
  readAt         DateTime
  Communication  Communication @relation(fields: [communicationId], references: [id])
  User           User         @relation(fields: [userId], references: [id])
  
  @@unique([communicationId, userId])
}
```

**ReadReceipt Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **communicationId** | String | | Communication reference |
| **userId** | String | | User reference |
| **readAt** | DateTime | | Read timestamp |

**Unique Constraint**: `@@unique([communicationId, userId])`

**Relations**:
- Many-to-one: Communication, User

---

### 3.8 Payment Models

#### Payment Model

```prisma
model Payment {
  id             String   @id @default(uuid())
  userId         String
  amount         Float
  currency       String   @default("USD")
  paymentMethod  String
  status         PaymentStatus
  bootcampId     String?
  subscriptionId String?
  transactionId  String
  User           User     @relation(fields: [userId], references: [id])
  Bootcamp       Bootcamp? @relation(fields: [bootcampId], references: [id])
  Subscription   Subscription? @relation(fields: [subscriptionId], references: [id])
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

**Payment Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **userId** | String | | User reference |
| **amount** | Float | | Payment amount |
| **currency** | String | @default("USD") | Currency code |
| **paymentMethod** | String | | Payment method |
| **status** | PaymentStatus | | Payment status |
| **bootcampId** | String? | | Optional bootcamp reference |
| **subscriptionId** | String? | | Optional subscription reference |
| **transactionId** | String | | Transaction identifier |
| **createdAt** | DateTime | @default(now()) | Creation timestamp |
| **updatedAt** | DateTime | @updatedAt | Update timestamp |

**Relations**:
- Many-to-one: User
- Many-to-one (optional): Bootcamp, Subscription

---

#### PaymentStatus Enum

```prisma
enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

**Status Values**:
- `PENDING`: Pending payment
- `COMPLETED`: Completed payment
- `FAILED`: Failed payment
- `REFUNDED`: Refunded payment

---

#### Subscription Model

```prisma
model Subscription {
  id         String   @id @default(uuid())
  userId     String
  plan       String
  startDate  DateTime
  endDate    DateTime
  status     String
  autoRenew  Boolean  @default(true)
  payments   Payment[]
  User       User     @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())
}
```

**Subscription Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **userId** | String | | User reference |
| **plan** | String | | Subscription plan |
| **startDate** | DateTime | | Start date |
| **endDate** | DateTime | | End date |
| **status** | String | | Subscription status |
| **autoRenew** | Boolean | @default(true) | Auto-renewal |
| **createdAt** | DateTime | @default(now()) | Creation timestamp |

**Relations**:
- Many-to-one: User
- One-to-many: payments

---

### 3.9 Content Models

#### TeachingExample Model

```prisma
model TeachingExample {
  id                 String   @id @default(uuid())
  concept            String
  abstractDescription String
  concreteAnalogy    String
  visualAid          String?
  discussionQuestions String[]
  subjectArea        String
  difficultyLevel    String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

**TeachingExample Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **concept** | String | | Concept name |
| **abstractDescription** | String | | Abstract description |
| **concreteAnalogy** | String | | Concrete analogy |
| **visualAid** | String? | | Optional visual aid URL |
| **discussionQuestions** | String[] | | Questions array |
| **subjectArea** | String | | Subject area |
| **difficultyLevel** | String | | Difficulty level |
| **createdAt** | DateTime | @default(now()) | Creation timestamp |
| **updatedAt** | DateTime | @updatedAt | Update timestamp |

---

#### DiscussionTopic Model

```prisma
model DiscussionTopic {
  id              String   @id @default(uuid())
  bootcampId      String
  day             Int
  title           String
  prompt          String
  guidance        String
  expectedOutcomes String[]
  tags            String[]
  Bootcamp        Bootcamp @relation(fields: [bootcampId], references: [id])
  createdAt       DateTime @default(now())
}
```

**DiscussionTopic Model Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | String | @id @default(uuid()) | Primary key |
| **bootcampId** | String | | Bootcamp reference |
| **day** | Int | | Day number |
| **title** | String | | Topic title |
| **prompt** | String | | Discussion prompt |
| **guidance** | String | | Facilitator guidance |
| **expectedOutcomes** | String[] | | Outcomes array |
| **tags** | String[] | | Tags array |
| **createdAt** | DateTime | @default(now()) | Creation timestamp |

**Relations**:
- Many-to-one: Bootcamp

---

## 4. TYPE GENERATION SUMMARY

### 4.1 Prisma Type Generation

**Process**: Prisma automatically generates TypeScript types from schema

**Generated Types Include**:
- Model types (User, Student, Bootcamp, etc.)
- Enum types (Role, BootcampStatus, etc.)
- Relation types
- Input types for mutations
- Filter types for queries

**Benefits**:
- Type safety
- Automatic synchronization
- IntelliSense support
- Compile-time error checking

---

## 5. DATABASE RELATIONSHIP SUMMARY

### 5.1 Entity Relationships

**User Hierarchy**:
- User (base) → Student, Parent, Facilitator, Admin (one-to-one)

**Bootcamp Relationships**:
- Bootcamp → Facilitator (many-to-one)
- Bootcamp → Enrollment (one-to-many)
- Bootcamp → Session (one-to-many)
- Bootcamp → DiscussionTopic (one-to-many)

**Student Relationships**:
- Student → User (many-to-one)
- Student → Parent (many-to-one, optional)
- Student → Enrollment (one-to-many)
- Student → KnowledgeStream (many-to-many via StudentKnowledgeStream)
- Student → ProgressRecord (one-to-many)
- Student → AttendanceRecord (one-to-many)

**Knowledge Stream Relationships**:
- KnowledgeStream → KnowledgeLevel (one-to-many)
- KnowledgeStream → Student (many-to-many via StudentKnowledgeStream)

**Session Relationships**:
- Session → Bootcamp (many-to-one)
- Session → SessionActivity (one-to-many)
- Session → AttendanceRecord (one-to-many)

**Communication Relationships**:
- Communication → User (many-to-one, sender)
- Communication → User (many-to-many via CommunicationRecipient)
- Communication → ReadReceipt (one-to-many)

**Payment Relationships**:
- Payment → User (many-to-one)
- Payment → Bootcamp (many-to-one, optional)
- Payment → Subscription (many-to-one, optional)

---

## END OF STRUCTURED DATABASE SPECIFICATION

**Original Content**: Preserved in full  
**Structure Added**: Hierarchical organization, tables, field summaries, relationship diagrams  
**Format**: Markdown optimized for LLM/AI parsing  
**Purpose**: Complete database specification for development teams and AI systems

