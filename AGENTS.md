<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

Escrow experiences use top-level TanStack file routes; browser auth gates the screens, while every private read and state change is authorized again inside its server function.

Share escrow record displays and mutation feedback between workspaces to keep transaction status and error handling consistent.
Validate sign-in return paths against escrow destinations so private invitations survive authentication without allowing external redirects.
Inactive payment methods accept preferences only, never payment references, so configuration placeholders cannot be treated as real deposits.
