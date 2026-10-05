import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [{ title: 'Set a new password — Tillpoint' }, { name: 'description', content: 'Choose a new password for your Tillpoint staff account.' }, { property: 'og:title', content: 'Set a new password — Tillpoint' }, { property: 'og:description', content: 'Choose a new password for your staff account.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState(''); const [error, setError] = useState(''); const navigate = useNavigate();
  async function submit(e: React.FormEvent) { e.preventDefault(); const { error } = await supabase.auth.updateUser({ password }); if (error) setError(error.message); else navigate({ to: '/' }); }
  return <main className="auth-page"><form className="auth-card auth-form" onSubmit={submit}><h1>Set a new password</h1><label>New password<input required type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)}/></label>{error && <p role="alert" className="auth-error">{error}</p>}<Button type="submit" className="w-full">Save password</Button></form></main>;
}
