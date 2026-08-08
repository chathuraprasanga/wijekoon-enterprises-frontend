---
description: Scaffold a full CRUD feature (list + add/edit + view) backed by a slice
---

Scaffold the feature named in `$ARGUMENTS` (e.g. `/new-page product` → `Product`). Assumes a matching slice already exists — run `/new-slice` first if not (`fetch<Domain>s`, `fetch<Domain>ById`, `create<Domain>`, `update<Domain>`, `delete<Domain>`).

## Files under `src/pages/<Domain>s/`

- **`index.tsx`** — list view. Dispatches `fetch<Domain>s` on mount (`useEffect` + `useAppDispatch`), reads `state.<domain>.items` via `useAppSelector`, renders a `mantine-datatable` `<DataTable>` with columns + row actions (edit → navigate to `/<domain>s/add-edit/:id`, delete → confirm then dispatch `delete<Domain>`, followed by `toNotify('Deleted', ..., 'SUCCESS')`). "Add new" button navigates to `/<domain>s/add-edit`.
- **`AddEdit<Domain>.tsx`** — single form for both create and edit, keyed by an optional `:id` route param. If `:id` is present, dispatch `fetch<Domain>ById` on mount and seed the form via `form.setValues(...)` once loaded; otherwise start from empty `initialValues`. On submit, dispatch `create<Domain>` or `update<Domain>` depending on whether `:id` is present, `try/catch` + `.unwrap()`, `toNotify` on both outcomes, then `navigate('/<domain>s')` on success.
- **`View<Domain>.tsx`** — read-only detail view, dispatches `fetch<Domain>ById` on mount, renders fields in a `Paper`/`Stack`. Only scaffold this file if the feature actually needs a distinct detail view beyond the edit form — many admin features don't.

## Route registration (`src/routes.tsx`)

```
/<domain>s                    → index.tsx
/<domain>s/add-edit           → AddEdit<Domain>.tsx (create)
/<domain>s/add-edit/:id       → AddEdit<Domain>.tsx (edit)
/<domain>s/view/:id           → View<Domain>.tsx   (only if scaffolded)
```

Use `/new-route` for the actual route wiring once these files exist.

## Rules

- List/add-edit/view are pages (default export), not shared components — they own their `useAppDispatch`/`useAppSelector` calls directly.
- Delete actions must confirm before dispatching (a Mantine `modals.openConfirmModal` or an inline confirm state) — never delete on a single click.
- Loading state during a mutation is local `useState<boolean>` on the page, not a slice-level flag (see the "Rules" section of `/new-slice`).
- Follow the theming convention in `CLAUDE.md`: no per-file `dark`/`light` token objects — style through Mantine props and `theme.ts`.
