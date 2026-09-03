# Car Rental Frontend — Refactor & Improvement Plan

## 1. Goal

Improve the current React frontend without rewriting the application.

The most important rule is:

> Keep the current UI and feature behavior unless there is a real bug.

Do NOT rebuild the project from zero.

The current project already has a useful structure with:

```text
src/
├── common/
├── contexts/
├── hooks/
├── services/
├── view/
└── feature folders
```

Keep this idea.

---

# 2. Current Structure

The repository currently contains:

```text
car_rental_frontend/
├── public/
├── src/
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── pnpm-lock.yaml
├── vercel.json
└── vite.config.js
```

The existing application is already deployed through Vercel.

Do NOT change the deployment setup unless required.

---

# 3. Target Structure

Use this as the preferred structure.

```text
src/
│
├── assets/
│
├── common/
│   ├── components/
│   ├── constants/
│   └── utils/
│
├── contexts/
│   ├── AuthContext.jsx
│   └── ...
│
├── hooks/
│   ├── useAuth.js
│   └── ...
│
├── services/
│   ├── api/
│   │   ├── auth.js
│   │   ├── car.js
│   │   ├── booking.js
│   │   └── customer.js
│   │
│   └── ...
│
├── view/
│   ├── auth/
│   ├── customer/
│   ├── admin/
│   └── ...
│
├── contactUs/
├── history/
│
├── App.jsx
├── Loader.jsx
├── main.jsx
└── index.css
```

## IMPORTANT

This is NOT a command to move everything.

If the current folders already work, keep them.

Only reorganize when it clearly improves the code.

---

# 4. Feature Folder Rule

New features should be grouped by feature.

For example:

```text
view/
├── auth/
├── cars/
├── booking/
├── customer/
└── admin/
```

A feature can contain:

```text
booking/
├── components/
├── pages/
├── hooks/
└── utils/
```

But do NOT create all these folders for a small feature.

Use only what is needed.

---

# 5. Existing Structure Must Be Preserved

The current project already has:

```text
common/
contexts/
hooks/
services/
view/
```

Keep them.

Do NOT replace everything with a completely new architecture such as:

```text
src/
├── application/
├── domain/
├── infrastructure/
├── presentation/
└── ...
```

That would make the project harder to understand without giving enough benefit.

Use simple React structure.

---

# 6. Components

Components should mainly handle UI.

Avoid putting large API calls directly inside UI components.

Bad:

```jsx
function BookingPage() {

    const createBooking = async () => {
        // 100 lines of API logic
        // validation
        // price calculation
        // error handling
    };

    return (...);
}
```

Better:

```text
BookingPage
    ↓
useBooking()
    ↓
bookingService
    ↓
API
```

---

# 7. Services

Keep API calls inside:

```text
src/services/
```

Prefer:

```text
services/
├── api/
│   ├── auth.js
│   ├── car.js
│   ├── booking.js
│   └── customer.js
```

Example:

```javascript
export const createBooking = async (data) => {
    return api.post('/bookings', data);
};
```

Components should not repeat API URLs.

Avoid:

```javascript
axios.post(
    "https://example.com/api/bookings",
    data
);
```

inside many components.

---

# 8. API Base URL

Use environment variables.

Example:

```text
.env
.env.example
```

Use:

```text
VITE_API_BASE_URL=
```

Do NOT hardcode production API URLs in many files.

The source code should use one API configuration.

---

# 9. API Client

If the project uses Axios, create one shared client.

Example:

```text
src/services/apiClient.js
```

or keep the existing API client if one already exists.

It should handle common settings such as:

```text
baseURL
headers
authentication
timeout
common error handling
```

Do NOT create a new API client if the project already has a working one.

Improve the existing one.

---

# 10. Authentication

Keep authentication logic inside:

```text
contexts/
hooks/
services/
```

Suggested flow:

```text
Login Page
    ↓
Auth Service
    ↓
Backend API
    ↓
Auth Context
    ↓
Application
```

