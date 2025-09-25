# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meeting Phantom Ultra is an AI assistant that joins Zoom meetings automatically, transcribes conversations in real-time, and sends email summaries with action items to meeting participants. Currently in task execution phase with 64 implementation tasks ready for 5-day sprint.

## Current State

- **Branch**: `001-ai-assistant-that` (Spec Kit feature branch)
- **Phase**: Phase 3.4 Integration Layer FUNCTIONALLY COMPLETE ✅ - Services connected to API endpoints
- **Status**: Integration layer functionally complete, 47/64 tasks (73.4%) finished, service orchestration established
- **Architecture**: Production-grade Next.js fullstack application with complete service integration
- **Sprint**: 5-day intensive development (12-13 tasks/day with parallel batching)
- **Build**: ✅ Functionally complete with known technical debt for Phase 3.6

## Tech Stack (Decided & Validated)

- **Frontend**: Next.js with TypeScript
- **Backend**: Next.js API Routes (fullstack approach)
- **Database**: Supabase (managed PostgreSQL) with Prisma ORM
- **Authentication**: Clerk (OAuth integration for Zoom/Gmail)
- **Meeting Integration**: Zoom API + AssemblyAI transcription
- **Email Delivery**: Gmail API
- **Deployment**: Vercel (serverless)

## Architecture Overview

### Database Schema (6 entities)
- **User**: Authentication, OAuth tokens, preferences
- **Meeting**: Zoom integration, status tracking, participants
- **Transcript**: AssemblyAI processing, speaker identification
- **ActionItem**: AI-extracted tasks, assignment tracking
- **Summary**: Meeting summaries, key points extraction
- **Email**: Delivery tracking, template management

### API Structure
- `/api/auth/*` - Authentication & OAuth flows
- `/api/meetings/*` - Meeting CRUD & webhook handling
- `/api/webhooks/zoom` - Meeting lifecycle events

### External Integrations
- **Zoom OAuth** - Meeting access & webhook subscriptions
- **Gmail OAuth** - Email summary delivery
- **AssemblyAI** - Real-time transcription with speaker ID
- **OpenAI GPT-4** - Summary generation & action item extraction

## Development Commands

```bash
npm run dev      # Next.js development server
npm run build    # Production build
npm run test     # Jest unit tests
npm run lint     # ESLint validation
npm run db:push  # Prisma schema sync
npm run db:studio # Database GUI
```

## MVP Constraints & Requirements

- **Scope**: Single-user accounts, English-only, Gmail-only
- **Performance**: <200ms API responses
- **Data Retention**: 30-day automatic cleanup
- **Budget**: Bootstrap/free tiers preferred
- **Timeline**: 5-day intensive development sprint

## Testing Strategy

- **Contract Tests**: API endpoint validation (OpenAPI schemas)
- **Unit Tests**: Service layer logic validation
- **Integration Tests**: Playwright for user workflows
- **Contract Tests**: OpenAPI schema validation
- **E2E Validation**: Complete quickstart guide (8-step user journey)

## Key Files

- `specs/001-ai-assistant-that/spec.md` - Complete functional specification
- `specs/001-ai-assistant-that/data-model.md` - Prisma database schema
- `specs/001-ai-assistant-that/contracts/` - OpenAPI 3.0 API specifications
- `specs/001-ai-assistant-that/tasks.md` - 64 numbered implementation tasks
- `PROJECT_CONTEXT.md` - MVP scope and tech stack decisions
- `FEATURES.md` - Implementation progress tracking

## Current Execution Phase

Implementation progress: 47/64 tasks completed (73.4%) - Integration Layer functionally complete
- ✅ **T001-T005**: Project setup and dependencies COMPLETE
- ✅ **T006-T015**: Contract tests (TDD foundation) COMPLETE
- ✅ **T016-T035**: Database schema and API endpoints COMPLETE
- ✅ **T036-T041**: Core services with mock implementations COMPLETE
- ✅ **T042-T047**: Integration layer - Services connected to API endpoints FUNCTIONALLY COMPLETE
- ✅ **Infrastructure**: Build errors resolved, Clerk v5 updated, TypeScript clean
- 🎯 **T048-T055**: Frontend dashboard components (NEXT TARGET)
- 📋 **T056-T064**: Polish, optimization, and deployment

**Current Focus**: Phase 3.5 Frontend Dashboard
- ✅ Integration layer: All services connected to API endpoints (real infrastructure, mock external APIs)
- ✅ Service orchestration: Meeting processing workflow fully integrated (real webhook → mock transcription → mock AI → mock email)
- ✅ Production-ready: Database connection pooling, error handling, authentication protection
- 🎯 Frontend dashboard: User interface for meeting management and integration settings

**Execution Strategy**: 
- ✅ Stable infrastructure foundation established
- ✅ All API endpoints implemented with proper OAuth callback handling
- ✅ TDD tests ready to validate service implementations
- ✅ Mock-first approach for external API integrations
- ✅ Core services layer complete with production-ready interfaces
- 🎯 Target: Complete frontend dashboard before polish phase

**Known Technical Debt (Phase 3.6 Polish)**:
- meeting-service.ts enum alignment and Prisma schema field mapping
- Path alias IDE warnings cleanup

## Constitutional Requirements

All development must maintain:
- <200ms API response times
- 80% test coverage minimum
- Secure OAuth token handling
- Consistent error handling
- Production-ready code quality

---
*Last Updated: September 25, 2025 - Phase 3.4 Integration Layer functionally complete*