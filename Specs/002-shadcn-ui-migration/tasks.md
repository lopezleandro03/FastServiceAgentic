# Task Breakdown: Shadcn-UI Design System Migration

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Guide**: [quickstart.md](./quickstart.md)  
**Branch**: `002-shadcn-ui-migration` | **Date**: January 8, 2026

## Task Execution Rules

- **Sequential Tasks**: Must be completed in order (blocking dependencies)
- **Parallel Tasks [P]**: Can be executed simultaneously (no blocking dependencies)
- **Test Tasks**: Must pass before proceeding to dependent implementation tasks
- **File-Based Coordination**: Tasks affecting the same files must run sequentially

## Phase 0: Setup & Configuration

### Setup Tasks

- [X] **T001**: Install TailwindCSS and PostCSS dependencies
  - **Files**: `frontend/package.json`
  - **Command**: `cd frontend && npm install -D tailwindcss postcss autoprefixer`
  - **Validation**: Check package.json devDependencies for tailwindcss, postcss, autoprefixer
  - **Dependencies**: None
  - **Parallel**: No

- [X] **T002**: Install shadcn-ui core dependencies
  - **Files**: `frontend/package.json`
  - **Command**: `cd frontend && npm install class-variance-authority clsx tailwind-merge @radix-ui/react-icons tailwindcss-animate`
  - **Validation**: Check package.json dependencies for cva, clsx, tailwind-merge, @radix-ui/react-icons; devDependencies for tailwindcss-animate
  - **Dependencies**: T001 (sequential to avoid npm conflicts)
  - **Parallel**: No

- [X] **T003**: Initialize TailwindCSS configuration
  - **Files**: `frontend/tailwind.config.js`, `frontend/postcss.config.js`
  - **Command**: `cd frontend && npx tailwindcss init -p`
  - **Validation**: Both config files exist
  - **Dependencies**: T001
  - **Parallel**: No

- [X] **T004**: Configure TailwindCSS with shadcn design tokens
  - **Files**: `frontend/tailwind.config.js`
  - **Action**: Replace entire file with shadcn-compatible configuration (see quickstart.md Step 2)
  - **Validation**: Config includes darkMode, content paths, extended theme with CSS variables
  - **Dependencies**: T003
  - **Parallel**: No

- [X] **T005**: Add shadcn CSS variables to global styles
  - **Files**: `frontend/src/index.css`
  - **Action**: Prepend @tailwind directives and CSS variable definitions (see quickstart.md Step 3)
  - **Validation**: File contains :root and .dark CSS variable definitions
  - **Dependencies**: T004
  - **Parallel**: No

- [X] **T006**: Initialize shadcn-ui CLI
  - **Files**: `frontend/components.json`, `frontend/src/lib/utils.ts`
  - **Command**: `cd frontend && npx shadcn-ui@latest init`
  - **Interactive Prompts**: TypeScript=Yes, Style=Default, BaseColor=Slate, CSSVariables=Yes, TailwindConfig=tailwind.config.js, ComponentsDir=src/components/ui, UtilsDir=src/lib, RSC=No
  - **Validation**: components.json and src/lib/utils.ts exist
  - **Dependencies**: T005
  - **Parallel**: No

- [X] **T007**: Install all dependencies and verify build
  - **Files**: `frontend/node_modules/`
  - **Command**: `cd frontend && npm install`
  - **Validation**: npm install completes without errors
  - **Dependencies**: T006
  - **Parallel**: No

- [X] **T008**: Verify dev server starts without errors
  - **Files**: None (test only)
  - **Command**: `cd frontend && npm start` (verify in browser, then stop)
  - **Validation**: App loads at localhost:3000 without console errors
  - **Dependencies**: T007
  - **Parallel**: No

- [X] **T009**: Commit Phase 0 setup
  - **Files**: All Phase 0 files
  - **Command**: `git add . && git commit -m "feat(ui): configure shadcn-ui and TailwindCSS"`
  - **Validation**: Git commit successful
  - **Dependencies**: T008
  - **Parallel**: No

