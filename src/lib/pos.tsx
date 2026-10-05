import { createContext, useContext, useState, type ReactNode } from 'react';
import bananas from '@/assets/bananas.jpg';
import apples from '@/assets/apples.jpg';
import juice from '@/assets/juice.jpg';
import milk from '@/assets/milk.jpg';
import bread from '@/assets/bread.jpg';
import eggs from '@/assets/eggs.jpg';
import honey from '@/assets/honey.jpg';
import avocado from '@/assets/avocado.jpg';
import coffee from '@/assets/coffee.jpg';

export type Product = { id: number; name: string; category: string; price: number; cost: number; stock: number; min: number; unit: string; sku: string; image: string; active: boolean };
export type CartItem = { id: number; quantity: number };
export type Sale = { id: string; date: string; items: { name: string; quantity: number; price: number; cost: number }[]; subtotal: number; discount: number; total: number; payment: string; cashier: string; refunded: boolean };
export type StockEntry = { product: string; change: number; reason: string; date: string };
export const categories = ['All products', 'Fruits & vegetables', 'Dairy & eggs', 'Bakery', 'Beverages', 'Pantry'] as const;
const initialProducts: Product[] = [
  { id: 1, name: 'Fresh bananas', category: categories[1], price: 4500, cost: 2800, stock: 48, min: 10, unit: 'bunch', sku: 'FRU-001', image: bananas, active: true },
  { id: 2, name: 'Red apples', category: categories[1], price: 8000, cost: 5000, stock: 32, min: 10, unit: 'kg', sku: 'FRU-002', image: apples, active: true },
  { id: 3, name: 'Orange juice', category: categories[4], price: 6500, cost: 4200, stock: 24, min: 8, unit: '500 ml', sku: 'BEV-001', image: juice, active: true },
  { id: 4, name: 'Fresh whole milk', category: categories[2], price: 4000, cost: 2600, stock: 18, min: 6, unit: '1 litre', sku: 'DAI-001', image: milk, active: true },
  { id: 5, name: 'Sourdough bread', category: categories[3], price: 12000, cost: 7500, stock: 8, min: 10, unit: 'loaf', sku: 'BAK-001', image: bread, active: true },
  { id: 6, name: 'Farm fresh eggs', category: categories[2], price: 6000, cost: 3800, stock: 36, min: 10, unit: '6 pack', sku: 'DAI-002', image: eggs, active: true },
  { id: 7, name: 'Pure natural honey', category: categories[5], price: 18000, cost: 11500, stock: 15, min: 5, unit: '250 g', sku: 'PAN-001', image: honey, active: true },
  { id: 8, name: 'Fresh avocado', category: categories[1], price: 3500, cost: 2000, stock: 5, min: 10, unit: 'piece', sku: 'FRU-003', image: avocado, active: true },
  { id: 9, name: 'Roasted coffee beans', category: categories[4], price: 25000, cost: 16000, stock: 20, min: 5, unit: '250 g', sku: 'BEV-002', image: coffee, active: true },
];
export const money = (value: number) => new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(value);
export const currency = (value: number) => `UGX ${money(value)}`;
type PosState = { products: Product[]; cart: CartItem[]; sales: Sale[]; history: StockEntry[]; add: (id: number) => void; quantity: (id: number, delta: number) => void; clear: () => void; checkout: (discount: number, payment: string, cashier?: string) => Sale | null; saveProduct: (product: Product) => void; adjust: (id: number, change: number, reason: string) => void; refund: (id: string) => void };
const PosContext = createContext<PosState | null>(null);
export function PosProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [history, setHistory] = useState<StockEntry[]>([]);
  function quantity(id: number, delta: number) {
    const product = products.find(p => p.id === id);
    if (!product || !product.active) return;
    setCart(current => {
      const existing = current.find(i => i.id === id);
      const next = Math.min(product.stock, (existing?.quantity ?? 0) + delta);
      if (next <= 0) return current.filter(i => i.id !== id);
      return existing ? current.map(i => i.id === id ? { ...i, quantity: next } : i) : [...current, { id, quantity: next }];
    });
  }
  function checkout(discount: number, payment: string, cashier = 'Cashier') {
    if (!cart.length || cart.some(i => { const p = products.find(p => p.id === i.id); return !p || !p.active || p.stock < i.quantity; })) return null;
    const items = cart.flatMap(i => { const p = products.find(p => p.id === i.id); return p ? [{ name: p.name, quantity: i.quantity, price: p.price, cost: p.cost }] : []; });
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const sale: Sale = { id: `SALE-${String(sales.length + 1).padStart(4, '0')}`, date: new Date().toISOString(), items, subtotal, discount, total: subtotal - subtotal * discount / 100, payment, cashier, refunded: false };
    setProducts(current => current.map(p => ({ ...p, stock: p.stock - (cart.find(i => i.id === p.id)?.quantity ?? 0) })));
    setHistory(current => [...items.map(i => ({ product: i.name, change: -i.quantity, reason: sale.id, date: sale.date })), ...current]);
    setSales(current => [sale, ...current]); setCart([]); return sale;
  }
  function adjust(id: number, change: number, reason: string) {
    const product = products.find(p => p.id === id);
    if (!product || product.stock + change < 0) return;
    setProducts(current => current.map(p => p.id === id ? { ...p, stock: p.stock + change } : p));
    setHistory(current => [{ product: product.name, change, reason, date: new Date().toISOString() }, ...current]);
  }
  function refund(id: string) {
    const sale = sales.find(s => s.id === id);
    if (!sale || sale.refunded) return;
    setSales(current => current.map(s => s.id === id ? { ...s, refunded: true } : s));
    sale.items.forEach(item => { const p = products.find(p => p.name === item.name); if (p) adjust(p.id, item.quantity, `Refund ${id}`); });
  }
  return <PosContext.Provider value={{ products, cart, sales, history, add: id => quantity(id, 1), quantity, clear: () => setCart([]), checkout, saveProduct: product => setProducts(current => current.some(p => p.id === product.id) ? current.map(p => p.id === product.id ? product : p) : [...current, product]), adjust, refund }}>{children}</PosContext.Provider>;
}
export function usePos() { const context = useContext(PosContext); if (!context) throw new Error('POS provider missing'); return context; }