# Database Specification for MindForge Learning Program

## Option B: TypeScript Types/Interfaces Based on Prototype JSON Files

### Core Entity Types

```typescript
// users.ts
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

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

export interface Parent extends BaseUser {
  childrenIds: string[];
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

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

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export interface Admin extends BaseUser {
  permissions: string[];
  department: string;
}

// bootcamps.ts
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

export interface DailySchedule {
  day: number; // 1-5 for Mon-Fri
  theme: string;
  activities: Activity[];
}

export interface Activity {
  time: string; // HH:MM-HH:MM format
  type: 'Interactive Lecture' | 'Group Exercise' | 'Peer Teaching' | 'Individual Work' | 'Assessment';
  title: string;
  description: string;
  materials: string[]; // File names/URLs
  learningObjectives: string[];
}

// knowledge-streams.ts
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

export interface KnowledgeLevel {
  level: number;
  title: string;
  bootcampIds: string[];
  skills: string[];
  prerequisites: number[]; // Level numbers that must be completed first
  nextLevel: number | null;
  estimatedCompletionTime: string; // e.g., "2-3 months"
}

// sessions.ts
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

export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
  joinTime?: Date;
  leaveTime?: Date;
  engagementScore?: number; // 1-100
}

// progress-tracking.ts
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

export interface AssessmentRubric {
  id: string;
  skill: string;
  levels: RubricLevel[];
  assessmentActivities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RubricLevel {
  level: string;
  description: string;
  criteria: string[];
}

// communications.ts
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

export interface ReadReceipt {
  userId: string;
  readAt: Date;
}

// payments.ts
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

// content.ts
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

## Option C: Database Schema + TypeScript Types

### Database Schema (PostgreSQL with Prisma)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

enum Role {
  STUDENT
  PARENT
  FACILITATOR
  ADMIN
}

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

model Parent {
  id         String   @id @default(uuid())
  userId     String   @unique
  children   Student[]
  subscriptionStatus String @default("trial")
  notificationPreferences Json
  User       User     @relation(fields: [userId], references: [id])
}

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

model Admin {
  id         String @id @default(uuid())
  userId     String @unique
  permissions String[]
  department String
  User       User   @relation(fields: [userId], references: [id])
}

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

enum BootcampFormat {
  IN_PERSON
  ONLINE
  HYBRID
}

enum BootcampStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

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

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

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

model StudentKnowledgeStream {
  id              String @id @default(uuid())
  studentId       String
  knowledgeStreamId String
  Student         Student        @relation(fields: [studentId], references: [id])
  KnowledgeStream KnowledgeStream @relation(fields: [knowledgeStreamId], references: [id])
  
  @@unique([studentId, knowledgeStreamId])
}

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

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}

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

model AssessmentRubric {
  id                  String       @id @default(uuid())
  skill               String       @unique
  levels              RubricLevel[]
  assessmentActivities String[]
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
}

model RubricLevel {
  id           String @id @default(uuid())
  level        String
  description  String
  criteria     String[]
  rubricId     String
  AssessmentRubric AssessmentRubric @relation(fields: [rubricId], references: [id])
}

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

enum CommunicationType {
  EMAIL
  NOTIFICATION
  MESSAGE
  ANNOUNCEMENT
}

enum CommunicationStatus {
  DRAFT
  SENT
  SCHEDULED
}

model CommunicationRecipient {
  id             String @id @default(uuid())
  communicationId String
  recipientId    String
  Communication  Communication @relation(fields: [communicationId], references: [id])
  User           User         @relation("Recipient", fields: [recipientId], references: [id])
  
  @@unique([communicationId, recipientId])
}

model ReadReceipt {
  id             String   @id @default(uuid())
  communicationId String
  userId         String
  readAt         DateTime
  Communication  Communication @relation(fields: [communicationId], references: [id])
  User           User         @relation(fields: [userId], references: [id])
  
  @@unique([communicationId, userId])
}

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

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

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

### Corresponding TypeScript Types (Generated from Schema)

```typescript
// These types are automatically generated by Prisma Client
// But here's what they would look like:

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Role = 'STUDENT' | 'PARENT' | 'FACILITATOR' | 'ADMIN';

export type Student = {
  id: string;
  userId: string;
  age: number;
  grade: string;
  interests: string[];
  learningStyle: string;
  parentId: string | null;
  progress: Prisma.JsonValue;
  User: User;
  Parent: Parent | null;
  completedBootcamps: Enrollment[];
  upcomingBootcamps: Enrollment[];
  knowledgeStreams: StudentKnowledgeStream[];
  progressRecords: ProgressRecord[];
  attendanceRecords: AttendanceRecord[];
};

export type Bootcamp = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  format: BootcampFormat[];
  ageRange: string;
  subjects: string[];
  facilitatorId: string;
  schedule: string;
  capacity: number;
  price: number;
  learningOutcomes: string[];
  weeklySchedule: Prisma.JsonValue;
  prerequisites: string[];
  status: BootcampStatus;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
  Facilitator: Facilitator;
  enrollments: Enrollment[];
  sessions: Session[];
  discussionTopics: DiscussionTopic[];
};

export type BootcampFormat = 'IN_PERSON' | 'ONLINE' | 'HYBRID';
export type BootcampStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type Enrollment = {
  id: string;
  studentId: string;
  bootcampId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt: Date | null;
  Student: Student;
  Bootcamp: Bootcamp;
};

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type Session = {
  id: string;
  bootcampId: string;
  day: number;
  theme: string;
  date: Date;
  startTime: string;
  endTime: string;
  Bootcamp: Bootcamp;
  activities: SessionActivity[];
  attendance: AttendanceRecord[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProgressRecord = {
  id: string;
  studentId: string;
  bootcampId: string | null;
  sessionId: string | null;
  skill: string;
  level: string;
  assessmentDate: Date;
  facilitatorId: string;
  evidence: string;
  nextSteps: string;
  createdAt: Date;
  Student: Student;
  Facilitator: Facilitator;
  Bootcamp: Bootcamp | null;
  Session: Session | null;
};

// ... and so on for all other models
```

This database specification provides both the structural definition (schema) and the corresponding TypeScript types needed for type-safe development. The Prisma schema serves as both the database definition and the source for generating TypeScript types, ensuring perfect synchronization between database structure and application code.