## Phase 1: Foundation Components (Button, Input, Textarea)

### Component Installation

- [X] **T010**: Install Button component via shadcn CLI
  - **Files**: `frontend/src/components/ui/button.tsx`
  - **Command**: `cd frontend && npx shadcn-ui@latest add button`
  - **Validation**: button.tsx exists in src/components/ui/
  - **Dependencies**: T009
  - **Parallel**: Yes [P]

- [X] **T011**: Install Input component via shadcn CLI
  - **Files**: `frontend/src/components/ui/input.tsx`
  - **Command**: `cd frontend && npx shadcn-ui@latest add input`
  - **Validation**: input.tsx exists in src/components/ui/
  - **Dependencies**: T009
  - **Parallel**: Yes [P]

- [X] **T012**: Install Textarea component via shadcn CLI
  - **Files**: `frontend/src/components/ui/textarea.tsx`
  - **Command**: `cd frontend && npx shadcn-ui@latest add textarea`
  - **Validation**: textarea.tsx exists in src/components/ui/
  - **Dependencies**: T009
  - **Parallel**: Yes [P]

### Component Migration

- [X] **T013**: Migrate MessageInput to use shadcn Button and Textarea
  - **Files**: `frontend/src/components/ChatPanel/MessageInput.tsx`
  - **Action**: Replace custom input/button with shadcn Textarea and Button components (see quickstart.md Phase 1 Step 2)
  - **Validation**: Component imports Button and Textarea from ../ui/
  - **Dependencies**: T010, T011, T012
  - **Parallel**: No

- [X] **T014**: Migrate MainPanel back button to shadcn Button
  - **Files**: `frontend/src/components/MainPanel/MainPanel.tsx`
  - **Action**: Add Button import, replace back button with `<Button variant="outline">` (see quickstart.md Phase 1 Step 3)
  - **Validation**: Component imports Button from ../ui/button
  - **Dependencies**: T010
  - **Parallel**: Yes [P] (different file than T013)

### Testing

- [X] **T015**: Test MessageInput component functionality
  - **Files**: None (manual test)
  - **Actions**:
    - Start dev server
    - Type in chat input
    - Verify Send button disabled when empty
    - Send message and verify it's sent
    - Test Enter key sends, Shift+Enter adds line
    - Verify hover/focus states
  - **Validation**: All tests pass
  - **Dependencies**: T013, T014
  - **Parallel**: No

- [X] **T016**: Commit Phase 1 foundation components
  - **Files**: All Phase 1 files
  - **Command**: `git add . && git commit -m "feat(ui): migrate Button and Input components (Phase 1)"`
  - **Validation**: Git commit successful
  - **Dependencies**: T015
  - **Parallel**: No

## Phase 2: Status & Loading Components (Badge, Skeleton)

### Component Installation

- [X] **T017**: Install Badge component via shadcn CLI
  - **Files**: `frontend/src/components/ui/badge.tsx`
  - **Command**: `cd frontend && npx shadcn-ui@latest add badge`
  - **Validation**: badge.tsx exists in src/components/ui/
  - **Dependencies**: T016
  - **Parallel**: Yes [P]

- [X] **T018**: Install Skeleton component via shadcn CLI
  - **Files**: `frontend/src/components/ui/skeleton.tsx`
  - **Command**: `cd frontend && npx shadcn-ui@latest add skeleton`
  - **Validation**: skeleton.tsx exists in src/components/ui/
  - **Dependencies**: T016
  - **Parallel**: Yes [P]

### Component Migration

- [X] **T019**: Migrate StatusBadge to use shadcn Badge
  - **Files**: `frontend/src/components/Orders/StatusBadge.tsx`
  - **Action**: Replace entire component with shadcn Badge-based implementation (see quickstart.md Phase 2 Step 2)
  - **Validation**: Component imports Badge from ../ui/badge; includes getStatusVariant and getStatusClassName helpers
  - **Dependencies**: T017
  - **Parallel**: No

