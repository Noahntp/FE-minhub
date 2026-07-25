# API Integration

Version: 1.0

---

# Objective

Replace all remaining mock data with production Backend APIs and ensure every learner-facing feature is fully synchronized with the Backend contract.

The objective is to create a stable, maintainable, and production-ready integration without modifying Backend behavior.

All engineering standards defined in:

- README.md
- docs/ai/00-engineering-handbook.md

must be followed.

---

# Prerequisites

Before implementation:

- Synchronize repository
- Pull latest changes
- Review docs.md
- Review Backend API documentation
- Review OpenAPI / Swagger (if available)
- Review existing API services
- Review shared hooks
- Review existing types

Understand the API contract before making changes.

Never guess API behavior.

---

# Scope

This task applies only to learner-facing features.

Possible targets include:

- Homepage
- Explore Courses
- Course Detail
- Learning Workspace
- Search
- My Learning
- Wishlist
- Profile

Only integrate APIs that already exist.

---

# Out of Scope

Do NOT:

- Create Backend endpoints
- Modify Backend logic
- Change database schema
- Invent request payloads
- Invent response fields

---

# Repository Synchronization

Before implementation:

1. Fetch latest repository changes.
2. Pull latest source.
3. Verify current branch.
4. Create a dedicated feature branch if necessary.

Never integrate APIs on outdated code.

---

# API Discovery

For every screen:

Identify:

- Existing Service
- Existing Hook
- Existing Types
- Existing Components

Reuse before creating new code.

---

# Mock Removal

Identify:

- Static JSON
- Fake API
- Local Mock
- Placeholder Data
- Temporary Responses

Replace them with real Backend APIs.

After replacement:

Remove obsolete mock implementations if no longer used.

---

# API Integration Rules

Every integration must verify:

- Endpoint
- HTTP Method
- Headers
- Authentication
- Query Parameters
- Path Parameters
- Request Body
- Response Mapping

Never bypass the project's API architecture.

---

# UI States

Every API request must support:

- Idle
- Loading
- Success
- Empty
- Error

Avoid blank screens.

Prefer Skeleton Loading.

---

# Error Handling

Handle:

- Network Error
- Unauthorized
- Forbidden
- Not Found
- Validation Error
- Server Error

Display user-friendly messages.

Do not expose raw server responses.

---

# Authentication

Respect the existing authentication flow.

Do not:

- Hard-code tokens
- Store secrets insecurely
- Bypass authentication

---

# Type Safety

Use:

- Existing Interfaces
- Existing Types
- Existing DTOs

Do not introduce unnecessary `any`.

---

# Performance

Avoid:

- Duplicate requests
- Waterfall requests
- Unnecessary re-fetching

Reuse cache mechanisms if the project already includes them.

---

# Regression Verification

After integration verify:

- Existing features still work.
- Routing remains functional.
- Shared components remain reusable.
- No UI regressions introduced.

---

# Acceptance Criteria

The task is complete only if:

- Mock data removed
- Real APIs integrated
- API contracts respected
- Loading implemented
- Empty implemented
- Error implemented
- Responsive verified
- Build passes
- Type Check passes
- Lint passes

---

# Deliverables

Provide:

## APIs Integrated

## Mock Sources Removed

## Services Reused

## Hooks Reused

## Types Reused

## Components Modified

## Components Reused

## Error Handling Added

## Testing Performed

## Remaining Backend Dependencies

---

# Final Report

Summarize:

- APIs Connected
- Remaining Mock Data
- Backend Limitations
- Risks
- Recommendations
- Production Readiness
