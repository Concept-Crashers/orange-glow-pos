import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/auth-page';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Sign in — Tillpoint' }, { name: 'description', content: 'Sign in or create a staff account for the Fresh Market till.' }, { property: 'og:title', content: 'Sign in — Tillpoint' }, { property: 'og:description', content: 'Staff sign in for the Fresh Market point of sale.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: AuthPage,
});
