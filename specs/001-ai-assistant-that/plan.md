
# Implementation Plan: AI Meeting Assistant

**Branch**: `001-ai-assistant-that` | **Date**: 2025-09-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-assistant-that/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
AI assistant that automatically joins Zoom meetings, transcribes conversations in real-time, extracts action items, and sends email summaries to all participants. Users sign up, connect Zoom and Gmail accounts, and the system handles everything automatically with privacy controls and consent mechanisms.

## Technical Context
**Language/Version**: TypeScript/JavaScript (Node.js 18+)
**Primary Dependencies**: Next.js, Clerk Auth, Supabase, Prisma ORM, Zoom API, AssemblyAI, Gmail API
**Storage**: Supabase (PostgreSQL-based) with Prisma ORM for type-safe database access
**Testing**: Jest/Vitest (unit), Playwright (integration), API contract testing
**Target Platform**: Vercel (serverless deployment)
**Project Type**: web (Next.js fullstack with API routes + React frontend)
**Performance Goals**: Real-time transcription, <200ms API responses, simple MVP architecture
**Constraints**: <200ms p95 API response, 30-day data retention, English-only processing, 3-week MVP timeline, solo developer, bootstrap budget
**Scale/Scope**: MVP for single users (10-50 users), ~20-30 meetings/day peak, free tier optimized

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Requirements Evaluation**:
- ✅ **Code Quality Standards**: Plan includes static analysis, code reviews, documentation
- ✅ **Testing Standards (NON-NEGOTIABLE)**: TDD approach, 80% coverage, unit/integration/contract tests
- ✅ **User Experience Consistency**: Standardized API patterns, consistent error handling
- ✅ **Performance Requirements**: <200ms API response targets, performance regression tests
- ✅ **Security & Reliability**: Input validation, OAuth authentication, error handling without leakage

**Violations**: None - Plan aligns with all constitutional principles
**Justifications**: N/A - No violations to justify

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - Backend API for meeting processing + minimal frontend dashboard for user management

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Database setup → Prisma schema implementation [P]
- API contract → Next.js API route implementation [P]
- Authentication → Clerk integration [P]
- OAuth flows → Zoom/Gmail integration
- Meeting processing → AssemblyAI integration
- UI components → React dashboard components [P]
- Integration tests for each user story

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: Database → Auth → APIs → UI → Integration
- Mark [P] for parallel execution (independent files/features)
- Optimize for solo developer workflow

**Tech Stack Considerations**:
- Next.js API routes for backend functionality
- Prisma migrations for database schema
- Clerk webhooks for user lifecycle
- Vercel deployment optimizations

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md optimized for 3-week MVP timeline

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (None - no violations)

**Artifacts Generated**:
- [x] research.md - Technology decisions and architecture patterns
- [x] data-model.md - Database schema and entity relationships
- [x] contracts/auth.yaml - Authentication API specification
- [x] contracts/meetings.yaml - Meeting management API specification
- [x] quickstart.md - End-to-end testing guide
- [x] CLAUDE.md updated - Agent context with tech stack

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
