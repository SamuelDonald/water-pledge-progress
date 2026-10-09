# NavalHomes

NavalHomes is a real-estate and contract-opportunity marketplace for Dallas, Houston, and the Rio Grande Valley.

## Product scope

- Browse reviewed property and acquisition opportunities.
- Distinguish contract assignments, direct purchases, and seller introductions.
- Submit seller leads for review; seller submissions are not automatically published.
- Build investor workflows for saved deals, document requests, offers, and status tracking.
- Keep exact addresses, seller contact details, and transaction documents behind appropriate access controls.

## Technology

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Tailwind CSS
- Convex for the target marketplace backend and Convex Auth
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

## Convex setup

The Convex schema, authentication configuration, public property queries, and seller-lead mutation are being introduced on the `feat/convex-backend-foundation` branch.

1. Authenticate with the Convex CLI in your own terminal.
2. Run `npx convex dev` to generate `convex/_generated` and deploy the backend to your selected development deployment.
3. Set `VITE_CONVEX_URL=https://hidden-pigeon-875.convex.cloud` in your local environment and Vercel project.
4. Configure Convex Auth's site URL and authentication origins using the current official setup instructions.
5. Validate schema deployment and queries before migrating existing records or switching the live frontend.

Do not commit deployment tokens, private keys, or secret environment files. The public Convex URL is not a secret.

## Migration status

This branch establishes the Convex foundation but does not automatically migrate existing Supabase records or switch all frontend reads and admin workflows. Existing Supabase paths must remain in place until their replacements are connected, tested, and verified. Do not remove Supabase credentials or database resources as part of the foundation step.

## Marketplace safety rules

- `properties.price` is the single opportunity price field.
- A seller lead is not a published listing or a verified contract assignment.
- Contract assignments must not be publicly represented as verified until contractual rights and required written disclosures have been checked.
- Public property queries intentionally withhold exact street addresses.
- Do not use fabricated records as real marketplace inventory.
