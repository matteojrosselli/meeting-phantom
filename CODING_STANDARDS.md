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

## Commit Hygiene
- Descriptive commit messages (explain what, not just “fix”)
- Commit every 30 minutes or after each working milestone

## Testing
- Write a test for every critical bug fixed
- Validate all new endpoints with curl or Postman before merging

## Miscellaneous
- Auto-format code using Prettier before commit
- Comment complex logic but avoid redundant comments

---

> **Last updated:** September 23, 2025
