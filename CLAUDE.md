# Wijekoon Enterprises — Admin Frontend

React 19 + TypeScript + Vite admin panel, styled with Mantine (Tailwind v4 utilities used sparingly on top, preflight disabled).

## Commands

```
npm run dev      # vite --mode dev
npm run build    # tsc -b && vite build --mode prod
npm run lint      # eslint .
npm run format    # prettier --write .
```

Node **>=22** is required (see `engines` in package.json) — the installed Vite/Rolldown build needs `node:util`'s `styleText` export, which doesn't exist before Node 20, and this repo's `.nvmrc`/engines target 22.

## Environment

`.env.dev` / `.env.prod` define `BASE_URL` (e.g. `http://localhost:3000`). `vite.config.ts` deliberately re-exposes it as `import.meta.env.APP_BASE_URL` (not the standard `VITE_` prefix) because `BASE_URL` collides with Vite's own reserved `import.meta.env.BASE_URL`. All API calls build off `src/utils/apiBaseUrl.ts`'s `API_BASE_URL = ${APP_BASE_URL}/api/v1` — never read `import.meta.env.APP_BASE_URL` directly in a slice/component.

## Architecture

Single admin app with a two-zone split: logged-out (`/login`, `/forgot-password`) and protected (`/app/*`, currently just `/app/dashboard`). Following the reference pattern, there is **one auth-loader on the parent route only** — `AuthLoaderChecker` (`src/utils/authChecker.ts`) on `/app`, checking `store.getState().auth.user` — not on every child route. `/login` has the inverse loader (`redirectIfAuthenticated`) that bounces an already-signed-in user to `/app/dashboard`.

Known limitation: the access token is memory-only (see below), and there's no "current user" endpoint in the Auth API to re-hydrate `state.auth.user` from just the refresh token. So a hard page reload on `/app/*` currently drops the session and redirects to `/login`, even though a valid refresh token still sits in `localStorage`. Revisit this once a session/"me" endpoint exists.

### Routing (`src/routes.tsx`)

React Router v7, `createBrowserRouter`, plain static imports. Switch to `React.lazy` + a single `<Suspense>` boundary in `App.tsx` once the route count grows past ~6 routes — not before, it's unnecessary overhead for a handful of screens.

### State (Redux Toolkit)

One slice per domain in `src/store/<domain>Slice/<domain>Slice.ts`, combined in `src/store/store.ts`. Always use the typed hooks from `src/store/hooks.ts` (`useAppDispatch`, `useAppSelector`) — never the raw `react-redux` hooks directly. See `/new-slice` for the thunk template.

### API layer — two tiers, don't mix them up

- **`src/interceptors/axiosInterceptor.ts`** exports `axiosInstance` — for **Bearer-protected** endpoints only. Its request interceptor attaches `Authorization` from `store.getState().auth.accessToken`. Its response interceptor retries once on 401/403 by dispatching `tokenRefresh()`, and force-logs-out (`logOut()`) if that also fails.
- **Unauthenticated** endpoints (login, refresh, forgot/verify/reset-password) call the API with plain `axios` directly inside the thunk — there's no token yet for `axiosInstance` to attach, and pointing them at `axiosInstance` would recurse into the refresh logic pointlessly.

**Access token lives in Redux memory state only — never localStorage.** This is a deliberate backend constraint (see the Auth API notes: the API doesn't set an httpOnly refresh cookie, so `REFRESH_TOKEN` is the one thing that falls back to `localStorage`; the access token is not persisted at all and is simply re-fetched via `tokenRefresh` after a reload once a protected zone exists to bootstrap into).

Every thunk's catch block returns `rejectWithValue(getErrorMessage(error))` (`src/utils/getErrorMessage.ts`) — it uniformly extracts the backend's `{ message }` shape (all API errors use this shape) with a sensible fallback. Don't hand-roll error-message extraction per thunk.

### Notifications

`src/hooks/toNotify.tsx` wraps `@mantine/notifications`. Signature: `toNotify(title, message, type)` where `type` is `'SUCCESS' | 'ERROR' | 'WARNING' | 'LOADING'`. **Always call `toNotify`, never `notifications.show` directly** — it's the one place styling/icons/auto-close per type are defined.

### Forms

`@mantine/form`'s `useForm` with an inline `validate` object (no Yup/Zod). Pages own submission (dispatch a thunk, `try/catch` + `.unwrap()`, local `useState<boolean>` for loading) and pass `onSubmit`/`loading` down. **Form components stay presentational** — they validate and call `onSubmit(values)`; they never call `axiosInstance` or `dispatch` directly. See `/new-component`.

### Theming

`src/theme.ts` — Mantine only. `primaryColor: 'gray'`, `defaultRadius: 'md'`, Ubuntu font. Rely on Mantine's own color-scheme handling (`defaultColorScheme="auto"` in `main.tsx`) — don't introduce the "define a `dark`/`light` const object per file and switch manually" pattern; centralize any new tokens in `theme.ts` instead.

## Folder conventions

| Path                                       | Contents                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `src/pages/`                               | Route-level `*Page.tsx`, default export                                                     |
| `src/components/`                          | Shared, presentational, named export, explicit `Props` type                                 |
| `src/layouts/`                             | Shared page chrome (currently unused — see note below)                                      |
| `src/store/<domain>Slice/`                 | One Redux slice per domain                                                                  |
| `src/store/store.ts`, `src/store/hooks.ts` | Store setup + typed hooks                                                                   |
| `src/interceptors/`                        | `axiosInstance` + interceptors                                                              |
| `src/hooks/`                               | Cross-cutting hooks (e.g. `toNotify`), `.tsx` even without JSX-heavy logic, for consistency |
| `src/utils/`                               | Small stateless helpers (`getErrorMessage`, `apiBaseUrl`)                                   |

Path alias `@/` → `./src` (both `vite.config.ts` and `tsconfig.app.json`).

`src/layouts/AuthLayout.tsx` was tried and removed — the login/forgot-password screens render their `Center`/`Container`/`Paper` card inline instead, with the title/subtitle inside the card. `src/layouts/AppLayout.tsx` is a thin wrapper that just renders `src/components/AppShell.tsx` (header + collapsible navbar + `<Outlet/>`, adapted from the reference project's `BasicAppShell.tsx` — trimmed to this project's own nav items and Mantine's own color-scheme handling instead of per-file dark/light token objects).

## Gotchas

- `PinInput` (used in the OTP screen) isn't `@mantine/form` uncontrolled-compatible and its `error` prop is a `boolean`, not a message string — use `mode: 'controlled'` and render the validation message in a separate `<Text>`.
- The Auth API's `identifier` field accepts email **or** phone — don't validate it as a strict email format.
- `resetToken` (from `/auth/verify-otp`) is short-lived and single-purpose — keep it in page-level React state only, never `localStorage`/`sessionStorage`, and never a URL param.
