import { createFileRoute } from '@tanstack/react-router';
import { SettingsView } from '@/components/staff-views';
export const Route = createFileRoute('/settings')({
  head: () => ({ meta: [{ title: 'Store settings — Tillpoint' }, { name: 'description', content: 'Shop name, address and phone number shown on printed receipts.' }, { property: 'og:title', content: 'Store settings — Tillpoint' }, { property: 'og:description', content: 'Shop name, address and phone number shown on printed receipts.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: SettingsView,
});
