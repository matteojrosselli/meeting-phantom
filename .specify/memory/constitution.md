<!--
SYNC IMPACT REPORT:
Version change: NEW → 1.0.0
Added sections: All sections (new constitution)
Modified principles: All principles (new constitution)
Templates requiring updates:
✅ .specify/templates/plan-template.md - references constitution checks
✅ .specify/templates/spec-template.md - compatible with principles
✅ .specify/templates/tasks-template.md - compatible with principles
Follow-up TODOs: None - all placeholders resolved
-->

# Meeting Phantom Constitution

## Core Principles

### I. Code Quality Standards
All code MUST adhere to consistent quality standards: Clean, readable, and maintainable code with proper documentation; Consistent formatting and naming conventions across all modules; Code reviews required for all changes with at least one approval; Static analysis tools MUST pass without warnings before merge.

**Rationale**: High code quality reduces bugs, improves maintainability, and enables faster development cycles.

### II. Testing Standards (NON-NEGOTIABLE)
Comprehensive testing MUST be implemented: Test-Driven Development (TDD) required - tests written before implementation; Minimum 80% code coverage for all production code; Unit, integration, and contract tests required for all features; All tests MUST pass before any merge to main branch.

**Rationale**: Robust testing prevents regressions, enables confident refactoring, and ensures system reliability.

### III. User Experience Consistency
User interfaces MUST provide consistent experiences: Standardized UI components and design patterns across all interfaces; Consistent error handling and user feedback mechanisms; Accessibility standards (WCAG 2.1 AA) MUST be met; Performance targets MUST be validated through user testing.

**Rationale**: Consistent UX reduces user confusion, improves adoption, and ensures inclusive access.

### IV. Performance Requirements
Performance standards MUST be met and monitored: Response times under 200ms for API endpoints (95th percentile); Frontend interactions under 100ms response time; Database queries optimized with proper indexing; Performance regression tests required for all releases.

**Rationale**: Performance directly impacts user satisfaction and system scalability.

### V. Security & Reliability
Security and reliability MUST be built-in from the start: All inputs MUST be validated and sanitized; Authentication and authorization implemented following industry standards; Error handling MUST prevent information leakage; Automated security scanning required in CI/CD pipeline.

**Rationale**: Security vulnerabilities and reliability issues can cause critical business impact and user trust loss.

## Quality Gates

All features MUST pass through standardized quality gates: Code review approval from at least one team member; All automated tests passing (unit, integration, contract); Security scan completion with no critical vulnerabilities; Performance benchmarks meeting defined thresholds; Documentation updated reflecting changes.

## Development Standards

Development workflow MUST follow established practices: Feature branches for all development work; Pull requests required for all changes to main branch; Continuous integration checks MUST pass before merge; Regular dependency updates and security patches; Standardized commit messages following conventional commits format.

## Governance

This constitution supersedes all other development practices and guidelines. All code changes MUST comply with these principles - violations require explicit justification and approval. Amendments to this constitution require team consensus and proper documentation of rationale. Regular constitution review sessions scheduled quarterly to ensure relevance and effectiveness.

All pull requests and code reviews MUST verify compliance with constitutional principles. Complexity that violates principles must be justified with clear business need and technical rationale. For runtime development guidance, refer to CLAUDE.md in the repository root.

**Version**: 1.0.0 | **Ratified**: 2025-09-23 | **Last Amended**: 2025-09-23