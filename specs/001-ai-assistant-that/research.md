# Research: AI Meeting Assistant

*Based on established PROJECT_CONTEXT.md decisions*

## Technology Decisions

### Frontend & Backend: Next.js with TypeScript
**Decision**: Next.js fullstack application with API routes
**Rationale**:
- Single codebase for frontend and backend simplifies solo development
- Built-in API routes eliminate need for separate backend service
- TypeScript provides type safety across the stack
- Excellent Vercel integration for deployment
- Strong ecosystem for AI/ML integrations

**Alternatives considered**: Already decided in PROJECT_CONTEXT.md

### Database: Supabase with Prisma ORM
**Decision**: Supabase as backend-as-a-service with Prisma for type-safe database access
**Rationale**:
- Supabase provides managed PostgreSQL with real-time subscriptions
- Built-in authentication integration with Clerk
- Generous free tier fits bootstrap budget
- Prisma ORM ensures type safety and excellent developer experience
- Real-time capabilities useful for meeting status updates

**Alternatives considered**: Already decided in PROJECT_CONTEXT.md

### Authentication: Clerk
**Decision**: Clerk for user authentication and session management
**Rationale**:
- Pre-built authentication UI components
- OAuth integrations for Zoom and Gmail
- User management dashboard included
- Excellent Next.js integration
- Free tier supports MVP user base
- Handles session management complexity

**Alternatives considered**: Already decided in PROJECT_CONTEXT.md

### Meeting Integration: Zoom API + AssemblyAI
**Decision**: Zoom APIs for meeting access, AssemblyAI for transcription
**Rationale**:
- Zoom Meeting SDK enables bot participation
- Zoom APIs handle meeting detection and scheduling
- AssemblyAI provides excellent real-time transcription
- Speaker identification capabilities
- Better pricing than OpenAI Whisper for continuous usage
- Built-in action item detection features

**Alternatives considered**: Already decided in PROJECT_CONTEXT.md

### Deployment: Vercel
**Decision**: Vercel for hosting and deployment
**Rationale**:
- Native Next.js platform with zero-config deployment
- Serverless functions handle API routes automatically
- Global CDN for frontend assets
- Built-in CI/CD from GitHub
- Generous free tier for MVP scale
- Excellent developer experience

**Alternatives considered**: Already decided in PROJECT_CONTEXT.md

## Architecture Patterns

### Simple MVC Pattern
**Decision**: Straightforward MVC architecture avoiding complexity
**Rationale**:
- 3-week timeline requires simple, proven patterns
- Solo developer benefits from familiar structure
- Next.js naturally supports MVC with pages/API routes
- Avoids event-driven complexity that would slow MVP development

**Alternatives considered**:
- Event-driven architecture: Too complex for MVP timeline
- Microservices: Overkill for single developer and simple use case

### Direct API Integration
**Decision**: Direct API calls to external services without complex abstractions
**Rationale**:
- Faster development for MVP
- Fewer layers of abstraction to debug
- Clear data flow for solo developer
- Can refactor later if needed

### Simple Database Schema
**Decision**: Normalized but straightforward schema design
**Rationale**:
- Prisma ORM handles relationships elegantly
- PostgreSQL supports JSON fields for flexible transcript storage
- Simple structure reduces development time
- Easier to understand and maintain

## Integration Decisions

### Meeting Processing Flow
**Decision**: Linear processing pipeline for simplicity
**Rationale**:
- Meeting detected → Bot joins → Transcribe → Process → Email
- Single responsibility per step
- Easy to debug and monitor
- Fits serverless execution model on Vercel

**Workflow**:
1. Webhook from Zoom detects meeting start
2. Bot joins meeting via Zoom SDK
3. Real-time transcription via AssemblyAI
4. Meeting end triggers AI processing for summary/actions
5. Gmail API sends formatted email to participants

### Data Management Strategy
**Decision**: Simple CRUD operations with Prisma
**Rationale**:
- Prisma generates type-safe database client
- Built-in connection pooling
- Migration system for schema changes
- Automatic 30-day cleanup via scheduled functions

### Error Handling Strategy
**Decision**: Graceful degradation with user notifications
**Rationale**:
- Meeting continues even if transcription fails
- Clear error messages to users via email
- Detailed logging with Vercel's built-in monitoring
- Retry mechanisms for critical operations

### Security Approach
**Decision**: OAuth-first with minimal custom auth logic
**Rationale**:
- Clerk handles secure authentication flows
- OAuth tokens stored securely by Clerk
- API routes protected by Clerk middleware
- Supabase RLS policies for data access control

## MVP Constraints & Trade-offs

### Single User Focus
**Decision**: Individual user accounts without team features
**Rationale**:
- Simplifies data model and permissions
- Faster MVP development
- Reduces UI complexity
- Can add team features in future iterations

### English-Only Processing
**Decision**: Limit to English language support
**Rationale**:
- Reduces complexity of AI processing
- AssemblyAI excellent English accuracy
- Matches user requirements from clarification session
- International support can be added later

### Basic UI/UX
**Decision**: Minimal but functional interface
**Rationale**:
- 3-week timeline prioritizes functionality over polish
- Clerk provides pre-built auth components
- Simple dashboard for meeting history
- Focus on email delivery as primary UX

### Free Tier Optimization
**Decision**: Architecture designed around service free tiers
**Rationale**:
- Bootstrap budget constraint
- Vercel: Hobby plan sufficient
- Supabase: Free tier covers MVP usage
- Clerk: Free tier supports user base
- AssemblyAI: Pay-per-use pricing scales with usage

## Technical Risk Mitigation

### Zoom API Rate Limits
**Mitigation**: Queue system for meeting processing, graceful backoff

### AssemblyAI Latency
**Mitigation**: Real-time streaming, fallback to batch processing

### Vercel Function Timeouts
**Mitigation**: Break long processes into smaller functions, use webhooks for async processing

### Database Connection Limits
**Mitigation**: Prisma connection pooling, optimize query patterns