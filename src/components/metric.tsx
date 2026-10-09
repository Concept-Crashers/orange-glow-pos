import type { LucideIcon } from 'lucide-react';

type MetricProps = { icon: LucideIcon; label: string; value: string; note?: string };

export function Metric({ icon: Icon, label, value, note }: MetricProps) {
  return <div className="metric">
    <i className="metric-icon" aria-hidden="true"><Icon size={19}/></i>
    <div className="metric-body"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>
  </div>;
}
