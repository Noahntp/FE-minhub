# Engineering Handbook

**Version:** 1.0  
**Edition:** Production  
**Project:** MindHub Frontend  
**Audience:** AI Coding Agents (Antigravity, Cursor Agent, Claude Code, Codex CLI, Gemini CLI, OpenHands)

---

# PART 1 — Engineering Philosophy & Repository Workflow

---

# 1. Objective

## Purpose

This handbook defines the engineering standards, development workflow, quality requirements, and operating procedures that every AI Coding Agent must follow when contributing to the MindHub Frontend project.

The goal is **not** to maximize code generation.

The goal is to produce maintainable, predictable, production-ready software that integrates cleanly with the existing architecture.

Every engineering decision must prioritize **long-term maintainability** over short-term implementation speed.

---

# 2. Engineering Principles

Every implementation must follow these principles.

---

## 2.1 Understand Before Modify

Never edit code before understanding:

- Project architecture
- Folder structure
- Feature boundaries
- Existing components
- Routing
- State flow
- API contracts
- Business logic
- Shared utilities

Never guess.

Always verify.

---

## 2.2 Stability Over Speed

A slower but stable implementation is always preferred over a fast implementation that introduces regressions.

Never sacrifice stability to complete a task faster.

---

## 2.3 Minimal Changes

Modify only the code necessary to complete the assigned task.

Avoid:

- Unnecessary refactoring
- Unnecessary file movement
- Unnecessary architecture changes
- Unrelated modifications

---

## 2.4 Reuse Before Create

Before creating:

- Component
- Hook
- Utility
- Service
- Type
- Context
- Store

Search the repository first.

Reuse existing implementations whenever possible.

---

## 2.5 API First

Business data must come from Backend APIs.

Never:

- Hard-code production data
- Fake API responses
- Create temporary production logic

If an API is unavailable:

- Document the limitation.
- Add a clearly marked TODO.
- Continue only if it does not violate business requirements.

---

## 2.6 Design System First

All UI must follow the existing Design System.

Do not introduce a different visual language.

Respect:

- Colors
- Typography
- Spacing
- Border Radius
- Shadows
- Animations
- Components
- Icons

---

## 2.7 Production Mindset

Write every change as if it will be deployed to production today.

Every feature should be:

- Stable
- Readable
- Maintainable
- Testable
- Scalable

---

# 3. AI Agent Responsibilities

The AI Agent is expected to perform work equivalent to a **Senior Frontend Engineer**.

Responsibilities include:

- Understanding requirements
- Understanding architecture
- Planning implementation
- Writing maintainable code
- Reusing existing components
- Preventing regressions
- Performing self-review
- Testing changes
- Producing production-ready output

The AI Agent is **not** expected to invent product requirements.

---

# 4. Repository Workflow

Every task must follow this workflow.

```text
Receive Task
      │
      ▼
Understand Requirements
      │
      ▼
Synchronize Repository
      │
      ▼
Analyze Architecture
      │
      ▼
Review Existing Components
      │
      ▼
Create Feature Branch
      │
      ▼
Implementation
      │
      ▼
Self Review
      │
      ▼
Build
      │
      ▼
Lint
      │
      ▼
Type Check
      │
      ▼
Testing
      │
      ▼
Commit
      │
      ▼
Final Report
```

No step may be skipped.

---

# 5. Git Workflow

Git synchronization must always occur before implementation.

---

## Step 1 — Check Repository Status

Run:

```bash
git status
```

Expected result:

- Working tree clean
- No merge conflict
- No unfinished rebase
- No unexpected untracked files

If the working tree is not clean:

- Analyze the changes.
- Preserve user work.
- Commit or stash when appropriate.
- Never discard changes without explicit instruction.

---

## Step 2 — Synchronize Repository

Always fetch the latest remote state.

```bash
git fetch
```

Then update the local integration branch.

```bash
git pull
```

Never implement features on outdated code.

---

## Step 3 — Identify Integration Branch

Verify the primary development branch.

Common examples:

```text
develop
dev
main
master
```

Never assume.

Always verify before creating a feature branch.

---

## Step 4 — Create Feature Branch

Branch naming convention:

```text
feature/<feature-name>
```

Examples:

```text
feature/course-detail
feature/course-list
feature/classroom
feature/ui-polish
```

Never develop directly on:

- main
- master
- develop
- dev

---

## Step 5 — Checkout Feature Branch

Example:

```bash
git checkout feature/course-detail
```

