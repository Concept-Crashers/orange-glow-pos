import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import bananas from "@/assets/bananas.jpg";
import apples from "@/assets/apples.jpg";
import juice from "@/assets/juice.jpg";
import milk from "@/assets/milk.jpg";
import bread from "@/assets/bread.jpg";
import eggs from "@/assets/eggs.jpg";
import honey from "@/assets/honey.jpg";
import avocado from "@/assets/avocado.jpg";
import coffee from "@/assets/coffee.jpg";

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min: number;
  unit: string;
  sku: string;
  image: string;
  active: boolean;
};
export type CartItem = { id: number; quantity: number };
export type Sale = {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number; cost: number }[];
  subtotal: number;
  discount: number;
  total: number;
  payment: string;
  paymentProvider?: string;
  paymentPhone?: string;
  customer?: string;
  cashier: string;
  refunded: boolean;
};
export type StockEntry = { product: string; change: number; reason: string; date: string };
export type StoreSettings = { shop_name: string; address: string; phone: string };
export const categories = [
  "All products",
  "Fruits & vegetables",
  "Dairy & eggs",
  "Bakery",
  "Beverages",
  "Pantry",
] as const;
const assets: Record<string, string> = {
  bananas,
  apples,
  juice,
  milk,
  bread,
  eggs,
  honey,
  avocado,
  coffee,
};
const toImage = (stored: string) =>
  stored.startsWith("asset:") ? (assets[stored.slice(6)] ?? "") : stored;
const fromImage = (url: string) => {
  const key = Object.keys(assets).find((k) => assets[k] === url);
  return key ? `asset:${key}` : url;
};
export const money = (value: number) =>
  new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 }).format(value);
export const currency = (value: number) => `UGX ${money(value)}`;

type PosState = {
  loading: boolean;
  error: string;
  products: Product[];
  cart: CartItem[];
  sales: Sale[];
  history: StockEntry[];
  settings: StoreSettings;
  saveSettings: (s: StoreSettings) => Promise<string | null>;
  add: (id: number) => void;
  quantity: (id: number, delta: number) => void;
  clear: () => void;
  checkout: (
    discount: number,
    payment: string,
    cashier?: string,
    paymentProvider?: string,
    paymentPhone?: string,
    customer?: string,
  ) => Sale | null;
  saveProduct: (product: Product) => void;
  adjust: (id: number, change: number, reason: string) => void;
  refund: (id: string) => void;
};
const PosContext = createContext<PosState | null>(null);

