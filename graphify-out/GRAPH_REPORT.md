# Graph Report - Frontend (2026-11-21)

## Corpus Check

- 114 files · ~36,407 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 7, .conf 2, .css 1)

## Summary

- 641 nodes · 1908 edges · 36 communities (23 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `9a4b1f6f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- package.json
- authSlice.ts
- dependencies
- compilerOptions
- scripts
- compilerOptions
- react
- main.tsx
- index.html entry document
- app
- icons.svg (Icon Sprite Sheet)
- .prettierrc.json
- client-log.util.ts
- lint-staged
- engines
- vite-env.d.ts
- tsconfig.json
- Dev Environment Logo (X mark)
- config.ts
- deploy.sh
- bootstrap.sh
- Type-aware ESLint config recommendation
- CustomerDetailPage.tsx
- eslint.config.js
- AddEditRolePage.tsx
- getErrorMessage
- useAppDispatch
- SKILL.md
- Build pattern, gotchas, and verification playbook
- Research checklist + standard scoping questions
- @mantine/core

## God Nodes (most connected - your core abstractions)

1. `@mantine/core` - 56 edges
2. `getErrorMessage()` - 54 edges
3. `react` - 48 edges
4. `useAppDispatch` - 45 edges
5. `@tabler/icons-react` - 39 edges
6. `toNotify()` - 33 edges
7. `react-router-dom` - 31 edges
8. `useAppSelector` - 29 edges
9. `CustomerDetailPage()` - 24 edges
10. `ListPage()` - 23 edges

## Surprising Connections (you probably didn't know these)

- `/new-slice slash command` --semantically_similar_to--> `Presentational form components convention` [INFERRED] [semantically similar]
  .claude/commands/new-slice.md → CLAUDE.md
- `Presentational form components convention` --semantically_similar_to--> `/new-component slash command` [INFERRED] [semantically similar]
  CLAUDE.md → .claude/commands/new-component.md
- `/new-route slash command` --references--> `App()` [EXTRACTED]
  .claude/commands/new-route.md → src/App.tsx
- `PinInput uncontrolled-incompatibility gotcha` --references--> `OtpForm()` [EXTRACTED]
  CLAUDE.md → src/components/OtpForm.tsx
- `/new-hook slash command` --references--> `toNotify()` [EXTRACTED]
  .claude/commands/new-hook.md → src/hooks/toNotify.tsx

## Import Cycles

- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/supplierSlice/supplierSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/chequeSlice/chequeSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/customerSlice/customerSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/permissionSlice/permissionSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/productSlice/productSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/roleSlice/roleSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/saleSlice/saleSlice.ts -> src/interceptors/axiosInterceptor.ts`
- 3-file cycle: `src/interceptors/axiosInterceptor.ts -> src/store/store.ts -> src/store/userSlice/userSlice.ts -> src/interceptors/axiosInterceptor.ts`

## Hyperedges (group relationships)

- **All icon symbols defined within the icons.svg sprite sheet** — public_icons_svg, public_icons_svg_bluesky_icon, public_icons_svg_discord_icon, public_icons_svg_documentation_icon, public_icons_svg_github_icon, public_icons_svg_social_icon, public_icons_svg_x_icon [EXTRACTED 1.00]
- **Purple-stroke outline UI action icons (documentation, social/share)** — public_icons_svg_documentation_icon, public_icons_svg_social_icon [INFERRED 0.75]
- **Auth session bootstrap / loader flow** — claude_authloaderchecker, src_utils_authchecker_authloaderchecker, src_utils_authchecker_redirectifauthenticated, claude_access_token_memory_only, src_store_authslice_authslice_tokenrefresh [INFERRED 0.80]
- **API error handling and token-refresh retry flow** — src_interceptors_axiosinterceptor_axiosinstance, src_store_authslice_authslice_tokenrefresh, src_store_authslice_authslice_logout, src_utils_geterrormessage_geterrormessage [INFERRED 0.85]
- **Solid-fill brand/social platform logo icons (bluesky, discord, github, x)** — public_icons_svg_bluesky_icon, public_icons_svg_discord_icon, public_icons_svg_github_icon, public_icons_svg_x_icon [INFERRED 0.85]
- **Feature-scaffolding slash command workflow** — claude_commands_new_component_command, claude_commands_new_hook_command, claude_commands_new_page_command, claude_commands_new_route_command, claude_commands_new_slice_command [INFERRED 0.85]

## Communities (36 total, 13 thin omitted)

### Community 0 - "package.json"

Cohesion: 0.09
Nodes (29): devDependencies, husky@^9.1.7, lint-staged@^16.4.0, postcss@^8.5.25, postcss-preset-mantine@^1.18.0, postcss-simple-vars@^7.0.1, prettier@^3.9.6, @types/figlet@^1.7.0 (+21 more)

### Community 1 - "authSlice.ts"

Cohesion: 0.11
Nodes (22): /new-page slash command, /new-route slash command, /new-slice slash command, axios@^1.19.0, axios, RetryableRequestConfig, Admin, authSlice (+14 more)

### Community 2 - "dependencies"

Cohesion: 0.09
Nodes (22): dependencies, clsx@^2.1.1, dayjs@^1.11.23, @fontsource/ibm-plex-mono@^5.3.0, @fontsource/ibm-plex-sans@^5.3.0, leaflet@^1.9.4, @mantine/core@^9.5.0, @mantine/dates@^9.5.0 (+14 more)

### Community 3 - "compilerOptions"

Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 4 - "scripts"

Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, prepare, preview

### Community 5 - "compilerOptions"

Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 6 - "react"

Cohesion: 0.11
Nodes (25): @mantine/hooks, react, ConfirmDialog(), Props, Column, Props, DeleteConfig, LoadParams (+17 more)

### Community 7 - "main.tsx"

Cohesion: 0.13
Nodes (15): @fontsource/noto-sans-sinhala@^5.3.0, @fontsource/noto-sans-tamil@^5.3.0, react-redux@^9.3.0, @fontsource/noto-sans-sinhala, @fontsource/noto-sans-tamil, @mantine/dates, react-redux, App() (+7 more)

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

### Community 14 - "lint-staged"

Cohesion: 0.67
Nodes (3): lint-staged, *.{css,json,md}, *.{ts,tsx}

### Community 32 - "CustomerDetailPage.tsx"

Cohesion: 0.08
Nodes (59): DataTable(), ListPage(), DetailList(), Row, EmptyState(), Props, InlineAlert(), Props (+51 more)

### Community 40 - "eslint.config.js"

Cohesion: 0.13
Nodes (14): eslint@^10.8.0, eslint-config-prettier@^10.1.8, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.3, globals@^17.7.0, typescript-eslint@^8.65.0, eslint (+6 more)

### Community 47 - "AddEditRolePage.tsx"

Cohesion: 0.11
Nodes (29): DetailDialog(), AddEditRolePage(), findPermission(), RoleFormValues, FILTERS, groupPermissionsByModule(), RolesPage(), fetchPermissions (+21 more)

### Community 48 - "getErrorMessage"

Cohesion: 0.06
Nodes (73): @reduxjs/toolkit@^2.12.0, @reduxjs/toolkit, Field(), LocationMap(), Props, StatusSection(), useActiveToggle(), AddEditCustomerModal() (+65 more)

### Community 52 - "useAppDispatch"

Cohesion: 0.10
Nodes (47): /new-hook slash command, @mantine/notifications@^9.5.0, @mantine/form, @mantine/notifications, FormModal(), icon(), NOTIFY_VISUALS, NotifyType (+39 more)

### Community 53 - "SKILL.md"

Cohesion: 0.25
Nodes (7): Phase 1: Research the target app first, Phase 2: Surface scope decisions before building, Phase 3: Design the plan, Phase 4: Build phase by phase, Phase 5: Verify for real, not just "it compiles", Phase 6: Deploy, if asked, Reference files

### Community 54 - "Build pattern, gotchas, and verification playbook"

Cohesion: 0.33
Nodes (5): Backend admin-module skeleton, Build pattern, gotchas, and verification playbook, Frontend skeleton, Gotchas, Verification playbook

### Community 55 - "Research checklist + standard scoping questions"

Cohesion: 0.33
Nodes (5): Finding and evaluating sibling reference templates, Research checklist + standard scoping questions, Standard scoping questions to ask (via AskUserQuestion), What to read in the backend, What to read in the frontend/mobile app

### Community 65 - "@mantine/core"

Cohesion: 0.06
Nodes (64): /new-component slash command, Folder conventions table, @mantine/core, react-router-dom, @tabler/icons-react, AppShell(), NAV_SECTIONS, AuthFormShell() (+56 more)

## Knowledge Gaps

- **8 isolated node(s):** `/new-hook slash command`, `App Branding / Logo Identity`, `Dev Environment Logo (X mark)`, `Type-aware ESLint config recommendation`, `React + TypeScript + Vite template doc` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 237 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `@mantine/core` connect `@mantine/core` to `package.json`, `CustomerDetailPage.tsx`, `dependencies`, `react`, `main.tsx`, `AddEditRolePage.tsx`, `getErrorMessage`, `useAppDispatch`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **What connects `/new-hook slash command`, `App Branding / Logo Identity`, `Dev Environment Logo (X mark)` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09425287356321839 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `package.json`, `@mantine/core`, `dependencies`, `CustomerDetailPage.tsx`, `main.tsx`, `AddEditRolePage.tsx`, `getErrorMessage`, `useAppDispatch`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `authSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11491935483870967 - nodes in this community are weakly interconnected._
- **Why does `@tabler/icons-react` connect `@mantine/core` to `package.json`, `CustomerDetailPage.tsx`, `dependencies`, `react`, `AddEditRolePage.tsx`, `getErrorMessage`, `useAppDispatch`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
