import { createFileRoute } from '@tanstack/react-router';
import { ReportsView } from '@/components/business-views';
export const Route = createFileRoute('/reports')({
  head: () => ({ meta: [{ title: 'Reports — Tillpoint' }, { name: 'description', content: 'View and export Fresh Market sales, profit, and inventory reports.' }, { property: 'og:title', content: 'Reports — Tillpoint' }, { property: 'og:description', content: 'View and export Fresh Market sales, profit, and inventory reports.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ReportsView,
});
