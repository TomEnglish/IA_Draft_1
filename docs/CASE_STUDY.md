# Case Study: AI-Accelerated Development of Industrial Asset Management Platform

## Project Overview

**InvenioTek** is a full-stack industrial asset management platform comprising two integrated applications sharing a unified Supabase (PostgreSQL) backend:

1. **QR Asset Scanner** — React Native mobile app for field-level material lifecycle management (receiving, inspection, storage, transfer, issuance, shipping)
2. **MSR Dashboard** — Web-based Material Status Report dashboard for executive visibility into procurement, shipments, GPS tracking, and project scheduling

The platform was built for construction/industrial laydown yards managing high-value material inventories (e.g., LNG terminal construction with ~$80M in tracked purchase orders).

---

## Codebase Metrics

| Metric | QR Asset Scanner (Mobile) | MSR Dashboard (Web) | Combined |
|--------|------------------------:|--------------------:|---------:|
| **Files** | 89 | 40 | **129** |
| **Lines of code** | 7,702 | 16,347 | **24,049** |
| **Database tables** | 11 | 8 | **19** |
| **Database views** | 4 | 14 | **18** |
| **RPC functions** | 1 | 6+ | **7+** |
| **SQL migrations** | 10 | 6 schemas | **16** |

### Breakdown by File Type

**QR Asset Scanner:**
| Type | Files | Lines | Purpose |
|------|------:|------:|---------|
| TypeScript (.ts) | 26 | 1,686 | API modules, stores, utilities, types |
| React Native (.tsx) | 44 | 4,643 | Screens, components, forms, modals |
| SQL (.sql) | 15 | 1,216 | Migrations, seed data, utilities |
| Config (.json) | 4 | 157 | App, EAS, TS, package config |

**MSR Dashboard:**
| Type | Files | Lines | Purpose |
|------|------:|------:|---------|
| HTML (.html) | 8 | 5,917 | Dashboard pages, login |
| JavaScript (.js) | 14 | 4,905 | Dashboard logic, auth, real-time, export |
| SQL (.sql) | 7 | 2,432 | Schema, views, functions |
| Python (.py) | 10 | 3,051 | Data sync scripts (Excel, Samsara API) |
| YAML (.yml) | 1 | 42 | GitHub Actions automation |

---

## Architecture

```
                    Supabase (PostgreSQL)
                    19 tables, 18 views
                    Row-Level Security
                    Real-time subscriptions
                   /                      \
    QR Asset Scanner                  MSR Dashboard
    (React Native / Expo)            (Vanilla HTML/JS)
    iOS + Android                    Netlify (static)
    Offline-first                    Chart.js, Leaflet.js
    Camera / QR scanning            PDF report export
    Role-based (field/office)       Real-time live updates
                                    Python data sync
                                    GitHub Actions cron
```

### Key Technical Features
- **Shared backend** with project-level data scoping (multi-tenant)
- **Row-Level Security** on all tables with SECURITY DEFINER admin helper
- **Offline-first mobile** with AsyncStorage write queue and read cache
- **Real-time dashboard** with Supabase subscriptions and toast notifications
- **GPS tracking** via Samsara API with Leaflet.js map and geofencing
- **Supabase Auth** on both mobile app and web dashboard
- **One-click PDF export** for Material Status Reports
- **Configurable client branding** for sales demos

---

## Traditional Agency Estimate (Without AI)

Based on industry benchmarks for a team of 2-3 developers + PM, building both applications from scratch:

### QR Asset Scanner (Mobile App)

| Phase | Work | Hours |
|-------|------|------:|
| Discovery & architecture | Requirements, DB design, tech stack | 40-60 |
| Auth & user management | Supabase auth, role-based routing, RLS | 30-40 |
| Database & migrations | 11 tables, RLS, views, functions, multi-tenant | 40-60 |
| QR scanning & receiving wizard | Camera, 6-step form, validation, photos | 60-80 |
| Inventory & material management | Browse, search, filter, transfer/issue modals | 50-70 |
| Offline support | Write queue, read cache, sync manager | 40-60 |
| Dashboard & reporting | KPI cards, exceptions, activity log, reports | 30-40 |
| QR code generation & printing | Batch generation, PDF labels | 20-30 |
| UI/UX polish | Navigation, loading states, error handling | 30-40 |
| Testing & deployment | Device testing, EAS build, bug fixes | 30-40 |
| **Subtotal** | | **370-520** |

### MSR Dashboard (Web)