Do not duplicate authentication state in many components.

---

# 11. Protected Routes

Customer/admin pages must not rely only on hiding UI buttons.

Use route protection.

Conceptually:

```text
User visits admin page
        ↓
Authenticated?
        ↓
Correct role?
        ↓
Allow / Redirect
```

But remember:

> Frontend route protection is for user experience, not security.

The backend must also check authorization.

---

# 12. Loading State

Avoid repeating loading code everywhere.

Current:

```jsx
if (loading) {
    return <Loader />;
}
```

is fine.

For reusable loading UI, keep:

```text
Loader.jsx
```

and/or:

```text
common/components/
```

Do not build a large state management system just for loading states.

---

# 13. Error Handling

API errors should have a consistent user experience.

Example:

```text
API request
    ↓
Success
    → show data

Failure
    → show useful message
```

Do not show raw backend errors such as:

```text
SQLSTATE...
500 Internal Server Error...
```

to normal users.

---

# 14. Forms

Forms should have:

```text
[ ] Input validation
[ ] Loading state
[ ] Error state
[ ] Success state
[ ] Disabled submit while processing
```

Avoid duplicate validation logic.

For example, date validation should have one clear place.

---

# 15. Booking UI

Booking is the most important frontend feature.

The frontend should:

```text
1. Validate date input
2. Show available cars
3. Show booking price
4. Prevent obvious invalid input
5. Send request to backend
6. Handle backend rejection
7. Refresh booking state
```

But:

> Never trust frontend booking validation as security.

The backend must check availability again.

---

# 16. State Management

Do not add Redux/Zustand/etc. unless the current application actually needs it.

The current project already has:

```text
contexts/
hooks/
```

Use these first.

Add global state only for truly global data such as:

```text
Authentication
Current user
Global application settings
```

Do not put every API response into global state.

---

# 17. Custom Hooks

Use hooks for reusable logic.

Example:

```text
hooks/
├── useAuth.js
├── useCars.js
├── useBooking.js
└── ...
```

But only create a hook when logic is reused or the component becomes too large.

Avoid:

```text
100 tiny hooks
```

---

# 18. Constants

Move repeated values into:

```text
src/common/constants/
```

Examples:

```javascript
export const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
};
```

Do not repeat strings throughout the application.

---

# 19. Utilities

Put small reusable functions inside:

```text
src/common/utils/
```

Examples:

```text
formatCurrency()
formatDate()
isValidDateRange()
```

Do not put business logic into random utility files.

---

# 20. TypeScript Migration

Do NOT rewrite the whole project to TypeScript immediately.

This is a gradual migration.

Recommended order:

```text
Phase 1
New reusable utilities
        ↓
Phase 2
API response models
        ↓
Phase 3
Custom hooks
        ↓
Phase 4
Important components
        ↓
Phase 5
Remaining components
```

New code can gradually use:

```text
.ts
.tsx
```

while old `.js/.jsx` files continue working.

Do not mix TypeScript conversion with a large architecture rewrite.

---

# 21. Component Size

If a component becomes very large, split it.

For example:

```text
BookingPage.jsx
```

can become:

```text
booking/
├── BookingPage.jsx
├── BookingForm.jsx
├── BookingSummary.jsx
└── BookingHistory.jsx
```

But do not split a 30-line component into five files.

Use common sense.

---

# 22. Naming

Use clear names.

Good:

```text
BookingForm.jsx
BookingSummary.jsx
useBooking.js
booking.js
formatCurrency.js
```

Avoid:

```text
abc.jsx
test2.jsx
newComponent.jsx
finalComponent.jsx
```

---

# 23. Remove Dead Code

During refactoring check for:

```text
[ ] Unused imports
[ ] Unused components
[ ] Unused hooks
[ ] Duplicate functions
[ ] Old API functions
[ ] Console.log()
[ ] Temporary test code
[ ] Commented-out old code
```

