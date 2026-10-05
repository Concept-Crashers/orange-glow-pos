import { Link, useRouterState, Navigate } from '@tanstack/react-router';
import { useAuth, roleLabel, type Role } from '@/lib/auth';
import { LayoutDashboard, ShoppingBasket, Package, Boxes, ReceiptText, ChartNoAxesCombined, Store, ChevronDown, Lightbulb, Clock, Users, LogOut, HelpCircle, Bell, CircleCheck, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
const navigation: { to: '/' | '/shift' | '/dashboard' | '/insights' | '/products' | '/inventory' | '/sales' | '/reports' | '/team'; label: string; icon: typeof ShoppingBasket; min: Role }[] = [
  { to: '/', label: 'Point of sale', icon: ShoppingBasket, min: 'cashier' },
  { to: '/shift', label: 'My shift', icon: Clock, min: 'cashier' },
  { to: '/inventory', label: 'Stock levels', icon: Boxes, min: 'cashier' },
  { to: '/dashboard', label: 'Sales dashboard', icon: LayoutDashboard, min: 'manager' },
  { to: '/insights', label: 'Sales insights', icon: Lightbulb, min: 'manager' },
  { to: '/products', label: 'Products', icon: Package, min: 'manager' },
  { to: '/sales', label: 'Transactions', icon: ReceiptText, min: 'manager' },
  { to: '/reports', label: 'Reports', icon: ChartNoAxesCombined, min: 'manager' },
  { to: '/team', label: 'Team & roles', icon: Users, min: 'admin' },
];
const publicPaths = ['/auth', '/reset-password'];
export function PosShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: s => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const auth = useAuth();
  const title = navigation.find(n => n.to === path)?.label ?? 'Point of sale';
  if (publicPaths.includes(path)) return <>{children}</>;
  if (!auth.ready) return <div className="gate-screen">Loading your workspace…</div>;
  if (!auth.session) return <Navigate to="/auth"/>;
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
    <div className="app-body"><header className="topbar"><div className="topbar-title"><Button variant="ghost" size="icon" className="mobile-menu" title="Toggle navigation" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <PanelLeftClose/> : <PanelLeftOpen/>}</Button><span className="breadcrumb">Workspace <span>/</span></span><strong>{title}</strong></div><div className="topbar-actions"><span className="workspace-status"><span/> Store open</span><Button size="icon" variant="ghost" aria-label="Notifications" title="Notifications" onClick={() => setNotice(true)}><Bell size={19}/></Button><span className="topbar-divider"/><span className="avatar">{initials}</span><div className="profile"><strong>{auth.name}</strong><span>{auth.role ? roleLabel[auth.role] : "No role"}</span></div><Button size="icon" variant="ghost" aria-label="Sign out" title="Sign out" onClick={() => auth.signOut()}><LogOut size={18}/></Button></div></header>{blocked ? <div className="gate-screen"><div><h2>You don’t have access to this page</h2><p>Ask an administrator if you need {page?.label.toLowerCase()} access.</p></div></div> : children}<footer className="workspace-footer"><span>Fresh Market <span>·</span> Sample workspace</span><span>All prices in UGX</span></footer></div>
    {notice && <div className="modal-backdrop"><div className="simple-modal"><Button variant="ghost" size="icon" className="modal-close" aria-label="Close" onClick={() => setNotice(false)}><X/></Button><h2>Workspace information</h2><p>This is a sample workspace. Transactions and changes last for this session only.</p><p>There are no new notifications. A support service is not connected yet.</p><Button onClick={() => setNotice(false)}>Got it</Button></div></div>}
  </div>;
}