# Course Detail Feature

Version: 1.0

---

# Objective

Implement or complete the Course Detail feature using production-quality engineering practices.

The implementation must comply with all rules defined in:

- README.md
- docs/ai/00-engineering-handbook.md

---

# Prerequisites

Before implementation:

- Synchronize repository
- Review existing Course Detail implementation
- Identify reusable components
- Review API contracts
- Review routing

Do not begin implementation until the existing architecture is understood.

---

# Feature Scope

This task is limited to the Course Detail experience.

Allowed areas include:

- Course Hero
- Course Information
- Instructor Information
- Curriculum
- Lessons Preview
- Reviews
- Ratings
- Enrollment
- Sidebar
- Sticky Actions
- Related Courses
- Loading States
- Empty States
- Error States
- Responsive Layout

---

# Out of Scope

Do NOT modify:

- Authentication
- User Profile
- Dashboard
- Learning Workspace
- Checkout
- Payment
- Admin
- Instructor Features

Unless required to fix integration.

---

# Required Review

Before coding review:

- Existing components
- Shared UI
- Existing hooks
- Existing services
- Existing types

Reuse before creating new implementations.

---

# API Integration

Connect only through the existing API architecture.

Never:

- Hard-code course data
- Create fake API responses
- Duplicate service logic

Support:

- Loading
- Empty
- Error
- Success

for every request.

---

# UI Requirements

The page should include:

## Course Hero

Display:

- Thumbnail
- Title
- Subtitle
- Rating
- Enrollment count
- Instructor
- Last update
- Category

---

## Course Overview

Display:

- Description
- Learning outcomes
- Requirements
- Target audience

---

## Curriculum

Display:

- Sections
- Lessons
- Preview lessons
- Locked lessons

Support expand/collapse.

---

## Instructor

Display:

- Avatar
- Name
- Biography
- Statistics

---

## Reviews

Display:

- Average rating
- Distribution
- Individual reviews

Support pagination if available.

---

## Sidebar

Display:

- Price
- Enrollment button
- Course includes
- Duration
- Level
- Language
- Certificate

Sticky on desktop when appropriate.

---

## Related Courses

Display recommendations from API.

Reuse existing course card components.

---

# Responsive Requirements

Support:

- Mobile
- Tablet
- Desktop

Verify:

- Hero
- Sidebar
- Curriculum
- Reviews
- Instructor
- Related Courses

---

# Accessibility

Verify:

- Semantic headings
- Keyboard navigation
- Focus visibility
- Image alt text
- Button labels

---

# Performance

Avoid:

- Duplicate API calls
- Unnecessary rendering
- Oversized images

Use lazy loading where appropriate.

---

# Acceptance Criteria

The feature is complete only if:

- API integrated
- Responsive
- Accessible
- Loading state implemented
- Empty state implemented
- Error state implemented
- Shared components reused
- Build passes
- Type check passes
- Lint passes

---

# Deliverables

Provide:

## Files Modified

## Components Created

## Components Reused

## APIs Used

## Responsive Verification

## Accessibility Verification

## Testing Performed

## Known Limitations

---

# Final Report

Summarize:

- Scope completed
- Architecture impact
- Components created
- Components reused
- API integrations
- Risks
- Remaining work
- Production readiness