export function PosProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [history, setHistory] = useState<StockEntry[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    shop_name: "Fresh Market",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fail = (e: { message: string } | null) => {
    if (e) setError(`Could not save: ${e.message}`);
  };

  useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        setProducts([]);
        setSales([]);
        setHistory([]);
        setLoading(false);
        return;
      }
      const [p, s, h, st] = await Promise.all([
        supabase.from("products").select("*").order("id"),
        supabase.from("sales").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase
          .from("stock_history")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("store_settings")
          .select("shop_name, address, phone")
          .eq("id", 1)
          .maybeSingle(),
      ]);
      const err = p.error ?? s.error ?? h.error ?? st.error;
      if (err) setError(`Could not load store data: ${err.message}`);
      setProducts(
        (p.data ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          price: Number(r.price),
          cost: Number(r.cost),
          stock: r.stock,
          min: r.min_stock,
          unit: r.unit,
          sku: r.sku,
          image: toImage(r.image),
          active: r.active,
        })),
      );
      setSales(
        (s.data ?? []).map((r) => ({
          id: r.id,
          date: r.created_at,
          items: r.items as Sale["items"],
          subtotal: Number(r.subtotal),
          discount: Number(r.discount),
          total: Number(r.total),
          payment: r.payment,
          ...(r.payment_provider ? { paymentProvider: r.payment_provider } : {}),
          ...(r.payment_phone ? { paymentPhone: r.payment_phone } : {}),
          ...(r.customer ? { customer: r.customer } : {}),
          cashier: r.cashier,
          refunded: r.refunded,
        })),
      );
      setHistory(
        (h.data ?? []).map((r) => ({
          product: r.product,
          change: r.change,
          reason: r.reason,
          date: r.created_at,
        })),
      );
      if (st.data) setSettings(st.data);
      setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "INITIAL_SESSION" || e === "SIGNED_OUT") setTimeout(load, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const persistProduct = (p: Product) =>
    supabase
      .from("products")
      .upsert({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        min_stock: p.min,
        unit: p.unit,
        sku: p.sku,
        image: fromImage(p.image),
        active: p.active,
      })
      .then((r) => fail(r.error));
  const persistStock = (id: number, stock: number) =>
    supabase
      .from("products")
      .update({ stock })
      .eq("id", id)
      .then((r) => fail(r.error));
  const persistHistory = (entries: StockEntry[]) =>
    supabase
      .from("stock_history")
      .insert(
        entries.map((e) => ({
          product: e.product,
          change: e.change,
          reason: e.reason,
          created_at: e.date,
        })),
      )
      .then((r) => fail(r.error));

  function quantity(id: number, delta: number) {
    const product = products.find((p) => p.id === id);
    if (!product || !product.active) return;
    setCart((current) => {
      const existing = current.find((i) => i.id === id);
      const next = Math.min(product.stock, (existing?.quantity ?? 0) + delta);
      if (next <= 0) return current.filter((i) => i.id !== id);
      return existing
        ? current.map((i) => (i.id === id ? { ...i, quantity: next } : i))
        : [...current, { id, quantity: next }];
    });
  }
  function checkout(
    discount: number,
    payment: string,
    cashier = "Cashier",
    paymentProvider?: string,
    paymentPhone?: string,
    customer?: string,
  ) {
    if (
      !cart.length ||
      cart.some((i) => {
        const p = products.find((p) => p.id === i.id);
        return !p || !p.active || p.stock < i.quantity;
      })
    )
      return null;
    const items = cart.flatMap((i) => {
      const p = products.find((p) => p.id === i.id);
      return p ? [{ name: p.name, quantity: i.quantity, price: p.price, cost: p.cost }] : [];
    });
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const now = new Date();
    const sale: Sale = {
      id: `SALE-${now.getTime().toString(36).toUpperCase()}`,
      date: now.toISOString(),
      items,
      subtotal,
      discount,
      total: subtotal - (subtotal * discount) / 100,
      payment,
      ...(paymentProvider ? { paymentProvider } : {}),
      ...(paymentPhone ? { paymentPhone } : {}),
      ...(customer ? { customer } : {}),
      cashier,
      refunded: false,
    };
    const entries = items.map((i) => ({
      product: i.name,
      change: -i.quantity,
      reason: sale.id,
      date: sale.date,
    }));
    supabase
      .from("sales")
      .insert({
        id: sale.id,
        created_at: sale.date,
        items: sale.items,
        subtotal,
        discount,
        total: sale.total,
        payment,
        payment_provider: paymentProvider ?? null,
        payment_phone: paymentPhone ?? null,
        customer: customer || null,
        cashier,
        refunded: false,
      })
      .then((r) => fail(r.error));
    cart.forEach((i) => {
      const p = products.find((p) => p.id === i.id);
      if (p) persistStock(p.id, p.stock - i.quantity);
    });
    persistHistory(entries);
    setProducts((current) =>
      current.map((p) => ({
        ...p,
        stock: p.stock - (cart.find((i) => i.id === p.id)?.quantity ?? 0),
      })),
    );
    setHistory((current) => [...entries, ...current]);
    setSales((current) => [sale, ...current]);
    setCart([]);
    return sale;
  }
  function adjust(id: number, change: number, reason: string) {
    const product = products.find((p) => p.id === id);
    if (!product || product.stock + change < 0) return;
    const entry = { product: product.name, change, reason, date: new Date().toISOString() };
    persistStock(id, product.stock + change);
    persistHistory([entry]);
    setProducts((current) =>
      current.map((p) => (p.id === id ? { ...p, stock: p.stock + change } : p)),
    );
    setHistory((current) => [entry, ...current]);
  }
  function refund(id: string) {
    const sale = sales.find((s) => s.id === id);
    if (!sale || sale.refunded) return;
    supabase
      .from("sales")
      .update({ refunded: true })
      .eq("id", id)
      .then((r) => fail(r.error));
    setSales((current) => current.map((s) => (s.id === id ? { ...s, refunded: true } : s)));
    const entries: StockEntry[] = [];
    const next = products.map((p) => {
      const qty = sale.items.filter((i) => i.name === p.name).reduce((v, i) => v + i.quantity, 0);
      if (!qty) return p;
      entries.push({
        product: p.name,
        change: qty,
        reason: `Refund ${id}`,
        date: new Date().toISOString(),
      });
      persistStock(p.id, p.stock + qty);
      return { ...p, stock: p.stock + qty };
    });
    setProducts(next);
    if (entries.length) {
      persistHistory(entries);
      setHistory((c) => [...entries, ...c]);
    }
  }
  async function saveSettings(s: StoreSettings) {
    const { error } = await supabase
      .from("store_settings")
      .update({ ...s, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (!error) setSettings(s);
    return error?.message ?? null;
  }
  function saveProduct(product: Product) {
    persistProduct(product);
    setProducts((current) =>
      current.some((p) => p.id === product.id)
        ? current.map((p) => (p.id === product.id ? product : p))
        : [...current, product],
    );
  }
  return (
    <PosContext.Provider
      value={{
        loading,
        error,
        products,
        cart,
        sales,
        history,
        settings,
        saveSettings,
        add: (id) => quantity(id, 1),
        quantity,
        clear: () => setCart([]),
        checkout,
        saveProduct,
        adjust,
        refund,
      }}
    >
      {children}
    </PosContext.Provider>
  );
}
export function usePos() {
  const context = useContext(PosContext);
  if (!context) throw new Error("POS provider missing");
  return context;
}
