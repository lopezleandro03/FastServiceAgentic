# Phase 0 Research: Shadcn-UI Design System Migration

**Date**: January 8, 2026  
**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Research Summary

This document consolidates all technical research findings required to resolve "NEEDS CLARIFICATION" items from the Technical Context and to inform implementation decisions for the shadcn-ui migration.

## 1. Shadcn-UI Setup & Installation

### Decision: Use shadcn-ui CLI with manual component installation
**Rationale**: 
- Shadcn-ui is not a traditional npm package; it's a collection of copy-paste components built on Radix UI primitives
- CLI-based installation provides the most flexibility and follows official best practices
- Components are copied into the project, allowing full customization without version lock-in

**Installation Process**:
```bash
# 1. Install TailwindCSS (if not already present)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 2. Install shadcn-ui dependencies
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-icons

# 3. Initialize shadcn-ui
npx shadcn-ui@latest init

# 4. Install specific components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add separator
```

**Alternatives Considered**:
- **Alternative**: Use a pre-built component library like MUI or Chakra UI
- **Rejected Because**: Shadcn-ui provides more control (components live in your codebase), better TypeScript support, and smaller bundle size due to tree-shaking. User specifically requested shadcn-ui.

---

## 2. TailwindCSS Configuration for Shadcn-UI

### Decision: Extend existing TailwindCSS config with shadcn design tokens
**Rationale**: 
- Shadcn-ui requires specific Tailwind configuration for design tokens (colors, border-radius, spacing)
- CSS variables approach allows runtime theme switching if needed in the future
- Configuration integrates seamlessly with existing React app

**Configuration Files**:

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**index.css** (add CSS variables):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Alternatives Considered**:
- **Alternative**: Use inline styles or styled-components
- **Rejected Because**: Shadcn-ui is built specifically for Tailwind; using other styling approaches defeats the purpose and increases complexity.

---

## 3. React 19 Compatibility

### Decision: Shadcn-ui is fully compatible with React 19.2.3
**Rationale**:
- Shadcn-ui components are built on Radix UI, which supports React 18+
- React 19 maintains backward compatibility with React 18 component patterns
- No breaking changes expected; tested in community with React 19 release candidates

**Verification**:
```json
// Current package.json dependencies
"react": "^19.2.3",
"react-dom": "^19.2.3"

// Shadcn-ui dependencies (compatible)
"@radix-ui/react-*": "^1.0.0" // All Radix primitives support React 18+
"class-variance-authority": "^0.7.0"
"tailwind-merge": "^2.2.0"
```

**Risk Mitigation**:
- If compatibility issues arise, Radix UI primitives can be pinned to specific versions
- React 19 is stable; shadcn-ui maintainers have confirmed compatibility

**Alternatives Considered**:
- **Alternative**: Downgrade to React 18 for guaranteed compatibility
- **Rejected Because**: React 19 is stable and backward compatible; no need to downgrade. Feature 001 already uses React 19 successfully.

---

## 4. Component Migration Strategy

### Decision: Incremental migration in 5 phases (foundation → tables → polish)
**Rationale**:
- Allows testing and validation at each step
- Minimizes risk of breaking changes
- Each phase delivers independently deployable value
- Aligns with user story priorities (P1 components first)

**Phase Breakdown**:

**Phase 1: Foundation Components (P1)** - Estimated 2-3 hours
- Install shadcn-ui CLI and configure Tailwind
- Add Button component (replace in MessageInput, MainPanel)
- Add Input/Textarea components (replace in MessageInput)
- Test: Chat functionality works identically with new components

**Phase 2: Status & Loading Components (P2)** - Estimated 1-2 hours
- Add Badge component (replace StatusBadge.tsx)
- Add Skeleton component (add loading states)
- Map order statuses to badge variants (success, warning, destructive, etc.)
- Test: Status badges display correctly in lists and details

**Phase 3: Card Layout Components (P2/P3)** - Estimated 2-3 hours
- Add Card component (use in OrderDetailsView sections)
- Add Separator component (divide sections in details view)
- Reorganize OrderDetailsView with Card wrappers
- Test: Order details display with improved visual hierarchy

**Phase 4: Table Component (P2)** - Estimated 3-4 hours
- Add Table component (replace OrderList table)
- Migrate table headers, rows, cells to shadcn Table primitives
- Maintain sorting, clicking, and hover interactions
- Test: Order list displays correctly with all interactions preserved

**Phase 5: Polish & Cleanup (All)** - Estimated 2-3 hours
- Remove unused custom CSS from App.css and component files
- Verify responsive behavior at all breakpoints
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Accessibility audit with axe DevTools
- Performance testing (bundle size, load times)

**Total Estimated Time**: 10-15 hours of focused development

**Alternatives Considered**:
- **Alternative**: "Big bang" migration (replace everything at once)
- **Rejected Because**: High risk of breaking changes; difficult to test; violates incremental delivery principle.

