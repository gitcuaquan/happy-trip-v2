# AI Coding Agent Guidelines for Happy Trip v2

## Project Overview
**Happy Trip v2** is a Nuxt 4 + Vue 3 TypeScript application for a ride-sharing/logistics service in Vietnam. The codebase has two distinct user flows:
- **Customer-facing**: Landing pages, service discovery, order creation (main site at `/`)
- **Driver/Partner-facing**: Authentication, dashboard, order management (at `/driver/*`)

Stack: Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Nuxt UI, Pinia, GSAP, Zod validation

## Critical Architecture Patterns

### Service Layer Design
Services are **class-based singletons** exported as both factory functions and direct instances:
```typescript
// `app/services/*.service.ts`
export class DriverService {
  private baseURL = 'https://sysdev.happytrip.vn/api'
  async login(phone: string, password: string) { ... }
}
export const useDriverService = () => new DriverService()     // Factory for SSR safety
export const customerService = new CustomerService()           // Direct singleton export
```
**Usage**: Use factory function in components (`useDriverService()`) for SSR safety; direct export for standalone use.

### Type System
- Core types live in `app/type.ts` (OrderDetail, DriverProfile, Address, WalletDetail, Order, HistoryOrder)
- DTOs for API payloads defined inline in service classes
- Use class-based types with default values for complex objects:
  ```typescript
  export class OrderDetail {
    short_id: string = ''
    departure: Address = new Address()
    constructor(data: Partial<OrderDetail>) { Object.assign(this, data) }
  }
  ```

### Component Organization
Components are **feature-grouped** under semantic folders:
- `components/shared/` - Reusable UI components (card-item, collapsible-card, feature-list)
- `components/ui/` - Custom form/input components (CreateOrder, DatePicker, SplitText)
- `components/{feature}/` - Feature-specific (blog/, driver/, history/)
- **All page routes are component-less**: Pages directly compose feature components

### Layout Strategy
- `layouts/default.vue` - Main header+footer layout (used for landing)
- `layouts/driver.vue` - Driver dashboard layout
- Pages use `definePageMeta({ layout: 'driver' })` to switch layouts

### API Response Patterns
The backend returns responses wrapped in data fields:
```typescript
// API response structure
{ data: { /* actual payload */ }, pagination?: {...} }

// Service methods unwrap this:
async getProfile(token: string) {
  const response = await $fetch<{ data: DriverProfile }>(`${baseURL}/partner/me`, { headers })
  return response.data  // Extract payload
}
```

## Development Workflows

### Build & Dev
```bash
pnpm install           # Install dependencies (uses pnpm@10.29.3)
pnpm dev              # Start dev server on http://localhost:2711
pnpm build            # Production build
pnpm lint             # ESLint check
pnpm typecheck        # TypeScript validation
```

### Key Configuration Files
- `nuxt.config.ts` - Dev server port: 2711, primary color: orange, Tailwind v4, prerender homepage
- `app.config.ts` - UI container max-width: 80vw, color scheme
- `eslint.config.mjs` - Uses @nuxt/eslint with strict settings (comma-dangle: never, brace style: 1tbs)

## Project-Specific Conventions

### Navigation & Routing
- Hero section with call-to-action buttons link to `/driver` or `/contact`
- No global authentication middleware; driver routes rely on client-side checks
- Pages use `definePageMeta` to set layout: `layout: 'default'` (standard), `layout: false` (fullscreen), or `layout: 'driver'` (driver dashboard)
- Auth composable `useAuth()` manages global state via `useState` + cookie-based tokens (`ht_token`)

### Styling
- **Utility-first Tailwind + Nuxt UI**: Never create custom CSS files (only `assets/css/main.css` exists)
- **Theme colors**: Primary = orange, neutral = slate (defined in app.config.ts)
- **Container**: All full-width sections use UContainer component for responsive max-width

### Error Handling
- **Critical API failures** (login, profile fetch): Throw error to caller for handling
- **Non-critical endpoints** (announcements, page list): Fail silently with `console.error()` + `console.warn()` and return empty fallback
- **Auth sync failures** (plugin): Log warning and call `logOut()` to clear invalid auth
```typescript
async getAnnouncements(): Promise<Announcement[]> {
  try { ... } catch (error) {
    console.error('Error fetching announcements:', error)
    return []  // Fail gracefully
  }
}
```

### Data Transformation
- `app/utils/index.ts` contains utility functions (e.g., `numberToCurrency` for VND formatting)
- Use `formatAddress(addr: Address, shortForm?: boolean)` from type.ts to format location data
- Status mapping: `HISTORY_STATUS_MAP` in type.ts converts numeric status codes to string labels

### Form Handling
- Forms use reactive state with Nuxt UI components:
  ```typescript
  const form = reactive({ phone: '', password: '' })
  // UForm + UFormField + UInput for form composition
  ```

## Integration Points & External Dependencies

### APIs
- **Partner/Customer API**: `https://sysdev.happytrip.vn/api` (driver/customer registration, login, announcements, auth)
- **Order/Content API**: `https://sys.happytrip.vn/api` (order management, articles/pages, active rides)
- All requests use `$fetch` from Nuxt (built-in composable)
- Protected routes require `Authorization: Bearer ${token}` header

