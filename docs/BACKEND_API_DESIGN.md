# Backend API Redesign Proposal

This document outlines the proposed API structure to move from a monolithic "thick client" architecture to a granular, backend-driven architecture.

## Core Philosophy

- **Granularity**: Modify only what changed (a single section, a page title) rather than the whole portfolio.
- **Concurrency**: Prevent overwrites by operating on specific resource IDs.
- **Performance**: Fetch only what is needed (e.g., don't load all sections for all pages when listing portfolios).

## 1. Portfolios

_Manage the container._

| Method   | Endpoint              | Description                                     | Payload                              |
| :------- | :-------------------- | :---------------------------------------------- | :----------------------------------- |
| `GET`    | `/api/portfolios`     | List user's portfolios (summary only).          | -                                    |
| `POST`   | `/api/portfolios`     | Create a new portfolio.                         | `{ title: string, slug?: string }`   |
| `GET`    | `/api/portfolios/:id` | Get portfolio details (can include pages list). | -                                    |
| `PATCH`  | `/api/portfolios/:id` | Update metadata (slug, global assets).          | `{ slug?: string, assets?: object }` |
| `DELETE` | `/api/portfolios/:id` | Delete portfolio and all contents.              | -                                    |

## 2. Pages

_Manage the structure of the portfolio._

| Method   | Endpoint                            | Description                 | Payload                                                            |
| :------- | :---------------------------------- | :-------------------------- | :----------------------------------------------------------------- |
| `GET`    | `/api/portfolios/:id/pages`         | List pages for a portfolio. | -                                                                  |
| `POST`   | `/api/portfolios/:id/pages`         | Create a new page.          | `{ title: string, slug: string }`                                  |
| `PATCH`  | `/api/pages/:id`                    | Update page details.        | `{ title?: string, slug?: string, status?: 'DRAFT'\|'PUBLISHED' }` |
| `DELETE` | `/api/pages/:id`                    | Delete a page.              | -                                                                  |
| `PUT`    | `/api/portfolios/:id/pages/reorder` | Reorder pages.              | `{ pageIds: string[] }`                                            |

## 3. Sections (The Big Change)

_Manage the content blocks. This replaces the large JSON blob._

| Method   | Endpoint                          | Description                  | Payload                            |
| :------- | :-------------------------------- | :--------------------------- | :--------------------------------- |
| `GET`    | `/api/pages/:id/sections`         | Get all sections for a page. | -                                  |
| `POST`   | `/api/pages/:id/sections`         | Add a section to a page.     | `{ type: string, config: object }` |
| `PATCH`  | `/api/sections/:id`               | Update a section's config.   | `{ config: Partial<Config> }`      |
| `DELETE` | `/api/sections/:id`               | Remove a section.            | -                                  |
| `PUT`    | `/api/pages/:id/sections/reorder` | Reorder sections on a page.  | `{ sectionIds: string[] }`         |

## 4. Assets (Optional)

_Decouple file storage from portfolio config._

| Method | Endpoint             | Description                  | Payload    |
| :----- | :------------------- | :--------------------------- | :--------- |
| `POST` | `/api/assets/upload` | Upload a file.               | `FormData` |
| `GET`  | `/api/assets`        | List user's uploaded assets. | -          |

## Data Models (TypeScript Interfaces)

```typescript
interface Portfolio {
  id: string;
  userId: string;
  slug: string;
  // Pages are now fetched separately or included as a relation
  pages?: Page[];
  assets: Record<string, any>;
}

interface Page {
  id: string;
  portfolioId: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  order: number;
  // Sections fetched separately
  sections?: Section[];
}

interface Section {
  id: string;
  pageId: string;
  type: string; // 'hero', 'text', etc.
  config: Record<string, any>; // The specific settings
  order: number;
}
```