Verify the current branch before implementation.

---

## Step 6 — Development

Implement only the assigned scope.

Avoid unrelated modifications.

Do not refactor unrelated files.

---

## Step 7 — Verification

Before committing, execute:

- Build
- Type Check
- Lint
- Automated Tests (if available)
- Manual Smoke Test
- Console Inspection

Implementation is not complete until all verification steps pass.

---

## Step 8 — Commit

Follow Conventional Commits.

Examples:

```text
feat(course-detail): implement production layout

feat(course-list): add filtering sidebar

fix(classroom): resolve lesson navigation

refactor(shared): simplify course card component
```

---

# 6. Git Rules

The AI Agent **MUST NOT** execute the following commands unless explicitly instructed:

```bash
git reset --hard

git clean -fd

git push --force

git push main

git push master

git rebase main
```

Never:

- Rewrite repository history.
- Delete branches.
- Delete commits.
- Force push shared branches.

---

# 7. Branch Strategy

Allowed prefixes:

```text
feature/
bugfix/
hotfix/
refactor/
docs/
chore/
```

Examples:

```text
feature/course-detail

feature/course-list

feature/classroom

bugfix/payment

refactor/course-card

docs/engineering-handbook
```

Avoid ambiguous names such as:

```text
new/

temp/

final/

last/

fix2/

testing/

abc/
```

---

# 8. Commit Standard

Each commit should represent **one logical change**.

### Good Examples

```text
feat(course-detail): implement enrollment badge

feat(course-list): add category filtering

fix(classroom): correct lesson progress

refactor(shared): extract reusable badge component
```

### Bad Examples

```text
update

fix

done

code

123

last

again
```

---

# 9. Commit Checklist

Before every commit, verify:

- [ ] Build completed successfully
- [ ] Type Check completed successfully
- [ ] Lint completed successfully
- [ ] No console errors
- [ ] No runtime errors
- [ ] No unused imports
- [ ] No unused variables
- [ ] No TODO left unintentionally
- [ ] No FIXME left unintentionally
- [ ] No debug code
- [ ] No commented legacy code

---

# 10. Engineering Decision Tree

Before every implementation ask:

---

## Requirement

```text
Do I understand the requirement?

        │

 YES    │ NO

        │

Continue     Analyze First
```

---

## Component

```text
Does this component already exist?

        │

 YES    │ NO

        │

Reuse      Create New
```

---

## Feature Impact

```text
Will this modification affect another feature?

        │

 YES    │ NO

        │

Regression Test     Continue
```

---

## API

```text
Does Backend already provide this data?

        │

 YES    │ NO

        │

Connect API     Create TODO
```

---

# 11. Anti-Patterns

Never:

- Refactor unrelated files.
- Rename the project structure.
- Change architecture without explicit requirement.
- Introduce mock data into production code.
- Replace API calls with hard-coded objects.
- Ignore build errors.
- Ignore lint warnings.
- Ignore type errors.
- Ignore accessibility requirements.
- Skip responsive testing.

---

# 12. Expected Output

Before implementation begins, the AI Agent should be able to answer the following questions:

- What architecture does this project use?
- Which feature am I modifying?
- Which files belong to this feature?
- Which shared components can be reused?
- Which API endpoints are involved?
- Which parts of the application could be affected?
- Which tests must be executed before committing?

If any answer is unknown, implementation **must not begin**.

---

# End of Part 1

The AI Agent is now prepared to:

- Understand repository structure
- Synchronize source code
- Follow engineering workflow
- Apply Git best practices
- Begin implementation according to production engineering standards

The next sections of this handbook will define:

- Architecture Standards
- Repository Scan Standards
- Feature Boundaries
- Component Boundaries
- Coding Standards
- API Integration
- Performance
- Accessibility
- Security
- Testing
- Code Review
- Production Readiness
- AI Agent Operating Procedures



# PART 2 — Architecture Review & Scope Control

---

# 13. Architecture First

## Objective

Before implementing any feature, the AI Agent must fully understand the project's architecture.

Implementation without architectural understanding is prohibited.

The objective is to:

- Prevent regression
- Prevent duplicate implementations
- Preserve maintainability
- Preserve scalability
- Preserve existing architecture

Never modify code before understanding where the code belongs.

---

# 14. Repository Scan Standard

Every implementation begins with a repository scan.

The AI Agent must identify:

## Project Structure

- Root directories
- Feature modules
- Shared modules
- Assets
- Layout
- Configuration
- Build system