### Libraries & Patterns
- **Nuxt UI**: Pre-built components (UButton, UForm, UHeader, UNavigationMenu, UIcon)
- **GSAP**: Animation library (used in hero sections, see `components/` with animation references)
- **Zod**: Validation library (imported but not heavily used in current code)
- **Tailwind CSS v4**: Utility-first styling with custom container configs

### State Management
- **Global auth state**: `useAuth()` composable manages `token` (cookie), `customerGlobal` (useState), and `isLoggedIn` computed
- **Service calls**: Direct instantiation in pages (`const service = useDriverService()` or `import { customerService }`)
- **Pinia module enabled** in nuxt.config but not actively used; for new state, add to `useAuth()` composable or create stores in `app/stores/` if needed

## Common Tasks & Examples

### Adding a New Page
1. Create file in `app/pages/{feature}/{page}.vue`
2. Import feature components and compose them
3. Add TypeScript setup script for logic
4. Use `definePageMeta` to set layout if needed

### Adding API Service
1. Create method in relevant service (`app/services/*.service.ts`)
2. Use `$fetch` with proper headers (add `Authorization: Bearer ${token}` for protected routes)
3. Unwrap response data in return statement
4. Throw errors for critical failures, return empty fallback for optional data

### Styling New Component
1. Use only Tailwind utility classes
2. Use Nuxt UI component library (UButton, UCard, etc.)
3. Apply theme colors via app.config.ts color definitions
4. Responsive: Always use md: prefix for tablet breakpoints

### Component Communication
- Props for parent→child data
- Emits for child→parent events
- Direct service instantiation and $fetch calls in page components (no dedicated state stores)

## Key Patterns & Gotchas

### API Response Unwrapping
Backend wraps responses in data fields. Services must unwrap:
```typescript
// API returns: { data: DriverProfile }
const response = await $fetch<{ data: DriverProfile }>(`${url}/partner/me`, { headers })
return response.data  // Extract the payload
```

### Service Factory vs Direct Export
- **Use factory** (`useDriverService()`) in components for SSR compatibility
- **Use direct export** (`customerService`) for standalone/non-component code
- Both patterns exist; choose appropriate one per context

### Status Mapping
Use `HISTORY_STATUS_MAP` in `type.ts` to convert numeric status codes:
```typescript
import { HISTORY_STATUS_MAP } from '~/type'
const statusLabel = HISTORY_STATUS_MAP[order.status_type]  // e.g., 'in_progress', 'completed'
```

### Address Formatting
Use `formatAddress(addr: Address, shortForm?: boolean)` utility to consistently format location data across components.

### Cookie-Based Auth
Auth token stored in `ht_token` cookie (managed via `useCookie()` in `useAuth()` composable). Token persists across page reloads for SSR safety.

## Debugging Notes
- Dev tools enabled in nuxt.config (devtools: enabled)
- Type checking: Run `pnpm typecheck` to catch TypeScript errors
- ESLint rules are strict—watch for comma-dangle and brace-style violations
- Check console for "Error" vs "warn" to distinguish critical vs non-critical API failures
