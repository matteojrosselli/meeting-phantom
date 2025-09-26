# Coding Standards

## File & Project Organization
- Each major feature in its own folder (`/feature`)
- Database schema in `/prisma/schema.prisma`
- All Next.js API routes in `/pages/api`

## Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Files: kebab-case (use dashes, not underscores)
- Database tables: snake_case (if managed directly)

## TypeScript/JS
- Always use explicit types and interfaces
- Avoid using `any` unless unavoidable

## API Development
- All endpoints follow REST conventions
- Use OpenAPI contracts as the source of truth for request/response types
- Mock external APIs for development (Zoom, AssemblyAI, Gmail, OpenAI)
- Production-ready interfaces enable easy mock-to-real client swapping

## Service Layer Architecture (Phase 3.4 Established)
- Service factory pattern: `src/lib/services/index.ts` for dependency injection
- Mock implementations for external APIs with production-ready interfaces
- Real infrastructure: OAuth management, database pooling, authentication
- Integration layer: Services connected to API endpoints with proper middleware

## Mock API Strategy
- External APIs use mock implementations during development
- Real OAuth token management and storage (UserService)
- Production transition ready: Easy swap when credentials available
- Mock clients: Zoom, AssemblyAI, Gmail, OpenAI with realistic responses

## Technical Debt Management
- Document technical debt with specific categorization
- Defer non-critical refactoring to appropriate phases (Phase 3.6 Polish)
- Enum alignment issues: Document for later resolution
- Path alias warnings: Functional but needs cleanup
- Connection pooling: Advanced patterns deferred to polish phase

## Commit Hygiene
- Descriptive commit messages (explain what, not just “fix”)
- Commit every 30 minutes or after each working milestone

## Testing
- Write a test for every critical bug fixed
- Validate all new endpoints with curl or Postman before merging

## Miscellaneous
- Auto-format code using Prettier before commit
- Comment complex logic but avoid redundant comments

## Frontend Component Patterns (Phase 3.5 Established)
- Next.js pages directory structure with Clerk authentication
- TypeScript component interfaces with strict typing
- Tailwind CSS responsive design with consistent color schemes
- Reusable component architecture with error handling and loading states
- API integration patterns with proper error boundaries

---

> **Last updated:** September 26, 2025 - Phase 3.5 Frontend patterns established
