# Graph Report - Frontend (2026-10-04)

## Corpus Check

- 77 files · ~77,421 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 477 nodes · 437 edges · 67 communities (43 shown, 24 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `8230dc31`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- devDependencies
- authSlice.ts
- dependencies
- compilerOptions
- package.json
- compilerOptions
- FilterBar.tsx
- /new-component slash command
- index.html entry document
- Folder conventions table
- icons.svg (Icon Sprite Sheet)
- .prettierrc.json
- post-commit
- client-log.util.ts
- authChecker.ts
- authStorage.ts
- toNotify
- ForgotPasswordForm.tsx
- ResetPasswordForm.tsx
- notifyConfig.tsx
- Loader.tsx
- post-checkout
- hooks.ts
- vite-env.d.ts
- tsconfig.json
- Dev Environment Logo (X mark)
- config.ts
- deploy.sh
- bootstrap.sh
- Type-aware ESLint config recommendation
- DashboardPage.tsx
- PageHeader.tsx
- routes.tsx
- apiBaseUrl.ts
- identifier field accepts email or phone gotcha
- resetToken short-lived, page-state-only gotcha
- customers/index.tsx
- orders/index.tsx
- products/index.tsx
- sales/index.tsx
- suppliers/index.tsx
- roleSlice.ts
- productSlice.ts
- customerSlice.ts
- supplierSlice.ts
- userSlice.ts
- ProfilePage.tsx
- SKILL.md
- Build pattern, gotchas, and verification playbook
- Research checklist + standard scoping questions
- AddEditCustomerModal.tsx
- AddEditProductModal.tsx
- AddEditUserModal.tsx
- AddEditSupplierModal.tsx
- permissionSlice.ts
- permissionLabels.ts
- AddEditRolePage.tsx
- RolesPage.tsx
- datePreview.ts
- SettingsLayout.tsx
- UsersPage.tsx

## God Nodes (most connected - your core abstractions)

1. `compilerOptions` - 19 edges
2. `compilerOptions` - 15 edges
3. `scripts` - 8 edges
4. `/new-slice slash command` - 8 edges
5. `icons.svg (Icon Sprite Sheet)` - 6 edges
6. `Build pattern, gotchas, and verification playbook` - 5 edges
7. `Research checklist + standard scoping questions` - 5 edges
8. `FilterBar()` - 4 edges
9. `Two-tier API layer (axiosInstance vs raw axios)` - 4 edges
10. `AppShell()` - 3 edges

## Surprising Connections (you probably didn't know these)

- `/new-slice slash command` --semantically_similar_to--> `Presentational form components convention` [INFERRED] [semantically similar]
  .claude/commands/new-slice.md → CLAUDE.md
- `/new-slice slash command` --references--> `ForgotPasswordPage()` [EXTRACTED]
  .claude/commands/new-slice.md → src/pages/ForgotPasswordPage.tsx
- `/new-slice slash command` --references--> `LoginPage()` [EXTRACTED]
  .claude/commands/new-slice.md → src/pages/LoginPage.tsx
- `/new-slice slash command` --references--> `getErrorMessage()` [EXTRACTED]
  .claude/commands/new-slice.md → src/utils/getErrorMessage.ts
- `/new-slice slash command` --references--> `authSlice` [EXTRACTED]
  .claude/commands/new-slice.md → src/store/authSlice/authSlice.ts

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **All icon symbols defined within the icons.svg sprite sheet** — public_icons_svg, public_icons_svg_bluesky_icon, public_icons_svg_discord_icon, public_icons_svg_documentation_icon, public_icons_svg_github_icon, public_icons_svg_social_icon, public_icons_svg_x_icon [EXTRACTED 1.00]
- **Purple-stroke outline UI action icons (documentation, social/share)** — public_icons_svg_documentation_icon, public_icons_svg_social_icon [INFERRED 0.75]
- **Auth session bootstrap / loader flow** — claude_authloaderchecker, src_utils_authchecker_authloaderchecker, src_utils_authchecker_redirectifauthenticated, claude_access_token_memory_only, src_store_authslice_authslice_tokenrefresh [INFERRED 0.80]
- **API error handling and token-refresh retry flow** — src_interceptors_axiosinterceptor_axiosinstance, src_store_authslice_authslice_tokenrefresh, src_store_authslice_authslice_logout, src_utils_geterrormessage_geterrormessage [INFERRED 0.85]
- **Solid-fill brand/social platform logo icons (bluesky, discord, github, x)** — public_icons_svg_bluesky_icon, public_icons_svg_discord_icon, public_icons_svg_github_icon, public_icons_svg_x_icon [INFERRED 0.85]
- **Feature-scaffolding slash command workflow** — claude_commands_new_component_command, claude_commands_new_hook_command, claude_commands_new_page_command, claude_commands_new_route_command, claude_commands_new_slice_command [INFERRED 0.85]

## Communities (67 total, 24 thin omitted)

### Community 0 - "devDependencies"

Cohesion: 0.04
Nodes (47): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, figlet, globals, husky (+39 more)

### Community 1 - "authSlice.ts"

Cohesion: 0.06
Nodes (30): Access token kept in Redux memory only, never localStorage, Two-tier API layer (axiosInstance vs raw axios), /new-page slash command, /new-route slash command, /new-slice slash command, Two-zone routing architecture (logged-out vs protected), App(), axiosInstance (+22 more)

### Community 2 - "dependencies"

Cohesion: 0.06
Nodes (33): axios, clsx, dayjs, @mantine/core, mantine-datatable, @mantine/dates, @mantine/form, @mantine/hooks (+25 more)

### Community 3 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+16 more)

### Community 4 - "package.json"

Cohesion: 0.11
Nodes (19): engines, node, lint-staged, *.{css,json,md}, *.{ts,tsx}, name, private, scripts (+11 more)

### Community 5 - "compilerOptions"

Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 6 - "FilterBar.tsx"

Cohesion: 0.27
Nodes (9): defaultIconFor(), DraftState, DraftValue, emptyValueFor(), FilterBar(), FilterFieldConfig, Props, readDraftFromParams() (+1 more)

### Community 7 - "/new-component slash command"

Cohesion: 0.18
Nodes (9): /new-component slash command, Presentational form components convention, PinInput uncontrolled-incompatibility gotcha, LoginForm(), LoginFormProps, LoginFormValues, OtpForm(), OtpFormProps (+1 more)

### Community 8 - "index.html entry document"

Cohesion: 0.25
Nodes (7): Centralized Mantine-only theming convention, app service (docker-compose.prod.yml), wijekoon-frontend:latest image, index.html entry document, Ubuntu Google Font, main.tsx entry (defaultColorScheme="auto"), theme

### Community 9 - "Folder conventions table"

Cohesion: 0.29
Nodes (6): Folder conventions table, AppShell(), NAV_ITEMS, SETTINGS_ITEM, AppLayout(), AuthLayout (tried and removed)

### Community 10 - "icons.svg (Icon Sprite Sheet)"

Cohesion: 0.43
Nodes (7): icons.svg (Icon Sprite Sheet), Bluesky Icon (social brand mark), Discord Icon (social brand mark), Documentation Icon (open-book/doc outline glyph), GitHub Icon (social brand mark), Social/Share Icon (person + share glyph), X (Twitter) Icon (social brand mark)

### Community 11 - ".prettierrc.json"

Cohesion: 0.33
Nodes (5): printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 12 - "post-commit"

Cohesion: 0.40
Nodes (4): post-commit script, GRAPHIFY_CHANGED, GRAPHIFY_REBUILD_LOG, PYTHONHASHSEED

### Community 13 - "client-log.util.ts"

Cohesion: 0.47
Nodes (4): __dirname, logClientUp(), pkg, printClientBanner()

### Community 14 - "authChecker.ts"

Cohesion: 0.70
Nodes (4): One-auth-loader-on-parent-route pattern, AuthLoaderChecker(), redirectIfAuthenticated(), tryRehydrateSession()

### Community 15 - "authStorage.ts"

Cohesion: 0.60
Nodes (3): clearStoredRefreshToken(), getStoredRefreshToken(), persistRefreshToken()

### Community 16 - "toNotify"

Cohesion: 0.50
Nodes (3): /new-hook slash command, toNotify-only notification convention, toNotify()

### Community 19 - "notifyConfig.tsx"

Cohesion: 0.50
Nodes (3): NOTIFY_VISUALS, NotifyType, NotifyVisual

### Community 21 - "post-checkout"

Cohesion: 0.50
Nodes (3): post-checkout script, GRAPHIFY_REBUILD_LOG, PYTHONHASHSEED

### Community 47 - "roleSlice.ts"

Cohesion: 0.13
Nodes (14): createRole, deleteRole, fetchRoleById, fetchRoles, initialState, PagedRolesParams, PagedRolesResponse, Permission (+6 more)

### Community 48 - "productSlice.ts"

Cohesion: 0.15
Nodes (12): createProduct, deleteProduct, fetchProducts, initialState, PagedProductsParams, PagedProductsResponse, Product, PRODUCT_UNITS (+4 more)

### Community 49 - "customerSlice.ts"

Cohesion: 0.18
Nodes (10): createCustomer, Customer, customerSlice, CustomerState, deleteCustomer, fetchCustomers, initialState, PagedCustomersParams (+2 more)

### Community 50 - "supplierSlice.ts"

Cohesion: 0.18
Nodes (10): createSupplier, deleteSupplier, fetchSuppliers, initialState, PagedSuppliersParams, PagedSuppliersResponse, Supplier, supplierSlice (+2 more)

### Community 51 - "userSlice.ts"

Cohesion: 0.18
Nodes (10): createUser, deleteUser, fetchUsers, initialState, PagedUsersParams, PagedUsersResponse, updateUser, User (+2 more)

### Community 52 - "ProfilePage.tsx"

Cohesion: 0.22
Nodes (6): AVATAR_SEEDS, AvatarPickerModal(), avatarUrl(), ModalProps, PasswordFormValues, ProfileFormValues

### Community 53 - "SKILL.md"

Cohesion: 0.25
Nodes (7): Phase 1: Research the target app first, Phase 2: Surface scope decisions before building, Phase 3: Design the plan, Phase 4: Build phase by phase, Phase 5: Verify for real, not just "it compiles", Phase 6: Deploy, if asked, Reference files

### Community 54 - "Build pattern, gotchas, and verification playbook"

Cohesion: 0.33
Nodes (5): Backend admin-module skeleton, Build pattern, gotchas, and verification playbook, Frontend skeleton, Gotchas, Verification playbook

### Community 55 - "Research checklist + standard scoping questions"

Cohesion: 0.33
Nodes (5): Finding and evaluating sibling reference templates, Research checklist + standard scoping questions, Standard scoping questions to ask (via AskUserQuestion), What to read in the backend, What to read in the frontend/mobile app

### Community 56 - "AddEditCustomerModal.tsx"

Cohesion: 0.33
Nodes (3): CustomerFormValues, FormProps, Props

### Community 57 - "AddEditProductModal.tsx"

Cohesion: 0.33
Nodes (3): FormProps, ProductFormValues, Props

### Community 58 - "AddEditUserModal.tsx"

Cohesion: 0.33
Nodes (3): FormProps, Props, UserFormValues

### Community 59 - "AddEditSupplierModal.tsx"

Cohesion: 0.33
Nodes (3): FormProps, Props, SupplierFormValues

### Community 60 - "permissionSlice.ts"

Cohesion: 0.33
Nodes (5): fetchPermissions, initialState, Permission, permissionSlice, PermissionState

### Community 61 - "permissionLabels.ts"

Cohesion: 0.50
Nodes (4): formatModuleLabel(), formatPermissionKey(), PERMISSION_ACTION_LABELS, PERMISSION_ACTION_ORDER

### Community 62 - "AddEditRolePage.tsx"

Cohesion: 0.67
Nodes (3): AddEditRolePage(), findPermission(), RoleFormValues

### Community 63 - "RolesPage.tsx"

Cohesion: 0.67
Nodes (3): FILTER_FIELDS, groupPermissionsByModule(), RolesPage()

### Community 64 - "datePreview.ts"

Cohesion: 0.83
Nodes (3): datePreview(), formatTime(), isSameDay()

## Knowledge Gaps

- **253 isolated node(s):** `NAV_ITEMS`, `SETTINGS_ITEM`, `STAT_CARDS`, `FILTER_FIELDS`, `AVATAR_SEEDS` (+248 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `/new-slice slash command` connect `authSlice.ts` to `/new-component slash command`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `NAV_ITEMS`, `SETTINGS_ITEM`, `STAT_CARDS` to the rest of the system?**
  _253 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `authSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05689900426742532 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
