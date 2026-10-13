import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { currency } from '@/lib/pos';

const PIE_COLORS = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--destructive)'];

export function SalesTrendChart({ data }: { data: { label: string; amount: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
        <Tooltip
          cursor={{ fill: 'var(--accent)' }}
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => [currency(v), 'Sales']}
        />
        <Bar dataKey="amount" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={56} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PaymentPieChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((v, d) => v + d.value, 0);
  if (!total) return <div className="empty-state"><h3>No payment data</h3><p>Payments will appear after your first sales.</p></div>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={3} dataKey="value" nameKey="name">
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: number, _n: string, p: { payload: { name: string } }) => [currency(v), p.payload.name]} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HourlySalesChart({ data }: { data: { hour: string; sales: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [currency(v), 'Sales']} />
        <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({ data }: { data: { category: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 20, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
        <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={100} />
        <Tooltip cursor={{ fill: 'var(--accent)' }} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [currency(v), 'Revenue']} />
        <Bar dataKey="revenue" fill="var(--primary)" radius={[0, 6, 6, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
