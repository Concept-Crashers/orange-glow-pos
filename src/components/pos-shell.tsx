import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { useAuth, roleLabel, type Role } from '@/lib/auth';
import { LayoutDashboard, ShoppingBasket, Package, Boxes, ReceiptText, ChartNoAxesCombined, Store, ChevronDown, Lightbulb, Clock, Users, LogOut, Settings, PackagePlus, Home, Mail, ShieldCheck, LogIn, HelpCircle, Bell, CircleCheck, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
const navigation: { to: '/cashier' | '/manager' | '/restock' | '/settings' | '/' | '/shift' | '/dashboard' | '/insights' | '/products' | '/inventory' | '/sales' | '/reports' | '/team'; label: string; icon: typeof ShoppingBasket; min: Role }[] = [
  { to: '/cashier', label: 'Cashier dashboard', icon: Home, min: 'cashier' },
  { to: '/', label: 'Point of sale', icon: ShoppingBasket, min: 'cashier' },
  { to: '/shift', label: 'My shift', icon: Clock, min: 'cashier' },
  { to: '/inventory', label: 'Stock levels', icon: Boxes, min: 'cashier' },
  { to: '/manager', label: 'Manager dashboard', icon: Home, min: 'manager' },
  { to: '/dashboard', label: 'Sales dashboard', icon: LayoutDashboard, min: 'manager' },
  { to: '/insights', label: 'Sales insights', icon: Lightbulb, min: 'manager' },
  { to: '/restock', label: 'Restock advice', icon: PackagePlus, min: 'manager' },
  { to: '/products', label: 'Products', icon: Package, min: 'manager' },
  { to: '/sales', label: 'Transactions', icon: ReceiptText, min: 'manager' },
  { to: '/reports', label: 'Reports', icon: ChartNoAxesCombined, min: 'manager' },
  { to: '/team', label: 'Team & roles', icon: Users, min: 'admin' },
  { to: '/settings', label: 'Store settings', icon: Settings, min: 'admin' },
];
const publicPaths = ['/auth', '/reset-password'];
export function PosShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: s => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(false); const [profile, setProfile] = useState(false); const [leaving, setLeaving] = useState(false); const go = useNavigate();
  const auth = useAuth();
  const title = navigation.find(n => n.to === path)?.label ?? 'Point of sale';
  if (publicPaths.includes(path)) return <>{children}</>;
  if (!auth.ready) return <div className="gate-screen">Loading your workspace…</div>;
  const allowed = navigation.filter(n => auth.can(n.min));
  const page = navigation.find(n => n.to === path);
  const blocked = page && !auth.can(page.min);
  const initials = auth.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <Link to="/" className="brand"><span className="brand-symbol"><ShoppingBasket size={23}/></span>till<span className="text-primary">point</span><span className="brand-dot">.</span></Link>
      <div className="store-switch"><span className="store-icon"><Store size={19}/></span><div><strong>Fresh Market</strong><span>Main store · Kampala</span></div><ChevronDown size={16}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{allowed.map(n => <Button key={n.to} asChild variant="ghost" className={`nav-item ${path === n.to ? 'nav-active' : ''}`}><Link to={n.to} onClick={() => setOpen(false)}><n.icon size={19}/><span>{n.label}</span>{path === n.to && <span className="nav-marker"/>}</Link></Button>)}</nav>
      <div className="sidebar-bottom"><div className="help-block"><span className="help-icon"><HelpCircle size={20}/></span><strong>A little help?</strong><p>We’re here for your business.</p><Button variant="outline" onClick={() => setNotice(true)}>Contact support <span>↗</span></Button></div><div className="session-label"><CircleCheck size={14}/><span>Sample workspace</span></div></div>
    </aside>
    <div className="app-body"><header className="topbar"><div className="topbar-title"><Button variant="ghost" size="icon" className="mobile-menu" title="Toggle navigation" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <PanelLeftClose/> : <PanelLeftOpen/>}</Button><span className="breadcrumb">Workspace <span>/</span></span><strong>{title}</strong></div><div className="topbar-actions"><span className="workspace-status"><span/> Store open</span><Button size="icon" variant="ghost" aria-label="Notifications" title="Notifications" onClick={() => setNotice(true)}><Bell size={19}/></Button><span className="topbar-divider"/><button type="button" className="profile-trigger" aria-label="Open profile" onClick={() => setProfile(true)}><span className="avatar">{initials}</span><div className="profile"><strong>{auth.name}</strong><span>{auth.role ? roleLabel[auth.role] : "No role"}{auth.preview ? " · test" : ""}</span></div><ChevronDown size={15}/></button></div></header>{blocked ? <div className="gate-screen"><div><h2>You don’t have access to this page</h2><p>Ask an administrator if you need {page?.label.toLowerCase()} access.</p></div></div> : children}<footer className="workspace-footer"><span>Fresh Market <span>·</span> Sample workspace</span><span>All prices in UGX</span></footer></div>
    {profile && <div className="modal-backdrop" onClick={() => setProfile(false)}><div className="simple-modal profile-modal" onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="modal-close" aria-label="Close" onClick={() => setProfile(false)}><X/></Button><span className="avatar avatar-lg">{initials}</span><h2>{auth.name}</h2>{auth.email && <p className="profile-line"><Mail size={14}/> {auth.email}</p>}<p className="profile-line"><ShieldCheck size={14}/> {auth.role ? roleLabel[auth.role] : "No role"}</p>{auth.preview && <><p>You are browsing in test mode without signing in. Pick a role to preview its screens:</p><div className="role-switch">{(['cashier', 'manager', 'admin'] as Role[]).map(r => <Button key={r} size="sm" variant={auth.role === r ? 'default' : 'outline'} onClick={() => { auth.setPreviewRole(r); setProfile(false); go({ to: r === 'cashier' ? '/cashier' : r === 'manager' ? '/manager' : '/team' }); }}>{roleLabel[r]}</Button>)}</div></>}<div className="modal-actions">{auth.session ? <Button variant="destructive" disabled={leaving} onClick={async () => { setLeaving(true); await auth.signOut(); setLeaving(false); setProfile(false); go({ to: '/auth', replace: true }); }}><LogOut/>{leaving ? 'Signing out…' : 'Log out'}</Button> : <Button onClick={() => { setProfile(false); go({ to: '/auth' }); }}><LogIn/>Sign in</Button>}</div></div></div>}
    {notice && <div className="modal-backdrop"><div className="simple-modal"><Button variant="ghost" size="icon" className="modal-close" aria-label="Close" onClick={() => setNotice(false)}><X/></Button><h2>Workspace information</h2><p>This is a sample workspace. Transactions and changes last for this session only.</p><p>There are no new notifications. A support service is not connected yet.</p><Button onClick={() => setNotice(false)}>Got it</Button></div></div>}
  </div>;
}