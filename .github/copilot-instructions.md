# SolvoteL Client - AI Coding Guidelines

## Architecture Overview

This is a Next.js 16 hotel management system client app using the app router. It connects to a Strapi backend API with multi-tenant support (filtered by `hotel_id`). Key modules include bookings, inventory, restaurant POS, and reporting.

- **Data Fetching**: Use SWR with 500ms refresh for real-time updates. Always include auth token and hotel_id filter.
- **Authentication**: JWT stored in cookies, auto-logout on expiry. Use `useAuth` context for state.
- **Routing**: Protected routes via middleware. Authenticated routes under `(authenticated)/`.

## Key Patterns

- **API Calls**: Use `GetDataList`, `CreateNewData`, `UpdateData` from `@/utils/ApiFunctions`. Example:
  ```js
  const bookings = GetDataList({ auth, endPoint: 'room-bookings' });
  ```
- **Forms**: Manual state management with `useState` for `formData` and `errors`. Validate on submit. Use `SuccessToast`/`ErrorToast` for feedback.
- **Components**: Material-UI with framer-motion animations. Lucide icons. Styled with `sx` prop or `styled()`.
- **Printables**: Use `react-to-print` with forwardRef components in `@/component/printables/`.
- **Dates**: Use `dayjs` for parsing. Utilities in `@/utils/DateFetcher`, `@/utils/CalculateDays`.

## Conventions

- Client components: Add `'use client'` at top.
- File paths: `@/` alias for root. Organize components by feature (e.g., `bookingComp/`, `dashboardComp/`).
- Permissions: Check with `CheckUserPermission(auth?.user?.permissions)`.
- Exports: Default export components, named for utilities.

## Workflows

- **Dev**: `npm run dev` (auto-reload).
- **Build**: `npm run build` then `npm start`.
- **Lint**: `npm run lint` (ESLint config in `eslint.config.mjs`).

## Examples

- Fetch data: `const rooms = GetDataList({ auth, endPoint: 'rooms' });`
- Update: `await UpdateData({ auth, endPoint: 'bookings', id, payload });`
- Toast: `SuccessToast('Booking updated');`
- Link navigation: `href="front-office/room-booking/${id}"`

Focus on real-time UI updates and hotel-specific business logic.</content>
<parameter name="filePath">c:\Users\amitm\OneDrive\Documents\professional\Projects\solvotel\solvotel-client\.github\copilot-instructions.md
