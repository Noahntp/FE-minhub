# Project Audit

Version: 1.0

---

# Objective

Your objective is to perform a complete engineering audit of the MindHub Frontend project before implementing any new feature.

Do NOT begin coding immediately.

The first responsibility is understanding the project.

This audit establishes the technical context required for all future implementation tasks.

---

# Prerequisites

Before performing this task, you MUST read:

- README.md
- docs/ai/00-engineering-handbook.md

All engineering rules defined in the handbook apply to this task.

---

# Inputs

Review every available project resource, including but not limited to:

- README
- docs/
- package.json
- tsconfig
- vite.config
- eslint
- router
- feature modules
- shared modules
- API layer
- environment configuration

If additional documentation exists, include it in the audit.

---

# Repository Synchronization

Before analysis:

1. Check repository status.
2. Fetch latest changes.
3. Pull latest code.
4. Verify current branch.
5. Create a new feature branch only if implementation is required.

Never audit an outdated repository.

---

# Objectives

Understand:

- Project Architecture
- Folder Structure
- Feature Modules
- Shared Components
- API Layer
- State Management
- Routing
- Authentication
- UI System
- Existing Technical Debt

---

# Required Analysis

## Architecture

Identify:

- Project architecture pattern
- Feature organization
- Shared modules
- Design system
- Dependency structure

---

## Folder Structure

Explain:

- Purpose of each major directory
- Feature ownership
- Shared ownership

---

## Routing

Document:

- Public routes
- Protected routes
- Nested layouts
- Route guards

---

## API Layer

Identify:

- API client
- Services
- Hooks
- Authentication
- Error handling

List any mock implementations that should later be replaced.

---

## State Management

Identify:

- Global state
- Local state
- Context
- Derived state

Evaluate whether state duplication exists.

---

## UI Components

Review:

- Shared components
- Layout components
- Feature components

Identify duplicate implementations.

---

## Feature Completion

For every major feature determine:

- Completed
- Partially implemented
- Missing
- Placeholder
- Mock implementation

---

## Technical Debt

Identify:

- Dead code
- Duplicate code
- TODO
- FIXME
- Unused files
- Large components
- Hard-coded values
- Mock data
- Architecture inconsistencies

---

## Production Risks

Identify anything that may prevent production deployment.

Examples:

- Missing loading states
- Missing error handling
- Missing responsive layouts
- Missing accessibility
- Broken routing
- API inconsistencies

---

# Out of Scope

This task must NOT:

- Implement new features
- Refactor code
- Modify architecture
- Install packages
- Rewrite components

Only analyze and report.

---

# Deliverables

Produce a structured engineering report including:

## 1. Architecture Summary

## 2. Folder Structure Overview

## 3. Feature Status Matrix

Example:

- Authentication
- Homepage
- Explore
- Course Detail
- Learning Workspace
- Profile
- Search
- Enrollment

Status:

- Complete
- Partial
- Missing

---

## 4. Shared Component Inventory

List reusable components.

---

## 5. API Integration Status

Identify:

- Connected APIs
- Mock APIs
- Missing APIs

---

## 6. Technical Debt

Prioritize by severity:

High

Medium

Low

---

## 7. Production Readiness Score

Evaluate:

- Architecture
- UI
- API
- Performance
- Accessibility
- Maintainability

Provide an overall score.

---

## 8. Recommended Next Tasks

Recommend implementation order based on engineering priority.

---

# Acceptance Criteria

The audit is complete only if:

- Repository analyzed
- Architecture understood
- Features categorized
- Technical debt documented
- Risks identified
- Recommendations provided

---

# Final Report

Summarize:

- Current project maturity
- Major strengths
- Major weaknesses
- Highest priority implementation
- Estimated production readiness
-
