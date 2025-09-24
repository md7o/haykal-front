# Copilot Instructions — haykal-front

These notes orient AI coding agents to be productive quickly in this repo. Focus on the concrete patterns already used here.

## Overview

- Framework: Next.js (App Router) 15 + React 19 + TypeScript.
- Styling: Tailwind v4 (via `@tailwindcss/postcss`) + shadcn/ui primitives + custom theme CSS in `src/styles`.
- UI libs: Radix UI primitives, lucide-react icons, AOS for scroll animations, dnd-kit for drag-drop.
- Dev server: `npm run dev` on port 3001 (not 3000).
- Path aliases: `@/*` → `src/*` (see `tsconfig.json`).

## Architecture & Data Flow

- App entry: `src/app/layout.tsx` sets global fonts, `AOSInit`, and wraps children with `AuthProvider` and `RecoveryPasswordProvider`.
- Route groups:
  - `(auth)`: login/signup/forgot/reset pages using RHF + zod.
  - `(structure)`: wraps pages with `StructureProvider` for category/layout selection (persisted in `sessionStorage`).
  - `(admin)`: wraps pages with `StudioProvider` to manage the visual "sections" editor.
- API layer (`src/api`):
  - `auth-endpoints.ts`: axios instance (`withCredentials: true`) using `NEXT_PUBLIC_API_URL`. Access token is kept in-memory and mirrored to `sessionStorage`; refresh handled via `/auth/refresh` with queued retries. Only safe in client components.
  - `studio-endpoints.ts`: CRUD under `/portfolio/custom` using the shared axios instance.
- State/contexts:
  - `AuthContext`: exposes `isLogged`, `user`, `isCheckingAuth`, `logoutUser`, `setIsLogged`, `setUser`. It bootstraps session by calling `checkAuthStatus()` on mount.
  - `StructureContext`: selected `CategoryType` and `LayoutType`, persisted in `sessionStorage`.
  - `StudioContext`: drives the sections editor; tracks `used` sections array, available registry, selection, reorder, and IDs (`portfolioId`, `customDesignId`) persisted in `sessionStorage`.
- Sections design system:
  - Registry: `src/components/pages/sections-design/registry/sections-registry.ts` defines types, labels, `defaultConfig`, `Design`, `Form`, and optional `validate` for each section type.
  - Creating instances uses `crypto.randomUUID()`; editing/reorder via dnd-kit (`StudioSidebar`) and `DrawerEditor`. Rendering examples in `(admin)/own` by fetching a saved custom design and mapping to `Design` components.

## Developer Workflows

- Install: `npm install`
- Dev: `npm run dev` (visits `http://localhost:3001`)
- Build: `npm run build` → `npm start`
- Lint: `npm run lint` (Flat config via `eslint.config.mjs`)
- Env: set `NEXT_PUBLIC_API_URL` (e.g., `.env.local`). Axios uses cookies and bearer token; ensure CORS + credentials are enabled server-side.

## Conventions & Patterns

- Client vs server: Any code touching `sessionStorage`, AOS, or the shared axios token must be in client components (`"use client"`). Avoid calling `auth-endpoints` from server components.
- Forms: Use React Hook Form + zod resolvers and the shared schemas in `src/lib/validations.ts`. Prefer the shared `FormField` component for consistent UX (label, error, touched) and `Button` variants from `src/components/ui`.
- Styling: Use `cn` from `src/lib/utils.ts` and component variants via `class-variance-authority` (see `ui/button.tsx`). Theme tokens live in `src/styles/Theme.css` and overrides in `Theme.cus.css`.
- Icons/animations: Use `lucide-react` icons; AOS attributes (`data-aos`, `data-aos-duration`) are sprinkled in landing components.
- Drag & drop: Use dnd-kit patterns as in `StudioSidebar` (`DndContext`, `SortableContext`, `useSortable`) and update via `reorderUsed`.

## How-To Examples

- Add a new section type:
  1. Create `Design` and `Form` under `src/components/pages/sections-design/<your-block>/`.
  2. Register it in `registry/sections-registry.ts` with `type`, `label`, `defaultConfig`, `Design`, `Form`, and optional `validate`.
  3. It will appear under "Available Sections" automatically via `StudioContext`.
- Build a validated form:
  - Define schema in `src/lib/validations.ts` (e.g., `signUpSchema`).
  - In a client component, use RHF + `zodResolver(schema)` and render inputs via `<FormField ... error={errors.field?.message} touched={touchedFields.field || submitAttempted} />`.
- Call the API safely in client:
  - Import from `src/api/...`. Example login: `await signIn({ email, password }); const user = await me(); setIsLogged(true); setUser(user);` (see `LoginForm`).

## Gotchas

- Port: Dev runs on 3001 by default; update links accordingly.
- Tokens: Access token lives in-memory + `sessionStorage`; SSR will not have it. Keep auth-bound requests in client components.
- Refresh: The axios interceptor queues 401s while refreshing; don’t implement duplicate refresh logic elsewhere.
- Session persistence: `StructureContext`/`StudioContext` mirror IDs and choices to `sessionStorage`; read/write only in browser.