---

## Frontend Architecture

Identify:

- Router
- Layout System
- Shared Components
- Feature Components
- Hooks
- Context
- Stores
- Services
- Utilities
- Types

---

## API Layer

Identify:

- API Client
- Request Layer
- Response Mapping
- Authentication
- Error Handling

---

## State Management

Determine:

- Global State
- Local State
- Derived State
- Cached State

Never duplicate state.

---

## Styling System

Determine:

- CSS Framework
- Component Library
- Design Tokens
- Theme
- Typography
- Spacing

Never bypass the Design System.

---

## Output Requirement

Before implementation the AI Agent must understand:

- How the application is structured.
- How features communicate.
- How data flows.
- Which modules can be reused.

---

# 15. Architecture Review Checklist

The AI Agent must be able to answer:

## Feature Layer

- Where does this feature live?
- Which folder owns this feature?
- What files belong to this feature?

---

## Shared Layer

- Which components are reusable?
- Which hooks already exist?
- Which utilities already exist?

---

## Routing

- Which route owns this page?
- Which layouts are used?
- Which guards exist?

---

## Data Flow

- Where does data originate?
- How does it reach the UI?
- Where is state updated?

---

## API

- Which endpoint provides this data?
- Is authentication required?
- Is pagination required?

---

## Business Logic

- Which rules belong to Backend?
- Which rules belong to Frontend?

Never move business logic without justification.

---

# 16. Feature Boundary

A feature owns only its own implementation.

Example:

Task:

Course Detail

Allowed modifications:

```text
src/features/course-detail

src/features/course/components

src/features/course/hooks

src/features/course/services
```

Not allowed:

```text
Auth

Checkout

Profile

Cart

Dashboard

Admin

Learning
```

unless directly required.

---

## Boundary Principle

Every task has a boundary.

The AI Agent must never expand the scope without necessity.

---

## Allowed Cross-Feature Changes

Cross-feature changes are allowed only if:

- Required for bug fixing
- Required for shared component reuse
- Required for API integration
- Required for routing

Otherwise:

Do not modify.

---

# 17. Component Boundary

Before creating a new component:

Search for existing components.

Priority:

```text
Shared Component

↓

Feature Component

↓

Local Component

↓

Create New
```

---

## Never Duplicate Components

Wrong:

```text
CourseCard

CourseItem

CoursePreview

LearningCard
```

when all perform the same responsibility.

Prefer:

```text
CourseCard
```

configured through props.

---

## Component Responsibility

Every component should have a single responsibility.

Avoid:

- Giant Components
- Mixed Responsibilities
- Business Logic inside Presentation Components

---

# 18. Dependency Rules

Before importing anything:

Determine:

- Does it already exist?
- Is it reusable?
- Is this dependency necessary?

---

## Never Add Dependencies Without Justification

Do not install:

```bash
npm install

pnpm add

yarn add
```

unless:

- Existing project cannot solve the problem.
- The dependency is actively maintained.
- The dependency aligns with project architecture.

---

# 19. Shared Component Rules

Shared Components belong to the entire application.

Examples:

- Button
- Badge
- Modal
- Card
- Input
- Avatar
- Skeleton
- Spinner

Shared Components must remain generic.

Never embed feature-specific business logic.

---

## Feature Components

Feature Components belong only to one feature.

Example:

EnrollmentBadge

CourseProgress

LessonSidebar

These should not be moved into Shared unless reused by multiple features.

---

# 20. Scope Control

The assigned task defines the maximum implementation scope.

Example:

Task:

Improve Course Detail UI.

Allowed:

- Layout
- Components
- Styling
- Responsive
- API integration

Not Allowed:

- Rewrite Router
- Replace State Management
- Redesign Authentication
- Refactor unrelated modules

---

# 21. Change Impact Analysis

Before editing any file ask:

```text
Will this change affect:

Navbar?

Footer?

Router?

Shared Components?

API Layer?

State Management?

Authentication?

Other Features?
```

If YES:

Perform regression testing.

If NO:

Continue.

---

# 22. Regression Prevention

Regression prevention is mandatory.

Every implementation must preserve:

- Existing Features
- Existing API Contracts
- Existing Routes
- Existing UI Behavior

---

## Before Saving

Verify:

- No unrelated files modified.
- No accidental formatting changes.
- No removed imports.
- No broken exports.

---

## Before Commit

Verify:

- Previous features still work.
- Shared Components still render correctly.
- Routing still functions.
- Authentication still works.
- API requests still succeed.

