import { createFileRoute } from '@tanstack/react-router';
import { CashierDashboard } from '@/components/staff-views';
export const Route = createFileRoute('/cashier')({
  head: () => ({ meta: [{ title: 'Cashier dashboard — Tillpoint' }, { name: 'description', content: 'Daily tasks, sales and low-stock alerts for cashiers.' }, { property: 'og:title', content: 'Cashier dashboard — Tillpoint' }, { property: 'og:description', content: 'Daily tasks, sales and low-stock alerts for cashiers.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: CashierDashboard,
});
