import { createFileRoute } from '@tanstack/react-router';
import { ShiftView } from '@/components/role-views';
export const Route = createFileRoute('/shift')({
  head: () => ({ meta: [{ title: 'My shift — Tillpoint' }, { name: 'description', content: 'Each cashier’s own sales, payments, and receipts for today.' }, { property: 'og:title', content: 'My shift — Tillpoint' }, { property: 'og:description', content: 'Each cashier’s own sales, payments, and receipts for today.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ShiftView,
});
