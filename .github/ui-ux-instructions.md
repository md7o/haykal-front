# UI/UX Agent Instructions — haykal-front

This file guides AI coding agents on design principles and implementation patterns for consistent, clean UI/UX across the project.

## Core Design Philosophy

- **Simplicity First:** Keep code minimal and readable. Every component should serve a clear purpose.
- **No Shadows:** Do not use box-shadow, text-shadow, or drop-shadow effects.
- **No Borders:** Avoid explicit borders. Use spacing, color contrast, and background differentiation instead.
- **Two-Color Palette:** All designs use **white** (`#ffffff`) and **card-bg** (`#eeeeee`) as primary colors.

## Design System Reference

### Color Tokens (from `src/styles/Theme.css`)

**Primary Colors:**

- `--color-base-bg`: `#ffffff` (white — main background)
- `--color-card-bg`: `#eeeeee` (card background — secondary)

**Text Colors:**

- `--color-title`: `black` (headings, primary text)
- `--color-description`: `#565656` (secondary text)

**Accent Colors:**

- `--color-accent`: `#fa886b` (coral — interactive elements, highlights)

**State Colors:**

- `--color-success`: `#38e9a2` (green — success messages)
- `--color-warning`: `#ffb71c` (yellow — warnings)
- `--color-error`: `#eb5f5f` (red — errors)

**Supporting:**

- `--color-secondary-card`: `#dddddd` (alternate card background)

### Spacing & Radius Tokens

**Border Radius:**

- `--radius-soft`: `10px` (subtle rounding)
- `--radius-base`: `16px` (standard rounding)
- `--radius-strong`: `20px` (prominent rounding)
- `--radius-curvey`: `50px` (very rounded)
- `--radius-full`: `999px` (fully rounded/pills)

**Font:**

- `--font-montserrat`: "Montserrat", sans-serif (all text)

## Implementation Guidelines

### 1. Use Theme Tokens Only

**DO:**

```tsx
<div className="bg-[--color-base-bg] text-[--color-title] rounded-[--radius-base]">Simple card</div>
```

**OR use Tailwind with custom tokens:**

```tsx
<div className="bg-white text-black rounded-base">Simple card</div>
```

**DON'T:**

```tsx
<div className="bg-blue-500 shadow-lg border border-gray-300">❌ Wrong colors and shadows/borders</div>
```

### 2. Visual Hierarchy Through Color, Not Shadows

Instead of relying on shadows to create depth, use:

- **Background color differences:** white vs card-bg
- **Spacing:** margins and padding to separate sections
- **Text color:** title vs description for emphasis
- **Accent color:** highlights for interactive elements

**Example:**

```tsx
// Good: Uses color and spacing for hierarchy
<div className="bg-white p-6">
  <h2 className="text-[--color-title] mb-3">Title</h2>
  <p className="text-[--color-description] text-sm">Subtitle</p>
</div>

// Bad: Relies on shadow
<div className="bg-white p-6 shadow-lg">
  <h2>Title</h2>
  <p>Subtitle</p>
</div>
```

### 3. Keep Component Code Minimal

- One responsibility per component.
- Avoid nested deep JSX structures.
- Extract logic into custom hooks in `src/hooks/`.
- Use composition over prop drilling.

**Example:**

```tsx
// Good: Simple, focused
export function CardSection({ title, description }: Props) {
  return (
    <div className="bg-[--color-card-bg] rounded-[--radius-base] p-4">
      <h3 className="text-[--color-title] font-semibold">{title}</h3>
      <p className="text-[--color-description] text-sm mt-2">{description}</p>
    </div>
  );
}

// Avoid: Overly complex with inline styles
export function Card({ data, onAction, loading, ... }) {
  return (
    <div style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      {/* Many nested divs and conditional logic */}
    </div>
  );
}
```

### 4. Component Structure Pattern

When adding a new component:

```tsx
// src/components/your-folder/YourComponent.tsx
"use client";

import { cn } from "@/lib/utils";

interface YourComponentProps {
  title: string;
  description?: string;
}

export function YourComponent({ title, description }: YourComponentProps) {
  return (
    <div className={cn("bg-[--color-card-bg]", "rounded-[--radius-base]", "p-4")}>
      <h3 className="text-[--color-title] font-semibold">{title}</h3>
      {description && <p className="text-[--color-description] text-sm mt-2">{description}</p>}
    </div>
  );
}
```

### 5. Styling Strategy

**Always prefer Tailwind classes with theme tokens:**

```tsx
// Use theme CSS variables
className = "bg-[var(--color-card-bg)] text-[var(--color-title)] rounded-[var(--radius-base)]";

// Or use configured Tailwind extensions (if available)
className = "bg-card-bg text-title rounded-base";
```

**Only add custom CSS in `src/styles/Theme.css` if:**

- Creating a reusable utility class
- Defining animations (like `@keyframes lightpulse`)
- Setting base element styles (like `body`, `html`)

