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
- Keep shared POS sample state in a root-mounted provider so navigation retains the session's cart, catalog, and sales; this UI pass has no persistent or authenticated backend.
- Place each business workspace view at its own top-level route with distinct metadata; the root supplies shared navigation.
- Keep all visual styles and semantic color values in the global design system; business components consume its classes.
