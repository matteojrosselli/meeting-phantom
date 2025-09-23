# Data Model: AI Meeting Assistant

## Entity Definitions

### User
Core user entity with authentication and integration settings.

**Fields**:
- `id`: UUID (Primary Key)
- `clerkUserId`: String (Clerk authentication ID)
- `email`: String (Unique, from Clerk)
- `name`: String (Display name from Clerk)
- `zoomConnected`: Boolean (OAuth connection status)
- `zoomAccessToken`: String (Encrypted, OAuth token)
- `zoomRefreshToken`: String (Encrypted, OAuth refresh)
- `gmailConnected`: Boolean (OAuth connection status)
- `gmailAccessToken`: String (Encrypted, OAuth token)
- `gmailRefreshToken`: String (Encrypted, OAuth refresh)
- `preferences`: JSON (User settings, meeting exclusions)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- One-to-many: `meetings[]`

**Validation Rules**:
- Email must be valid format (handled by Clerk)
- OAuth tokens encrypted at rest
- Preferences JSON schema validated

### Meeting
Meeting instance with lifecycle tracking.

**Fields**:
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key → User)
- `zoomMeetingId`: String (Zoom meeting identifier)
- `title`: String (Meeting title from Zoom)
- `scheduledStart`: DateTime (Zoom scheduled time)
- `actualStart`: DateTime (When bot joined)
- `actualEnd`: DateTime (When meeting ended)
- `status`: Enum (`scheduled`, `in_progress`, `completed`, `failed`, `skipped`)
- `participants`: JSON Array (Meeting participant list)
- `meetingUrl`: String (Zoom meeting URL)
- `isExcluded`: Boolean (User manually excluded)
- `botJoined`: Boolean (Bot successfully joined)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Many-to-one: `user` (User)
- One-to-one: `transcript` (Transcript, optional)
- One-to-one: `summary` (Summary, optional)
- One-to-many: `actionItems[]` (ActionItem)
- One-to-many: `emails[]` (Email)

**Validation Rules**:
- Status transitions: scheduled → in_progress → completed/failed
- Actual start/end times required when status is completed
- Participants array contains email/name objects

**State Transitions**:
```
scheduled → in_progress (bot joins)
in_progress → completed (meeting ends successfully)
in_progress → failed (error during processing)
scheduled → skipped (user excluded or error before joining)
```

### Transcript
Real-time meeting transcription with speaker identification.

**Fields**:
- `id`: UUID (Primary Key)
- `meetingId`: UUID (Foreign Key → Meeting, Unique)
- `assemblyAIId`: String (AssemblyAI transcript ID)
- `status`: Enum (`processing`, `completed`, `failed`)
- `language`: String (Always 'en' for MVP)
- `speakers`: JSON Array (Speaker identification data)
- `segments`: JSON Array (Timestamped transcript segments)
- `confidence`: Float (Overall transcription confidence)
- `duration`: Integer (Meeting duration in seconds)
- `wordCount`: Integer (Total words transcribed)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- One-to-one: `meeting` (Meeting)

**Validation Rules**:
- Language must be 'en' for MVP
- Confidence between 0.0 and 1.0
- Segments contain timestamp, speaker, text fields

**JSON Schema for segments**:
```json
{
  "timestamp": "ISO datetime",
  "speaker": "string",
  "text": "string",
  "confidence": "float"
}
```

### ActionItem
Extracted action items from meeting content.

**Fields**:
- `id`: UUID (Primary Key)
- `meetingId`: UUID (Foreign Key → Meeting)
- `text`: Text (Action item description)
- `assignee`: String (Person assigned, optional)
- `dueDate`: Date (Due date if mentioned, optional)
- `priority`: Enum (`low`, `medium`, `high`)
- `status`: Enum (`pending`, `completed`, `cancelled`)
- `confidence`: Float (AI extraction confidence)
- `sourceSegment`: String (Original transcript text)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Many-to-one: `meeting` (Meeting)

**Validation Rules**:
- Text cannot be empty
- Priority defaults to 'medium'
- Confidence between 0.0 and 1.0
- Source segment tracks original context

### Summary
Generated meeting summary with key points and decisions.

**Fields**:
- `id`: UUID (Primary Key)
- `meetingId`: UUID (Foreign Key → Meeting, Unique)
- `title`: String (Generated title)
- `overview`: Text (Executive summary)
- `keyPoints`: JSON Array (Main discussion points)
- `decisions`: JSON Array (Decisions made)
- `nextSteps`: JSON Array (Next steps identified)
- `attendees`: JSON Array (Participant summary)
- `aiModel`: String (AI model used for generation)
- `generatedAt`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- One-to-one: `meeting` (Meeting)

