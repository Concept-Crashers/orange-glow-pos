import { createFileRoute } from '@tanstack/react-router';
import { ProductFinderView } from '@/components/role-views';
export const Route = createFileRoute('/assist')({
  head: () => ({ meta: [{ title: 'Product finder — Tillpoint' }, { name: 'description', content: 'Describe a customer’s needs and get AI-recommended in-stock products.' }, { property: 'og:title', content: 'Product finder — Tillpoint' }, { property: 'og:description', content: 'AI product recommendations from the in-stock catalog.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ProductFinderView,
});
