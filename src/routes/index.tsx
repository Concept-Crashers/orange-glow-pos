import { createFileRoute } from '@tanstack/react-router';
import { PosRegister } from '@/components/pos-register';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Point of Sale — Tillpoint' }, { name: 'description', content: 'Fresh Market cashier workspace. Browse products, manage orders, and create receipts.' }, { property: 'og:title', content: 'Point of Sale — Tillpoint' }, { property: 'og:description', content: 'Fresh Market cashier workspace for products, orders, and receipts.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: PosRegister,
});
