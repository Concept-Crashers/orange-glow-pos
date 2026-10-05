import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useAuth } from '@/lib/auth';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [{ title: 'Sign in — Tillpoint' }, { name: 'description', content: 'Sign in or create a staff account for the Fresh Market till.' }, { property: 'og:title', content: 'Sign in — Tillpoint' }, { property: 'og:description', content: 'Staff sign in for the Fresh Market point of sale.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: AuthPage,
});

function AuthPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (session) navigate({ to: '/' }); }, [session, navigate]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    if (mode === 'signin') { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setError(error.message); }
    else if (mode === 'signup') { const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } } }); if (error) setError(error.message); else if (!data.session) setMessage('Check your email to confirm your account, then sign in.'); }
    else { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) setError(error.message); else setMessage('We sent a password reset link to your email.'); }
    setBusy(false);
  }
  async function google() { setError(''); const r = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin }); if (r.error) setError(r.error.message ?? 'Google sign-in failed.'); }
  return <main className="auth-page"><div className="auth-card">
    <div className="brand auth-brand"><span className="brand-symbol"><ShoppingBasket size={23}/></span>till<span className="text-primary">point</span><span className="brand-dot">.</span></div>
    <h1>{mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create staff account' : 'Reset your password'}</h1>
    <p className="auth-sub">{mode === 'signup' ? 'New accounts start as cashiers. An administrator can change your role.' : 'Fresh Market · Main store'}</p>
    <form onSubmit={submit} className="auth-form">
      {mode === 'signup' && <label>Full name<input required value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name"/></label>}
      <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/></label>
      {mode !== 'reset' && <label>Password<input required type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}/></label>}
      {error && <p role="alert" className="auth-error">{error}</p>}
      {message && <p className="auth-message">{message}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</Button>
    </form>
    {mode !== 'reset' && <><div className="auth-divider"><span>or</span></div><Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button></>}
    <div className="auth-links">
      {mode === 'signin' ? <><button onClick={() => setMode('signup')}>Create an account</button><button onClick={() => setMode('reset')}>Forgot password?</button></> : <button onClick={() => setMode('signin')}>Back to sign in</button>}
    </div>
  </div></main>;
}
