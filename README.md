# Liberty Crest Realty

Liberty Crest Realty is a real-estate listing and inquiry platform for homes across Dallas, Houston, and the Rio Grande Valley.

## Current features

- Browse published property listings.
- View property details, photos, videos, pricing, and key property information.
- Filter and explore homes by location and listing details.
- Submit property inquiries through the public website.
- Manage property listings and media through the admin interface.
- Store property listings, media, and inquiries in Supabase.

## Technology

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Tailwind CSS
- Supabase (PostgreSQL, Auth, and Storage)
- Vite and Bun

## Development

Install dependencies and start the local development server:

```sh
bun install
bun run dev
```

Build the application:

```sh
bun run build
```

Run lint checks:

```sh
bun run lint
```

## Environment configuration

Configure the required Supabase project settings and any optional WhatsApp notification credentials in your deployment environment. Do not commit real secrets or private environment files to version control.

## Database

Supabase schema changes are tracked in `supabase/migrations/`. Apply the required migrations to the target Supabase project before relying on database-backed listings, media uploads, inquiries, or admin access.
