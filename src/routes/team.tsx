import { createFileRoute } from '@tanstack/react-router';
import { TeamView } from '@/components/role-views';
export const Route = createFileRoute('/team')({
  head: () => ({ meta: [{ title: 'Team & roles — Tillpoint' }, { name: 'description', content: 'Manage staff accounts and roles for the store.' }, { property: 'og:title', content: 'Team & roles — Tillpoint' }, { property: 'og:description', content: 'Manage staff accounts and roles for the store.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: TeamView,
});
