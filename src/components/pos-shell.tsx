import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { useAuth, roleLabel, type Role } from '@/lib/auth';
import { usePos, currency } from '@/lib/pos';
import { LayoutDashboard, ShoppingBasket, Package, Boxes, ReceiptText, ChartNoAxesCombined, Store, ChevronDown, Lightbulb, Clock, Users, LogOut, Settings, PackagePlus, Home, Mail, ShieldCheck, LogIn, HelpCircle, Bell, CircleCheck, PanelLeftClose, PanelLeftOpen, X, Sparkles, Truck, AlertTriangle, PackageX, RotateCcw, ShoppingCart, Phone, MapPin, Globe, Github } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
const navigation: { to: '/cashier' | '/assist' | '/manager' | '/restock' | '/settings' | '/register' | '/shift' | '/dashboard' | '/insights' | '/products' | '/inventory' | '/sales' | '/reports' | '/team' | '/purchasing'; label: string; icon: typeof ShoppingBasket; min: Role }[] = [
  { to: '/cashier', label: 'Cashier dashboard', icon: Home, min: 'cashier' },
  { to: '/register', label: 'Point of sale', icon: ShoppingBasket, min: 'cashier' },
  { to: '/assist', label: 'Product finder', icon: Sparkles, min: 'cashier' },
  { to: '/shift', label: 'My shift', icon: Clock, min: 'cashier' },
  { to: '/inventory', label: 'Stock levels', icon: Boxes, min: 'cashier' },
  { to: '/manager', label: 'Manager dashboard', icon: Home, min: 'manager' },
  { to: '/dashboard', label: 'Sales dashboard', icon: LayoutDashboard, min: 'manager' },
  { to: '/insights', label: 'Sales insights', icon: Lightbulb, min: 'manager' },
  { to: '/restock', label: 'Restock advice', icon: PackagePlus, min: 'manager' },
  { to: '/products', label: 'Products', icon: Package, min: 'manager' },
  { to: '/purchasing', label: 'Purchasing', icon: Truck, min: 'manager' },
  { to: '/sales', label: 'Transactions', icon: ReceiptText, min: 'manager' },
  { to: '/reports', label: 'Reports', icon: ChartNoAxesCombined, min: 'manager' },
  { to: '/team', label: 'Team & roles', icon: Users, min: 'admin' },
  { to: '/settings', label: 'Store settings', icon: Settings, min: 'admin' },
];
const publicPaths = ['/', '/auth', '/reset-password'];

type Notification = { id: string; icon: typeof AlertTriangle; title: string; detail: string; to: string; level: 'warning' | 'error' | 'info' };

function useNotifications() {
  const { products, sales } = usePos();
  const { can } = useAuth();
  return useMemo<Notification[]>(() => {
    const items: Notification[] = [];
    const outOfStock = products.filter(p => p.active && p.stock === 0);
    const lowStock = products.filter(p => p.active && p.stock > 0 && p.stock <= p.min);
    const refunds = sales.filter(s => s.refunded && isToday(s.date));
    const todaySales = sales.filter(s => !s.refunded && isToday(s.date));
    for (const p of outOfStock.slice(0, 3)) items.push({ id: `oos-${p.id}`, icon: PackageX, title: `${p.name} is out of stock`, detail: 'Reorder immediately — shelf is empty', to: '/inventory', level: 'error' });
    for (const p of lowStock.slice(0, 4)) items.push({ id: `low-${p.id}`, icon: AlertTriangle, title: `${p.name} is running low`, detail: `${p.stock} ${p.unit} left (minimum: ${p.min})`, to: '/inventory', level: 'warning' });
    if (can('manager')) {
      for (const s of refunds.slice(0, 2)) items.push({ id: `ref-${s.id}`, icon: RotateCcw, title: `Refund processed: ${s.id}`, detail: `${currency(s.total)} returned to stock`, to: '/sales', level: 'info' });
      if (!todaySales.length) items.push({ id: 'no-sales', icon: ShoppingCart, title: 'No sales yet today', detail: 'Open the register and start selling', to: '/register', level: 'info' });
      if (lowStock.length > 0) items.push({ id: 'restock-hint', icon: PackagePlus, title: `${lowStock.length + outOfStock.length} items need restocking`, detail: 'Get an AI restock plan with priorities and costs', to: '/restock', level: 'warning' });
    }
    return items;
  }, [products, sales, can]);
}
const isToday = (d: string) => new Date(d).toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');

