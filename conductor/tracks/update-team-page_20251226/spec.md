# Specification: Update Team Page with Portfolio Hero

## 1. Overview
The goal of this track is to completely redesign the "Team" page (`app/team/page.tsx`) by replacing the current team member grid with a personal, portfolio-style "Hero" section. This new section will exactly replicate the design provided in the reference content, featuring a profile picture, introduction text, social links, a primary call-to-action (CTA), and a dynamic age counter.

## 2. Functional Requirements
- **Hero Section:**
  - Display a profile picture (referencing `public/pfp.webp`).
  - Display a headline (e.g., "hi, i'm [name].").
  - **Dynamic Age Counter:** Implement the live, millisecond-precision age counter exactly as shown in the reference code ("been here for [age] years").
  - Display social media links (GitHub, LinkedIn, X, Email) with icons.
  - Include a primary Call to Action (CTA) button directly within the hero section.
- **Page Layout:**
  - Retain the existing `Header` and `CombinedFooter`.
  - Replace the current "Our Team" content and "Join Us" section with the new Hero component.

## 3. Technical Requirements
- **New Component:** Create `components/team/team-hero.tsx` (or similar) adapting the code from `@temp/potato/components/hero.tsx`.
- **Logic:**
  - Port the `useEffect` hook for the age calculation: `(now - birthDate) / (1000 * 60 * 60 * 24 * 365.25)`.
  - Ensure the birth date is set to `2006-01-02T00:00:00Z` as per the reference.
- **Styling & Animations:**
  - Ensure necessary animations (e.g., `animate-fade-in-up`) are available in `app/globals.css`. If missing, port them from the reference.
  - Use existing UI components (e.g., `components/ui/button`) where applicable.
- **Assets:** Ensure the profile picture `pfp.webp` is handled in `public/`.

## 4. Out of Scope
- "Projects" or "Experience" sections from the portfolio reference (only the Hero section is requested).
