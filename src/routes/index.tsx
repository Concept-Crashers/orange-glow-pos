import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/components/landing-page';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Tillpoint — Point of sale for modern stores' }, { name: 'description', content: 'Fast checkout, live stock, receipts, sales dashboards and AI tools for retail stores.' }, { property: 'og:title', content: 'Tillpoint — Point of sale for modern stores' }, { property: 'og:description', content: 'Fast checkout, live stock, receipts and AI tools for retail teams.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: LandingPage,
});
