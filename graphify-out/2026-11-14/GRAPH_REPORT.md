# Graph Report - Frontend (2026-11-14)

## Corpus Check

- 78 files · ~26,076 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 7, .conf 2, .css 1)

## Summary

- 484 nodes · 1149 edges · 34 communities (22 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `e5bc0841`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- eslint.config.js
- authSlice.ts
- dependencies
- compilerOptions
- scripts
- compilerOptions
- routes.tsx
- react-router-dom
- index.html entry document
- app
- icons.svg (Icon Sprite Sheet)
- .prettierrc.json
- client-log.util.ts
- package.json
- lint-staged
- vite-env.d.ts
- tsconfig.json
- Dev Environment Logo (X mark)
- config.ts
- deploy.sh
- bootstrap.sh
- Type-aware ESLint config recommendation
- getErrorMessage
- productSlice.ts
- suppliers/index.tsx
- customers/index.tsx
- SKILL.md
- Build pattern, gotchas, and verification playbook
- Research checklist + standard scoping questions

## God Nodes (most connected - your core abstractions)

1. `getErrorMessage()` - 42 edges
2. `toNotify()` - 37 edges
3. `useAppDispatch` - 37 edges
4. `@mantine/core` - 29 edges
5. `useAppSelector` - 25 edges
6. `react` - 23 edges
7. `react-router-dom` - 23 edges
8. `PageHeader()` - 23 edges
9. `compilerOptions` - 19 edges
10. `@tabler/icons-react` - 18 edges

## Surprising Connections (you probably didn't know these)

- `/new-slice slash command` --semantically_similar_to--> `Presentational form components convention` [INFERRED] [semantically similar]
  .claude/commands/new-slice.md → CLAUDE.md
- `Presentational form components convention` --semantically_similar_to--> `/new-component slash command` [INFERRED] [semantically similar]
  CLAUDE.md → .claude/commands/new-component.md
- `PinInput uncontrolled-incompatibility gotcha` --references--> `OtpForm()` [EXTRACTED]
  CLAUDE.md → src/components/OtpForm.tsx
- `/new-hook slash command` --references--> `toNotify()` [EXTRACTED]
  .claude/commands/new-hook.md → src/hooks/toNotify.tsx
- `toNotify-only notification convention` --references--> `toNotify()` [EXTRACTED]
  CLAUDE.md → src/hooks/toNotify.tsx

## Import Cycles

- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/supplierSlice/supplierSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/customerSlice/customerSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/permissionSlice/permissionSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/productSlice/productSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/roleSlice/roleSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/userSlice/userSlice.ts -> src/interceptors/axiosInterceptor.ts`

## Hyperedges (group relationships)

- **All icon symbols defined within the icons.svg sprite sheet** — public_icons_svg, public_icons_svg_bluesky_icon, public_icons_svg_discord_icon, public_icons_svg_documentation_icon, public_icons_svg_github_icon, public_icons_svg_social_icon, public_icons_svg_x_icon [EXTRACTED 1.00]
- **Purple-stroke outline UI action icons (documentation, social/share)** — public_icons_svg_documentation_icon, public_icons_svg_social_icon [INFERRED 0.75]
- **Auth session bootstrap / loader flow** — claude_authloaderchecker, src_utils_authchecker_authloaderchecker, src_utils_authchecker_redirectifauthenticated, claude_access_token_memory_only, src_store_authslice_authslice_tokenrefresh [INFERRED 0.80]
- **API error handling and token-refresh retry flow** — src_interceptors_axiosinterceptor_axiosinstance, src_store_authslice_authslice_tokenrefresh, src_store_authslice_authslice_logout, src_utils_geterrormessage_geterrormessage [INFERRED 0.85]
- **Solid-fill brand/social platform logo icons (bluesky, discord, github, x)** — public_icons_svg_bluesky_icon, public_icons_svg_discord_icon, public_icons_svg_github_icon, public_icons_svg_x_icon [INFERRED 0.85]
- **Feature-scaffolding slash command workflow** — claude_commands_new_component_command, claude_commands_new_hook_command, claude_commands_new_page_command, claude_commands_new_route_command, claude_commands_new_slice_command [INFERRED 0.85]

## Communities (34 total, 12 thin omitted)

### Community 0 - "eslint.config.js"

Cohesion: 0.13
Nodes (14): eslint@^10.8.0, eslint-config-prettier@^10.1.8, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.3, globals@^17.7.0, typescript-eslint@^8.65.0, eslint (+6 more)

### Community 1 - "authSlice.ts"

Cohesion: 0.10
Nodes (26): /new-page slash command, /new-route slash command, /new-slice slash command, axios@^1.19.0, axios, App(), axiosInstance, RetryableRequestConfig (+18 more)

### Community 2 - "dependencies"

Cohesion: 0.09
Nodes (23): dependencies, clsx@^2.1.1, dayjs@^1.11.23, @mantine/core@^9.5.0, mantine-datatable@^9.4.0, @mantine/dates@^9.5.0, @mantine/hooks@^9.5.0, @mantine/notifications@^9.5.0 (+15 more)

### Community 3 - "compilerOptions"

Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 4 - "scripts"

Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, prepare, preview

### Community 5 - "compilerOptions"

Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 6 - "routes.tsx"

Cohesion: 0.09
Nodes (36): Folder conventions table, @tabler/icons-react@^3.46.0, @mantine/core, @tabler/icons-react, AppShell(), NAV_ITEMS, SETTINGS_ITEM, defaultIconFor() (+28 more)

### Community 7 - "react-router-dom"

Cohesion: 0.13
Nodes (20): /new-component slash command, @mantine/form@^9.5.1, @mantine/form, react-router-dom, ForgotPasswordForm(), ForgotPasswordFormProps, ForgotPasswordFormValues, LoginForm() (+12 more)

### Community 8 - "index.html entry document"

Cohesion: 0.33
Nodes (5): app service (docker-compose.prod.yml), wijekoon-frontend:latest image, index.html entry document, Ubuntu Google Font, main.tsx entry (defaultColorScheme="auto")

### Community 9 - "app"

Cohesion: 0.20
Nodes (9): build, container_name, image, ports, restart, context, dockerfile, services (+1 more)

### Community 10 - "icons.svg (Icon Sprite Sheet)"

Cohesion: 0.43
Nodes (7): icons.svg (Icon Sprite Sheet), Bluesky Icon (social brand mark), Discord Icon (social brand mark), Documentation Icon (open-book/doc outline glyph), GitHub Icon (social brand mark), Social/Share Icon (person + share glyph), X (Twitter) Icon (social brand mark)

### Community 11 - ".prettierrc.json"

Cohesion: 0.33
Nodes (5): printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 13 - "client-log.util.ts"

Cohesion: 0.16
Nodes (10): figlet@^1.11.4, vite@^8.2.0, @vitejs/plugin-react@^6.0.4, figlet, vite, @vitejs/plugin-react, __dirname, logClientUp() (+2 more)

### Community 16 - "package.json"

Cohesion: 0.08
Nodes (33): devDependencies, husky@^9.1.7, lint-staged@^16.4.0, postcss@^8.5.25, postcss-preset-mantine@^1.18.0, postcss-simple-vars@^7.0.1, prettier@^3.9.6, tailwindcss@^4.3.3 (+25 more)

### Community 22 - "lint-staged"

Cohesion: 0.67
Nodes (3): lint-staged, *.{css,json,md}, *.{ts,tsx}

### Community 47 - "getErrorMessage"

Cohesion: 0.08
Nodes (46): @reduxjs/toolkit@^2.12.0, @reduxjs/toolkit, AddEditRolePage(), findPermission(), RoleFormValues, AddEditUserForm(), AddEditUserModal(), FormProps (+38 more)

### Community 48 - "productSlice.ts"

Cohesion: 0.17
Nodes (19): AddEditProductForm(), AddEditProductModal(), FormProps, ProductFormValues, Props, ProductsPage(), STATIC_FILTER_FIELDS, createProduct (+11 more)

### Community 50 - "suppliers/index.tsx"

Cohesion: 0.16
Nodes (19): AddEditSupplierForm(), AddEditSupplierModal(), FormProps, Props, SupplierFormValues, FILTER_FIELDS, SuppliersPage(), createSupplier (+11 more)

### Community 52 - "customers/index.tsx"

Cohesion: 0.09
Nodes (44): /new-hook slash command, react, ResetPasswordForm(), ResetPasswordFormProps, ResetPasswordFormValues, NOTIFY_VISUALS, NotifyType, NotifyVisual (+36 more)

### Community 53 - "SKILL.md"

Cohesion: 0.25
Nodes (7): Phase 1: Research the target app first, Phase 2: Surface scope decisions before building, Phase 3: Design the plan, Phase 4: Build phase by phase, Phase 5: Verify for real, not just "it compiles", Phase 6: Deploy, if asked, Reference files

### Community 54 - "Build pattern, gotchas, and verification playbook"

Cohesion: 0.33
Nodes (5): Backend admin-module skeleton, Build pattern, gotchas, and verification playbook, Frontend skeleton, Gotchas, Verification playbook

### Community 55 - "Research checklist + standard scoping questions"

Cohesion: 0.33
Nodes (5): Finding and evaluating sibling reference templates, Research checklist + standard scoping questions, Standard scoping questions to ask (via AskUserQuestion), What to read in the backend, What to read in the frontend/mobile app

## Knowledge Gaps

- **8 isolated node(s):** `App Branding / Logo Identity`, `Dev Environment Logo (X mark)`, `Type-aware ESLint config recommendation`, `React + TypeScript + Vite template doc`, `/new-hook slash command` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 187 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `@mantine/core` connect `routes.tsx` to `dependencies`, `react-router-dom`, `getErrorMessage`, `package.json`, `productSlice.ts`, `suppliers/index.tsx`, `customers/index.tsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **What connects `App Branding / Logo Identity`, `Dev Environment Logo (X mark)`, `Type-aware ESLint config recommendation` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `eslint.config.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Why does `@reduxjs/toolkit` connect `getErrorMessage` to `authSlice.ts`, `package.json`, `productSlice.ts`, `suppliers/index.tsx`, `customers/index.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `authSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09957325746799431 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `react-router-dom` to `authSlice.ts`, `dependencies`, `routes.tsx`, `getErrorMessage`, `package.json`, `productSlice.ts`, `suppliers/index.tsx`, `customers/index.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09230769230769231 - nodes in this community are weakly interconnected._