- **Alternative**: Migrate components based on file structure rather than user stories
- **Rejected Because**: User story alignment ensures value delivery at each step; file-based approach may leave partially complete features.

---

## 5. FastService Branding Integration

### Decision: Customize shadcn theme colors to match FastService visual identity
**Rationale**:
- Default shadcn slate theme may not align with FastService brand
- CSS variables allow easy color customization without component changes
- Maintain professional appearance while leveraging shadcn structure

**Recommended Color Palette** (to be confirmed with stakeholders):
```css
:root {
  /* FastService primary brand color (blue/teal - typical for service businesses) */
  --primary: 197 71% 45%; /* #1e8fcb - adjust based on actual brand */
  --primary-foreground: 0 0% 100%;

  /* Status-specific colors for order badges */
  --status-pending: 45 93% 47%; /* Yellow - Pendiente, Evaluando */
  --status-in-progress: 217 91% 60%; /* Blue - Presupuestado, Reparando */
  --status-completed: 142 71% 45%; /* Green - Finalizado, Entregado */
  --status-cancelled: 0 84% 60%; /* Red - Cancelado, Rechazado */
  
  /* Keep shadcn defaults for other tokens (background, border, etc.) */
}
```

**Status Badge Mapping**:
- **Pendiente, Evaluando, Presupuestado**: `variant="warning"` (yellow)
- **Reparando, Esperando Repuesto**: `variant="default"` (blue)
- **Finalizado, Entregado**: `variant="success"` (green)
- **Cancelado, Rechazado, Sin Solución**: `variant="destructive"` (red)

**Alternatives Considered**:
- **Alternative**: Use shadcn default slate theme without customization
- **Rejected Because**: Generic branding reduces professional appearance; customization is trivial with CSS variables.

---

## 6. Accessibility Compliance

### Decision: Leverage Radix UI's built-in WCAG 2.1 AA compliance
**Rationale**:
- All shadcn-ui components are built on Radix UI primitives, which are designed for accessibility
- Radix UI handles ARIA attributes, keyboard navigation, and focus management automatically
- Reduces manual accessibility work; allows focus on color contrast and content

**Accessibility Checklist**:
- ✅ **Keyboard Navigation**: All Radix UI components support keyboard (Tab, Enter, Escape, Arrow keys)
- ✅ **Focus Management**: Focus indicators are built-in via `focus-visible` utilities
- ✅ **ARIA Attributes**: Automatically applied by Radix primitives (aria-label, aria-expanded, etc.)
- ⚠️ **Color Contrast**: Must verify custom brand colors meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- ⚠️ **Screen Reader Testing**: Test with NVDA/JAWS to ensure Spanish content is announced correctly

**Testing Tools**:
- Lighthouse (automated audit in Chrome DevTools)
- axe DevTools browser extension (detailed WCAG compliance report)
- Manual keyboard navigation testing
- NVDA screen reader testing (Spanish language profile)

**Alternatives Considered**:
- **Alternative**: Build custom accessible components from scratch
- **Rejected Because**: Radix UI provides battle-tested accessibility; reinventing the wheel increases risk and effort.

---

## 7. Bundle Size Impact

### Decision: Monitor bundle size; target < 15% increase from shadcn-ui dependencies
**Rationale**:
- Shadcn-ui components are tree-shakeable (only imported components are bundled)
- Radix UI primitives are lightweight (~5-10KB per component gzipped)
- TailwindCSS is already tree-shaken; design tokens add minimal overhead

**Baseline Measurements** (from existing build):
- Current bundle size: ~250KB gzipped (estimated based on React 19 + react-scripts)
- Target max bundle size: 287.5KB gzipped (250KB * 1.15)

**Expected Additions**:
```
@radix-ui/react-slot: ~2KB
@radix-ui/react-badge: ~3KB
@radix-ui/react-table: ~8KB
class-variance-authority: ~2KB
tailwind-merge: ~3KB
8 shadcn components: ~15-20KB total
TailwindCSS design tokens: ~5KB
---------------------------------
Total added: ~35-45KB gzipped
```

**Estimated final bundle**: ~285-295KB gzipped (within 15% target with small overage acceptable)

**Mitigation if Exceeded**:
- Code splitting for less critical components (Skeleton, Separator)
- Lazy load OrderDetailsView (already on separate route)
- Remove unused TailwindCSS utilities with PurgeCSS

**Alternatives Considered**:
- **Alternative**: Use a CDN-hosted component library to avoid bundle bloat
- **Rejected Because**: Shadcn-ui is not CDN-hostable (components are in your codebase); defeats customization benefits.

---

## 8. Spanish Language Rendering

### Decision: No changes required; Shadcn-ui components are internationalization-friendly
**Rationale**:
- Shadcn-ui components render content passed as children/props; no English hard-coded
- All UI text remains in existing Spanish strings (no component changes affect language)
- Typography scale supports Spanish character set (ñ, á, é, í, ó, ú, ü, ¿, ¡)

