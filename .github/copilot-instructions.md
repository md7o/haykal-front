# Copilot Instructions — haykal-front

Guide for AI agents to become productive in this Next.js portfolio editor codebase.

## Quick Start

- **Install & run:** `npm install` && `npm run dev` (dev server on port 3001)
- **Build:** `npm run build` && `npm run start`
- **Lint:** `npm run lint`
- **Path alias:** `@/*` → `src/*` (used in all imports)

## Architecture Overview

**Tech Stack:** Next.js 16 + React 19 + TypeScript | Tailwind v4 + shadcn/ui + Radix UI | Axios (token refresh) | react-hook-form + zod

**Route Structure** (Next.js App Router with route groups):

- `(auth)`: Login, signup, password reset
- `(structure)`: Studio editor (`/studio`)
- `(user-admin)`: Dashboard, user panels (`/dashboard`, `/own`)
- `community/[slug]`: Community hubs (posts, events, resources)
- `(portfolio)/[id]`: Published portfolio view

**Core State** (in order of responsibility):

1. **AuthContext** (`src/context/AuthContext.tsx`): Session, user, token lifecycle
2. **StudioContext** (`src/context/StudioContext.tsx`): Portfolio editor state — sections, pages, config
3. **UserPortfolioContext**: Portfolio metadata & caching

## Critical Patterns

### StudioContext: Single Source of Truth for Editor

- Manages: `used[]` sections, `available[]` section types, `pages[]`, `selectedPageId`, `portfolioId`
- **Does NOT** persist to Local Storage — data fetched from API, cached in `sessionStorage` only for `portfolioId`
- Optimistically updates UI, then syncs via API calls in `useStudioPages` and `useStudioSections` hooks
- On 401 error: silently resets state (no noisy console logs)

### Section System (Portfolio Building Blocks)

- **Definition file:** `src/components/pages/portfolio-feature/sections-design/sectionsVisualization.ts`
- Each section has: `type` (string key), `label`, `defaultConfig`, `Design` component, optional `Form` component, optional `validate()` function
- **Example types:** `header`, `hero`, `text`, `career`, `achievements`, `events`, `business-services`, `social-links`
- Adding new: Create folder `src/components/pages/portfolio-feature/sections-design/<type>/` with `<Type>Block.tsx` (Design) and `<Type>BlockForm.tsx` (Form with config interface), then add to `sectionsVisualization` record

### API Layer

- **Central:** `src/api/auth/auth-endpoints.ts` exports `api` (axios instance) with refresh token interceptor + scheduled refresh
- **Patterns:** `src/api/portfolios-api/` (portfolio, pages, sections CRUD), `src/api/community/` (posts, members, etc.), `src/api/user/` (profile), `src/api/api-utils.ts` (helpers)
- **Error handling:** Catch & log at call site; 401s trigger `AuthContext` reset

### Forms & Validation

- All validation via `src/lib/validations.ts`: Zod schemas (`loginSchema`, `signUpSchema`, `emailSchema`, `passwordSchema`, `usernameSchema`)
- React-hook-form + Zod integration in forms
- Custom `validateField()` and `createFieldValidator()` helpers

### Styling & Theme

- Tailwind v4 via `@tailwindcss/postcss`
- shadcn/ui components in `src/components/ui/shadcn_ui/`
- Theme tokens in `src/styles/Theme.css` (CSS custom properties)
- Use `cn()` helper (from `clsx`/`tailwind-merge`) for class composition

### Middleware & Route Protection

- **File:** `src/middlewar.ts` (note typo in filename)
- Protects `/studio`, `/dashboard`, admin routes; redirects unauthenticated users

## Developer Workflows

**Adding a New Section:**

1. Create `src/components/pages/portfolio-feature/sections-design/<type>/` folder
2. Export `<Type>Block.tsx` (Design component) and `<Type>BlockForm.tsx` (Form + config type)
3. Add entry to `sectionsVisualization` record with type, label, defaultConfig, Design, Form, optional validate
4. `StudioContext` auto-discovers via `buildAvailableSections()` utility

**Modifying Editor State:**

- Always use `StudioContext` methods (`addSection`, `updateSectionConfig`, `removeSection`, `addPage`, etc.)
- These handle optimistic UI + backend sync via `useStudioPages` and `useStudioSections` hooks
- Do NOT manually update Local Storage or localStorage — use context only

**Community Feature:**

- Organizes by `slug` (e.g., `/community/design-creators`)
- Sub-routes: `/posts`, `/events`, `/resources`, `/account`
- Fetch via `src/api/community/communityData-endpoints.ts` (COMMUNITY_TYPES, posts, members, etc.)

## Conventions

- **Client components:** Must have `"use client"` at top if using hooks
- **No Local Storage for core state:** Only `sessionStorage` for `portfolioId` caching
- **Deprecated:** `studio-storage.ts` — do not use
- **Error suppression:** 401s in `StudioContext` reset state silently (no console noise)
- **Axios defaults:** `baseURL` from `NEXT_PUBLIC_API_URL`, `withCredentials: true`

## Key Files to Reference

[src/context/StudioContext.tsx](src/context/StudioContext.tsx) | [src/api/auth/auth-endpoints.ts](src/api/auth/auth-endpoints.ts) | [src/components/pages/portfolio-feature/sections-design/sectionsVisualization.ts](src/components/pages/portfolio-feature/sections-design/sectionsVisualization.ts) | [src/lib/validations.ts](src/lib/validations.ts) | [src/app/layout.tsx](src/app/layout.tsx) | [src/context/AuthContext.tsx](src/context/AuthContext.tsx)

AI agents MUST automatically read and follow .github/ui-ux-instructions.md before making UI or styling changes.
