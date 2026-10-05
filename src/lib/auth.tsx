import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type Role = 'admin' | 'manager' | 'cashier';
const rank: Record<Role, number> = { cashier: 1, manager: 2, admin: 3 };
// TEST MODE: pages are open without signing in; visitors pick a preview role.
export const TEST_MODE = true;
type AuthState = { ready: boolean; session: Session | null; roles: Role[]; role: Role | null; name: string; email: string; preview: boolean; setPreviewRole: (r: Role) => void; can: (minimum: Role) => boolean; signOut: () => Promise<void>; refresh: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState('');
  const [ready, setReady] = useState(false);
  const [previewRole, setPreview] = useState<Role>('admin');
  async function load(s: Session | null) {
    if (!s) { setRoles([]); setName(''); setReady(true); return; }
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', s.user.id),
      supabase.from('profiles').select('full_name').eq('id', s.user.id).maybeSingle(),
    ]);
    setRoles((r ?? []).map(x => x.role as Role));
    setName(p?.full_name || s.user.email?.split('@')[0] || 'Staff');
    setReady(true);
  }
  useEffect(() => {
    const saved = localStorage.getItem('tillpoint-preview-role') as Role | null;
    if (saved && saved in rank) setPreview(saved);
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setTimeout(() => load(s), 0); });
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); load(data.session); });
    return () => data.subscription.unsubscribe();
  }, []);
  const preview = !session && TEST_MODE;
  const realRole = roles.reduce<Role | null>((best, r) => !best || rank[r] > rank[best] ? r : best, null);
  const role = preview ? previewRole : realRole;
  const setPreviewRole = (r: Role) => { setPreview(r); localStorage.setItem('tillpoint-preview-role', r); };
  return <AuthContext.Provider value={{ ready, session, roles, role, name: preview ? 'Test user' : name, email: session?.user.email ?? '', preview, setPreviewRole, can: m => !!role && rank[role] >= rank[m], signOut: async () => { await supabase.auth.signOut(); }, refresh: () => load(session) }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const c = useContext(AuthContext); if (!c) throw new Error('Auth provider missing'); return c; }
export const roleLabel: Record<Role, string> = { admin: 'Administrator', manager: 'Store manager', cashier: 'Cashier' };
