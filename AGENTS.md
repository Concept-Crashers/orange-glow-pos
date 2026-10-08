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

## Application rules
- Keep shared POS sample state in a root-mounted provider so navigation retains the session's cart, catalog, and sales; products, sales, stock history and store settings persist in Lovable Cloud; the cart stays in memory.
- Place each business workspace view at its own top-level route with distinct metadata; the root supplies shared navigation.
- Keep all visual styles and semantic color values in the global design system; business components consume its classes.
- Staff sign-in and roles (admin, manager, cashier) live in Lovable Cloud with roles in a separate user_roles table; the first account becomes admin, later ones cashier. Why: prevents privilege escalation.
- The shell gates every page by minimum role from its navigation list; server functions re-check roles. Why: UI gating alone is not security.
- AI sales insights and restock advice run in role-checked server functions that receive POS data from the client and call the AI Gateway. Why: keeps the key server-side.
- Store tables use role-based RLS (is_staff / is_manager / has_role); a trigger stops cashiers from changing products except reducing stock at checkout; the shell redirects signed-out visitors to /auth and `/` is a public landing page. Why: only authorized staff may change sales, inventory and settings.
- AI product finder (askProductMatch) is open to any staff role and only sees in-stock products. Why: cashiers need it at the till.
