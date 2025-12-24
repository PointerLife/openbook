# Specification: Remove Blog Feature

## Overview
Remove all traces of the "Blog" feature from the OpenBook application. This includes the visual components on the landing page, individual blog pages, routing, backend logic, and any dependencies that are exclusively used for the blog functionality. The goal is to streamline the codebase by removing unused or deprecated features.

## Functional Requirements
- **Landing Page:** Remove the "Blog" section and any links/references to the blog.
- **Components:** Delete all blog-related React components (e.g., `blog-section.tsx`, `blog-card.tsx`, `BlogPost.tsx`, and any others found).
- **Routes:** Remove the `/blog` route and any dynamic sub-routes (e.g., `/blog/[slug]`).
- **Data/Content:** Remove any static content, JSON files, or Markdown files used specifically for blog posts.
- **API/Utils:** Remove any API endpoints, utility functions, or types defined solely for the blog.
- **Navigation:** Update the header/footer to remove "Blog" links.

## Non-Functional Requirements
- **Clean Code:** Ensure no "dead code" (unused imports, variables, styles) remains after the deletion.
- **Stability:** The application must build and run successfully without errors.
- **Dependencies:** Identify and uninstall npm packages that were used *only* for the blog feature (e.g., specific markdown parsers not used elsewhere).

## Acceptance Criteria
- [ ] The Landing Page loads correctly without the Blog section.
- [ ] Navigating to `/blog` results in a 404 Not Found (or redirects to home).
- [ ] The `components/landing/` directory no longer contains blog-related files.
- [ ] No build errors occur due to missing components or imports.
- [ ] `package.json` is updated to remove unused dependencies (if any).