- [X] **T020**: Create OrderListSkeleton component (optional enhancement)
  - **Files**: `frontend/src/components/Orders/OrderListSkeleton.tsx` (new file)
  - **Action**: Create skeleton loading component (see quickstart.md Phase 2 Step 3)
  - **Validation**: Component exists and uses Skeleton from ../ui/skeleton
  - **Dependencies**: T018
  - **Parallel**: Yes [P] (different file than T019)

### Testing

- [X] **T021**: Test StatusBadge color mapping
  - **Files**: None (manual test)
  - **Actions**:
    - Search for orders with different statuses
    - Verify badge colors:
      - Green: Finalizado, Entregado
      - Yellow: Pendiente, Evaluando, Presupuestado
      - Blue: Reparando, Esperando Repuesto
      - Red: Cancelado, Rechazado, Sin Solución
    - Check color contrast with Lighthouse
  - **Validation**: All status colors correct and WCAG 2.1 AA compliant
  - **Dependencies**: T019, T020
  - **Parallel**: No

- [X] **T022**: Commit Phase 2 status components
  - **Files**: All Phase 2 files
  - **Command**: `git add . && git commit -m "feat(ui): migrate Badge and Skeleton components (Phase 2)"`
  - **Validation**: Git commit successful
  - **Dependencies**: T021
  - **Parallel**: No

## Phase 3: Card Layout Components

### Component Installation

- [X] **T023**: Install Card component via shadcn CLI
  - **Files**: `frontend/src/components/ui/card.tsx`
  - **Command**: `cd frontend && npx shadcn-ui@latest add card`
  - **Validation**: card.tsx exists in src/components/ui/
  - **Dependencies**: T022
  - **Parallel**: Yes [P]

- [X] **T024**: Install Separator component via shadcn CLI
  - **Files**: `frontend/src/components/ui/separator.tsx`
  - **Command**: `cd frontend && npx shadcn-ui@latest add separator`
  - **Validation**: separator.tsx exists in src/components/ui/
  - **Dependencies**: T022
  - **Parallel**: Yes [P]

### Component Migration

- [X] **T025**: Migrate OrderDetailsView to use shadcn Card and Separator
  - **Files**: `frontend/src/components/Orders/OrderDetailsView.tsx`
  - **Action**: Replace entire component with Card-based layout (see quickstart.md Phase 3 Step 2)
  - **Validation**: Component imports Card, CardContent, CardHeader, CardTitle, CardDescription, Separator from ../ui/
  - **Dependencies**: T023, T024
  - **Parallel**: No

### Testing

- [X] **T026**: Test OrderDetailsView layout
  - **Files**: None (manual test)
  - **Actions**:
    - Click on an order to view details
    - Verify all sections display in separate cards
    - Check spacing between cards
    - Verify Separator divides repair information sections
    - Test responsive layout at 375px, 768px, 1024px
    - Verify all data displays correctly
  - **Validation**: All layout tests pass
  - **Dependencies**: T025
  - **Parallel**: No

- [X] **T027**: Commit Phase 3 card components
  - **Files**: All Phase 3 files
  - **Command**: `git add . && git commit -m "feat(ui): migrate Card and Separator components (Phase 3)"`
  - **Validation**: Git commit successful
  - **Dependencies**: T026
  - **Parallel**: No

## Phase 4: Table Component

### Component Installation

- [X] **T028**: Install Table component via shadcn CLI
  - **Files**: `frontend/src/components/ui/table.tsx`
  - **Command**: `cd frontend && npx shadcn-ui@latest add table`
  - **Validation**: table.tsx exists in src/components/ui/
  - **Dependencies**: T027
  - **Parallel**: No

### Component Migration

- [X] **T029**: Migrate OrderList to use shadcn Table
  - **Files**: `frontend/src/components/Orders/OrderList.tsx`
  - **Action**: Replace entire component with shadcn Table-based implementation (see quickstart.md Phase 4 Step 2)
  - **Validation**: Component imports Table, TableBody, TableCell, TableHead, TableHeader, TableRow from ../ui/table
  - **Dependencies**: T028
  - **Parallel**: No

