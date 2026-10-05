import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type Role = 'admin' | 'manager' | 'cashier';
const rank: Record<Role, number> = { cashier: 1, manager: 2, admin: 3 };
type AuthState = { ready: boolean; session: Session | null; roles: Role[]; role: Role | null; name: string; can: (minimum: Role) => boolean; signOut: () => Promise<void>; refresh: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState('');
  const [ready, setReady] = useState(false);
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
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setTimeout(() => load(s), 0); });
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); load(data.session); });
    return () => data.subscription.unsubscribe();
  }, []);
  const role = roles.reduce<Role | null>((best, r) => !best || rank[r] > rank[best] ? r : best, null);
  return <AuthContext.Provider value={{ ready, session, roles, role, name, can: m => !!role && rank[role] >= rank[m], signOut: async () => { await supabase.auth.signOut(); }, refresh: () => load(session) }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const c = useContext(AuthContext); if (!c) throw new Error('Auth provider missing'); return c; }
export const roleLabel: Record<Role, string> = { admin: 'Administrator', manager: 'Store manager', cashier: 'Cashier' };
