# Graph Report - Frontend (2026-08-29)

## Corpus Check

- Corpus is ~12,647 words - fits in a single context window. You may not need a graph.

## Summary

- 313 nodes · 288 edges · 43 communities (26 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.79)
- Token cost: 0 input · 188,358 output

## Community Hubs (Navigation)

- Build & Lint Tooling
- Auth Store & Bootstrap
- Runtime Dependencies
- TS App Config
- Package Scripts & Metadata
- TS Node Config
- User Redux Slice
- Login & OTP Forms
- Theming & Docker Deploy
- App Shell & Layouts
- Icon Sprite Sheet
- Prettier Config
- User Form Component
- Vite Config & Client Log
- Auth Loader Checker
- Auth Token Storage
- Notification Hook
- Forgot Password Form
- Reset Password Form
- Notification Config
- Loader Component
- Users List Page
- Typed Redux Hooks
- Vite Env Types
- Root TS Config
- Dev Logo Branding
- Config File
- Deploy Script
- Deploy Bootstrap Script
- README Template Note
- Routes & Router
- API Base URL Util
- Identifier Field Gotcha
- Reset Token Gotcha
- Favicon Asset

## God Nodes (most connected - your core abstractions)

1. `compilerOptions` - 19 edges
2. `compilerOptions` - 15 edges
3. `scripts` - 8 edges
4. `/new-slice slash command` - 8 edges
5. `icons.svg (Icon Sprite Sheet)` - 6 edges
6. `Two-tier API layer (axiosInstance vs raw axios)` - 4 edges
7. `lint-staged` - 3 edges
8. `*.{ts,tsx}` - 3 edges
9. `App()` - 3 edges
10. `AppShell()` - 3 edges

## Surprising Connections (you probably didn't know these)

- `/new-slice slash command` --semantically_similar_to--> `Presentational form components convention` [INFERRED] [semantically similar]
  .claude/commands/new-slice.md → CLAUDE.md
- `/new-slice slash command` --references--> `ForgotPasswordPage()` [EXTRACTED]
  .claude/commands/new-slice.md → src/pages/ForgotPasswordPage.tsx
- `/new-slice slash command` --references--> `LoginPage()` [EXTRACTED]
  .claude/commands/new-slice.md → src/pages/LoginPage.tsx
- `/new-slice slash command` --references--> `authSlice` [EXTRACTED]
  .claude/commands/new-slice.md → src/store/authSlice/authSlice.ts
- `/new-slice slash command` --references--> `store` [EXTRACTED]
  .claude/commands/new-slice.md → src/store/store.ts

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Feature-scaffolding slash command workflow** — claude_commands_new_component_command, claude_commands_new_hook_command, claude_commands_new_page_command, claude_commands_new_route_command, claude_commands_new_slice_command [INFERRED 0.85]
- **Auth session bootstrap / loader flow** — claude_authloaderchecker, src_utils_authchecker_authloaderchecker, src_utils_authchecker_redirectifauthenticated, claude_access_token_memory_only, src_store_authslice_authslice_tokenrefresh [INFERRED 0.80]
- **API error handling and token-refresh retry flow** — src_interceptors_axiosinterceptor_axiosinstance, src_store_authslice_authslice_tokenrefresh, src_store_authslice_authslice_logout, src_utils_geterrormessage_geterrormessage [INFERRED 0.85]
- **Solid-fill brand/social platform logo icons (bluesky, discord, github, x)** — public_icons_svg_bluesky_icon, public_icons_svg_discord_icon, public_icons_svg_github_icon, public_icons_svg_x_icon [INFERRED 0.85]
- **Purple-stroke outline UI action icons (documentation, social/share)** — public_icons_svg_documentation_icon, public_icons_svg_social_icon [INFERRED 0.75]
- **All icon symbols defined within the icons.svg sprite sheet** — public_icons_svg, public_icons_svg_bluesky_icon, public_icons_svg_discord_icon, public_icons_svg_documentation_icon, public_icons_svg_github_icon, public_icons_svg_social_icon, public_icons_svg_x_icon [EXTRACTED 1.00]

## Communities (43 total, 17 thin omitted)