### Testing

- [X] **T030**: Test OrderList table functionality
  - **Files**: None (manual test)
  - **Actions**:
    - Search for orders to display list
    - Verify table headers are clearly visible
    - Check row alignment and spacing
    - Test hover effect on rows
    - Click row to navigate to details
    - Test responsive behavior on mobile (horizontal scroll)
    - Verify "No se encontraron órdenes" message when empty
  - **Validation**: All table tests pass
  - **Dependencies**: T029
  - **Parallel**: No

- [X] **T031**: Commit Phase 4 table component
  - **Files**: All Phase 4 files
  - **Command**: `git add . && git commit -m "feat(ui): migrate Table component (Phase 4)"`
  - **Validation**: Git commit successful
  - **Dependencies**: T030
  - **Parallel**: No

## Phase 5: Polish & Cleanup

### CSS Cleanup

- [ ] **T032**: Remove unused custom CSS from App.css
  - **Files**: `frontend/src/App.css`
  - **Action**: Remove any custom button, input, table styles replaced by shadcn; keep layout-specific styles (70/30 split)
  - **Validation**: File contains only essential non-shadcn styles
  - **Dependencies**: T031
  - **Parallel**: No

- [ ] **T033**: Clean up component-level CSS (if any)
  - **Files**: `frontend/src/components/**/*.css` (if they exist)
  - **Action**: Remove or consolidate any component-specific CSS files now replaced by shadcn Tailwind classes
  - **Validation**: No conflicting CSS remains
  - **Dependencies**: T032
  - **Parallel**: No

### Responsive Testing

- [ ] **T034**: Test responsive behavior at all breakpoints
  - **Files**: None (manual test)
  - **Actions**:
    - Test at 375px (mobile portrait)
    - Test at 768px (tablet)
    - Test at 1024px (desktop)
    - Test at 1440px (large desktop)
    - Verify 70/30 split maintained on desktop
    - Verify components stack/adapt on mobile
    - Check no horizontal scrolling (except table on mobile)
  - **Validation**: All responsive tests pass
  - **Dependencies**: T033
  - **Parallel**: No

### Cross-Browser Testing

- [ ] **T035**: Test in Chrome
  - **Files**: None (manual test)
  - **Actions**: Open app in Chrome, verify all components render correctly, test interactions
  - **Validation**: Chrome test passes
  - **Dependencies**: T034
  - **Parallel**: Yes [P]

- [ ] **T036**: Test in Firefox
  - **Files**: None (manual test)
  - **Actions**: Open app in Firefox, verify all components render correctly, test interactions
  - **Validation**: Firefox test passes
  - **Dependencies**: T034
  - **Parallel**: Yes [P]

- [ ] **T037**: Test in Edge
  - **Files**: None (manual test)
  - **Actions**: Open app in Edge, verify all components render correctly, test interactions
  - **Validation**: Edge test passes
  - **Dependencies**: T034
  - **Parallel**: Yes [P]

### Accessibility Audit

- [ ] **T038**: Run Lighthouse accessibility audit
  - **Files**: None (automated test)
  - **Actions**:
    - Start dev server
    - Open Chrome DevTools → Lighthouse
    - Run Accessibility audit
    - Fix any issues found
  - **Validation**: Lighthouse accessibility score ≥ 95
  - **Dependencies**: T035
  - **Parallel**: No

- [ ] **T039**: Manual keyboard accessibility test
  - **Files**: None (manual test)
  - **Actions**:
    - Tab through all interactive elements
    - Verify focus indicators are visible
    - Test Enter/Space on buttons
    - Test Escape to close/cancel actions
  - **Validation**: All keyboard navigation works
  - **Dependencies**: T038
  - **Parallel**: No