Do not delete something until you confirm it is unused.

---

# 24. ESLint

Keep ESLint.

Fix errors first.

Then fix important warnings.

Do not disable ESLint rules just to make the build pass.

Bad:

```javascript
// eslint-disable-next-line
```

Use it only when there is a real reason.

---

# 25. README

Replace the default Vite README with real project documentation.

The README should contain:

```text
# Car Rental Frontend

## About

## Features

## Tech Stack

## Application Structure

## Environment Variables

## API Configuration

## Installation

## Development

## Production Build

## Deployment

## Backend Repository
```

Also add screenshots if useful.

---

# 26. Environment Example

Create/update:

```text
.env.example
```

Example:

```text
VITE_API_BASE_URL=
```

Never commit real:

```text
API keys
tokens
passwords
private secrets
```

---

# 27. Testing

Do not add a huge testing system immediately.

Start with important user flows.

Priority:

```text
[ ] Login
[ ] Logout
[ ] Car listing
[ ] Car details
[ ] Booking
[ ] Booking history
[ ] Protected routes
```

Add tests gradually.

---

# 28. Performance

Do not optimize everything early.

First fix obvious issues:

```text
[ ] Unnecessary API calls
[ ] Duplicate requests
[ ] Large images
[ ] Unnecessary re-renders
[ ] Missing list keys
```

Use memoization only when there is a real reason.

Do not add:

```text
useMemo()
useCallback()
React.memo()
```

everywhere.

---

# 29. Refactoring Order

Follow this order.

## Phase 1 — Protect Current Application

```text
1. Run the application
2. Check login
3. Check main pages
4. Check car browsing
5. Check booking
6. Check history
```

---

## Phase 2 — Clean Code

```text
7. Remove unused imports
8. Remove console.log()
9. Remove dead code
10. Fix obvious duplicated code
```

---

## Phase 3 — API Layer

```text
11. Review services
12. Centralize API configuration
13. Remove duplicated API calls
14. Improve common error handling
```

---

## Phase 4 — Components

```text
15. Find very large components
16. Split only large components
17. Move reusable UI to common/
```

---

## Phase 5 — Hooks and Context

```text
18. Review contexts
19. Review hooks
20. Remove duplicated state logic
```

---

## Phase 6 — Booking

```text
21. Improve booking form
22. Improve loading state
23. Improve error handling
24. Handle backend availability errors
```

---

## Phase 7 — TypeScript

```text
25. Start gradual TypeScript migration
```

---

## Phase 8 — Documentation

```text
26. Rewrite README
27. Document environment variables
28. Document API setup
```

---

# 30. Important Refactoring Rule

Do NOT do this:

```text
Current React app
        ↓
Delete src/
        ↓
Create completely new architecture
```

Do this:

```text
Current React app
        ↓
Keep existing folders
        ↓
Improve one feature
        ↓
Test
        ↓
Move to next feature
```

The final project should still look familiar to the original developer.

---

# 31. Definition of Done

The frontend refactor is complete when:

```text
[ ] Existing UI still works
[ ] Existing features still work
[ ] API behavior is preserved
[ ] API calls are organized
[ ] Authentication is centralized
[ ] Protected routes are handled
[ ] Large components are split
[ ] Duplicate logic is reduced
[ ] Dead code is removed
[ ] Environment variables are clean
[ ] ESLint passes
[ ] Important user flows are tested
[ ] README explains the project
[ ] TypeScript migration can continue gradually
```

---

# 32. Final Architecture Principle

The project should follow this simple idea:

```text
                React UI
                   │
                   ▼
              Components
                   │
                   ▼
                Hooks
                   │
                   ▼
              Services
                   │
                   ▼
                REST API
                   │
                   ▼
             Laravel Backend
```

Keep the architecture simple.

Do not add patterns just because they are popular.

Every new folder, abstraction, library, or pattern must solve a real problem.

> Improve the existing project.
>
> Do not replace the existing project.