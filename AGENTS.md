<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hammet Frontend — Agent Instructions

## 1. Purpose

You are working on the frontend of Hammet, an AI Career Platform with B2B and B2C products.

Your responsibility is to implement requested frontend changes while preserving existing architecture, behavior, design consistency, and product requirements.

The goal is not to rewrite the application into your preferred architecture. The goal is to make the requested change correctly, with the smallest reasonable implementation.

## 2. Core Working Rules

### Understand Before Changing

Before modifying code:

1. Inspect the relevant files and understand the existing implementation.
2. Read the surrounding components, hooks, utilities, and API integrations.
3. Check existing types, design tokens, and established patterns.
4. Identify potential effects on other components, routes, authentication, and state.
5. Determine whether the requested change requires an architectural decision.

Do not assume how the application works based on filenames alone.

### Minimal Changes

- Make only the changes necessary to satisfy the request.
- Do not refactor unrelated code.
- Do not restructure components or move logic without a clear requirement.
- Do not rename variables, functions, files, or components unnecessarily.
- Do not replace an existing implementation simply because you prefer another approach.
- Preserve existing behavior unless the request explicitly changes it.
- Do not introduce new dependencies when existing functionality is sufficient.

If a broader refactor appears necessary, explain why and request approval before proceeding.

### Scope Discipline

Instructions apply to the current task.

Do not interpret a narrowly scoped request as permission to improve adjacent features, fix unrelated issues, or redesign an entire page.

If you discover an unrelated bug, report it separately unless it presents an immediate security or data-integrity risk.

## 3. Technology and Existing Architecture

The frontend uses:

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- Progressive Web App architecture
- Dexie.js / IndexedDB for local persistence where applicable
- Service workers for offline capabilities where applicable

Inspect the existing project configuration before introducing or changing implementation patterns.

Use the project's installed versions, existing conventions, and established abstractions. Do not assume that a library, API, or feature is available without checking.

### Component Design

- Prefer small, focused components.
- Reuse existing components and utilities when appropriate.
- Use composition rather than creating unnecessarily large components.
- Keep business logic out of presentation components when the existing architecture separates these responsibilities.
- Avoid premature abstraction and generic component systems that solve no current requirement.
- Follow existing naming, file organization, and import conventions.

Do not create abstractions solely to make a small change appear more reusable.

## 4. UI/UX Principles

### Hick's Law

All frontend pages and interactive flows must follow Hick's Law.

Reduce unnecessary decision complexity by:

- Presenting the most relevant choices first.
- Grouping related options.
- Avoiding unnecessary simultaneous choices.
- Using progressive disclosure when appropriate.
- Providing clear primary actions.
- Removing redundant controls and competing calls to action.
- Keeping workflows focused on the user's immediate objective.

Do not interpret Hick's Law as a requirement to hide necessary functionality or add extra steps. Optimize the user's decision-making process, not merely the number of visible controls.

### Design Consistency

- Follow the existing design system and Tailwind conventions.
- Reuse established design tokens and components.
- Preserve visual hierarchy, spacing, typography, and interaction patterns.
- Avoid introducing arbitrary colors, spacing values, or new design conventions when existing tokens cover the requirement.
- Do not redesign unrelated parts of a page.

A requested functional change does not automatically authorize a visual redesign.

### Responsive Behavior and Accessibility

- Preserve responsive behavior across supported screen sizes.
- Use semantic HTML and accessible controls.
- Ensure interactive elements have meaningful labels.
- Preserve keyboard accessibility and visible focus states.
- Handle loading, empty, success, and error states where relevant.
- Do not sacrifice accessibility to simplify the interface.

## 5. B2B and B2C Boundaries

Hammet has separate B2B and B2C frontend experiences over a shared backend.

- B2B frontend: `schools.hammetedu.com`
- B2C frontend: `app.hammetedu.com`
- Shared API: `api.hammetedu.com`

Understand which product the requested change belongs to before editing code.

Do not accidentally introduce B2C behavior into B2B or vice versa.

Respect the established role, scope, and access model:

- `role` identifies the type of user.
- `scope` identifies the product or administrative domain.
- `access` identifies functional capabilities within that scope.

Use the existing authentication and authorization abstractions. Do not invent new role values, access values, or routing rules.

Frontend route protection and visibility restrictions improve the user experience but are not security boundaries. The backend remains authoritative.

## 6. API Integration and Data Handling

