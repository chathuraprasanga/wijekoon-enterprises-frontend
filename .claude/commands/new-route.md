---
description: Add a new route to src/routes.tsx
---

Add a route for the page described in `$ARGUMENTS` to `src/routes.tsx`.

## Current pattern (small route count)

```tsx
import <Name>Page from './pages/<Name>Page.tsx';

export const router = createBrowserRouter([
  // ...
  {
    path: '/<kebab-name>',
    element: <<Name>Page />,
  },
]);
```

## Rules

- Route path segments are kebab-case (`/forgot-password`, not `/forgotPassword`).
- Keep plain static imports while the route count stays small (roughly ≤6 top-level routes). Once it grows past that, switch **every** route to `React.lazy(() => import(...))` and wrap the router's consumer (`App.tsx`) in a single `<Suspense fallback={...}>` — don't mix lazy and static imports in the same file.
- If this route belongs under a protected `/app/*` zone that doesn't exist yet, that parent route needs exactly **one** auth-loader (checking `store.getState().auth`) — do not add a loader to the child route too; see the "Architecture" section of `CLAUDE.md`.
- Always keep a catch-all (`{ path: '*', element: <Navigate to="/login" replace /> }`) as the last entry so unknown paths don't fall through to a blank screen.
