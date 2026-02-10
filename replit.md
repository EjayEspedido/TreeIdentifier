# EcoPlan - Interactive Map-Based Environmental Planning Application

## Overview

EcoPlan is an interactive map-based web application for environmental planning in the Philippines. Users click on a map to identify the nearest barangay (village), view its information (name, population, coordinates, flood risk, urban density), and receive tree planting recommendations based on land area input. The app uses Leaflet for mapping, calculates nearest barangay using coordinate distance, and recommends suitable tree species based on environmental constraints like flood risk and urban density.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (client/)
- **Framework**: React 18 with TypeScript, built with Vite
- **Routing**: Wouter (lightweight router) — single main route (`/` → Dashboard)
- **State Management**: TanStack React Query for server state; local React state for UI
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives, styled with Tailwind CSS
- **Mapping**: Leaflet + react-leaflet with OpenStreetMap tiles (no API key needed)
- **Animations**: Framer Motion for smooth UI transitions
- **Styling**: Tailwind CSS with CSS variables for theming (earthy green eco palette), custom fonts (Outfit for display, Plus Jakarta Sans for body)
- **Key Pages**: Dashboard (map + side panel), NotFound
- **Key Components**: MapController (handles map clicks, markers), TreeCard (displays tree recommendations)
- **Custom Hooks**: `use-eco-data.ts` (useBarangays, useNearestBarangay, useRecommendTrees), `use-mobile.tsx`, `use-toast.ts`
- **Path Aliases**: `@/` → `client/src/`, `@shared/` → `shared/`

### Backend (server/)
- **Framework**: Express.js on Node with TypeScript (tsx runner)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Key Endpoints**:
  - `GET /api/barangays` — list all barangays
  - `GET /api/barangays/nearest?lat=&lng=` — find nearest barangay to coordinates
  - `POST /api/trees/recommend` — get tree recommendations based on land area and barangay
  - `GET /api/trees` — list all trees
- **Route Definitions**: Shared route contracts in `shared/routes.ts` with Zod validation schemas
- **Storage Layer**: `IStorage` interface implemented by `DatabaseStorage` class, abstracting database access
- **Distance Calculation**: Currently uses Euclidean distance on coordinates (small dataset); designed to upgrade to Haversine or PostGIS
- **Dev Server**: Vite dev middleware served through Express in development
- **Production**: Static files served from `dist/public` after build

### Shared (shared/)
- **Schema**: Drizzle ORM table definitions for `barangays` and `trees` tables in `shared/schema.ts`
- **Routes**: API contract definitions with Zod validation in `shared/routes.ts`
- **Types**: Shared TypeScript types (Barangay, Tree, InsertBarangay, InsertTree) inferred from Drizzle schema

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (requires `DATABASE_URL` environment variable)
- **Schema Push**: `npm run db:push` uses drizzle-kit to push schema to database
- **Tables**:
  - `barangays`: id, name, latitude, longitude, population, flood_risk, urban_density
  - `trees`: id, name, scientific_name, description, image_url, min_area_sqm, flood_resilient, urban_suitable, growth_timeline (JSONB)
- **Seeding**: Storage has a `hasData()` method to check if data needs seeding on startup

### Build System
- **Dev**: `tsx server/index.ts` with Vite HMR middleware
- **Build**: Custom `script/build.ts` — Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Production**: `node dist/index.cjs` serves static files + API

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable using `pg` (node-postgres) pool
- **OpenStreetMap**: Map tile provider (free, no API key required)
- **Leaflet CDN**: CSS loaded from unpkg CDN in index.html
- **Google Fonts**: Outfit, Plus Jakarta Sans, DM Sans, Fira Code, Geist Mono, Architects Daughter loaded via Google Fonts CDN
- **External Marker Icons**: Green marker icons loaded from GitHub (pointhi/leaflet-color-markers) and cdnjs
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev only)
- **Session Store**: `connect-pg-simple` available for PostgreSQL-backed sessions (if auth is added later)