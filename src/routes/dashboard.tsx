import { createFileRoute } from '@tanstack/react-router';
import { DashboardView } from '@/components/business-views';
export const Route = createFileRoute('/dashboard')({
  head: () => ({ meta: [{ title: 'Business Overview — Tillpoint' }, { name: 'description', content: 'Fresh Market sales performance, gross profit, and best-selling products.' }, { property: 'og:title', content: 'Business Overview — Tillpoint' }, { property: 'og:description', content: 'Fresh Market sales performance, gross profit, and best-selling products.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: DashboardView,
});
