# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meeting Phantom Ultra is an AI assistant that joins Zoom meetings automatically, transcribes conversations in real-time, and sends email summaries with action items to meeting participants. Currently in task execution phase with 64 implementation tasks ready for 5-day sprint.

## Current State

- **Branch**: `001-ai-assistant-that` (Spec Kit feature branch)
- **Phase**: Phase 3.4 Services Layer - Core services complete, integration layer next
- **Status**: Infrastructure complete, 41/64 tasks (64.1%) finished, core services implemented
- **Architecture**: Production-grade Next.js fullstack application
- **Sprint**: 5-day intensive development (12-13 tasks/day with parallel batching)
- **Build**: ✅ Clean compilation after infrastructure fixes (commit ba966f3)

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

Implementation progress: 41/64 tasks completed (64.1%)
- ✅ **T001-T005**: Project setup and dependencies COMPLETE
- ✅ **T006-T015**: Contract tests (TDD foundation) COMPLETE
- ✅ **T016-T035**: Database schema and API endpoints COMPLETE
- ✅ **T036-T041**: Core services with mock implementations COMPLETE
- ✅ **Infrastructure**: Build errors resolved, Clerk v5 updated, TypeScript clean
- 🎯 **T042-T047**: Integration layer with middleware and pipelines (CURRENT TARGET)
- 📋 **T048-T055**: Frontend dashboard components
- 📋 **T056-T064**: Polish, optimization, and deployment

**Current Focus**: Phase 3.4 Integration Layer
- ✅ Core services: User, Meeting, Zoom (mock), AssemblyAI (mock), Gmail (mock), AI (mock)
- 🎯 Integration layer: OAuth token management, transcription pipeline, middleware
- Mock implementations: Rapid development without API dependencies
- Production transition: Easy swap to real API clients when credentials available

**Execution Strategy**: 
- ✅ Stable infrastructure foundation established
- ✅ All API endpoints implemented with proper OAuth callback handling
- ✅ TDD tests ready to validate service implementations
- ✅ Mock-first approach for external API integrations
- ✅ Core services layer complete with production-ready interfaces
- 🎯 Target: Complete integration layer before frontend development

## Constitutional Requirements

All development must maintain:
- <200ms API response times
- 80% test coverage minimum
- Input validation and security
- Consistent error handling
- Production-ready code quality

---
*Last Updated: September 25, 2025 - Phase 3.4 Services Layer with infrastructure complete*
