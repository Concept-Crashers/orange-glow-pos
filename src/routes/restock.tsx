import { createFileRoute } from '@tanstack/react-router';
import { RestockView } from '@/components/staff-views';
export const Route = createFileRoute('/restock')({
  head: () => ({ meta: [{ title: 'Restock advice — Tillpoint' }, { name: 'description', content: 'AI-powered restock recommendations from stock levels and recent sales.' }, { property: 'og:title', content: 'Restock advice — Tillpoint' }, { property: 'og:description', content: 'AI-powered restock recommendations from stock levels and recent sales.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: RestockView,
});
