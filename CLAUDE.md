# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meeting Phantom Ultra is an AI assistant that joins Zoom meetings automatically, transcribes conversations in real-time, and sends email summaries with action items to meeting participants. 

**Current Status**: Phase 3.4 Integration Layer functionally complete (47/64 tasks, 73.4%) with **mock external APIs** + real infrastructure. Ready for Phase 3.5 Frontend Dashboard development.

## Current State

- **Branch**: `001-ai-assistant-that` (Spec Kit feature branch)
- **Phase**: Phase 3.4 Integration Layer FUNCTIONALLY COMPLETE ✅ - Services connected to API endpoints
- **Status**: Integration layer functionally complete, 47/64 tasks (73.4%) finished, service orchestration established
- **Architecture**: Production-grade Next.js fullstack application with complete service integration
- **API Strategy**: 🔄 **MOCK EXTERNAL APIs ACTIVE** (Zoom, AssemblyAI, Gmail, OpenAI) + Real infrastructure
- **Sprint**: 5-day intensive development (12-13 tasks/day with parallel batching)
- **Build**: ✅ Functionally complete with ⚠️ **documented technical debt** for Phase 3.6

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

### 🔄 **Mock API Strategy (Phase 3.4 Achievement)**

**MOCK EXTERNAL APIs ACTIVE** (Production Transition Ready):
- **Zoom API**: Mock client active, real OAuth token management via UserService
- **AssemblyAI**: Mock transcription responses, real webhook processing pipeline  
- **Gmail API**: Mock email delivery, real template system and OAuth storage
- **OpenAI GPT-4**: Mock AI responses, real meeting processing workflow

**🏢 REAL INFRASTRUCTURE COMPLETE**:
- OAuth token management and storage (UserService)
- Database connection pooling and error handling
- Clerk authentication protection across all endpoints
- Complete webhook processing pipeline (Zoom → MeetingProcessor)

**🚀 PRODUCTION TRANSITION READY**: Easy swap to real API clients when credentials available

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
- ✅ **Real Infrastructure**: OAuth management, database pooling, authentication protection, webhook processing
- ✅ **Mock External APIs**: Zoom, AssemblyAI, Gmail, OpenAI clients (production-transition ready)
- ✅ **Service orchestration**: Complete meeting workflow (real webhook → mock transcription → mock AI → mock email)
- 🎯 **Frontend dashboard**: User interface connecting to existing API endpoints
- ⚠️ **Technical debt**: Documented and deferred to Phase 3.6 Polish

**Execution Strategy**: 
- ✅ **Mock-First Development**: External APIs mocked for rapid development without dependencies
- ✅ **Production-Ready Interfaces**: Easy swap to real API clients when credentials available
- ✅ **Real Infrastructure**: OAuth, database, authentication, webhook processing complete
- ✅ **TDD Foundation**: Contract tests validate API implementations
- 🎯 **Frontend Focus**: UI development leveraging completed backend infrastructure

## ⚠️ **Technical Debt (Documented for Phase 3.6 Polish)**

### 🔧 **Service Layer Refactoring**
- **meeting-service.ts**: Enum alignment ("cancelled" vs "failed"), Prisma schema field mapping
- **Database infrastructure**: Advanced connection pooling, comprehensive error handling
- **Service orchestration**: Full error boundaries, logging, monitoring
- **OAuth token management**: Advanced refresh/validation flows

### 🔄 **External API Transition**
- **Mock-to-Production Swapping**: Zoom, AssemblyAI, Gmail, OpenAI clients
- **API rate limiting**: Production usage patterns
- **Error handling**: Production-grade external API management

### 💻 **Code Quality**
- **Path aliases**: IDE warnings cleanup (@/lib/* imports)
- **TypeScript**: Additional strict mode improvements
- **ESLint**: Advanced production-ready rules

## Constitutional Requirements

All development must maintain:
- <200ms API response times
- 80% test coverage minimum
- Secure OAuth token handling
- Consistent error handling
- Production-ready code quality

---
*Last Updated: September 25, 2025 - Phase 3.4 Integration Layer functionally complete with mock external APIs + real infrastructure*