---

# 23. Decision Trees

## Repository Scan

```text
Project Understood?

      │

YES   │ NO

      │

Continue

      │

Analyze More
```

---

## Component

```text
Existing Component?

      │

YES   │ NO

      │

Reuse

      │

Create New
```

---

## Feature Boundary

```text
Does this file belong to the assigned feature?

      │

YES   │ NO

      │

Modify

      │

Do Not Touch
```

---

## Dependency

```text
Need New Package?

      │

YES   │ NO

      │

Justify

      │

Use Existing Tools
```

---

# 24. Anti-Patterns

Never:

- Duplicate components.
- Duplicate hooks.
- Duplicate utilities.
- Move components between layers unnecessarily.
- Install packages without justification.
- Modify unrelated features.
- Expand scope.
- Rewrite architecture.
- Ignore feature boundaries.

---

# 25. Architecture Completion Checklist

Before implementation begins:

- [ ] Repository structure understood.
- [ ] Feature identified.
- [ ] Shared Components reviewed.
- [ ] Existing hooks reviewed.
- [ ] Existing services reviewed.
- [ ] Existing utilities reviewed.
- [ ] API identified.
- [ ] Routing identified.
- [ ] State flow understood.
- [ ] Feature boundary defined.
- [ ] Scope confirmed.
- [ ] Regression risk evaluated.

---

# End of Part 2

The AI Agent now understands:

- Repository Architecture
- Feature Ownership
- Component Ownership
- Dependency Management
- Scope Control
- Regression Prevention

Implementation should begin only after all architectural checks have been completed successfully.


# PART 3 — Coding Standards & Implementation Rules

---

# 26. Implementation Philosophy

## Objective

Every implementation must prioritize:

- Readability
- Maintainability
- Scalability
- Predictability
- Reusability

The AI Agent should write code that another engineer can understand without additional explanation.

The goal is not to produce the shortest code.

The goal is to produce the clearest code.

---

# 27. React Standards

React components should remain:

- Small
- Focused
- Reusable
- Predictable

Each component should have one responsibility.

---

## Component Size

Recommended:

- 50–150 lines

Acceptable:

- Up to 250 lines

Beyond 300 lines:

Split into smaller components.

---

## Component Responsibility

Each component should do one thing well.

Bad:

```tsx
CourseDetail.tsx

- Fetch API
- Handle Authentication
- Manage Enrollment
- Render Layout
- Render Reviews
- Render Sidebar
- Manage Video
```

Good:

```text
CourseDetailPage

├── CourseHero

├── CourseOverview

├── CourseCurriculum

├── CourseReview

├── CourseSidebar
```

---

## Component Composition

Prefer composition over inheritance.

Example:

```tsx
<Card>

<Card.Header />

<Card.Body />

<Card.Footer />

</Card>
```

Avoid deeply nested JSX.

---

# 28. Props Rules

Props should be:

- Explicit
- Typed
- Minimal

Avoid passing unnecessary props.

---

Bad

```tsx
<Component

user={user}

course={course}

profile={profile}

config={config}

theme={theme}

settings={settings}

/>
```

Good

```tsx
<CourseCard

title

thumbnail

price

rating

/>
```

---

Never pass data that the component does not use.

---

# 29. TypeScript Standards

Type safety is mandatory.

---

Never use:

```ts
any
```

unless there is a documented reason.

Prefer:

```ts
interface

type

generic

union

enum (when appropriate)
```

---

## Type Naming

Examples

```ts
Course

CourseResponse

CourseReview

Enrollment

Lesson

LessonProgress
```

Avoid:

```ts
Data

Item

Info

Object

Something
```

---

## Type Assertions

Avoid:

```ts
as any
```

Avoid:

```ts
as unknown as
```

unless absolutely necessary.

---

# 30. State Management Rules

State should exist in exactly one place.

Avoid duplicated state.

---

Priority

```text
Server State

↓

Global State

↓

Local State

↓

Derived State
```

---

Never duplicate:

```tsx
course.name

courseTitle

selectedCourseName
```

Store once.

Derive when necessary.

---

# 31. Hooks Rules

Hooks should encapsulate logic.

Components should focus on rendering.

---

Good

```text
useCourse()

↓

API

↓

Cache

↓

Loading

↓

Error

↓

Return Data
```

Component

↓

Render UI

---

Avoid:

