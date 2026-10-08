import { useEffect, useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { ShoppingBasket, Mail, Lock, User, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useAuth } from '@/lib/auth';

export const HOME_ROUTE = '/register';
export const ROLE_HOME = { admin: '/dashboard', manager: '/manager', cashier: '/cashier' } as const;

export function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>;
}

function Field({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return <label>{label}<span className="auth-input"><Icon size={17}/>{children}</span></label>;
}

export function AuthPage() {
  const { session, role, ready } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [fullName, setFullName] = useState(''); const [show, setShow] = useState(false);
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [googleBusy, setGoogleBusy] = useState(false);
  useEffect(() => { if (session && ready && role) navigate({ to: ROLE_HOME[role] }); }, [session, role, ready, navigate]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    if (mode === 'signin') { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setError(error.message); }
    else if (mode === 'signup') { const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } } }); if (error) setError(error.message); else if (!data.session) setMessage('Check your email to confirm your account, then sign in.'); }
    else { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) setError(error.message); else setMessage('We sent a password reset link to your email.'); }
    setBusy(false);
  }
  async function google() { setError(''); setGoogleBusy(true); const r = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin }); if (r.error) { setError(r.error.message ?? 'Google sign-in failed.'); setGoogleBusy(false); } else if (!r.redirected) setGoogleBusy(false); }
  const switchTo = (m: typeof mode) => { setMode(m); setError(''); setMessage(''); };
  return <main className="auth-page"><div className="auth-card">
    <div className="brand auth-brand"><span className="brand-symbol"><ShoppingBasket size={23}/></span>till<span className="text-primary">point</span><span className="brand-dot">.</span></div>
    <h1>{mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create staff account' : 'Reset your password'}</h1>
    <p className="auth-sub">{mode === 'signup' ? 'New accounts start as cashiers. An administrator can change your role.' : mode === 'reset' ? 'Enter your email and we’ll send you a reset link.' : 'Sign in to open the Fresh Market till.'}</p>
    <form onSubmit={submit} className="auth-form">
      {mode === 'signup' && <Field icon={User} label="Full name"><input required placeholder="e.g. Sarah Namuli" value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name"/></Field>}
      <Field icon={Mail} label="Email"><input required type="email" placeholder="you@freshmarket.ug" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/></Field>
      {mode !== 'reset' && <Field icon={Lock} label="Password"><input required type={show ? 'text' : 'password'} minLength={6} placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}/><button type="button" className="auth-eye" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></Field>}
      {mode === 'signin' && <button type="button" className="auth-forgot" onClick={() => switchTo('reset')}>Forgot password?</button>}
      {error && <p role="alert" className="auth-error">{error}</p>}
      {message && <p className="auth-message">{message}</p>}
      <Button type="submit" disabled={busy || googleBusy} className="w-full">{busy && <Loader2 className="animate-spin"/>}{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</Button>
    </form>
    {mode !== 'reset' && <><div className="auth-divider"><span>or</span></div><Button variant="outline" className="w-full" disabled={busy || googleBusy} onClick={google}>{googleBusy ? <Loader2 className="animate-spin"/> : <GoogleIcon/>}Continue with Google</Button></>}
    {mode === 'reset' && <div className="auth-links"><button onClick={() => switchTo('signin')}><ArrowLeft size={14}/> Back to sign in</button></div>}
    <Link to="/" className="auth-skip"><ArrowLeft size={14}/> Back to home</Link>
  </div></main>;
}