export function PosShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: s => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(false); const [profile, setProfile] = useState(false); const [leaving, setLeaving] = useState(false); const [support, setSupport] = useState(false); const go = useNavigate();
  const auth = useAuth();
  const notifications = useNotifications();
  const [notifSeen, setNotifSeen] = useState(false);
  const unseenCount = notifSeen ? 0 : notifications.length;
  const isPublic = publicPaths.includes(path);
  useEffect(() => { if (!isPublic && auth.ready && !auth.session && !auth.preview) go({ to: '/auth', replace: true }); }, [isPublic, auth.ready, auth.session, auth.preview, go]);
  const title = navigation.find(n => n.to === path)?.label ?? 'Point of sale';
  if (publicPaths.includes(path)) return <>{children}</>;
  if (!auth.ready || (!auth.session && !auth.preview)) return <div className="gate-screen">Loading your workspace…</div>;
  const allowed = navigation.filter(n => auth.can(n.min));
  const page = navigation.find(n => n.to === path);
  const blocked = page && !auth.can(page.min);
  const initials = auth.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <button type="button" className="sidebar-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20}/></button>
      <Link to="/register" className="brand"><span className="brand-symbol"><ShoppingBasket size={23}/></span>till<span className="text-primary">point</span><span className="brand-dot">.</span></Link>
      <div className="store-switch"><span className="store-icon"><Store size={19}/></span><div><strong>Fresh Market</strong><span>Main store · Kampala</span></div><ChevronDown size={16}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{allowed.map(n => <Button key={n.to} asChild variant="ghost" className={`nav-item ${path === n.to ? 'nav-active' : ''}`}><Link to={n.to} onClick={() => setOpen(false)}><n.icon size={19}/><span>{n.label}</span>{path === n.to && <span className="nav-marker"/>}</Link></Button>)}</nav>
      <div className="sidebar-bottom"><div className="help-block"><span className="help-icon"><HelpCircle size={20}/></span><strong>A little help?</strong><p>We're here for your business.</p><Button variant="outline" onClick={() => setSupport(true)}>Contact support <span>↗</span></Button></div><div className="session-label"><CircleCheck size={14}/><span>Sample workspace</span></div></div>
    </aside>
    <div className="app-body"><header className="topbar"><div className="topbar-title"><Button variant="ghost" size="icon" className="mobile-menu" title="Toggle navigation" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <PanelLeftClose/> : <PanelLeftOpen/>}</Button><span className="breadcrumb">Workspace <span>/</span></span><strong>{title}</strong></div><div className="topbar-actions"><span className="workspace-status"><span/> Store open</span><button type="button" className="notif-trigger" aria-label={`Notifications${unseenCount ? ` (${unseenCount} new)` : ''}`} title="Notifications" onClick={() => { setNotice(true); setNotifSeen(true); }}><Bell size={19}/>{unseenCount > 0 && <span className="notif-badge">{unseenCount}</span>}</button><span className="topbar-divider"/><button type="button" className="profile-trigger" aria-label="Open profile" onClick={() => setProfile(true)}><span className="avatar">{initials}</span><div className="profile"><strong>{auth.name}</strong><span>{auth.role ? roleLabel[auth.role] : "No role"}{auth.preview ? " · test" : ""}</span></div><ChevronDown size={15}/></button></div></header>{blocked ? <div className="gate-screen"><div><h2>You don't have access to this page</h2><p>Ask an administrator if you need {page?.label.toLowerCase()} access.</p></div></div> : <div key={path} className="page-transition">{['/dashboard','/manager','/cashier'].includes(path) && <section className="welcome-banner"><div><span>{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</span><h2>Welcome back, {auth.name.split(' ')[0]}</h2><p>{auth.role ? roleLabel[auth.role] : 'Staff'} workspace · here's what needs your attention today.</p></div><Button asChild><Link to="/register"><ShoppingBasket/>Open point of sale</Link></Button></section>}{children}</div>}<footer className="workspace-footer"><span>Fresh Market <span>·</span> Sample workspace</span><span>All prices in UGX</span></footer></div>
    {profile && <div className="modal-backdrop" onClick={() => setProfile(false)}><div className="simple-modal profile-modal" onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="modal-close" aria-label="Close" onClick={() => setProfile(false)}><X/></Button><span className="avatar avatar-lg">{initials}</span><h2>{auth.name}</h2>{auth.email && <p className="profile-line"><Mail size={14}/> {auth.email}</p>}<p className="profile-line"><ShieldCheck size={14}/> {auth.role ? roleLabel[auth.role] : "No role"}</p>{auth.preview && <><p>You are browsing in test mode without signing in. Pick a role to preview its screens:</p><div className="role-switch">{(['cashier', 'manager', 'admin'] as Role[]).map(r => <Button key={r} size="sm" variant={auth.role === r ? 'default' : 'outline'} onClick={() => { auth.setPreviewRole(r); setProfile(false); go({ to: r === 'cashier' ? '/cashier' : r === 'manager' ? '/manager' : '/team' }); }}>{roleLabel[r]}</Button>)}</div></>}<div className="modal-actions">{auth.session ? <Button variant="destructive" disabled={leaving} onClick={async () => { setLeaving(true); await auth.signOut(); setLeaving(false); setProfile(false); go({ to: '/auth', replace: true }); }}><LogOut/>{leaving ? 'Signing out…' : 'Log out'}</Button> : <Button onClick={() => { setProfile(false); go({ to: '/auth' }); }}><LogIn/>Sign in</Button>}</div></div></div>}
    {notice && <div className="modal-backdrop" onClick={() => setNotice(false)}><div className="simple-modal notif-panel" onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="modal-close" aria-label="Close" onClick={() => setNotice(false)}><X/></Button><h2>Notifications</h2>
      {notifications.length > 0 ? <><p className="notif-subtitle">{notifications.length} alert{notifications.length === 1 ? '' : 's'} from your store right now.</p><div className="notif-list">{notifications.map(n => <Link key={n.id} to={n.to as string} className={`notif-item notif-${n.level}`} onClick={() => setNotice(false)}><span className="notif-icon"><n.icon size={18}/></span><div><strong>{n.title}</strong><span>{n.detail}</span></div></Link>)}</div></> : <><p>No active notifications. Your store is running smoothly.</p><div className="notif-empty"><CircleCheck size={32}/><h3>All clear</h3><p>No stock alerts, refunds or issues to review.</p></div></>}
      <div className="notif-footer"><Button variant="outline" onClick={() => setNotice(false)}>Close</Button></div>
    </div></div>}
    {support && <div className="modal-backdrop" onClick={() => setSupport(false)}><div className="simple-modal support-panel" onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="modal-close" aria-label="Close" onClick={() => setSupport(false)}><X/></Button><h2>Contact support</h2><p className="notif-subtitle">We're here to help your business run smoothly.</p><div className="support-list"><a href="tel:+256786021431" className="support-item"><span className="support-icon"><Phone size={18}/></span><div><strong>Call us</strong><span>+256 786 021431</span></div></a><a href="mailto:wambogohassan63@gmail.com" className="support-item"><span className="support-icon"><Mail size={18}/></span><div><strong>Email us</strong><span>wambogohassan63@gmail.com</span></div></a><a href="https://www.till-point.tech" className="support-item"><span className="support-icon"><Globe size={18}/></span><div><strong>Website</strong><span>www.till-point.tech</span></div></a><a href="https://github.com/Chemistry2i" target="_blank" rel="noopener noreferrer" className="support-item"><span className="support-icon"><Github size={18}/></span><div><strong>GitHub</strong><span>github.com/Chemistry2i</span></div></a><div className="support-item"><span className="support-icon"><Clock size={18}/></span><div><strong>Hours</strong><span>Mon–Sat, 8am–6pm EAT</span></div></div></div><div className="notif-footer"><Button variant="outline" onClick={() => setSupport(false)}>Close</Button></div></div></div>}
  </div>;
}
