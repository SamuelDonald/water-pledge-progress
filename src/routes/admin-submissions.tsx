import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy Liberty Crest Realty route. The former property marketplace has been retired.
export const Route = createFileRoute("/admin-submissions")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});
