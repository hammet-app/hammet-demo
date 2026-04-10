# HammetLabs — UI Components

## Files

```
src/
├── app/
│   ├── globals.css          ← @import "tailwindcss" + full @theme block
│   └── layout.tsx           ← Root layout wiring fonts
├── lib/
│   ├── fonts.ts             ← DM Sans + Plus Jakarta Sans via next/font
│   ├── roles.ts             ← UserRole type, getPrimaryRole, getInitials helpers
│   └── api-types.ts         ← CurriculumModuleBlock + shared API shapes
└── components/
    ├── ui/
    │   └── status-pill.tsx  ← StatusPill — approved / submitted / flagged / not_started / locked
    ├── sidebar-config.ts    ← Nav entries per role (student / teacher / school_admin / hammet_admin)
    ├── topbar.tsx           ← Topbar — role badge, avatar, hamburger (mobile)
    ├── sidebar.tsx          ← Sidebar — active state, section labels, badge counter
    ├── dashboard-layout.tsx ← Wires Topbar + Sidebar + Sheet drawer (Sheet managed here)
    ├── stat-card.tsx        ← Stat card — icon, value, sub label
    ├── module-card.tsx      ← Module/lesson list item — week badge + status pill
    ├── student-row-card.tsx ← Student row — avatar, progress bar (teacher/admin only)
    ├── submission-card.tsx  ← Submission — flag note, Revise / View action
    └── lesson-content-card.tsx ← Full lesson renderer — all 7 block types + reflection textarea
```

## Setup notes

### 1. globals.css
Replace the contents of your `src/app/globals.css` with the provided file.
The `@theme` block defines all brand tokens as CSS custom properties available
as Tailwind utilities (e.g. `bg-purple-dark`, `text-cyan`, `border-border`).

### 2. Fonts
The `layout.tsx` applies `dmSans.variable` and `plusJakarta.variable` as class
names on `<html>`. The CSS variables `--font-dm-sans` and `--font-plus-jakarta`
are then consumed by the `--font-sans` and `--font-head` tokens in `@theme`.

### 3. shadcn Sheet
`dashboard-layout.tsx` imports `Sheet` from `@/components/ui/sheet`.
Make sure you've run:
```bash
npx shadcn@latest add sheet
```

### 4. DashboardLayout usage
Wrap each role's page layout with `<DashboardLayout user={user}>`:

```tsx
// app/(dashboard)/layout.tsx
import { DashboardLayout } from "@/components/dashboard-layout";
import { getSession } from "@/lib/session"; // your auth helper

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getSession(); // returns AuthUser shape
  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
```

### 5. Active nav highlighting
`Sidebar` uses `usePathname()` internally via the `activePath` prop passed from
`DashboardLayout`. Exact match + prefix match both highlight the item.

### 6. Adding a badge count to nav items
In `sidebar-config.ts`, add a `badge` number to any `NavItem`.
The Sidebar renders it as a cyan pill. Update counts by fetching from your API
and passing them into a modified config (e.g. pending review count for teachers).

### 7. Tailwind v4 custom tokens
All brand tokens in `@theme` become Tailwind utilities automatically:
- `--color-purple-dark` → `bg-purple-dark`, `text-purple-dark`, `border-purple-dark`
- `--color-cyan` → `bg-cyan`, `text-cyan`, `border-cyan`
- etc.
No `tailwind.config.ts` needed.
