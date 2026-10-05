import { createFileRoute } from '@tanstack/react-router';
import { SalesView } from '@/components/business-views';
export const Route = createFileRoute('/sales')({
  head: () => ({ meta: [{ title: 'Transactions — Tillpoint' }, { name: 'description', content: 'Review Fresh Market transactions, receipts, payment methods, and refunds.' }, { property: 'og:title', content: 'Transactions — Tillpoint' }, { property: 'og:description', content: 'Review Fresh Market transactions, receipts, payment methods, and refunds.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: SalesView,
});