```tsx
Huge useEffect

↓

API

↓

Mapping

↓

Sorting

↓

Filtering

↓

Pagination

↓

Business Logic
```

inside components.

---

## Custom Hooks

Create custom hooks when logic is reused.

Examples

```text
useCourse()

useEnrollment()

useProgress()

useReview()
```

---

# 32. API Integration Rules

Frontend must follow Backend contracts.

Never invent API fields.

Never rename API fields locally without mapping.

---

Preferred Flow

```text
Backend API

↓

API Client

↓

Service

↓

Hook

↓

Component
```

---

Never call fetch() directly inside UI components unless project architecture explicitly allows it.

---

Handle:

- Loading
- Empty
- Error
- Success

for every API request.

---

# 33. Error Handling

Every async operation should handle:

- Loading
- Success
- Error
- Retry (if appropriate)

---

Never:

```tsx
try {

// ...

} catch {}
```

Empty catch blocks are prohibited.

---

Show meaningful UI states.

Not only console logs.

---

# 34. Naming Convention

Names should describe responsibility.

Good

```text
CourseCard

CourseHero

LessonSidebar

EnrollmentButton

ReviewSection
```

Bad

```text
Card2

Component1

Thing

DataBox

Widget
```

---

Variables

Good

```ts
course

selectedLesson

reviewCount

isEnrolled
```

Bad

```ts
a

b

data

obj

item
```

---

# 35. Styling Standards

Respect the Design System.

Never introduce inconsistent styling.

---

Avoid

```css
padding:13px;

margin:17px;

border-radius:9px;
```

Magic numbers.

---

Use:

- Design Tokens
- Theme Variables
- Utility Classes
- Shared Styles

---

Never hard-code:

- Colors
- Fonts
- Shadows
- Radius

when design tokens exist.

---

# 36. File Organization

One responsibility per file.

Example

```text
CourseDetail/

CourseDetailPage.tsx

CourseHero.tsx

CourseOverview.tsx

CourseSidebar.tsx

CourseReview.tsx

hooks/

services/

types/

utils/
```

Avoid giant files.

---

# 37. Performance Rules

Avoid unnecessary renders.

Prefer:

```tsx
memo()

useMemo()

useCallback()
```

only when profiling or architecture indicates a measurable benefit.

Do not over-optimize prematurely.

---

Prefer:

- Lazy Loading
- Code Splitting
- Image Optimization
- Virtualization (large lists)

---

# 38. Accessibility Standards

Every UI must support:

- Keyboard Navigation
- Focus Indicators
- Semantic HTML
- Screen Readers

Images must include:

```tsx
alt=""
```

Interactive elements must be reachable by keyboard.

---

# 39. Logging Rules

Allowed

```ts
console.error()
```

during debugging.

Before commit:

Remove:

```ts
console.log()

console.table()

console.debug()
```

Production code should not contain debug logging.

---

# 40. Documentation Rules

Complex logic should include concise comments explaining *why*, not *what*.

Good

```ts
// Preserve optimistic UI while awaiting server confirmation.
```

Avoid comments that restate obvious code.

---

# 41. Decision Trees

## Component

```text
Need a new component?

       │

YES    │ NO

       │

Search Existing

       │

Found?

       │

YES    │ NO

       │

Reuse     Create
```

---

## Hook

```text
Logic reused?

      │

YES   │ NO

      │

Extract Hook

      │

Keep Local
```

---

## API

```text
API Exists?

      │

YES   │ NO

      │

Use Service

      │

Create TODO
```

---

## State

```text
Need State?

       │

YES    │ NO

       │

Local?

↓

Shared?

↓

Server?

↓

Choose Smallest Scope
```

---

# 42. Anti-Patterns

Never:

- Use `any` without justification.
- Create giant components.
- Duplicate business logic.
- Fetch directly inside presentation components.
- Duplicate state.
- Ignore loading states.
- Ignore error states.
- Ignore empty states.
- Hard-code production data.
- Leave debug logs.
- Introduce magic numbers.
- Create meaningless names.

---

# 43. Implementation Checklist

Before considering a feature complete:

- [ ] Components have a single responsibility.
- [ ] Existing components reused where possible.
- [ ] Types are strongly defined.
- [ ] No unnecessary `any`.
- [ ] API follows Backend contracts.
- [ ] Loading state implemented.
- [ ] Error state implemented.
- [ ] Empty state implemented.
- [ ] Responsive layout verified.
- [ ] Accessibility verified.
- [ ] No debug logs.
- [ ] No unused imports.
- [ ] No dead code.

