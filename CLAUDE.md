# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meeting Phantom Ultra is an AI assistant that joins Zoom meetings automatically, transcribes conversations in real-time, and sends email summaries with action items to meeting participants. Currently in task execution phase with 64 implementation tasks ready for 5-day sprint.

## Current State

- **Branch**: `001-ai-assistant-that` (Spec Kit feature branch)
- **Phase**: Task execution phase - 64 numbered tasks ready
- **Status**: Specification complete, tasks.md generated, ready for implementation
- **Architecture**: Production-grade Next.js fullstack application
- **Sprint**: 5-day intensive development (12-13 tasks/day with parallel batching)

## Tech Stack (Decided & Validated)

- **Frontend**: Next.js with TypeScript
- **Backend**: Next.js API Routes (fullstack approach)
- **Database**: Supabase (managed PostgreSQL) with Prisma ORM
- **Authentication**: Clerk (OAuth integration for Zoom/Gmail)
- **Meeting Integration**: Zoom API + AssemblyAI transcription
- **Email Delivery**: Gmail API
- **Deployment**: Vercel (serverless)

## Architecture Overview

### Database Schema (6 Entities)
- User (auth + OAuth tokens)
- Meeting (lifecycle tracking)
- Transcript (AssemblyAI integration)
- ActionItem (extracted tasks)
- Summary (AI-generated overview)
- Email (delivery tracking)

### API Structure
- `/api/auth/*` - Authentication & OAuth flows
- `/api/meetings/*` - Meeting CRUD & webhook handling
- `/api/webhooks/zoom` - Meeting lifecycle events

### Key Integrations
- **Zoom OAuth** - Meeting access & bot participation
- **Gmail OAuth** - Email summary delivery
- **AssemblyAI** - Real-time transcription with speaker ID
- **OpenAI GPT-4** - Summary generation & action item extraction

## Development Commands

*Will be established during implementation phase*

```bash
# Development (planned)
npm run dev      # Next.js development server
npm run build    # Production build
npm run test     # Jest unit tests
npm run test:e2e # Playwright integration tests

# Database (planned)
npx prisma migrate dev # Run migrations
npx prisma generate    # Generate client
npx prisma studio      # Database GUI
```


## MVP Constraints

- **Timeline**: 5-day intensive development cycle (full-time focus)
- **Scope**: Single-user accounts, English-only, Gmail-only
- **Performance**: <200ms API responses
- **Data Retention**: 30-day automatic cleanup
- **Budget**: Free tier optimized (Vercel, Supabase, Clerk)
- **Development Style**: High-velocity batching of parallel tasks


## Testing Strategy

- **Unit Tests**: Jest/Vitest for business logic
- **Integration Tests**: Playwright for user workflows
- **Contract Tests**: OpenAPI schema validation
- **E2E Validation**: Complete quickstart guide (8-step user journey)

## Key Files & Documentation

- `specs/001-ai-assistant-that/spec.md` - Complete feature specification
- `specs/001-ai-assistant-that/data-model.md` - Prisma database schema
- `specs/001-ai-assistant-that/contracts/` - OpenAPI 3.0 API specifications
- `specs/001-ai-assistant-that/tasks.md` - 64 numbered implementation tasks
- `specs/001-ai-assistant-that/quickstart.md` - End-to-end testing guide
- `PROJECT_CONTEXT.md` - MVP scope and tech stack decisions
- `FEATURES.md` - Implementation progress tracking

## Current Execution Phase

Ready to execute 64 numbered implementation tasks:
- **T001-T005**: Project setup and dependencies (Day 1)
- **T006-T015**: Contract tests (TDD phase - MUST complete before implementation)
- **T016-T030**: Database schema and core models (Day 1-2)
- **T031-T045**: Authentication and OAuth flows (Day 2-3)
- **T046-T058**: Meeting processing and transcription (Day 3-4)
- **T059-T064**: UI, integration tests, and deployment (Day 4-5)

**Execution Strategy**: 
- Batch parallel [P] tasks together for efficiency
- Complete TDD phase (T006-T015) before ANY implementation
- Target 12-13 tasks per day with focused 8-10 hour sessions

## Constitutional Requirements

All development must maintain:
- <200ms API response times
- 80% test coverage minimum
- Input validation and security
- Consistent error handling
- Production-ready code quality

---
*Last Updated: September 24, 2025 - Task execution phase ready*