### 6. Interactive Elements

**Buttons and Links:**

- Use `--color-accent` (`#fa886b`) for primary actions.
- Use `--color-secondary-card` or lighter backgrounds for secondary actions.
- No box-shadow; create contrast through color.
- Small padding (8-12px) with appropriate border radius.

**Example:**

```tsx
<button className="bg-[--color-accent] text-white rounded-[--radius-base] px-4 py-2 hover:opacity-90 transition-opacity">
  Click Me
</button>
```

**Hover States:**

- Use `opacity` changes or slight color adjustments.
- Use `transition-` utilities for smoothness.
- Never add shadow on hover.

```tsx
className = "hover:opacity-90 transition-opacity";
// or
className = "hover:bg-[--color-secondary] transition-colors";
```

### 7. Cards and Containers

**Pattern:**

```tsx
<div className="bg-[--color-card-bg] rounded-[--radius-base] p-4 space-y-3">{/* Content */}</div>
```

- Always use `bg-[--color-card-bg]` for secondary containers (not white).
- `bg-[--color-base-bg]` (white) for page backgrounds and primary surfaces.
- Use consistent padding: `p-4` (default), `p-3` (compact), `p-6` (spacious).
- Never use `border` class — rely on background color contrast.

### 8. Text and Typography

**Hierarchy:**

- **Headings (h1, h2, h3):** `text-[--color-title]` with `font-semibold` or `font-bold`.
- **Body text:** `text-[--color-description]` with `text-sm` or `text-base`.
- **Labels:** `text-[--color-title]` with `text-xs` or `text-sm`.

**Example:**

```tsx
<h2 className="text-[--color-title] text-lg font-semibold">Main Title</h2>
<p className="text-[--color-description] text-sm mt-1">Supporting text</p>
```

### 9. Spacing Rules

- Use Tailwind spacing utilities: `p-`, `m-`, `gap-`, `space-`.
- Standard unit: `4` (1rem / 16px).
- Common spacings: `p-2`, `p-3`, `p-4`, `p-6`.
- Between sections: `mt-6` or `mb-6`.
- Within components: `gap-2` or `space-y-2`.

### 10. Forms and Inputs

- (Critical one) Use shadcn/ui form components from `src/components/ui-tools/ui/`.
- Apply theme colors via Tailwind classes.
- Keep labels clean and aligned.
- No borders; use `bg-[--color-card-bg]` for input backgrounds.

**Example:**

```tsx
<input
  type="text"
  placeholder="Enter name"
  className="bg-[--color-card-bg] text-[--color-title] rounded-[--radius-base] px-3 py-2 placeholder-[--color-description]"
/>
```

## Common Pitfalls to Avoid

| ❌ Don't                      | ✅ Do                                               |
| ----------------------------- | --------------------------------------------------- |
| `shadow-lg`, `shadow-md`      | Use background color contrast                       |
| `border border-gray-300`      | Rely on spacing and color to define edges           |
| `bg-blue-500`, `bg-red-300`   | Use token colors: `--color-accent`, `--color-error` |
| Inline `style={{ }}`          | Use Tailwind classes with theme tokens              |
| Deep component nesting        | Keep components flat and composable                 |
| Custom fonts or colors        | Always use `src/styles/Theme.css` tokens            |
| Multiple states per component | Break into smaller, focused components              |

## When Adding New Features

1. **Review existing patterns** in `src/components/pages/` (e.g., portfolio, dashboard, community).
2. **Use `Theme.css` tokens only** — never hardcode colors.
3. **Keep components under 150 lines** — split if larger.
4. **Test with both white and card-bg** backgrounds to ensure readability.
5. **No shadows or borders** — full stop.
6. **Use `cn()` helper** for conditional class merging.

## File Organization

- **Components:** `src/components/<feature-name>/YourComponent.tsx`
- **Styling:** All in `src/styles/Theme.css` and Tailwind classes.
- **Utilities:** `src/lib/utils.ts` (includes `cn()` helper).
- **Hooks:** `src/hooks/` for shared logic.

## Quick Reference: Color Usage

| Purpose                   | Token                 | Hex       |
| ------------------------- | --------------------- | --------- |
| Page/main background      | `--color-base-bg`     | `#ffffff` |
| Card/secondary background | `--color-card-bg`     | `#eeeeee` |
| Primary text              | `--color-title`       | `black`   |
| Secondary text            | `--color-description` | `#565656` |
| Interactive/highlights    | `--color-accent`      | `#fa886b` |
| Success messages          | `--color-success`     | `#38e9a2` |
| Error messages            | `--color-error`       | `#eb5f5f` |
| Warnings                  | `--color-warning`     | `#ffb71c` |

---

**Summary:** Build clean, simple UIs using only Tailwind classes + Theme.css tokens. No shadows, no borders. Think white and card-bg. Every component should feel lightweight and intentional.
