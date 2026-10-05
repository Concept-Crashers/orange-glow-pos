import { createFileRoute } from '@tanstack/react-router';
import { InventoryView } from '@/components/business-views';
export const Route = createFileRoute('/inventory')({
  head: () => ({ meta: [{ title: 'Inventory — Tillpoint' }, { name: 'description', content: 'Track stock quantities, adjustments, low-stock products, and inventory value.' }, { property: 'og:title', content: 'Inventory — Tillpoint' }, { property: 'og:description', content: 'Track stock quantities, adjustments, low-stock products, and inventory value.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: InventoryView,
});
