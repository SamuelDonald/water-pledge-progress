# Liberty Crest Escrow Services

Liberty Crest Escrow Services is being defined as a Texas-focused residential real-estate transaction and escrow coordination platform. The planned product replaces the legacy property-listing and seller-inquiry experience with realtor-led transaction creation, invited buyer onboarding, document review, payment tracking, buyer confirmation, and administrator-authorized release workflows.

## Product decisions
- Texas residential transactions, with featured markets and statewide inquiry coverage.
- Premium, warm, editorial luxury real-estate design.
- Passwordless email OTP for buyers.
- Open realtor registration with verification and administrator approval.
- Roles: Administrator, Authorized Realtor, Buyer, Escrow Officer.
- Buyers enter through realtor-issued transaction invitations.
- Bank wire and cryptocurrency are planned payment methods; provider and custody integrations remain disabled placeholders until formally selected and configured.
- Every fund release requires explicit administrator authorization.

## Product documentation
- [Product specification](docs/LIBERTY_CREST_ESCROW_PRODUCT_SPEC.md)
- [Backend integration implementation prompt](docs/BACKEND_INTEGRATION_PROMPT.md)

## Technology baseline
The current repository package manifest identifies React 19, TypeScript, TanStack Start/Router, Tailwind CSS, Vite, and Bun. The existing README describes a Supabase-backed property listing implementation. Verify the actual deployed backend and current source before implementing migrations or integrations; do not assume the old data model is suitable for escrow workflows.

## Development
Install dependencies and start the development server:

```sh
bun install
bun run dev
```

Build:

```sh
bun run build
```

Lint:

```sh
bun run lint
```

## Important implementation status
This branch currently adds product and backend-integration specifications. It does not claim that the application UI, authentication, database schema, payment processing, custody, or disbursement workflows have been implemented. Wire and cryptocurrency payment flows must remain unavailable until the approved provider/custody architecture is configured and tested. Never use real funds or represent funds as secured based solely on client-submitted evidence.
