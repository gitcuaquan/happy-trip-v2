# AI Coding Agent Guidelines for Happy Trip v2

## Project Overview
**Happy Trip v2** is a Nuxt 4 + Vue 3 TypeScript application for a ride-sharing/logistics service in Vietnam. The codebase has two distinct user flows:
- **Customer-facing**: Landing pages, service discovery, order creation (main site at `/`)
- **Driver/Partner-facing**: Authentication, dashboard, order management (at `/driver/*`)

Stack: Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Nuxt UI, Pinia, GSAP, Zod validation

## Critical Architecture Patterns

### Service Layer Design
Services are **class-based singletons** with static factory functions, NOT composables:
```typescript
// `app/services/*.service.ts`
export class DriverService {
  private baseURL = 'https://sysdev.happytrip.vn/api'
  async login(phone: string, password: string) { ... }
}
export const useDriverService = () => new DriverService()
```
**Usage**: Import service and instantiate with factory function in components/pages.

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
- No authentication middleware on public pages; driver routes rely on client-side checks
- Pages use `ClientOnly` wrapper when accessing browser APIs (see `pages/driver/login.vue`)

### Styling
- **Utility-first Tailwind + Nuxt UI**: Never create custom CSS files (only `assets/css/main.css` exists)
- **Theme colors**: Primary = orange, neutral = slate (defined in app.config.ts)
- **Container**: All full-width sections use UContainer component for responsive max-width

### Error Handling
- Services throw errors on critical API failures (login, profile fetch)
- Non-critical endpoints fail silently with console.warn and return empty fallbacks:
  ```typescript
  async getAnnouncements(): Promise<Announcement[]> {
    try { ... } catch (error) {
      console.warn('Could not fetch announcements:', error)
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
- **Partner API**: `https://sysdev.happytrip.vn/api` (driver registration, login, announcements)
- **Order API**: `https://sys.happytrip.vn/api` (order management)
- All requests use `$fetch` from Nuxt (built-in composable)

### Libraries & Patterns
- **Nuxt UI**: Pre-built components (UButton, UForm, UHeader, UNavigationMenu, UIcon)
- **GSAP**: Animation library (used in hero sections, see `components/` with animation references)
- **Zod**: Validation library (imported but not heavily used in current code)
- **Tailwind CSS v4**: Utility-first styling with custom container configs

### State Management
- **Pinia module enabled** in nuxt.config but not actively used in current codebase
- If state management needed, add stores in `app/stores/` directory

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

## Debugging Notes
- Dev tools enabled in nuxt.config (devtools: enabled)
- Type checking: Run `pnpm typecheck` to catch TypeScript errors
- ESLint rules are strict—watch for comma-dangle and brace-style violations
- Check console for "Error" vs "warn" to distinguish critical vs non-critical API failures
