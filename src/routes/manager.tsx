import { createFileRoute } from '@tanstack/react-router';
import { ManagerDashboard } from '@/components/staff-views';
export const Route = createFileRoute('/manager')({
  head: () => ({ meta: [{ title: 'Manager dashboard — Tillpoint' }, { name: 'description', content: 'Store performance, cashier activity and tasks for managers.' }, { property: 'og:title', content: 'Manager dashboard — Tillpoint' }, { property: 'og:description', content: 'Store performance, cashier activity and tasks for managers.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ManagerDashboard,
});
