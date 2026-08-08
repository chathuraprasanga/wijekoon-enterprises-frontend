---
description: Scaffold a cross-cutting hook
---

Create a new hook named in `$ARGUMENTS` under `src/hooks/use<Name>.tsx` (`.tsx` even if it has no JSX, for consistency with `toNotify.tsx`).

```tsx
type Use<Name>Result = {
  // explicit return shape
};

export const use<Name> = (): Use<Name>Result => {
  // ...

  return {
    // ...
  };
};
```

## Rules

- Named export, explicit return-type interface — no inferred `any`.
- If the hook needs server data, **dispatch a thunk** (`useAppDispatch` + the relevant slice action) rather than calling `axiosInstance` directly from the hook.
- For user feedback, call `toNotify` (`src/hooks/toNotify.tsx`) rather than reimplementing a notification pattern.
- Keep hooks cross-cutting/UI-concern focused (loading overlays, notifications, media queries, etc.) — domain data fetching belongs in a slice thunk, not a hook.
