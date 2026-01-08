# Quickstart Guide: Shadcn-UI Migration

**Date**: January 8, 2026  
**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

## Overview

This guide provides step-by-step instructions for implementing the shadcn-ui design system migration. Follow these phases sequentially, committing after each phase for incremental progress.

## Prerequisites

- Node.js 18+ and npm installed
- Git repository with branch `002-shadcn-ui-migration` checked out
- Frontend server stopped (stop any running `npm start` processes)
- Familiarity with React, TypeScript, and TailwindCSS

## Phase 0: Setup & Configuration

### Step 1: Install TailwindCSS and Dependencies

```bash
cd frontend

# Install TailwindCSS and PostCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn-ui core dependencies
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-icons

# Install TailwindCSS animation plugin
npm install -D tailwindcss-animate
```

### Step 2: Configure TailwindCSS

Create/update `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
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

### Step 3: Add CSS Variables

Update `frontend/src/index.css`:

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
    
    /* FastService brand color - customize as needed */
    --primary: 197 71% 45%;
    --primary-foreground: 0 0% 100%;
    
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

### Step 4: Initialize Shadcn-UI

```bash
# Initialize shadcn-ui (will create components.json and src/lib/utils.ts)
npx shadcn-ui@latest init

# When prompted:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - Tailwind config: tailwind.config.js
# - Components directory: src/components/ui
# - Utils directory: src/lib
# - React Server Components: No
# - Write configuration: Yes
```

### Step 5: Verify Setup

```bash
# Check that files were created
ls src/lib/utils.ts          # Should exist
ls components.json            # Should exist
ls tailwind.config.js         # Should be updated

# Install and start dev server
npm install
npm start

# App should load without errors (no visual changes yet)
```

**Commit**: `git add . && git commit -m "feat(ui): configure shadcn-ui and TailwindCSS"`

---

## Phase 1: Foundation Components (Button, Input)

### Step 1: Install Button and Input Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
```

This creates:
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`

### Step 2: Update MessageInput Component

Edit `frontend/src/components/ChatPanel/MessageInput.tsx`:

```tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Escribí tu consulta..."
        disabled={disabled}
        className="flex-1 resize-none"
        rows={3}
      />
      <Button 
        onClick={handleSend} 
        disabled={disabled || !message.trim()}
        className="self-end"
      >
        Enviar
      </Button>
    </div>
  );
};
```

### Step 3: Update MainPanel Back Button

Edit `frontend/src/components/MainPanel/MainPanel.tsx` (add Button import and replace back button):

```tsx
import { Button } from '../ui/button';

// In the render method, replace the back button:
{viewingOrderDetails && (
  <div className="mb-4">
    <Button 
      variant="outline" 
      onClick={handleBackToList}
    >
      ← {orders.length > 0 ? 'Back to Resultados de Búsqueda' : 'Back to Inicio'}
    </Button>
  </div>
)}
```

### Step 4: Test Foundation Components

```bash
npm start
```

**Manual Testing**:
- [ ] Chat input displays with shadcn styling
- [ ] Typing in chat input works
- [ ] Send button is disabled when input is empty
- [ ] Clicking Send sends the message
- [ ] Enter key sends message (Shift+Enter adds new line)
- [ ] Back button in order details has outline variant
- [ ] Buttons show hover/focus states

**Commit**: `git add . && git commit -m "feat(ui): migrate Button and Input components (Phase 1)"`

---

## Phase 2: Status & Loading Components (Badge, Skeleton)

### Step 1: Install Badge and Skeleton Components

```bash
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add skeleton
```

### Step 2: Update StatusBadge Component

Edit `frontend/src/components/Orders/StatusBadge.tsx`:

```tsx
import React from 'react';
import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: string;
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const statusLower = status.toLowerCase();
  
  // Completed statuses - green/success (use default with custom class)
  if (['finalizado', 'entregado'].includes(statusLower)) {
    return 'default';
  }
  
  // In-progress statuses - blue (secondary)
  if (['reparando', 'esperando repuesto'].includes(statusLower)) {
    return 'secondary';
  }
  
  // Cancelled/failed statuses - red (destructive)
  if (['cancelado', 'rechazado', 'sin solución'].includes(statusLower)) {
    return 'destructive';
  }
  
  // Pending statuses - yellow (outline with custom class)
  return 'outline';
};

const getStatusClassName = (status: string): string => {
  const statusLower = status.toLowerCase();
  
  if (['finalizado', 'entregado'].includes(statusLower)) {
    return 'bg-green-100 text-green-800 hover:bg-green-100';
  }
  
  if (['pendiente', 'evaluando', 'presupuestado'].includes(statusLower)) {
    return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
  }
  
  return '';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <Badge 
      variant={getStatusVariant(status)}
      className={getStatusClassName(status)}
    >
      {status}
    </Badge>
  );
};
```

### Step 3: Add Loading Skeleton (Optional Enhancement)

Create `frontend/src/components/Orders/OrderListSkeleton.tsx`:

```tsx
import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const OrderListSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Step 4: Test Status & Loading Components