---

# End of Part 3

The AI Agent now understands:

- React Engineering Standards
- TypeScript Standards
- API Integration Standards
- State Management Principles
- Component Design
- Performance Expectations
- Accessibility Requirements
- Production Coding Practices

All implementation must comply with these standards before proceeding to testing and review.


# PART 4 — UI Engineering Standards

---

# 44. UI Philosophy

## Objective

The objective of every user interface is not merely to display information.

A production-quality interface must be:

- Consistent
- Predictable
- Accessible
- Responsive
- Fast
- Delightful

The user should never need to guess how the interface behaves.

Every interaction should feel intentional.

---

# 45. Design System First

The Design System is the single source of truth.

Before introducing any UI element, verify whether an equivalent component already exists.

Priority:

```text
Design System

↓

Shared Component

↓

Feature Component

↓

New Component
```

Never duplicate visual components.

---

## Never Create Multiple Variants

Wrong

```
Blue Button

Primary Button

Action Button

Main Button
```

Good

```
<Button variant="primary" />

<Button variant="secondary" />

<Button variant="danger" />
```

---

# 46. Layout Standards

Layouts should be predictable.

Prefer:

```
Page

↓

Container

↓

Section

↓

Grid / Flex

↓

Card

↓

Content
```

Avoid deeply nested wrappers.

Maximum recommended nesting:

```
5 Levels
```

---

# 47. Responsive Design

Every page must support:

- Mobile
- Tablet
- Desktop

Recommended breakpoints:

```
Mobile

↓

Tablet

↓

Laptop

↓

Desktop
```

Never design only for Desktop.

---

## Responsive Checklist

Every page should verify:

- Navigation
- Sidebar
- Cards
- Tables
- Images
- Forms
- Dialogs
- Buttons

---

# 48. Spacing Standards

Spacing should follow a consistent scale.

Example

```
4

8

12

16

24

32

40

48

64
```

Avoid arbitrary values.

Wrong

```
padding:13px

margin:19px
```

---

# 49. Typography

Typography should be hierarchical.

Example

```
Heading

↓

Subheading

↓

Body

↓

Caption

↓

Label
```

Never use random font sizes.

---

# 50. Color Standards

Never hard-code colors.

Wrong

```css
color:#3182ce;
```

Correct

```css
color:var(--primary);
```

Use Design Tokens whenever available.

---

# 51. Icons

Icons should communicate meaning.

Avoid decorative icons without purpose.

Icons must remain visually consistent throughout the application.

---

# 52. Images

Images should:

- Lazy Load
- Preserve Aspect Ratio
- Include alt text
- Avoid Layout Shift

Large images should be optimized.

---

# 53. Forms

Every form must provide:

- Labels
- Validation
- Error Messages
- Success Feedback
- Loading State

Never rely solely on placeholders.

---

# 54. Buttons

Buttons should clearly indicate:

- Primary Action
- Secondary Action
- Disabled State
- Loading State

Never allow duplicate submissions.

Example

```
Submit

↓

Loading...

↓

Completed
```

---

# 55. Empty States

Every feature should gracefully handle empty data.

Example

```
No Courses Found

↓

Explanation

↓

Call To Action
```

Never display blank pages.

---

# 56. Loading States

Loading should never block the entire application unless absolutely necessary.

Preferred order:

```
Skeleton

↓

Content
```

Avoid infinite spinners.

---

# 57. Skeleton Loading

Skeletons should approximate the final layout.

Never display unrelated placeholders.

Good Skeleton:

```
Course Card Skeleton

↓

Course Card
```

Bad Skeleton:

```
Random Gray Boxes
```

---

# 58. Error States

Every request should have a recoverable error state.

Display:

- Friendly Message
- Retry Button
- Recovery Guidance

Avoid exposing raw server errors.

---

# 59. Animations

Animations should improve usability.

Never animate for decoration alone.

Recommended duration:

```
150ms

↓

300ms
```

Avoid long transitions.

---

# 60. Micro-interactions

Micro-interactions improve user confidence.

Examples:

- Hover
- Active
- Focus
- Success
- Error
- Progress

Every interaction should provide visual feedback.

---

# 61. Accessibility

Every page should support:

- Keyboard Navigation
- Visible Focus
- Semantic HTML
- Screen Readers

Never remove focus outlines without replacement.

---

# 62. Motion Accessibility

Respect users who prefer reduced motion.

Animations should degrade gracefully.

---

