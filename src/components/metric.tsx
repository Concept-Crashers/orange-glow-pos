import {
  AlertTriangle,
  Boxes,
  ChartNoAxesCombined,
  CircleDollarSign,
  PackageCheck,
  PackageX,
  ReceiptText,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";

type MetricProps = { icon?: LucideIcon; label: string; value: string; note?: string };

function iconForLabel(label: string): LucideIcon {
  const normalized = label.toLowerCase();
  if (normalized.includes("transaction")) return ReceiptText;
  if (normalized.includes("sales") || normalized.includes("sale")) return ShoppingBasket;
  if (normalized.includes("profit") || normalized.includes("average")) return ChartNoAxesCombined;
  if (normalized.includes("cash") || normalized.includes("value")) return CircleDollarSign;
  if (normalized.includes("out of stock")) return PackageX;
  if (normalized.includes("stock") || normalized.includes("product"))
    return normalized.includes("low") || normalized.includes("minimum") ? AlertTriangle : Boxes;
  return PackageCheck;
}

export function Metric({ icon: Icon, label, value, note }: MetricProps) {
  const MetricIcon = Icon ?? iconForLabel(label);
  return (
    <div className="metric">
      <i className="metric-icon" aria-hidden="true">
        <MetricIcon size={19} />
      </i>
      <div className="metric-body">
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </div>
  );
}