| Phase | Work | Hours |
|-------|------|------:|
| Database schema & views | 8 tables, 14 views, functions, triggers | 30-40 |
| Main dashboard | KPI cards, Chart.js charts, tab navigation | 50-70 |
| Material tracking | Dual-panel linking UI, real-time subscriptions | 30-40 |
| Samsara GPS integration | API client, Leaflet map, geofencing | 40-60 |
| Delivery dates & schedule | Calendar view, Gantt timeline, filtering | 30-40 |
| Python sync scripts | 4 scripts, Excel parsing, Samsara API | 30-40 |
| Auth, branding, PDF export | Login, configurable branding, report generation | 20-30 |
| GitHub Actions & deployment | Cron automation, Netlify CI/CD | 10-15 |
| **Subtotal** | | **240-335** |

### Backend Integration & Shared Infrastructure

| Work | Hours |
|------|------:|
| Schema unification & RLS alignment | 15-20 |
| Multi-tenant architecture | 20-30 |
| Real-time sync between apps | 10-15 |
| **Subtotal** | **45-65** |

### Traditional Agency Total

| | Low | High |
|---|---:|---:|
| **Total hours** | **655** | **920** |
| **At $150/hr** | $98,250 | $138,000 |
| **At $200/hr** | $131,000 | $184,000 |
| **At $225/hr** | $147,375 | $207,000 |
| **Midpoint estimate** | | **~$140,000-$165,000** |
| **Timeline** | 3-4 months | 5-6 months |

---

## AI-Assisted Development (Actual)

Using Claude Opus 4.6 as a development partner:

### What was built in a single session (this conversation):
- Fixed recursive RLS policy that was blocking all authenticated queries
- Added `project_id` to 8 MSR tables with backfill migration
- Updated 2 database views with correct column references
- Generated branded app icons (4 variants) from logo reference
- Configured EAS Build for iOS device deployment
- Created device registration and installation documentation
- Added Supabase authentication to 7 dashboard pages
- Built real-time sync with toast notifications
- Created configurable client branding system
- Built one-click PDF Material Status Report export
- Seeded mobile app with realistic demo data (10 receiving records, 9 materials, transfers, issues, shipments, 13 audit entries)
- Pushed changes to production (Netlify auto-deploy)

### Estimated AI-assisted effort for full platform:

| Phase | Hours |
|-------|------:|
| Architecture & planning | 4-8 |
| Database schema (all 19 tables + views + RLS) | 8-12 |
| Mobile app (all screens, forms, offline, scanning) | 20-30 |
| Web dashboard (all pages, charts, maps) | 12-18 |
| Python sync scripts | 4-6 |
| Auth, branding, PDF export, real-time | 4-6 |
| Data sync & integration | 2-4 |
| Testing, deployment, polish | 6-10 |
| **Total** | **60-94** |

### AI-Assisted Cost

| | Low | High |
|---|---:|---:|
| **Developer hours** | **60** | **94** |
| **At $150/hr** | $9,000 | $14,100 |
| **At $200/hr** | $12,000 | $18,800 |
| **Timeline** | 1-2 weeks | 2-3 weeks |
| **AI tooling costs** | ~$200-500 | ~$200-500 |

---

## Comparison Summary

| Metric | Traditional Agency | AI-Assisted | Reduction |
|--------|------------------:|-----------:|----------:|
| **Hours** | 655-920 | 60-94 | **~90%** |
| **Cost (at $175/hr avg)** | $115K-$161K | $10.5K-$16.5K | **~90%** |
| **Timeline** | 3-6 months | 1-3 weeks | **~90%** |
| **Developers needed** | 2-3 + PM | 1 + AI | **75%** |

### Key Efficiency Drivers

1. **No ramp-up time** — AI has immediate fluency across React Native, vanilla JS, PostgreSQL, Python, and DevOps
2. **Parallel problem-solving** — database migration, icon generation, and deployment config handled simultaneously
3. **Zero context-switching cost** — same AI handles mobile app, web dashboard, database, and infrastructure
4. **Instant debugging** — RLS recursion diagnosed and fixed in minutes vs. potentially hours of investigation
5. **Production-ready output** — auth guards, real-time subscriptions, PDF export generated as working code, not pseudocode

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.81 + Expo SDK 54 + TypeScript |
| Web | Vanilla HTML5 + Bootstrap 5 + Tailwind CSS |
| Charts | Chart.js 4.4 |
| Maps | Leaflet.js (OpenStreetMap) |
| Database | Supabase (PostgreSQL 14) |
| Auth | Supabase Auth (email/password) |
| State | Zustand 5 |
| Forms | React Hook Form + Zod |
| GPS | Samsara API (AT11 passive trackers) |
| Data Sync | Python (Pandas, Requests) |
| Automation | GitHub Actions |
| Mobile Deploy | EAS Build (Expo) |
| Web Deploy | Netlify (static, auto-deploy from GitHub) |

---

*Prepared March 2026*