**Manual Testing**:
- [ ] Order status badges display with correct colors:
  - Green: Finalizado, Entregado
  - Yellow: Pendiente, Evaluando, Presupuestado
  - Blue: Reparando, Esperando Repuesto
  - Red: Cancelado, Rechazado, Sin Solución
- [ ] Skeleton components display during loading (if implemented)
- [ ] Badge text is readable (contrast check)

**Commit**: `git add . && git commit -m "feat(ui): migrate Badge and Skeleton components (Phase 2)"`

---

## Phase 3: Card Layout Components

### Step 1: Install Card and Separator

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add separator
```

### Step 2: Update OrderDetailsView

Edit `frontend/src/components/Orders/OrderDetailsView.tsx`:

```tsx
import React from 'react';
import { OrderDetails } from '../../types/order';
import { StatusBadge } from './StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

interface OrderDetailsViewProps {
  order: OrderDetails;
}

export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ order }) => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Orden #{order.numero}</CardTitle>
              <CardDescription>
                Cliente: {order.nombreCliente}
              </CardDescription>
            </div>
            <StatusBadge status={order.estado} />
          </div>
        </CardHeader>
      </Card>

      {/* Customer Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p>{order.nombreCliente}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              <p>{order.telefonoCliente || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{order.emailCliente || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">DNI</p>
              <p>{order.dniCliente || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Equipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo</p>
              <p>{order.tipoEquipo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Marca</p>
              <p>{order.marcaEquipo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Modelo</p>
              <p>{order.modeloEquipo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Serie</p>
              <p>{order.serieEquipo || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repair Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Reparación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Falla Reportada</p>
            <p className="mt-1">{order.fallaReportada || 'N/A'}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
            <p className="mt-1">{order.diagnostico || 'Pendiente'}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha Ingreso</p>
              <p>{new Date(order.fechaIngreso).toLocaleDateString('es-AR')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha Estimada</p>
              <p>{order.fechaEstimadaEntrega 
                ? new Date(order.fechaEstimadaEntrega).toLocaleDateString('es-AR') 
                : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technician Information Card (if assigned) */}
      {order.tecnicoNombre && (
        <Card>
          <CardHeader>
            <CardTitle>Técnico Asignado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{order.tecnicoNombre}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

### Step 3: Test Card Components

**Manual Testing**:
- [ ] Order details display in separate cards
- [ ] Cards have proper spacing and shadows
- [ ] Sections are clearly separated
- [ ] Grid layout works at different screen sizes
- [ ] Separators divide content appropriately
- [ ] All information displays correctly

**Commit**: `git add . && git commit -m "feat(ui): migrate Card and Separator components (Phase 3)"`

---

## Phase 4: Table Component

### Step 1: Install Table Component

```bash
npx shadcn-ui@latest add table
```

### Step 2: Update OrderList Component

Edit `frontend/src/components/Orders/OrderList.tsx`:

```tsx
import React from 'react';
import { Order } from '../../types/order';
import { StatusBadge } from './StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface OrderListProps {
  orders: Order[];
  onOrderClick: (orderNumber: number) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onOrderClick }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron órdenes
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.numero}
              onClick={() => onOrderClick(order.numero)}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">#{order.numero}</TableCell>
              <TableCell>{order.nombreCliente}</TableCell>
              <TableCell>{order.tipoEquipo}</TableCell>
              <TableCell>
                <StatusBadge status={order.estado} />
              </TableCell>
              <TableCell className="text-right">
                {new Date(order.fechaIngreso).toLocaleDateString('es-AR')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

### Step 3: Test Table Component

**Manual Testing**:
- [ ] Order list displays in table format
- [ ] Table headers are clearly visible
- [ ] Rows are properly aligned
- [ ] Hover effect works on rows
- [ ] Clicking a row navigates to order details
- [ ] Table is responsive (scrolls horizontally on mobile)
- [ ] "No se encontraron órdenes" message displays when empty

**Commit**: `git add . && git commit -m "feat(ui): migrate Table component (Phase 4)"`

---

## Phase 5: Polish & Cleanup

### Step 1: Remove Unused Custom CSS

Edit `frontend/src/App.css` - remove any custom button, input, table styles that are now replaced by shadcn components. Keep only:
- Layout-specific styles (70/30 split)
- Any custom animations not covered by shadcn
- Global utilities not in Tailwind

### Step 2: Verify Responsive Behavior

Test at these breakpoints:
- [ ] 375px (mobile portrait)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)
- [ ] 1440px (large desktop)

Ensure:
- 70/30 split is maintained on desktop
- Components stack/adapt on mobile
- Text remains readable at all sizes
- No horizontal scrolling (except table on mobile)

### Step 3: Cross-Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (latest)

Verify:
- Components render identically
- Hover/focus states work
- No layout shifts
- Fonts load correctly

### Step 4: Accessibility Audit

Run Lighthouse audit:
```bash
# Start app
npm start

# Open Chrome DevTools → Lighthouse
# Run Accessibility audit
# Target: 95+ score
```

Manual accessibility checks:
- [ ] All interactive elements are keyboard accessible (Tab navigation)
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] Screen reader test (NVDA) - Spanish content is announced correctly

### Step 5: Performance Testing

Run Lighthouse performance audit:
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1

Check bundle size:
```bash
npm run build

# Check build/static/js/*.js file sizes
# Total gzipped should be < 300KB
```

### Step 6: Final Visual Review

Compare before/after:
- [ ] Chat panel looks modern and polished
- [ ] Order list is easier to scan
- [ ] Order details have clear visual hierarchy
- [ ] Status badges are prominent and readable
- [ ] Overall appearance is professional and consistent

**Commit**: `git add . && git commit -m "feat(ui): polish and cleanup (Phase 5)"`

---

## Completion Checklist

### Functional Requirements
- [ ] FR-001: Shadcn-ui integrated with all dependencies
- [ ] FR-002: TailwindCSS configured with shadcn tokens
- [ ] FR-003: Chat input uses shadcn Input/Textarea
- [ ] FR-004: Buttons use shadcn Button component
- [ ] FR-005: Order list uses shadcn Table
- [ ] FR-006: Status badges use shadcn Badge
- [ ] FR-007: Order details use shadcn Card
- [ ] FR-008: 70/30 split layout preserved
- [ ] FR-009: All existing functionality maintained
- [ ] FR-010: Spanish UI text unchanged
- [ ] FR-011-012: Consistent spacing and typography applied
- [ ] FR-013: Skeleton loading states implemented
- [ ] FR-014-015: Accessibility maintained (keyboard nav, WCAG 2.1 AA)
- [ ] FR-016: Responsive breakpoints configured
- [ ] FR-017: Light mode theme configured
- [ ] FR-018: Conflicting CSS removed
- [ ] FR-019: Smooth animations/transitions applied
- [ ] FR-020: Form elements have focus-visible states

### User Stories
- [ ] US1 (P1): Modern chat interface - visually improved and professional
- [ ] US2 (P2): Enhanced order list - table layout with clear status indicators
- [ ] US3 (P3): Refined order details - card-based sections with visual hierarchy
- [ ] US4 (P1): Responsive layout - 70/30 split maintained, mobile-friendly
- [ ] US5 (P2): Consistent theme - unified colors, typography, spacing

### Success Criteria
- [ ] SC-001: Task completion time unchanged or faster
- [ ] SC-002: WCAG 2.1 AA compliance (Lighthouse 95+)
- [ ] SC-003: Performance budget met (FCP < 1.5s, TTI < 3.5s)
- [ ] SC-004: Functional tests pass (manual verification complete)
- [ ] SC-005: No unintended visual regressions
- [ ] SC-006: Responsive at all breakpoints
- [ ] SC-008: Consistent across browsers
- [ ] SC-010: 30%+ custom CSS removed

---

## Merge to Main

Once all checks pass:

```bash
# Ensure all changes are committed
git status

# Switch to main and merge
git checkout main
git merge 002-shadcn-ui-migration

# Push to remote
git push origin main

# Delete feature branch (optional)
git branch -d 002-shadcn-ui-migration
```

---

## Troubleshooting

### Issue: TailwindCSS classes not applying

**Solution**: Ensure `content` paths in `tailwind.config.js` include all component files:
```javascript
content: ['./src/**/*.{ts,tsx}']
```

### Issue: Shadcn components not found

**Solution**: Verify `components.json` has correct paths:
```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

And `tsconfig.json` has path mappings:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: CSS variables not working

**Solution**: Ensure `index.css` is imported in `index.tsx`:
```typescript
import './index.css';
```

### Issue: Bundle size exceeds target

**Solution**: Use code splitting for OrderDetailsView:
```typescript
const OrderDetailsView = lazy(() => import('./components/Orders/OrderDetailsView'));
```

---

## Next Steps (Future Enhancements)

- [ ] Add dark mode toggle (toggle `dark` class on `<html>`)
- [ ] Implement more shadcn components (Dialog, Dropdown, Popover)
- [ ] Add animations with framer-motion
- [ ] Create custom color theme specific to FastService branding
- [ ] Add visual regression testing with Percy/Chromatic
