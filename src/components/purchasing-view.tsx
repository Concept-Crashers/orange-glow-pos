import { useEffect, useState } from 'react';
import { Plus, Truck, FileText, PackageCheck, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Metric } from '@/components/metric';
import { supabase } from '@/integrations/supabase/client';
import { usePos, currency } from '@/lib/pos';

type Supplier = { id: string; name: string; contact: string; phone: string; email: string };
type Line = { productId: number; name: string; quantity: number; cost: number };
type Order = { id: string; number: string; supplier_name: string; items: Line[]; total: number; status: string; invoice_number: string; invoice_total: number; created_at: string; received_at: string | null };

export function PurchasingView() {
  const { products, adjust } = usePos();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [sForm, setSForm] = useState<{ name: string; contact: string; phone: string; email: string } | null>(null);
  const [oForm, setOForm] = useState<{ supplier: string; lines: Line[] } | null>(null);
  const [receiving, setReceiving] = useState<Order | null>(null);
  const [invoice, setInvoice] = useState({ number: '', total: '' });

  async function load() {
    const [s, o] = await Promise.all([
      supabase.from('suppliers').select('id,name,contact,phone,email').order('name'),
      supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }),
    ]);
    if (s.error || o.error) setError((s.error ?? o.error)!.message);
    setSuppliers(s.data ?? []);
    setOrders((o.data ?? []).map(r => ({ ...r, items: r.items as Line[], total: Number(r.total), invoice_total: Number(r.invoice_total) })));
  }
  useEffect(() => { load(); }, []);

  async function saveSupplier() {
    if (!sForm?.name.trim()) return;
    const { error } = await supabase.from('suppliers').insert(sForm);
    if (error) return setError(error.message);
    setSForm(null); load();
  }
  async function saveOrder() {
    if (!oForm) return;
    const lines = oForm.lines.filter(l => l.quantity > 0);
    const sup = suppliers.find(s => s.id === oForm.supplier);
    if (!sup || !lines.length) return;
    const { error } = await supabase.from('purchase_orders').insert({
      number: `PO-${Date.now().toString(36).toUpperCase()}`, supplier_id: sup.id, supplier_name: sup.name,
      items: lines, total: lines.reduce((v, l) => v + l.quantity * l.cost, 0), status: 'ordered',
    });
    if (error) return setError(error.message);
    setOForm(null); load();
  }
  async function receive() {
    if (!receiving) return;
    const { error } = await supabase.from('purchase_orders').update({ status: 'received', received_at: new Date().toISOString(), invoice_number: invoice.number, invoice_total: Number(invoice.total) || receiving.total }).eq('id', receiving.id);
    if (error) return setError(error.message);
    receiving.items.forEach(l => adjust(l.productId, l.quantity, `Received ${receiving.number}`));
    setReceiving(null); load();
  }

  const open = orders.filter(o => o.status === 'ordered');
  return <main className="management-page">
    <div className="page-heading"><div><div className="eyebrow">FRESH MARKET WORKSPACE</div><h1>Purchasing</h1><p>Suppliers, purchase orders, invoices and stock receiving.</p></div>
      <div className="flex gap-2"><Button variant="outline" onClick={() => setSForm({ name: '', contact: '', phone: '', email: '' })}><Plus/>Supplier</Button><Button disabled={!suppliers.length} onClick={() => setOForm({ supplier: suppliers[0]?.id ?? '', lines: products.filter(p => p.active).map(p => ({ productId: p.id, name: p.name, quantity: 0, cost: p.cost })) })}><ClipboardList/>New purchase order</Button></div></div>
    {error && <p className="text-destructive">{error}</p>}
    <div className="metric-grid"><Metric icon={Truck} label="Suppliers" value={String(suppliers.length)}/><Metric icon={ClipboardList} label="Open orders" value={String(open.length)}/><Metric icon={FileText} label="Awaiting value" value={currency(open.reduce((v, o) => v + o.total, 0))}/><Metric icon={PackageCheck} label="Received orders" value={String(orders.length - open.length)}/></div>
    <h2 className="section-heading">Purchase orders & invoices</h2>
    <div className="table-wrap"><table><thead><tr><th>Order</th><th>Supplier</th><th>Items</th><th>Order total</th><th>Invoice</th><th>Status</th><th></th></tr></thead><tbody>{orders.map(o => <tr key={o.id}><td>{o.number}<br/><small className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString('en-GB')}</small></td><td>{o.supplier_name}</td><td>{o.items.map(l => `${l.name} × ${l.quantity}`).join(', ')}</td><td>{currency(o.total)}</td><td>{o.invoice_number ? `${o.invoice_number} · ${currency(o.invoice_total)}` : '—'}</td><td><span className={`stock-tag ${o.status === 'ordered' ? 'low' : ''}`}>{o.status === 'ordered' ? 'Awaiting delivery' : 'Received'}</span></td><td>{o.status === 'ordered' && <Button size="sm" variant="outline" onClick={() => { setReceiving(o); setInvoice({ number: '', total: String(o.total) }); }}>Receive stock</Button>}</td></tr>)}</tbody></table>{!orders.length && <p className="p-4 text-muted-foreground">No purchase orders yet.</p>}</div>
    <h2 className="section-heading">Suppliers</h2>
    <div className="table-wrap"><table><thead><tr><th>Name</th><th>Contact</th><th>Phone</th><th>Email</th></tr></thead><tbody>{suppliers.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.contact}</td><td>{s.phone}</td><td>{s.email}</td></tr>)}</tbody></table>{!suppliers.length && <p className="p-4 text-muted-foreground">Add your first supplier to start ordering.</p>}</div>

    {sForm && <div className="modal-backdrop"><form className="simple-modal" onSubmit={e => { e.preventDefault(); saveSupplier(); }}><h2>New supplier</h2>{(['name', 'contact', 'phone', 'email'] as const).map(k => <label key={k}>{k.charAt(0).toUpperCase() + k.slice(1)}<input required={k === 'name'} value={sForm[k]} onChange={e => setSForm({ ...sForm, [k]: e.target.value })}/></label>)}<div className="modal-actions"><Button type="button" variant="outline" onClick={() => setSForm(null)}>Cancel</Button><Button type="submit">Save supplier</Button></div></form></div>}
    {oForm && <div className="modal-backdrop"><form className="simple-modal" onSubmit={e => { e.preventDefault(); saveOrder(); }}><h2>New purchase order</h2><label>Supplier<select value={oForm.supplier} onChange={e => setOForm({ ...oForm, supplier: e.target.value })}>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><div style={{ maxHeight: 300, overflow: 'auto' }}>{oForm.lines.map((l, i) => <label key={l.productId}>{l.name} · {currency(l.cost)} each<input type="number" min={0} step={1} value={l.quantity || ''} placeholder="0" onChange={e => { const lines = [...oForm.lines]; lines[i] = { ...l, quantity: Math.max(0, Math.floor(Number(e.target.value))) }; setOForm({ ...oForm, lines }); }}/></label>)}</div><p>Total {currency(oForm.lines.reduce((v, l) => v + l.quantity * l.cost, 0))}</p><div className="modal-actions"><Button type="button" variant="outline" onClick={() => setOForm(null)}>Cancel</Button><Button type="submit" disabled={!oForm.lines.some(l => l.quantity > 0)}>Place order</Button></div></form></div>}
    {receiving && <div className="modal-backdrop"><form className="simple-modal" onSubmit={e => { e.preventDefault(); receive(); }}><h2>Receive {receiving.number}</h2><p>{receiving.items.map(l => `${l.name} × ${l.quantity}`).join(', ')} will be added to stock.</p><label>Supplier invoice number<input required value={invoice.number} onChange={e => setInvoice({ ...invoice, number: e.target.value })}/></label><label>Invoice amount (UGX)<input type="number" min={0} value={invoice.total} onChange={e => setInvoice({ ...invoice, total: e.target.value })}/></label><div className="modal-actions"><Button type="button" variant="outline" onClick={() => setReceiving(null)}>Cancel</Button><Button type="submit">Receive stock</Button></div></form></div>}
  </main>;
}
