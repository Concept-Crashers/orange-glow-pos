import { Printer, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency, usePos, type Sale } from "@/lib/pos";
export function Receipt({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const { settings } = usePos();
  return (
    <div className="modal-backdrop">
      <div className="receipt-modal">
        <Button
          variant="ghost"
          size="icon"
          className="modal-close"
          aria-label="Close receipt"
          onClick={onClose}
        >
          <X />
        </Button>
        <div className="receipt-status">
          <Check size={24} />
        </div>
        <h2>Sale complete</h2>
        <p className="text-muted-foreground">Payment recorded successfully</p>
        <div className="receipt-paper" id="printable-receipt">
          <div className="receipt-heading">
            <span>SALES RECEIPT</span>
            <strong>{sale.id}</strong>
          </div>
          <h3>{settings.shop_name}</h3>
          {settings.address && <p>{settings.address}</p>}
          {settings.phone && <p>Tel {settings.phone}</p>}
          <div className="receipt-meta">
            <span>{new Date(sale.date).toLocaleDateString("en-GB")}</span>
            <span>{new Date(sale.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          {sale.customer && <div className="receipt-detail"><span>Customer</span><strong>{sale.customer}</strong></div>}
          <div className="receipt-items-heading"><span>Item</span><span>Amount</span></div>
          {sale.items.map((item, i) => (
            <div className="receipt-line" key={i}>
              <span>
                {item.name}
                <small className="receipt-qty">
                  {item.quantity} × {currency(item.price)}
                </small>
              </span>
              <span>{currency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="receipt-totals">
            <div>
              <span>Subtotal</span>
              <span>{currency(sale.subtotal)}</span>
            </div>
            <div>
              <span>Discount ({sale.discount}%)</span>
              <span>− {currency((sale.subtotal * sale.discount) / 100)}</span>
            </div>
            <div className="receipt-total">
              <strong>Total</strong>
              <strong>{currency(sale.total)}</strong>
            </div>
            <div>
              <span>Payment</span>
              <strong>{sale.payment}</strong>
            </div>
            {sale.paymentProvider && <div><span>Network</span><span>{sale.paymentProvider}</span></div>}
            {sale.paymentPhone && <div><span>Phone</span><span>{sale.paymentPhone}</span></div>}
            <div>
              <span>Cashier</span>
              <strong>{sale.cashier}</strong>
            </div>
          </div>
          <p className="receipt-thanks">Thank you for shopping with us!</p>
        </div>
        <div className="receipt-buttons">
          <Button onClick={() => window.print()}>
            <Printer />
            Print receipt
          </Button>
          <Button variant="outline" onClick={onClose}>
            {sale.refunded ? "Close" : "Done"}
          </Button>
        </div>
      </div>
    </div>
  );
}