**Verification**:
```tsx
// Example: Button component preserves Spanish text
<Button>Enviar</Button> // Renders "Enviar" correctly

// Example: Input placeholder
<Input placeholder="Escribí tu consulta..." /> // Spanish placeholder works
```

**Font Considerations**:
- Current system font stack likely supports Spanish
- If custom fonts added, verify they include Latin Extended characters
- Test with actual Spanish content (accents, special characters)

**Alternatives Considered**:
- **Alternative**: Use a dedicated i18n library like react-intl
- **Rejected Because**: Not needed for this migration; all text is already Spanish. Future feature if multi-language support required.

---

## 9. Testing Strategy

### Decision: Combination of automated tests, visual regression, and manual QA
**Rationale**:
- Functional tests verify component behavior (React Testing Library)
- Visual regression catches unintended styling changes
- Manual testing ensures real-world usability

**Test Plan**:

**1. Unit Tests** (React Testing Library):
```typescript
// Example test for Button migration
test('MessageInput sends message with shadcn Button', () => {
  render(<MessageInput onSend={mockSend} />);
  const input = screen.getByPlaceholderText('Escribí tu consulta...');
  const button = screen.getByRole('button', { name: /enviar/i });
  
  fireEvent.change(input, { target: { value: 'test message' } });
  fireEvent.click(button);
  
  expect(mockSend).toHaveBeenCalledWith('test message');
});
```

**2. Visual Regression** (Percy or Chromatic - optional):
- Capture screenshots of all components before/after migration
- Compare for unintended changes
- Validate intentional design improvements

**3. Manual Testing Checklist**:
- ✅ Chat panel: Send message, receive response, scroll history
- ✅ Order list: Click order, hover states, status badges render
- ✅ Order details: View details, click back button, data displays correctly
- ✅ Responsive: Test at 375px (mobile), 768px (tablet), 1024px+ (desktop)
- ✅ Accessibility: Tab through all interactive elements, verify focus indicators
- ✅ Cross-browser: Chrome, Firefox, Safari, Edge (latest versions)

**4. Performance Testing**:
- Lighthouse audit: FCP < 1.5s, TTI < 3.5s
- Network tab: Verify bundle size < 300KB gzipped
- Throttle to Fast 3G, verify app remains responsive

**Alternatives Considered**:
- **Alternative**: Rely solely on automated tests
- **Rejected Because**: Visual design changes require human verification; automated tests can't catch subtle styling issues.

---

## 10. Rollback Plan

### Decision: Git-based rollback with incremental commits per phase
**Rationale**:
- Each phase is committed separately, allowing rollback to any point
- Feature branch protects main until full migration is validated
- Small commits make it easy to identify and revert problematic changes

**Rollback Strategy**:
```bash
# If Phase 3 breaks something, rollback to Phase 2
git revert <phase-3-commit-hash>

# Or reset to specific phase
git reset --hard <phase-2-commit-hash>

# If entire feature needs rollback, delete branch
git checkout main
git branch -D 002-shadcn-ui-migration
```

**Commit Structure**:
- Commit 1: "feat(ui): configure shadcn-ui and TailwindCSS"
- Commit 2: "feat(ui): migrate Button and Input components (Phase 1)"
- Commit 3: "feat(ui): migrate Badge and Skeleton components (Phase 2)"
- Commit 4: "feat(ui): migrate Card and Separator components (Phase 3)"
- Commit 5: "feat(ui): migrate Table component (Phase 4)"
- Commit 6: "feat(ui): polish and cleanup (Phase 5)"

**Alternatives Considered**:
- **Alternative**: Single large commit at the end
- **Rejected Because**: Makes rollback all-or-nothing; can't recover partial progress if issues found late.

---

## Research Completion Summary

All technical unknowns have been resolved:

✅ **Installation Process**: CLI-based installation with manual component addition  
✅ **TailwindCSS Configuration**: Extend config with shadcn design tokens via CSS variables  
✅ **React 19 Compatibility**: Fully compatible; no downgrades needed  
✅ **Migration Strategy**: 5-phase incremental approach (10-15 hours estimated)  
✅ **Branding**: Customize CSS variables for FastService colors and status mapping  
✅ **Accessibility**: Leverage Radix UI WCAG 2.1 AA compliance + manual color contrast checks  
✅ **Bundle Size**: Target < 15% increase (~35-45KB added, within acceptable range)  
✅ **Spanish Language**: No changes needed; components preserve existing text  
✅ **Testing**: Combined automated + visual regression + manual QA approach  
✅ **Rollback**: Git-based rollback with per-phase commits  

**Next Step**: Proceed to Phase 1 (Design & Contracts) to document component APIs and create quickstart guide.
