import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, ShoppingBasket, Package, Boxes, ReceiptText, ChartNoAxesCombined, Store, ChevronDown, HelpCircle, Bell, CircleCheck, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
const navigation = [
  { to: '/', label: 'Point of sale', icon: ShoppingBasket },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/sales', label: 'Transactions', icon: ReceiptText },
  { to: '/reports', label: 'Reports', icon: ChartNoAxesCombined },
] as const;
export function PosShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: s => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const title = navigation.find(n => n.to === path)?.label ?? 'Point of sale';
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <Link to="/" className="brand"><span className="brand-symbol"><ShoppingBasket size={23}/></span>till<span className="text-primary">point</span><span className="brand-dot">.</span></Link>
      <div className="store-switch"><span className="store-icon"><Store size={19}/></span><div><strong>Fresh Market</strong><span>Main store · Kampala</span></div><ChevronDown size={16}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{navigation.map(n => <Button key={n.to} asChild variant="ghost" className={`nav-item ${path === n.to ? 'nav-active' : ''}`}><Link to={n.to} onClick={() => setOpen(false)}><n.icon size={19}/><span>{n.label}</span>{path === n.to && <span className="nav-marker"/>}</Link></Button>)}</nav>
      <div className="sidebar-bottom"><div className="help-block"><span className="help-icon"><HelpCircle size={20}/></span><strong>A little help?</strong><p>We’re here for your business.</p><Button variant="outline" onClick={() => setNotice(true)}>Contact support <span>↗</span></Button></div><div className="session-label"><CircleCheck size={14}/><span>Sample workspace</span></div></div>
    </aside>
    <div className="app-body"><header className="topbar"><div className="topbar-title"><Button variant="ghost" size="icon" className="mobile-menu" title="Toggle navigation" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <PanelLeftClose/> : <PanelLeftOpen/>}</Button><span className="breadcrumb">Workspace <span>/</span></span><strong>{title}</strong></div><div className="topbar-actions"><span className="workspace-status"><span/> Store open</span><Button size="icon" variant="ghost" aria-label="Notifications" title="Notifications" onClick={() => setNotice(true)}><Bell size={19}/></Button><span className="topbar-divider"/><span className="avatar">AM</span><div className="profile"><strong>Alex Morgan</strong><span>Sample cashier</span></div></div></header>{children}<footer className="workspace-footer"><span>Fresh Market <span>·</span> Sample workspace</span><span>All prices in UGX</span></footer></div>
    {notice && <div className="modal-backdrop"><div className="simple-modal"><Button variant="ghost" size="icon" className="modal-close" aria-label="Close" onClick={() => setNotice(false)}><X/></Button><h2>Workspace information</h2><p>This is a sample workspace. Transactions and changes last for this session only.</p><p>There are no new notifications. A support service is not connected yet.</p><Button onClick={() => setNotice(false)}>Got it</Button></div></div>}
  </div>;
}