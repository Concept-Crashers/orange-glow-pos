import { createFileRoute } from '@tanstack/react-router';
import { PurchasingView } from '@/components/purchasing-view';
export const Route = createFileRoute('/purchasing')({
  head: () => ({ meta: [{ title: 'Purchasing — Tillpoint' }, { name: 'description', content: 'Suppliers, purchase orders, invoices and stock receiving.' }, { property: 'og:title', content: 'Purchasing — Tillpoint' }, { property: 'og:description', content: 'Suppliers, purchase orders, invoices and stock receiving.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: PurchasingView,
});
