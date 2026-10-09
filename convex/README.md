# NavalHomes Convex backend

This directory is the planned backend source of truth for the NavalHomes marketplace.

## Deployment

- Convex Cloud URL: `https://hidden-pigeon-875.convex.cloud`
- HTTP Actions URL: `https://hidden-pigeon-875.convex.site`

Configure `CONVEX_DEPLOYMENT` through the authenticated Convex CLI workflow and `VITE_CONVEX_URL` in the frontend deployment environment. Do not commit deployment tokens or private keys.

## Local setup

1. Install dependencies with the repository's package manager.
2. Authenticate locally with the Convex CLI.
3. Run `npx convex dev` to generate `convex/_generated` and deploy the schema/functions to the selected development deployment.
4. Configure the Convex Auth site URL and allowed authentication origins using the current Convex Auth setup guide before enabling sign-in.
5. Add `VITE_CONVEX_URL=https://hidden-pigeon-875.convex.cloud` to the local environment and the Vercel project environment for the appropriate deployment target.

## Migration order

1. Deploy and validate the schema and public property queries.
2. Migrate approved property/media records from Supabase; verify row counts and field mappings before switching reads.
3. Switch public listing/detail reads to Convex and seller submissions to `sellerLeads`.
4. Implement Convex Auth sign-in, profiles, role assignment, investor verification, and server-enforced authorization.
5. Add saved deals, document requests, offers, status milestones, and admin audit workflows.
6. Verify Vercel build/runtime and production behavior before removing legacy Supabase paths.

Do not expose exact street addresses, private seller details, contract files, or unapproved opportunities through public queries. A contract assignment must not be publicly represented as verified until the required contractual rights and written disclosures have been checked.

## Important implementation notes

- `properties.price` is the single opportunity price field.
- Public queries deliberately return `address: null`; restricted investor document/address access is a later authenticated milestone.
- New property records must explicitly use `review_status: "published"` before they are visible publicly.
- This schema does not migrate existing Supabase data automatically.