- Use the existing API client and request conventions.
- Respect established request and response schemas.
- Do not duplicate backend business rules in the frontend.
- Do not call Supabase or the database directly when the established architecture requires communication through the FastAPI backend.
- Handle API errors explicitly and consistently with existing patterns.
- Avoid unnecessary network requests.
- Do not silently change API contracts or assume response fields exist.
- Update frontend types when an approved API contract changes.

Do not fabricate successful responses, silently swallow errors, or present failed operations as successful.

## 7. Local-First and Offline Behavior

Offline support is an important part of Hammet's learning architecture, particularly for B2B school environments.

Where a feature uses local-first behavior:

- Inspect existing Dexie schemas and data-access utilities before changing them.
- Understand how local records are created, updated, and identified.
- Preserve established synchronization and deduplication behavior.
- Account for interrupted operations and connectivity loss.
- Do not assume that a successful local write means the backend has received the data.
- Avoid introducing duplicate records during retries or synchronization.
- Consider how existing locally persisted data is affected by schema changes.

Do not introduce a new synchronization mechanism without understanding the current design and obtaining approval for material architectural changes.

Do not implement deferred features merely because you discover they are missing. Follow the requested scope.

## 8. State and Side Effects

- Follow existing state-management conventions.
- Avoid duplicating sources of truth unnecessarily.
- Keep derived state derived when practical.
- Handle asynchronous operations and component lifecycle correctly.
- Prevent duplicate submissions and unintended repeated side effects where relevant.
- Clean up subscriptions, listeners, and resources according to existing patterns.

Do not introduce a new state-management library without approval.

## 9. Security

- Never place secrets or privileged credentials in frontend code.
- Treat browser storage and client-side state as accessible to the user.
- Do not assume that hidden UI elements protect their underlying data.
- Do not expose restricted course resources simply because a component needs course information.
- Fetch protected resources through the authorized backend flow.
- Do not store sensitive authentication data in an insecure location.
- Do not weaken authentication, authorization, or resource-access checks to make a feature work.

If a requested change would expose protected resources, stop and explain the risk before proceeding.

## 10. Dependencies and Configuration

Before adding a dependency, determine whether the existing stack already provides the required functionality.

Do not:

- Add a dependency for a trivial utility.
- Upgrade packages unrelated to the task.
- Replace established libraries without justification.
- Modify build tooling or configuration unnecessarily.
- commit environment files or credentials.

Dependency upgrades and changes to build infrastructure require approval unless explicitly requested.

## 11. Testing and Verification

Use the project's existing test framework and scripts.

After making a change:

1. Run relevant tests where available.
2. Run applicable type checks and linting.
3. Verify affected interactions and important edge cases.
4. Check that existing behavior has not been unintentionally changed.
5. Report any checks that could not be run.

Prioritize tests for authentication, access control, local persistence, synchronization, purchasing flows, and other high-risk functionality.

Do not claim that a test passed if it was not run.

Do not modify tests merely to make an incorrect implementation pass.

## 12. Changes Requiring Approval

Discuss the change before proceeding when it materially affects:

- Frontend architecture or application structure.
- Authentication or authorization.
- B2B/B2C boundaries or product routing.
- API contracts.
- Offline synchronization or local data models.
- Database-dependent frontend behavior.
- Payment or purchasing flows.
- Security-sensitive resource delivery.
- Major dependencies or build infrastructure.
- Shared components whose behavior affects multiple products.
- Existing architectural decisions.

Ordinary, localized UI changes and safe bug fixes can proceed without unnecessary approval.

If the task cannot be completed safely without making an unapproved architectural decision, stop and ask.

## 13. Completion Report

When the task is complete, report:

- What changed.
- Why the change was necessary.
- Which files or areas were affected.
- Tests and checks performed, including any failures.
- Known limitations or relevant follow-up work.

Keep the report factual and concise.

Do not claim to have implemented functionality that remains incomplete.

## 14. Non-Negotiable Rules

- Understand existing code before editing.
- Make the smallest reasonable change.
- Do not refactor unrelated code.
- Do not silently alter architecture.
- Do not introduce unnecessary dependencies.
- Do not bypass backend security.
- Preserve established offline behavior.
- Follow Hick's Law on frontend pages.
- Do not invent requirements.
- Ask before making consequential decisions outside the task's scope.

**Operating principle: Make the requested change, preserve the existing system, and avoid creating new problems while solving the current one.**