# 63. Dark Mode Compatibility

Avoid colors that only work in light mode.

Components should adapt naturally to theming.

---

# 64. Performance Budget

UI should render efficiently.

Avoid:

- Heavy Shadows
- Large DOM Trees
- Unnecessary Animations
- Large Images

---

# 65. UI Consistency Checklist

Before completing a feature:

- [ ] Uses Design System
- [ ] Responsive
- [ ] Accessible
- [ ] Loading State
- [ ] Empty State
- [ ] Error State
- [ ] Success Feedback
- [ ] Keyboard Friendly
- [ ] Theme Compatible
- [ ] Consistent Spacing
- [ ] Consistent Typography

---

# 66. UI Decision Trees

## New UI

```text
Existing Component?

      │

YES   │ NO

      │

Reuse

      │

Create New
```

---

## Loading

```text
API Request?

      │

YES

↓

Skeleton

↓

Content
```

---

## Empty Data

```text
No Data?

      │

YES

↓

Empty State

↓

CTA
```

---

## Error

```text
Failed?

      │

YES

↓

Friendly Message

↓

Retry
```

---

# 67. Anti-Patterns

Never:

- Hard-code colors.
- Hard-code spacing.
- Ignore mobile layouts.
- Ignore tablet layouts.
- Remove loading states.
- Remove empty states.
- Remove error states.
- Hide accessibility issues.
- Animate excessively.
- Create inconsistent UI.

---

# 68. Definition of Done (UI)

A UI feature is complete only if:

- Responsive
- Accessible
- Consistent
- Uses Design System
- Includes Loading State
- Includes Empty State
- Includes Error State
- Includes Success Feedback
- Supports Keyboard Navigation
- Passes Visual Review

---

# End of Part 4

The AI Agent now understands how to build production-quality user interfaces that are consistent, accessible, responsive, performant, and aligned with the project's Design System.


# PART 5 — Production Readiness & Engineering Review

---

# 69. Production Mindset

## Objective

Implementation is **not finished** when the code compiles.

Implementation is complete only when the feature is production-ready.

Production-ready means:

- Stable
- Tested
- Reviewed
- Maintainable
- Consistent
- Accessible
- Performant

Every implementation should be treated as deployable.

---

# 70. Testing Standards

Every feature must pass all applicable verification before completion.

Minimum verification includes:

- Build
- Type Check
- Lint
- Runtime
- UI Validation
- API Validation
- Responsive Validation

Never skip verification.

---

## Build Verification

The project must build successfully.

Build failures are blocking issues.

Never commit code that cannot build.

---

## Type Checking

Zero TypeScript errors.

Do not suppress type errors simply to complete the task.

---

## Lint

Lint warnings should be treated as potential issues.

Resolve them whenever possible.

---

## Runtime Validation

Verify:

- No crashes
- No blank screens
- No infinite loading
- No infinite re-render
- No console errors

---

# 71. API Validation

Every API integration must verify:

- Correct Endpoint
- Correct HTTP Method
- Correct Request Body
- Correct Query Parameters
- Correct Headers
- Correct Authentication
- Correct Error Handling

Never assume Backend responses.

---

## API States

Every request should handle:

- Idle
- Loading
- Success
- Empty
- Error

---

# 72. Regression Testing

Before completion verify:

Navigation

Authentication

Existing Features

Shared Components

Routing

Global State

Theme

Responsive Layout

No previous functionality should be broken.

---

# 73. Performance Review

Review:

- Render frequency
- Bundle size impact
- Large images
- Lazy loading
- Memoization opportunities
- Network requests

Avoid unnecessary optimization.

Optimize measurable bottlenecks.

---

# 74. Security Checklist

Verify:

- No secrets committed
- No API keys exposed
- No hard-coded tokens
- No sensitive information in logs
- Proper authentication flow
- Proper authorization checks

Never expose internal server messages to users.

---

# 75. Accessibility Checklist

Confirm:

- Keyboard navigation
- Visible focus
- Semantic HTML
- Form labels
- Image alt text
- Dialog accessibility
- Screen reader compatibility

Accessibility is required.

Not optional.

---

# 76. Code Review Checklist

Before considering implementation complete ask:

## Readability

Can another engineer understand this code quickly?

---

## Maintainability

Can this feature be modified safely in the future?

---

## Reusability

Can duplicated logic be extracted?

---

## Simplicity

Can complexity be reduced?

---

## Consistency

Does this implementation match the rest of the project?

---

## Performance