- [ ] **T040**: Color contrast verification
  - **Files**: None (manual test)
  - **Actions**:
    - Use Lighthouse or WebAIM contrast checker
    - Verify all text meets WCAG 2.1 AA (4.5:1 for normal, 3:1 for large)
    - Check status badge colors for sufficient contrast
  - **Validation**: All colors meet WCAG 2.1 AA
  - **Dependencies**: T038
  - **Parallel**: Yes [P] (can run with T039)

### Performance Testing

- [ ] **T041**: Run Lighthouse performance audit
  - **Files**: None (automated test)
  - **Actions**:
    - Open Chrome DevTools → Lighthouse
    - Run Performance audit (Mobile, 3G throttling)
    - Check FCP, TTI, CLS metrics
  - **Validation**: FCP < 1.5s, TTI < 3.5s, CLS < 0.1
  - **Dependencies**: T038
  - **Parallel**: No

- [ ] **T042**: Check production bundle size
  - **Files**: None (build test)
  - **Command**: `cd frontend && npm run build`
  - **Actions**:
    - Build production bundle
    - Check build/static/js/*.js file sizes
    - Calculate total gzipped size
  - **Validation**: Total gzipped < 300KB (< 15% increase from baseline ~250KB)
  - **Dependencies**: T041
  - **Parallel**: No

### Final Validation

- [ ] **T043**: Complete functional requirements checklist
  - **Files**: None (validation)
  - **Actions**: Review FR-001 through FR-020 from spec.md, verify each is implemented
  - **Validation**: All 20 FRs checked ✅
  - **Dependencies**: T042
  - **Parallel**: No

- [ ] **T044**: Complete user stories checklist
  - **Files**: None (validation)
  - **Actions**: Review US1-US5 from spec.md, verify each acceptance scenario passes
  - **Validation**: All 5 user stories checked ✅
  - **Dependencies**: T043
  - **Parallel**: No

- [ ] **T045**: Complete success criteria checklist
  - **Files**: None (validation)
  - **Actions**: Review SC-001 through SC-010 from spec.md, verify each metric is met
  - **Validation**: All 10 success criteria checked ✅
  - **Dependencies**: T044
  - **Parallel**: No

### Commit & Finalize

- [ ] **T046**: Commit Phase 5 polish and cleanup
  - **Files**: All Phase 5 files
  - **Command**: `git add . && git commit -m "feat(ui): polish and cleanup (Phase 5)"`
  - **Validation**: Git commit successful
  - **Dependencies**: T045
  - **Parallel**: No

- [ ] **T047**: Final git status check
  - **Files**: None (git check)
  - **Command**: `git status`
  - **Validation**: Working directory clean, all changes committed
  - **Dependencies**: T046
  - **Parallel**: No

- [ ] **T048**: Update README with shadcn-ui migration notes (if needed)
  - **Files**: `README.md`
  - **Action**: Add note about UI design system if not already documented
  - **Validation**: README mentions shadcn-ui
  - **Dependencies**: T047
  - **Parallel**: No

## Summary

**Total Tasks**: 48  
**Estimated Time**: 10-15 hours  
**Sequential Phases**: 6 (Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5)  
**Parallel Tasks**: 12 tasks can run in parallel within their phases  

**Critical Path**:
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 →
T010-T012 [P] → T013 → T015 → T016 →
T017-T018 [P] → T019 → T021 → T022 →
T023-T024 [P] → T025 → T026 → T027 →
T028 → T029 → T030 → T031 →
T032 → T033 → T034 → T035-T037 [P] → T038 → T039-T040 [P] → T041 → T042 → T043 → T044 → T045 → T046 → T047 → T048

**Dependencies Summary**:
- Phase 0 (Setup): Fully sequential (T001-T009)
- Phase 1 (Foundation): Component installs parallel [P], migrations sequential
- Phase 2 (Status): Component installs parallel [P], migrations can be parallel [P]
- Phase 3 (Cards): Component installs parallel [P], migration sequential
- Phase 4 (Table): Fully sequential
- Phase 5 (Polish): Browser tests parallel [P], accessibility tests can be parallel [P]