### Community 0 - "Build & Lint Tooling"

Cohesion: 0.04
Nodes (47): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, figlet, globals, husky (+39 more)

### Community 1 - "Auth Store & Bootstrap"

Cohesion: 0.06
Nodes (28): Access token kept in Redux memory only, never localStorage, Two-tier API layer (axiosInstance vs raw axios), /new-page slash command, /new-route slash command, /new-slice slash command, Two-zone routing architecture (logged-out vs protected), App(), axiosInstance (+20 more)

### Community 2 - "Runtime Dependencies"

Cohesion: 0.07
Nodes (29): axios, clsx, @mantine/core, mantine-datatable, @mantine/form, @mantine/hooks, @mantine/notifications, dependencies (+21 more)

### Community 3 - "TS App Config"

Cohesion: 0.08
Nodes (24): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+16 more)

### Community 4 - "Package Scripts & Metadata"

Cohesion: 0.11
Nodes (19): engines, node, lint-staged, *.{css,json,md}, *.{ts,tsx}, name, private, scripts (+11 more)

### Community 5 - "TS Node Config"

Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 6 - "User Redux Slice"

Cohesion: 0.15
Nodes (12): createUser, CreateUserPayload, deleteUser, fetchUserById, fetchUsers, FetchUsersParams, initialState, PagedUsersResponse (+4 more)

### Community 7 - "Login & OTP Forms"

Cohesion: 0.18
Nodes (9): /new-component slash command, Presentational form components convention, PinInput uncontrolled-incompatibility gotcha, LoginForm(), LoginFormProps, LoginFormValues, OtpForm(), OtpFormProps (+1 more)

### Community 8 - "Theming & Docker Deploy"

Cohesion: 0.25
Nodes (7): Centralized Mantine-only theming convention, app service (docker-compose.prod.yml), wijekoon-frontend:latest image, index.html entry document, Ubuntu Google Font, main.tsx entry (defaultColorScheme="auto"), theme

### Community 9 - "App Shell & Layouts"

Cohesion: 0.33
Nodes (5): Folder conventions table, AppShell(), NAV_ITEMS, AppLayout(), AuthLayout (tried and removed)

### Community 10 - "Icon Sprite Sheet"

Cohesion: 0.43
Nodes (7): icons.svg (Icon Sprite Sheet), Bluesky Icon (social brand mark), Discord Icon (social brand mark), Documentation Icon (open-book/doc outline glyph), GitHub Icon (social brand mark), Social/Share Icon (person + share glyph), X (Twitter) Icon (social brand mark)

### Community 11 - "Prettier Config"

Cohesion: 0.33
Nodes (5): printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 12 - "User Form Component"

Cohesion: 0.33
Nodes (4): EMPTY_VALUES, ROLE_OPTIONS, UserFormProps, UserFormValues

### Community 13 - "Vite Config & Client Log"

Cohesion: 0.47
Nodes (4): __dirname, logClientUp(), pkg, printClientBanner()

### Community 14 - "Auth Loader Checker"

Cohesion: 0.70
Nodes (4): One-auth-loader-on-parent-route pattern, AuthLoaderChecker(), redirectIfAuthenticated(), tryRehydrateSession()

### Community 15 - "Auth Token Storage"

Cohesion: 0.60
Nodes (3): clearStoredRefreshToken(), getStoredRefreshToken(), persistRefreshToken()

### Community 16 - "Notification Hook"

Cohesion: 0.50
Nodes (3): /new-hook slash command, toNotify-only notification convention, toNotify()

### Community 19 - "Notification Config"

Cohesion: 0.50
Nodes (3): NOTIFY_VISUALS, NotifyType, NotifyVisual

## Knowledge Gaps

- **156 isolated node(s):** `semi`, `singleQuote`, `printWidth`, `tabWidth`, `trailingComma` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Build & Lint Tooling` to `Package Scripts & Metadata`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Package Scripts & Metadata`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `/new-slice slash command` connect `Auth Store & Bootstrap` to `Login & OTP Forms`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `printWidth` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build & Lint Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Auth Store & Bootstrap` be split into smaller, more focused modules?**
  _Cohesion score 0.06031746031746032 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
