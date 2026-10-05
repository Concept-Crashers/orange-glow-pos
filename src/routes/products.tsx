import { createFileRoute } from '@tanstack/react-router';
import { ProductsView } from '@/components/business-views';
export const Route = createFileRoute('/products')({
  head: () => ({ meta: [{ title: 'Products — Tillpoint' }, { name: 'description', content: 'Manage the Fresh Market product catalog, prices, and categories.' }, { property: 'og:title', content: 'Products — Tillpoint' }, { property: 'og:description', content: 'Manage the Fresh Market product catalog, prices, and categories.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ProductsView,
});
