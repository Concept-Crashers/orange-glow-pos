import { createFileRoute } from '@tanstack/react-router';
import { InsightsView } from '@/components/role-views';
export const Route = createFileRoute('/insights')({
  head: () => ({ meta: [{ title: 'Sales insights — Tillpoint' }, { name: 'description', content: 'Ask questions about store sales and get AI-powered, actionable advice.' }, { property: 'og:title', content: 'Sales insights — Tillpoint' }, { property: 'og:description', content: 'Ask questions about store sales and get AI-powered, actionable advice.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: InsightsView,
});
