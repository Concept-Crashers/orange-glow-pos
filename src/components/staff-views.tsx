import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ShoppingBasket, Boxes, AlertTriangle, RotateCcw, Lightbulb, PackagePlus, ReceiptText, CheckCircle2, Circle, Store, Loader2, Send, ClipboardList, CircleDollarSign, PackageX, ChartNoAxesCombined } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Metric } from '@/components/metric';
import { usePos, currency } from '@/lib/pos';
import { useAuth } from '@/lib/auth';
import { askRestockPlan } from '@/lib/insights.functions';
import { renderMarkdown } from '@/components/role-views';

function Heading({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) { return <div className="page-heading"><div><div className="eyebrow">FRESH MARKET WORKSPACE</div><h1>{title}</h1><p>{subtitle}</p></div>{children}</div>; }
type Task = { label: string; done: boolean; to: '/register' | '/inventory' | '/sales' | '/restock' | '/insights' | '/dashboard' | '/settings' | '/products' | '/shift'; hint: string };
function Tasks({ items }: { items: Task[] }) {
  return <div className="task-list">{items.map(t => <Link key={t.label} to={t.to} className={`task ${t.done ? 'task-done' : ''}`}>{t.done ? <CheckCircle2 size={20}/> : <Circle size={20}/>}<div><strong>{t.label}</strong><span>{t.hint}</span></div></Link>)}</div>;
}
const isToday = (d: string) => new Date(d).toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');

export function CashierDashboard() {
  const { sales, products } = usePos(); const { name } = useAuth();
  const mine = sales.filter(s => s.cashier === name && isToday(s.date) && !s.refunded);
  const total = mine.reduce((v, s) => v + s.total, 0);
  const low = products.filter(p => p.active && p.stock <= p.min);
  const tasks: Task[] = [
    { label: 'Open the till and serve customers', done: mine.length > 0, to: '/register', hint: mine.length ? `${mine.length} sales completed today` : 'Start your first sale of the day' },
    { label: 'Print a receipt for every sale', done: mine.length > 0, to: '/register', hint: 'Use “Print receipt” after each checkout' },
    { label: 'Check shelf stock levels', done: false, to: '/inventory', hint: low.length ? `${low.length} items are running low — tell your manager` : 'All items are well stocked' },
    { label: 'Review your shift before closing', done: false, to: '/shift', hint: 'Count cash and compare with your shift total' },
  ];
  return <main className="management-page"><Heading title="Cashier dashboard" subtitle="Your cashier dashboard and today’s tasks."><Button asChild><Link to="/register"><ShoppingBasket/>New sale</Link></Button></Heading>
    <div className="metric-grid"><Metric icon={ShoppingBasket} label="My sales today" value={currency(total)}/><Metric icon={ReceiptText} label="Transactions" value={String(mine.length)}/><Metric icon={CircleDollarSign} label="Cash collected" value={currency(mine.filter(s => s.payment === 'Cash').reduce((v, s) => v + s.total, 0))}/><Metric icon={AlertTriangle} label="Low-stock items" value={String(low.length)}/></div>
    <div className="dashboard-columns"><section><h2 className="section-heading">Today’s tasks</h2><Tasks items={tasks}/></section>
    <section><h2 className="section-heading">Running low</h2>{low.length ? <div className="table-wrap"><table><thead><tr><th>Product</th><th>In stock</th></tr></thead><tbody>{low.map(p => <tr key={p.id}><td>{p.name}</td><td><span className="stock-tag low">{p.stock} left</span></td></tr>)}</tbody></table></div> : <div className="empty-state"><Boxes/><h3>Shelves look good</h3><p>No items are below their minimum.</p></div>}</section></div>
  </main>;
}

export function ManagerDashboard() {
  const { sales, products, history } = usePos();
  const today = sales.filter(s => isToday(s.date)); const done = today.filter(s => !s.refunded); const total = done.reduce((v, s) => v + s.total, 0);
  const refunds = today.filter(s => s.refunded);
  const low = products.filter(p => p.active && p.stock <= p.min); const out = products.filter(p => p.active && !p.stock);
  const restockedToday = history.some(h => h.change > 0 && isToday(h.date) && !h.reason.startsWith('Refund'));
  const cashiers = [...new Set(done.map(s => s.cashier))].map(c => ({ c, n: done.filter(s => s.cashier === c).length, v: done.filter(s => s.cashier === c).reduce((a, s) => a + s.total, 0) }));
  const tasks: Task[] = [
    { label: 'Restock low items', done: !low.length, to: '/restock', hint: low.length ? `${low.length} items below minimum — get an AI restock plan` : 'Nothing below minimum' },
    { label: 'Record deliveries received', done: restockedToday, to: '/inventory', hint: 'Update quantities when stock arrives' },
    { label: 'Review refunds', done: !refunds.length, to: '/sales', hint: refunds.length ? `${refunds.length} refunds today` : 'No refunds today' },
    { label: 'Check daily sales performance', done: false, to: '/dashboard', hint: 'Daily totals, payments and top sellers' },
    { label: 'Ask a sales question', done: false, to: '/insights', hint: 'Get practical advice from your sales' },
  ];
  return <main className="management-page"><Heading title="Manager dashboard" subtitle="Today at a glance and what needs your attention."><Button asChild variant="outline"><Link to="/restock"><PackagePlus/>Restock advice</Link></Button></Heading>
    <div className="metric-grid"><Metric icon={ShoppingBasket} label="Sales today" value={currency(total)}/><Metric icon={ReceiptText} label="Transactions" value={String(done.length)}/><Metric icon={RotateCcw} label="Refunds" value={String(refunds.length)}/><Metric icon={PackageX} label="Out of stock" value={String(out.length)} note={`${low.length} low`}/></div>
    <div className="dashboard-columns"><section><h2 className="section-heading">Your tasks</h2><Tasks items={tasks}/></section>
    <section><h2 className="section-heading">Cashiers today</h2>{cashiers.length ? <div className="table-wrap"><table><thead><tr><th>Cashier</th><th>Sales</th><th>Amount</th></tr></thead><tbody>{cashiers.map(x => <tr key={x.c}><td>{x.c}</td><td>{x.n}</td><td>{currency(x.v)}</td></tr>)}</tbody></table></div> : <div className="empty-state"><ReceiptText/><h3>No sales yet today</h3><p>Cashier activity will appear here.</p></div>}
    <h2 className="section-heading">Needs attention</h2><div className="table-wrap"><table><tbody>{low.map(p => <tr key={p.id}><td><AlertTriangle size={14} className="text-warning"/> {p.name}</td><td>{p.stock} / min {p.min}</td></tr>)}{refunds.map(s => <tr key={s.id}><td><RotateCcw size={14}/> Refund {s.id}</td><td>{currency(s.total)}</td></tr>)}</tbody></table>{!low.length && !refunds.length && <div className="empty-state"><h3>All clear</h3></div>}</div></section></div>
  </main>;
}

export function RestockView() {
  const { products, sales } = usePos(); const ask = useServerFn(askRestockPlan); const { preview } = useAuth();
  const [question, setQuestion] = useState('What should I restock this week and in what order? My budget is UGX 500,000.');
  const [answer, setAnswer] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const since = Date.now() - 14 * 864e5;
  async function submit() {
    if (busy || question.trim().length < 3) return;
    setBusy(true); setError(''); setAnswer('');
    const recent = sales.filter(s => !s.refunded && new Date(s.date).getTime() >= since);
    const data = { periodDays: 14, products: products.filter(p => p.active).map(p => ({ name: p.name, stock: p.stock, minimum: p.min, unit: p.unit, cost: p.cost, price: p.price, unitsSoldLast14Days: recent.reduce((v, s) => v + s.items.filter(i => i.name === p.name).reduce((a, i) => a + i.quantity, 0), 0) })) };
    try { const r = await ask({ data: { question, data } }); if (r.ok) setAnswer(r.text); else setError(r.error); }
    catch { setError(preview ? 'Sign in with a manager account to use restock advice.' : 'The recommendation could not be completed. Please try again.'); }
    setBusy(false);
  }
  const low = products.filter(p => p.active && p.stock <= p.min);
  return <main className="management-page"><Heading title="Restock advice" subtitle="Ask about stock and recent sales to get a prioritised restock list."/>
    <div className="metric-grid"><Metric icon={AlertTriangle} label="Below minimum" value={String(low.length)}/><Metric icon={PackageX} label="Out of stock" value={String(products.filter(p => p.active && !p.stock).length)}/><Metric icon={ChartNoAxesCombined} label="Sales (14 days)" value={String(sales.filter(s => !s.refunded && new Date(s.date).getTime() >= since).length)}/><Metric icon={CircleDollarSign} label="Stock value" value={currency(products.reduce((v, p) => v + p.stock * p.cost, 0))}/></div>
    <div className="insight-box"><textarea aria-label="Your restock question" placeholder="e.g. What should I reorder before the weekend?" value={question} onChange={e => setQuestion(e.target.value)}/><Button onClick={submit} disabled={busy || question.trim().length < 3}>{busy ? <Loader2 className="animate-spin"/> : <Send/>}{busy ? 'Planning…' : 'Get plan'}</Button></div>
    {preview && <p className="sample-label">Restock advice needs a signed-in manager or administrator account.</p>}
    {busy && <div className="insight-result insight-wait"><ClipboardList/> Checking {products.length} products against recent sales…</div>}
    {error && <p role="alert" className="auth-error">{error}</p>}
    {answer && <div className="insight-result"><div className="insight-label"><Lightbulb size={16}/> Restock plan</div>{renderMarkdown(answer)}</div>}
  </main>;
}

export function SettingsView() {
  const { settings, saveSettings } = usePos(); const { can } = useAuth();
  const [form, setForm] = useState(settings); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const [synced, setSynced] = useState(settings);
  if (synced !== settings) { setSynced(settings); setForm(settings); }
  async function save(e: React.FormEvent) { e.preventDefault(); setBusy(true); setMsg(''); setErr(''); const r = await saveSettings({ shop_name: form.shop_name.trim(), address: form.address.trim(), phone: form.phone.trim(), primary_color: form.primary_color }); if (r) setErr(r); else setMsg('Store details saved. New receipts will use them.'); setBusy(false); }
  return <main className="management-page"><Heading title="Store settings" subtitle="These details appear at the top of every printed receipt."/>
    <div className="settings-grid"><form className="settings-card auth-form" onSubmit={save}>
      <label>Shop name<input required maxLength={60} placeholder="e.g. Fresh Market" value={form.shop_name} onChange={e => setForm({ ...form, shop_name: e.target.value })} disabled={!can('admin')}/></label>
      <label>Address<input maxLength={120} placeholder="e.g. Plot 12 Kampala Road, Kampala" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} disabled={!can('admin')}/></label>
      <label>Phone number<input maxLength={30} type="tel" placeholder="e.g. +256 700 123 456" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} disabled={!can('admin')}/></label>
      <label>Primary brand color<span className="color-setting"><input type="color" aria-label="Primary brand color" value={form.primary_color} onChange={e => { const primary_color = e.target.value; setForm({ ...form, primary_color }); document.documentElement.style.setProperty('--primary', primary_color); }} disabled={!can('admin')}/><strong>{form.primary_color}</strong></span></label>
      <p className="settings-help">This color updates buttons, links, highlights, KPI cards, and the workspace accents.</p>
      {err && <p role="alert" className="auth-error">{err}</p>}{msg && <p className="auth-message">{msg}</p>}
      <Button type="submit" disabled={busy || !can('admin')}>{busy && <Loader2 className="animate-spin"/>}Save details</Button>
    </form>
    <div className="receipt-paper settings-preview"><Store size={20}/><h3>{form.shop_name || 'Shop name'}</h3>{form.address && <p>{form.address}</p>}{form.phone && <p>Tel {form.phone}</p>}<div className="receipt-meta"><span>SALE-PREVIEW</span><span>{new Date().toLocaleDateString('en-GB')}</span></div><div className="receipt-line"><span>Fresh bananas × 2</span><span>{currency(9000)}</span></div><div className="receipt-totals"><div className="receipt-total"><strong>Total</strong><strong>{currency(9000)}</strong></div></div><p className="receipt-thanks">Receipt preview</p></div></div>
  </main>;
}