Is unnecessary rendering avoided?

---

## Accessibility

Does the feature remain accessible?

---

## API Contract

Does the implementation follow Backend contracts exactly?

---

# 77. Mentor Review Checklist

Review the implementation from the perspective of a technical reviewer.

Ask:

- Is the feature complete?
- Is the code clean?
- Is the UI consistent?
- Is the implementation responsive?
- Is accessibility considered?
- Is there unnecessary complexity?
- Is there duplicate code?
- Are loading states implemented?
- Are empty states implemented?
- Are error states implemented?
- Is production data used?
- Are mock values removed?
- Is every TODO intentional?

If any answer is "No", improve the implementation before completion.

---

# 78. Pull Request Standards

Before opening a Pull Request ensure:

- Feature scope is complete
- No unrelated changes
- Branch is synchronized
- Build passes
- Lint passes
- Type Check passes
- Tests pass (if available)
- No merge conflicts
- Commit history is clean

---

## Pull Request Description

Include:

- Objective
- Scope
- Screens modified
- API endpoints used
- Testing performed
- Known limitations
- Screenshots (if applicable)

---

# 79. Final Validation Checklist

Before marking a task as completed verify:

## Repository

- [ ] Latest code synchronized
- [ ] Correct feature branch

---

## Code Quality

- [ ] Readable
- [ ] Reusable
- [ ] Maintainable

---

## React

- [ ] Components have single responsibility
- [ ] No duplicated logic
- [ ] Existing components reused

---

## TypeScript

- [ ] Strong typing
- [ ] No unnecessary any

---

## API

- [ ] Correct endpoints
- [ ] Correct error handling
- [ ] Correct loading states

---

## UI

- [ ] Responsive
- [ ] Accessible
- [ ] Design System compliant

---

## Performance

- [ ] No unnecessary rendering
- [ ] No large unused assets

---

## Production

- [ ] Build successful
- [ ] Type Check successful
- [ ] Lint successful
- [ ] Runtime verified

---

# 80. Definition of Done

A task is complete only if:

- Requirements satisfied
- Scope respected
- Architecture preserved
- Existing components reused
- Backend contract respected
- UI finalized
- Responsive verified
- Accessibility verified
- Performance acceptable
- Build passes
- Type Check passes
- Lint passes
- Runtime verified
- Regression testing completed
- Ready for Code Review
- Ready for Merge

If any requirement is incomplete,

the task is **NOT DONE**.

---

# 81. AI Agent Behavior

The AI Agent must behave as a professional software engineer.

Always:

- Analyze before implementing
- Respect project architecture
- Respect feature boundaries
- Preserve maintainability
- Prevent regressions
- Prefer existing solutions
- Follow project conventions
- Produce production-ready code

Never:

- Guess requirements
- Invent APIs
- Ignore architecture
- Modify unrelated features
- Refactor outside scope
- Install dependencies without justification
- Leave debug code
- Ignore warnings
- Ignore failed validation
- Declare success without verification

---

# 82. Final Report Template

At the end of every task, provide a concise engineering report.

Template:

```text
Task Summary

Completed Scope

Files Modified

Architecture Impact

API Changes

Shared Components Used

Testing Performed

Known Limitations

Potential Risks

Recommendations

Production Readiness
```

---

# 83. Engineering Decision Tree

Before finishing any task ask:

```text
Requirements Complete?

        │

 YES    │ NO

        │

Continue     Finish Missing Work
```

---

```text
Build Successful?

        │

 YES    │ NO

        │

Continue     Fix Build
```

---

```text
Type Check Passed?

        │

 YES    │ NO

        │

Continue     Fix Types
```

---

```text
Regression Found?

        │

 YES    │ NO

        │

Fix Issue     Continue
```

---

```text
Production Ready?

        │

 YES    │ NO

        │

Create PR     Improve Quality
```

---

# 84. Engineering Oath

Every implementation should satisfy the following principles:

- Understand before modifying.
- Reuse before creating.
- Simplicity over complexity.
- Stability over speed.
- Quality over quantity.
- Production over prototype.
- Maintainability over shortcuts.
- Consistency over personal preference.

These principles define the engineering culture of this project.

---

# End of Engineering Handbook

This handbook defines the minimum engineering standards for every AI Coding Agent contributing to the MindHub Frontend project.

Any implementation that does not comply with these standards should be considered incomplete.

The following prompt files (01–10) are task-specific extensions of this handbook and inherit all rules defined herein.