**Validation Rules**:
- Title max 200 characters
- Overview required, max 1000 characters
- JSON arrays contain structured objects

### Email
Email delivery tracking for meeting summaries.

**Fields**:
- `id`: UUID (Primary Key)
- `meetingId`: UUID (Foreign Key → Meeting)
- `recipientEmail`: String (Recipient address)
- `recipientName`: String (Recipient name, optional)
- `subject`: String (Email subject line)
- `status`: Enum (`pending`, `sent`, `failed`, `bounced`)
- `gmailMessageId`: String (Gmail API message ID)
- `sentAt`: DateTime (When email was sent)
- `errorMessage`: String (Error details if failed)
- `retryCount`: Integer (Number of retry attempts)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Many-to-one: `meeting` (Meeting)

**Validation Rules**:
- Recipient email must be valid format
- Retry count max 3
- Error message required when status is failed

## Database Schema (Prisma)

```prisma
// schema.prisma

model User {
  id                String    @id @default(cuid())
  clerkUserId       String    @unique
  email             String    @unique
  name              String
  zoomConnected     Boolean   @default(false)
  zoomAccessToken   String?
  zoomRefreshToken  String?
  gmailConnected    Boolean   @default(false)
  gmailAccessToken  String?
  gmailRefreshToken String?
  preferences       Json      @default("{}")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  meetings          Meeting[]
}

model Meeting {
  id            String      @id @default(cuid())
  userId        String
  zoomMeetingId String
  title         String
  scheduledStart DateTime
  actualStart   DateTime?
  actualEnd     DateTime?
  status        MeetingStatus @default(scheduled)
  participants  Json        @default("[]")
  meetingUrl    String
  isExcluded    Boolean     @default(false)
  botJoined     Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  user          User        @relation(fields: [userId], references: [id])
  transcript    Transcript?
  summary       Summary?
  actionItems   ActionItem[]
  emails        Email[]

  @@unique([userId, zoomMeetingId])
}

model Transcript {
  id            String            @id @default(cuid())
  meetingId     String            @unique
  assemblyAIId  String
  status        TranscriptStatus  @default(processing)
  language      String            @default("en")
  speakers      Json              @default("[]")
  segments      Json              @default("[]")
  confidence    Float?
  duration      Int?
  wordCount     Int?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  meeting       Meeting           @relation(fields: [meetingId], references: [id])
}

model ActionItem {
  id            String      @id @default(cuid())
  meetingId     String
  text          String
  assignee      String?
  dueDate       DateTime?
  priority      Priority    @default(medium)
  status        ActionStatus @default(pending)
  confidence    Float
  sourceSegment String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  meeting       Meeting     @relation(fields: [meetingId], references: [id])
}

model Summary {
  id            String    @id @default(cuid())
  meetingId     String    @unique
  title         String
  overview      String
  keyPoints     Json      @default("[]")
  decisions     Json      @default("[]")
  nextSteps     Json      @default("[]")
  attendees     Json      @default("[]")
  aiModel       String
  generatedAt   DateTime
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  meeting       Meeting   @relation(fields: [meetingId], references: [id])
}

model Email {
  id              String      @id @default(cuid())
  meetingId       String
  recipientEmail  String
  recipientName   String?
  subject         String
  status          EmailStatus @default(pending)
  gmailMessageId  String?
  sentAt          DateTime?
  errorMessage    String?
  retryCount      Int         @default(0)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  meeting         Meeting     @relation(fields: [meetingId], references: [id])
}

enum MeetingStatus {
  scheduled
  in_progress
  completed
  failed
  skipped
}

enum TranscriptStatus {
  processing
  completed
  failed
}

enum Priority {
  low
  medium
  high
}

enum ActionStatus {
  pending
  completed
  cancelled
}

enum EmailStatus {
  pending
  sent
  failed
  bounced
}
```

## Data Retention Policy

**30-Day Automatic Cleanup**:
- Scheduled function runs daily
- Deletes meetings older than 30 days
- Cascading deletes remove associated transcripts, summaries, action items, emails
- User accounts and preferences retained
- OAuth tokens refreshed but not deleted

**Implementation**:
```sql
-- Cleanup query (executed by scheduled function)
DELETE FROM Meeting
WHERE createdAt < NOW() - INTERVAL '30 days';
```