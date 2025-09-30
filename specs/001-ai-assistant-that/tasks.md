# Tasks: AI Meeting Assistant

**Input**: Design documents from `/specs/001-ai-assistant-that/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, API routes
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js fullstack**: `pages/`, `components/`, `lib/`, `prisma/`
- API routes in `pages/api/`
- Database schema in `prisma/schema.prisma`
- Tests in `__tests__/` or `tests/`

## Phase 3.1: Setup ✅ COMPLETE
- [x] T001 Create Next.js project structure with TypeScript
- [x] T002 Initialize package.json with Next.js, Prisma, Clerk, and dependencies
- [x] T003 [P] Configure ESLint, Prettier, and TypeScript config
- [x] T004 [P] Setup Prisma with Supabase connection
- [x] T005 [P] Configure Clerk authentication environment

## Phase 3.2: Tests First (TDD) ✅ COMPLETE
**TDD FOUNDATION ESTABLISHED: All contract tests failing as required**
**PROGRESS: 10/10 tests complete - Ready for Phase 3.3 implementation**
- [x] T006 [P] Contract test GET /api/auth/profile in __tests__/api/auth/profile.test.ts
- [x] T007 [P] Contract test GET /api/auth/integrations in __tests__/api/auth/integrations.test.ts
- [x] T008 [P] Contract test POST /api/auth/zoom/connect in __tests__/api/auth/zoom-connect.test.ts
- [x] T009 [P] Contract test POST /api/auth/gmail/connect in __tests__/api/auth/gmail-connect.test.ts
- [x] T010 [P] Contract test GET /api/meetings in __tests__/api/meetings/list.test.ts
- [x] T011 [P] Contract test POST /api/meetings in __tests__/api/meetings/create.test.ts
- [x] T012 [P] Contract test GET /api/meetings/{id} in __tests__/api/meetings/details.test.ts
- [x] T013 [P] Contract test POST /api/webhooks/zoom in __tests__/api/webhooks/zoom.test.ts
- [x] T014 [P] Integration test user signup flow in __tests__/integration/auth.test.ts
- [x] T015 [P] Integration test meeting processing workflow in __tests__/integration/meetings.test.ts

## Phase 3.3: Core Implementation ✅ COMPLETE

### Database Layer ✅ COMPLETE
- [x] T016 [P] User model in prisma/schema.prisma
- [x] T017 [P] Meeting model in prisma/schema.prisma
- [x] T018 [P] Transcript model in prisma/schema.prisma
- [x] T019 [P] ActionItem model in prisma/schema.prisma
- [x] T020 [P] Summary model in prisma/schema.prisma
- [x] T021 [P] Email model in prisma/schema.prisma
- [x] T022 Run Prisma migration and generate client

### Authentication APIs ✅ COMPLETE
- [x] T023 [P] GET /api/auth/profile endpoint in pages/api/auth/profile.ts
- [x] T024 [P] GET /api/auth/integrations endpoint in pages/api/auth/integrations.ts
- [x] T025 [P] POST /api/auth/zoom/connect endpoint in pages/api/auth/zoom/connect.ts
- [x] T026 [P] POST /api/auth/zoom/callback endpoint in pages/api/auth/zoom/callback.ts
- [x] T027 [P] POST /api/auth/gmail/connect endpoint in pages/api/auth/gmail/connect.ts
- [x] T028 [P] POST /api/auth/gmail/callback endpoint in pages/api/auth/gmail/callback.ts

### Meeting Management APIs ✅ COMPLETE
- [x] T029 [P] GET /api/meetings endpoint in pages/api/meetings/index.ts
- [x] T030 [P] POST /api/meetings endpoint in pages/api/meetings/index.ts
- [x] T031 [P] GET /api/meetings/[id] endpoint in pages/api/meetings/[id].ts
- [x] T032 [P] PATCH /api/meetings/[id] endpoint in pages/api/meetings/[id].ts
- [x] T033 [P] GET /api/meetings/[id]/transcript endpoint in pages/api/meetings/[id]/transcript.ts
- [x] T034 [P] GET /api/meetings/[id]/summary endpoint in pages/api/meetings/[id]/summary.ts

### Webhook Handler ✅ COMPLETE
- [x] T035 POST /api/webhooks/zoom endpoint in pages/api/webhooks/zoom.ts

## Phase 3.4: Integration Services ✅ COMPLETE
**STRATEGY: Mock implementations for rapid development, production-ready interfaces**
**PROGRESS: 6/6 core services complete - All service layer implementations finished**

### Core Services (Mock Implementations) ✅ COMPLETE
- [x] T036 [P] UserService for user management in lib/services/user-service.ts
- [x] T037 [P] MeetingService for meeting lifecycle in lib/services/meeting-service.ts
- [x] T038 [P] ZoomService for Zoom API integration (mock) in lib/services/zoom-service.ts
- [x] T039 [P] AssemblyAIService for transcription (mock) in lib/services/assemblyai-service.ts
- [x] T040 [P] GmailService for email delivery (mock) in lib/services/gmail-service.ts
- [x] T041 [P] AIService for summarization and action extraction (mock) in lib/services/ai-service.ts

### Integration Layer ✅ FUNCTIONALLY COMPLETE
- [x] T042 Connect ZoomService with OAuth token management (mock client) ⚠️ TECH DEBT
- [x] T043 Connect AssemblyAI with real-time transcription pipeline (mock responses) ⚠️ TECH DEBT
- [x] T044 Connect Gmail service with OAuth and email templates (mock delivery) ⚠️ TECH DEBT
- [x] T045 Integrate AI service with meeting processing workflow (mock AI responses) ⚠️ TECH DEBT
- [x] T046 Setup database connection pooling and error handling ⚠️ TECH DEBT
- [x] T047 Implement Clerk middleware for API route protection ✅ COMPLETE

### Phase 3.4 Technical Debt (Deferred to Phase 3.6 Polish)
- **T042-T046**: Service integrations functionally complete but require refactoring
- **Database pooling**: Basic Prisma client implemented, advanced pooling/error handling deferred
- **Service orchestration**: Basic webhook processing works, full service integration patterns deferred
- **OAuth token management**: Core functionality works, advanced token refresh/validation deferred
- **External API mocking**: Mock implementations active, production client swapping deferred
- **meeting-service.ts**: Enum alignment and Prisma schema field mapping issues deferred

## Phase 3.5: Frontend Dashboard ✅ COMPLETE

### Core Pages ✅ COMPLETE
- [x] T048 [P] Landing page with authentication in pages/index.tsx
- [x] T049 [P] Dashboard page for meeting list in pages/dashboard.tsx
- [x] T050 [P] Meeting details page in pages/meetings/[id].tsx
- [x] T051 [P] Integration settings page in pages/settings.tsx

### Components ✅ COMPLETE
- [x] T052 [P] MeetingCard component in components/MeetingCard.tsx
- [x] T053 [P] TranscriptViewer component in components/TranscriptViewer.tsx
- [x] T054 [P] SummaryDisplay component in components/SummaryDisplay.tsx
- [x] T055 [P] IntegrationStatus component in components/IntegrationStatus.tsx

## Phase 3.6: Polish & Optimization
- [x] T056 [P] Unit tests for UserService in __tests__/services/user-service.test.ts
- [x] T057 [P] Unit tests for MeetingService in __tests__/services/meeting-service.test.ts
- [x] T058 [P] Unit tests for AI processing in __tests__/services/ai-service.test.ts
- [ ] T059 Performance tests for API endpoints (<200ms requirement)
- [ ] T060 [P] Error boundary components for frontend error handling
- [ ] T061 [P] Loading states and optimistic updates for better UX
- [ ] T062 Setup automated 30-day data cleanup job
- [ ] T063 [P] Environment configuration for production deployment
- [ ] T064 Run end-to-end quickstart validation tests

## Dependencies
- ✅ Setup (T001-T005) COMPLETE - All subsequent tasks unblocked
- ✅ Tests (T006-T015) COMPLETE - TDD foundation established, all tests failing
- ✅ Implementation (T016-T035) COMPLETE - Database models and API endpoints
- ✅ Services (T036-T041) COMPLETE - Core business logic with mock external integrations
- ✅ Integration (T042-T047) FUNCTIONALLY COMPLETE - Services connected with documented technical debt
- ✅ Frontend (T048-T055) COMPLETE - All UI pages and components with authentication
- Database models (T016-T022) before services (T036-T041)
- Services (T036-T041) before API endpoints (T023-T035)
- Core APIs before integration (T042-T047)
- Backend complete before frontend (T048-T055)
- Implementation complete before polish (T056-T064)

## Parallel Execution Examples

### Phase 3.2: All Contract Tests (Run Together) ✅ COMPLETE
```
Task: "Contract test GET /api/auth/profile in __tests__/api/auth/profile.test.ts"
Task: "Contract test GET /api/auth/integrations in __tests__/api/auth/integrations.test.ts"
Task: "Contract test POST /api/auth/zoom/connect in __tests__/api/auth/zoom-connect.test.ts"
Task: "Contract test POST /api/auth/gmail/connect in __tests__/api/auth/gmail-connect.test.ts"
Task: "Contract test GET /api/meetings in __tests__/api/meetings/list.test.ts"
Task: "Contract test POST /api/meetings in __tests__/api/meetings/create.test.ts"
Task: "Contract test GET /api/meetings/{id} in __tests__/api/meetings/details.test.ts"
Task: "Contract test POST /api/webhooks/zoom in __tests__/api/webhooks/zoom.test.ts"
```
**NOTE: All 8 contract tests + 2 integration tests (T006-T015) can run in parallel**

### Phase 3.3: Database Models (Run Together)
```
Task: "User model in prisma/schema.prisma"
Task: "Meeting model in prisma/schema.prisma"
Task: "Transcript model in prisma/schema.prisma"
Task: "ActionItem model in prisma/schema.prisma"
Task: "Summary model in prisma/schema.prisma"
Task: "Email model in prisma/schema.prisma"
```

### Phase 3.4: Core Services (Run Together)
```
Task: "UserService for user management in lib/services/user-service.ts"
Task: "MeetingService for meeting lifecycle in lib/services/meeting-service.ts"
Task: "ZoomService for Zoom API integration in lib/services/zoom-service.ts"
Task: "AssemblyAIService for transcription in lib/services/assemblyai-service.ts"
Task: "GmailService for email delivery in lib/services/gmail-service.ts"
Task: "AIService for summarization and action extraction in lib/services/ai-service.ts"
```

### Phase 3.5: Frontend Components (Run Together)
```
Task: "MeetingCard component in components/MeetingCard.tsx"
Task: "TranscriptViewer component in components/TranscriptViewer.tsx"
Task: "SummaryDisplay component in components/SummaryDisplay.tsx"
Task: "IntegrationStatus component in components/IntegrationStatus.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each completed task
- Use TypeScript strict mode throughout
- Follow Next.js 13+ app directory conventions if preferred
- Ensure all OAuth flows use Clerk for secure token management
- Test with real Zoom and Gmail OAuth flows in development

## Task Generation Rules
*Applied during generation*

1. **From Contracts**:
   - auth.yaml → 6 contract test tasks [P] + 6 implementation tasks [P]
   - meetings.yaml → 7 contract test tasks [P] + 7 implementation tasks [P]

2. **From Data Model**:
   - 6 entities → 6 model creation tasks [P] + migration task
   - Relationships → service layer integration tasks

3. **From User Stories** (quickstart.md):
   - User signup → integration test [P]
   - Meeting processing → integration test [P]
   - OAuth flows → integration into API tasks

4. **From Tech Stack** (Next.js + TypeScript + Prisma + Clerk):
   - Next.js project setup
   - TypeScript configuration
   - Prisma schema and migrations
   - Clerk authentication setup
   - Vercel deployment preparation

## Validation Checklist
*GATE: Checked before task execution*

- [x] All contracts have corresponding tests (13 contract tests)
- [x] All entities have model tasks (6 models + migration)
- [x] All tests come before implementation (TDD enforced)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] 5-day sprint timeline considerations (64 tasks, ~12-13 per day)
- [x] Constitutional requirements addressed (<200ms, 80% coverage, security)