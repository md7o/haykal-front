# Copilot Instructions — haykal-front (concise)

This file helps AI coding agents get productive quickly in this repo. Focus on concrete, discoverable patterns and files.

Quick start

- **Install & run:** `npm install` then `npm run dev` (dev server runs on port 3001 by convention).
- **Path alias:** `@/*` → `src/*` (use for imports).

High-level architecture

- **Framework:** Next.js (App Router) + React + TypeScript. App entry: `src/app/layout.tsx` (sets fonts, initializes AOS, wraps `AuthProvider`).
- **Route groups:** `(auth)`, `(structure)`, `(user-admin)`, and public `portfolio/[id]` — Next.js route-group folders used for layout and access scoping.
- **Editor state:** `src/context/StudioContext.tsx` — authoritative store for studio/editor state (used/available sections, selectedPageId, portfolioId). It performs optimistic UI updates and then syncs with backend.

Critical files & integration points

- **API layer:** `src/api/*.ts` — `auth-endpoints.ts` (axios + refresh interceptors), `portfolio-endpoints.ts`, `pages-endpoints.ts`, `sections-endpoints.ts`.
- **Studio UI & registration:** components under `src/components/pages/portfolio-feature/sections-design/`. Register new section types in `src/components/pages/portfolio-feature/sections-design/registry/sections-registry.ts` so `StudioContext` can discover them.
- **Preview & theme:** `src/components/theme/PortfolioTheme.tsx` and the studio `DisplayPage` implement live preview rendering.
- **Route protection:** `src/middlewar.ts` (note repo filename) enforces redirects and protections for studio and admin areas.

Conventions & patterns (specific)

- **Client components:** Files using hooks must include `"use client"` at the top (common across `components/*` and studio pages).
- **Forms & validation:** `react-hook-form` + `zod` — schemas and helpers in `src/lib/validations.ts`.
- **Styling:** Tailwind v4 + shadcn/ui. Use `cn()` helper and theme tokens in `src/styles/Theme.css`.
- **Storage rule:** Do **not** persist core studio data to Local Storage. Only `portfolioId` is cached in `sessionStorage`. `studio-storage.ts` is deprecated — avoid using it.
- **401 handling:** `StudioContext` silently resets on 401 to avoid noisy logs — be aware when adding new API flows.

How to add a new Section (practical steps)

1. Add a `Design` (preview) and `Form` (config) component: `src/components/pages/sections-design/<your-section>/Design.tsx` and `Form.tsx`.
2. Export metadata or default props matching existing sections (follow patterns in other folders).
3. Register the section in `sections-registry.ts`.
4. Use `StudioContext` methods (`addSection`, `updateSectionConfig`) — these handle optimistic update + backend sync.

Developer workflows & scripts

- **Dev server:** `npm run dev` (uses Next dev server). Build with `npm run build` and start production with `npm run start` if present in `package.json`.
- **Lint/format:** use repo scripts (`npm run lint`, `npm run format`) where available.

Notes for AI agents

- Favor changing `StudioContext` (single source of truth) rather than sprinkling local persistence in components.
- When adding or modifying sections, update both the UI folder and the registry; add API calls in `src/api` as needed.
- Example places to inspect for patterns: `src/context/StudioContext.tsx`, `src/api/auth-endpoints.ts`, `src/components/pages/portfolio-feature/sections-design/registry/sections-registry.ts`, `src/app/(structure)/studio/page.tsx`, `src/components/theme/PortfolioTheme.tsx`.

If anything in these notes is unclear or you want concrete code examples (registry entry, sample `Design` + `Form`, or `StudioContext` helper), tell me which area and I will add a focused snippet.

# Copilot Instructions — haykal-front

These notes orient AI coding agents to be productive quickly in this repo. Focus on the concrete patterns already used here.

## Overview

- **Framework:** Next.js (App Router) 15 + React 19 + TypeScript.
- **Styling:** Tailwind v4 (via `@tailwindcss/postcss`) + shadcn/ui primitives + custom theme CSS in `src/styles`.
- **UI Libs:** Radix UI primitives, lucide-react icons, AOS for scroll animations, dnd-kit for drag-drop.
- **Dev Server:** `npm run dev` on port 3001.
- **Path Aliases:** `@/*` → `src/*`.

## Architecture & Data Flow

- **App Entry:** `src/app/layout.tsx` sets global fonts, `AOSInit`, and wraps children with `AuthProvider`.
- **Route Groups:**

  - `(auth)`: Login/signup pages.
  - `(structure)`: Studio layout.
  - `(user-admin)`: Dashboard and control panels.
  - `portfolio/[id]`: Public portfolio view.

- **State Management:**

  - **AuthContext:** Manages user session (`isLogged`, `user`). Token stored in memory/cookies.
  - **StudioContext:** **Primary state for the editor.**
    - Manages `used` sections, `available` sections, `selectedPageId`, `portfolioId`.
    - **CRITICAL:** Data is **NOT** stored in Local Storage. It is fetched from the backend API.
    - `portfolioId` is cached in `sessionStorage` only to persist context across reloads.
    - Performs optimistic updates for UI, then syncs with API.

- **API Layer (`src/api`):**
  - **`auth-endpoints.ts`:** Axios instance with interceptors for token refresh.
  - **`portfolio-endpoints.ts`:** CRUD for Portfolios (`getPortfolioById`, `resolveUserPortfolioId`).
  - **`pages-endpoints.ts`:** CRUD for Pages (`getPages`, `createPage`, `updatePage`).
  - **`sections-endpoints.ts`:** CRUD for Sections (`getSections`, `createSection`, `reorderSections`).

## Developer Workflows

- **Adding Sections:**

  1. Create `Design` and `Form` components in `src/components/pages/sections-design/<type>/`.
  2. Register in `src/components/pages/portfolio-feature/sections-design/registry/sections-registry.ts`.
  3. `StudioContext` automatically picks it up.

- **Studio Logic:**

  - `StudioSidebar` uses `StudioContext` to list/add sections.
  - `DisplayPage` renders the live preview using `PortfolioTheme`.
  - **Do not use `studio-storage.ts`**. It is deprecated. Use `StudioContext` methods (`addSection`, `updateSectionConfig`) which call the API.

- **Routing & Middleware:**
  - `src/middleware.ts` handles route protection.
  - Users without a portfolio are redirected appropriately.
  - 401 errors in `StudioContext` trigger a state reset.

## Conventions

- **Client Components:** Any component using hooks (`useStudio`, `useAuth`, `useState`) must be `"use client"`.
- **Forms:** Use `react-hook-form` + `zod` (schemas in `src/lib/validations.ts`).
- **Styling:** Use `cn()` for class merging. Theme tokens are in `src/styles/Theme.css`.
- **Error Handling:** API errors should be caught. `StudioContext` silently handles 401s to avoid console noise.
