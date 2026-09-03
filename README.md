# Journey Wheel — Car Rental Frontend

React + Vite frontend for the Journey Wheel car rental platform.

## About

Journey Wheel lets customers find, select, and book rental cars, while staff and
admins manage the fleet, offices, bookings, deliveries, and maintenance through
dedicated dashboards.

## Features

- Customer car search, car listing, and booking flow
- Booking history and profile management
- Live map for pickup/drop-off locations
- Staff dashboard: deliveries, pickups, maintenance, contact messages
- Admin dashboard: user management, car management, locations, reports

## Tech Stack

- React 19 + Vite 6
- Material UI (MUI), Ant Design
- React Router 7, React Leaflet
- Tailwind CSS (via `@tailwindcss/vite`)
- GSAP / AOS (animations), Recharts (charts)
- Dayjs (dates)

## Application Structure

```text
src/
  common/            Shared UI components and hooks
  contexts/          React context providers (user, role, form, and messages)
  services/          API layer (DataServices, Configuration, BaseUrl)
  view/
    home/            Public landing page components
    ride/            Booking / ride flow (Ride, Review, etc.)
    profile/         User profile
    admin/           Admin & staff dashboards and components
  history/           Booking history
  contactUs/         Contact form
  types.ts           Shared API/domain types
```

## Environment Variables

Create a `.env` file (see `.env.example`) with:

```text
VITE_API_BASE_URL=        # Backend base URL, e.g. https://your-backend.onrender.com
VITE_TOMTOM_KEY=          # TomTom maps API key
```

Never commit real API keys or tokens. `.env` is gitignored.

## API Configuration

All requests go through `src/services/DataServices.ts`, which exposes generic
response types and resolves the base URL from `VITE_API_BASE_URL` (falling back
to the configured production host in `src/services/BaseUrl.ts`).

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
npm run lint
npm run typecheck
```

## Production Build

```bash
npm run build
npm run preview
```

## Deployment

The frontend is deployed on Vercel. Set the `VITE_API_BASE_URL` and
`VITE_TOMTOM_KEY` environment variables in your hosting provider's settings.

## Backend Repository

The Laravel backend lives in `../backend`. It must be reachable at the URL set
in `VITE_API_BASE_URL`.
