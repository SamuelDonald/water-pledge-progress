# WaterForPuertoRico.org — Phase 1

A transparency-first donation platform for Puerto Rico's water crisis. Phase 1 covers the full public donor experience with real payments, a real database, and English/Spanish throughout. Volunteer, organization, and admin portals come in a later phase.

## What gets built

**Landing page (`/`)**
Hero with the requested headline and copy, "Donate Now" + "View Impact" buttons, live crisis dashboard, featured campaigns, a community stories strip, and a transparency teaser.

**Live crisis dashboard**
Families supported, liters delivered, communities reached, active campaigns, funds raised, current drought severity, and a reservoir status card marked as pending integration. All values come from the database and update as donations land.

**Campaigns (`/campaigns`, `/campaigns/:slug`)**
Each campaign shows community name, goal, progress bar, beneficiary count, the specific need (filters, bottled water, cisterns, trucks), photo/video gallery, and a timeline of updates. Seeded with the four example campaigns: Water for San Juan Families, Emergency Water Trucks for Loíza, School Water Supply Initiative, Community Cistern Installation.

**Donation flow (`/donate`, `/donate/:campaign`)**
One-time or monthly. Presets $10 / $25 / $50 / $100 plus custom. Optional dedication note and anonymous toggle. Checkout is hosted and secure; Apple Pay and Google Pay appear automatically for eligible devices. Thank-you page shows the personalized impact of that gift (liters funded, families helped) and links to the donor's tracker.

**Impact tracker (`/impact`)**
Donor signs in by email to see total donated, campaigns supported, families helped, liters funded, updates from the communities they backed, and downloadable receipts.

**Community stories (`/stories`, `/stories/:slug`)**
Photo, video, and written testimonials from recipients, linked back to the campaign they came from.

**Emergency map (`/map`)**
Interactive map of Puerto Rico with drought-severity shading by municipality, markers for communities receiving aid, active campaigns, distribution points, and delivery progress. Click a marker to open a campaign summary.

**Transparency (`/transparency`)**
Financial breakdown (program vs. administrative vs. payment processing), monthly reports, audits section (placeholder until available), partner organizations, and delivery metrics. Every figure is derived from recorded donations and deliveries, not hardcoded.

**Bilingual**
Language toggle in the header, English/Spanish for all UI copy and for campaign, story, and update content. Choice persists across visits.

## Design direction

Not a generic charity template. Deep Atlantic-blue and sand palette drawn from Puerto Rico's coast, one clear accent for urgency, generous typography, data presented like a newsroom crisis tracker rather than a marketing page. Motion is restrained: counters count up, progress bars fill on scroll.

## Technical notes

- Built on this project's stack: TanStack Start (React + Vite) with Tailwind, TanStack Router routes, and server functions — not Next.js. Deployed and hosted by Lovable rather than Vercel; functionally equivalent.
- Backend is Lovable Cloud (Supabase under the hood): Postgres, auth, storage for photos/videos, and server-side functions. Cloudinary is not needed.
- Payments: Lovable's built-in Stripe integration (test mode first, no Stripe account setup needed). This covers cards, Apple Pay, and Google Pay via hosted checkout, plus recurring monthly gifts. PayPal is not supported by the built-in integration and is deferred — I'll note it as a future addition rather than pretend it's wired.
- Tables: `campaigns`, `campaign_updates`, `communities`, `donations`, `donors`, `stories`, `deliveries`, `partners`, `financial_reports`, with translated text columns for EN/ES. RLS: public read on published rows only; donations readable only by the owning donor; all writes server-side.
- Donation records are written by a verified Stripe webhook, never trusted from the browser. Dashboard/transparency totals are computed from those rows.
- Map: Leaflet with OpenStreetMap tiles plus stored municipality drought values — no map API key required. Live NOAA / U.S. Drought Monitor ingestion is deferred; drought severity is an editable field for now, so the UI is ready for the feed.
- Seed data: realistic campaigns, communities, stories, and delivery records inserted by migration so the site is fully populated on first load. Clearly labeled sample content where it stands in for real reporting.

## Explicitly deferred

Volunteer portal, organization portal, admin dashboard, SMS donations, corporate sponsorships, matching campaigns, fraud detection, live reservoir/weather feeds, blockchain tracking, mobile app, PayPal.

## Order of work

1. Enable Lovable Cloud + Stripe payments; create schema and seed data.
2. Design system, bilingual layout, header/footer, language toggle.
3. Landing page + crisis dashboard.
4. Campaigns list and detail.
5. Donation flow, checkout, webhook, thank-you page.
6. Impact tracker with sign-in and receipts.
7. Stories, map, transparency page.
8. SEO metadata per route, responsive pass, review.
