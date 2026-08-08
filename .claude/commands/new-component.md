---
description: Scaffold a shared, presentational component
---

Create a new shared component named in `$ARGUMENTS` under `src/components/<Name>.tsx`.

```tsx
import { Stack } from '@mantine/core';

export type <Name>Props = {
  // explicit props — no `any`
};

export const <Name> = ({ ...props }: <Name>Props) => {
  return (
    <Stack>
      {/* ... */}
    </Stack>
  );
};
```

## Rules

- **Named export**, PascalCase filename matching the component name (matches `LoginForm.tsx`, `OtpForm.tsx`, etc.).
- Explicit `Props` type — every prop typed, no `any`.
- **No `axiosInstance`/`useAppDispatch` calls inside a shared component.** If it needs data or needs to submit something, that belongs to the page that renders it — pass callbacks (`onSubmit`, `onSelect`, ...) and data down as props instead. This keeps form/display components reusable and testable in isolation.
- No CSS files/CSS modules — style via Mantine props (`Stack`/`Group` spacing, `c`, `size`, etc.) or `theme.ts` overrides for anything that should apply everywhere. Tailwind utility classes are fine for the rare one-off (e.g. a responsive show/hide), not as the primary styling mechanism.
- If the component wraps a form, follow the `useForm` pattern in `LoginForm.tsx` — inline `validate` object, `form.getInputProps(field)`, submit via `form.onSubmit(onSubmit)`.
