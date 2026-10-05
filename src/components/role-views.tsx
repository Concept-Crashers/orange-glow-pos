import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Lightbulb, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePos, currency } from '@/lib/pos';
import { useAuth, roleLabel, type Role } from '@/lib/auth';
import { askSalesInsights } from '@/lib/insights.functions';

function Heading({ title, subtitle }: { title: string; subtitle: string }) { return <div className="page-heading"><div><div className="eyebrow">FRESH MARKET WORKSPACE</div><h1>{title}</h1><p>{subtitle}</p></div></div>; }

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const bold = (s: string) => s.split(/\*\*(.+?)\*\*/g).map((part, j) => j % 2 ? <strong key={j}>{part}</strong> : part);
    if (/^#{1,4}\s/.test(line)) return <h3 key={i}>{bold(line.replace(/^#+\s/, ''))}</h3>;
    if (/^\s*([-*]|\d+\.)\s/.test(line)) return <li key={i}>{bold(line.replace(/^\s*([-*]|\d+\.)\s/, ''))}</li>;
    if (!line.trim()) return null;
    return <p key={i}>{bold(line)}</p>;
  });
}

const suggestions = ['Which products should I restock first this week?', 'How are payment methods trending and what should I change?', 'Which products bring the most profit?', 'How can I increase average basket size?'];

export function InsightsView() {
  const { sales, products } = usePos();
  const ask = useServerFn(askSalesInsights);
  const [question, setQuestion] = useState(''); const [answer, setAnswer] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(q = question) {
    if (q.trim().length < 3 || busy) return;
    setQuestion(q); setBusy(true); setError(''); setAnswer('');
    const data = {
      products: products.map(p => ({ name: p.name, category: p.category, price: p.price, cost: p.cost, stock: p.stock, minimum: p.min, active: p.active })),
      sales: sales.map(s => ({ date: s.date, total: s.total, discountPercent: s.discount, payment: s.payment, cashier: s.cashier, refunded: s.refunded, items: s.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })) })),
    };
    try { const r = await ask({ data: { question: q, data } }); if (r.ok) setAnswer(r.text); else setError(r.error); }
    catch { setError('The analysis could not be completed. Please try again.'); }
    setBusy(false);
  }
  return <main className="management-page"><Heading title="Sales insights" subtitle="Ask a question about your store and get clear, practical advice."/>
    <div className="insight-box"><textarea aria-label="Your sales question" placeholder="e.g. Which products are slowing down and what should I do about it?" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}/><Button onClick={() => submit()} disabled={busy || question.trim().length < 3}><Send/>{busy ? 'Analysing…' : 'Analyse'}</Button></div>
    <div className="report-tabs">{suggestions.map(s => <Button key={s} variant="outline" size="sm" disabled={busy} onClick={() => submit(s)}>{s}</Button>)}</div>
    {!sales.length && <p className="sample-label">No sales have been made in this session yet — insights will be based on stock and prices only.</p>}
    {busy && <div className="insight-result insight-wait"><Lightbulb/> Reviewing {sales.length} sales and {products.length} products…</div>}
    {error && <p role="alert" className="auth-error">{error}</p>}
    {answer && <div className="insight-result"><div className="insight-label"><Lightbulb size={16}/> Insights</div>{renderMarkdown(answer)}</div>}
  </main>;
}

export function ShiftView() {
  const { sales } = usePos(); const { name } = useAuth();
  const today = new Date().toLocaleDateString('en-CA');
  const mine = sales.filter(s => s.cashier === name && new Date(s.date).toLocaleDateString('en-CA') === today);
  const done = mine.filter(s => !s.refunded); const total = done.reduce((v, s) => v + s.total, 0);
  const pay = ['Cash', 'Mobile Money', 'Card', 'Bank transfer'].map(p => ({ p, v: done.filter(s => s.payment === p).reduce((a, s) => a + s.total, 0) }));
  return <main className="management-page"><Heading title="My shift" subtitle={`Today's sales for ${name}.`}/>
    <div className="metric-grid"><div className="metric"><span>My sales today</span><strong>{currency(total)}</strong></div><div className="metric"><span>Transactions</span><strong>{done.length}</strong></div><div className="metric"><span>Average sale</span><strong>{currency(done.length ? total / done.length : 0)}</strong></div><div className="metric"><span>Cash in drawer</span><strong>{currency(pay[0]?.v ?? 0)}</strong></div></div>
    <h2 className="section-heading">By payment method</h2><div className="table-wrap"><table><tbody>{pay.map(x => <tr key={x.p}><td>{x.p}</td><td>{currency(x.v)}</td></tr>)}</tbody></table></div>
    <h2 className="section-heading">My recent receipts</h2><div className="table-wrap"><table><thead><tr><th>Receipt</th><th>Time</th><th>Payment</th><th>Total</th></tr></thead><tbody>{mine.map(s => <tr key={s.id}><td>{s.id}</td><td>{new Date(s.date).toLocaleTimeString('en-GB')}</td><td>{s.payment}</td><td>{currency(s.total)}{s.refunded ? ' · Refunded' : ''}</td></tr>)}</tbody></table>{!mine.length && <div className="empty-state"><h3>No sales yet today</h3><p>Your completed checkouts will appear here.</p></div>}</div>
  </main>;
}

type Member = { id: string; full_name: string; email: string; roles: Role[] };
export function TeamView() {
  const { can, session, refresh } = useAuth(); const isAdmin = can('admin');
  const [members, setMembers] = useState<Member[]>([]); const [error, setError] = useState('');
  async function load() {
    const [{ data: p, error: e }, { data: r }] = await Promise.all([supabase.from('profiles').select('id, full_name, email').order('created_at'), supabase.from('user_roles').select('user_id, role')]);
    if (e) { setError(e.message); return; }
    setMembers((p ?? []).map(m => ({ ...m, roles: (r ?? []).filter(x => x.user_id === m.id).map(x => x.role as Role) })));
  }
  useEffect(() => { load(); }, []);
  async function setRole(id: string, role: Role) {
    setError('');
    const del = await supabase.from('user_roles').delete().eq('user_id', id).neq('role', role);
    const ins = await supabase.from('user_roles').insert({ user_id: id, role });
    const insErr = ins.error && ins.error.code !== '23505' ? ins.error : null;
    if (del.error || insErr) setError((del.error ?? insErr)!.message);
    await load(); if (id === session?.user.id) refresh();
  }
  return <main className="management-page"><Heading title="Team & roles" subtitle={isAdmin ? 'Choose what each staff member can do.' : 'See who works in this store.'}/>
    {error && <p role="alert" className="auth-error">{error}</p>}
    <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>{members.map(m => { const current: Role = m.roles.includes('admin') ? 'admin' : m.roles.includes('manager') ? 'manager' : 'cashier'; return <tr key={m.id}><td>{m.full_name || '—'}</td><td>{m.email}</td><td>{isAdmin && m.id !== session?.user.id ? <select aria-label={`Role for ${m.email}`} className="role-select" value={current} onChange={e => setRole(m.id, e.target.value as Role)}>{(['cashier', 'manager', 'admin'] as Role[]).map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}</select> : <span className="stock-tag"><ShieldCheck size={12}/> {roleLabel[current]}</span>}</td></tr>; })}</tbody></table></div>
    <p className="sample-label">Cashiers sell and check stock. Managers also see dashboards, update stock, and use insights. Administrators manage the team.</p>
  </main>;
}
