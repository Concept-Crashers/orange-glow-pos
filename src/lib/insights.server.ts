import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createLovableAiGatewayRunIdFetch } from './run-id.server';

export class GatewayError extends Error { constructor(public status: number, message: string) { super(message); } }

type ProductDatum = { name: string; category?: string; price: number; cost?: number; stock?: number; minimum?: number; active?: boolean; unit?: string; inStock?: number; unitsSoldLast14Days?: number; };
type SaleDatum = { date: string; total: number; discountPercent?: number; payment?: string; cashier?: string; refunded?: boolean; items?: { name: string; quantity: number; price: number }[]; };

function localSalesInsight(question: string, data: { products: ProductDatum[]; sales: SaleDatum[] }): string {
  const q = question.toLowerCase();
  const products = data.products ?? [];
  const sales = (data.sales ?? []).filter((s) => !s.refunded);
  const totalRevenue = sales.reduce((v, s) => v + s.total, 0);
  const avgSale = sales.length ? totalRevenue / sales.length : 0;
  const productRevenue: Record<string, { qty: number; rev: number }> = {};
  for (const s of sales) { for (const item of s.items ?? []) { const key = item.name; if (!productRevenue[key]) productRevenue[key] = { qty: 0, rev: 0 }; productRevenue[key].qty += item.quantity; productRevenue[key].rev += item.price * item.quantity; } }
  const ranked = Object.entries(productRevenue).sort((a, b) => b[1].rev - a[1].rev);
  const topSellers = ranked.slice(0, 5);
  const slowSellers = ranked.slice(-3).reverse();
  const paymentCounts: Record<string, number> = {};
  for (const s of sales) { const p = s.payment ?? 'Unknown'; paymentCounts[p] = (paymentCounts[p] ?? 0) + 1; }
  const paymentBreakdown = Object.entries(paymentCounts).sort((a, b) => b[1] - a[1]);
  const lowStock = products.filter((p) => p.active !== false && (p.stock ?? 0) <= (p.minimum ?? 0));
  const outOfStock = products.filter((p) => p.active !== false && (p.stock ?? 0) === 0);
  const profitByProduct: Record<string, number> = {};
  for (const s of sales) { for (const item of s.items ?? []) { const prod = products.find((p) => p.name === item.name); const cost = prod?.cost ?? 0; profitByProduct[item.name] = (profitByProduct[item.name] ?? 0) + (item.price - cost) * item.quantity; } }
  const topProfit = Object.entries(profitByProduct).sort((a, b) => b[1] - a[1]).slice(0, 5);
  let answer = '';
  if (q.includes('profit') || q.includes('margin') || q.includes('money')) {
    answer = `**Top profit generators**\n\nYour most profitable products this period:\n\n`;
    for (const [name, profit] of topProfit) { answer += `1. **${name}** — UGX ${Math.round(profit).toLocaleString()} profit\n`; }
    if (topProfit.length === 0) answer += `No sales data yet to calculate profit. Start selling to see which products earn the most.\n`;
    answer += `\n**Recommended actions**\n- Promote high-margin products near the till\n- Bundle low-profit high-sellers with high-profit items\n- Review pricing on products with thin margins\n`;
  } else if (q.includes('payment') || q.includes('method') || q.includes('cash') || q.includes('mobile')) {
    answer = `**Payment method breakdown**\n\nAcross ${sales.length} transactions totalling UGX ${Math.round(totalRevenue).toLocaleString()}:\n\n`;
    for (const [method, count] of paymentBreakdown) { answer += `1. **${method}** — ${count} transactions (${Math.round((count / Math.max(sales.length, 1)) * 100)}%)\n`; }
    if (paymentBreakdown.length === 0) answer += `No sales recorded yet. Payment trends will appear after your first checkouts.\n`;
    answer += `\n**Recommended actions**\n- Encourage mobile money for faster checkout during peak hours\n- Keep enough float in the cash drawer for change\n- Track which methods customers prefer to adjust staffing\n`;
  } else if (q.includes('slow') || q.includes('restock') || q.includes('reorder') || q.includes('stock')) {
    answer = `**Inventory status**\n\n`;
    answer += `**Low stock alerts** (${lowStock.length} items at or below minimum):\n`;
    for (const p of lowStock.slice(0, 5)) { answer += `1. **${p.name}** — ${p.stock ?? 0} ${p.unit ?? 'units'} left (minimum: ${p.minimum ?? 0})\n`; }
    if (lowStock.length === 0) answer += `All products are above their minimum stock levels.\n`;
    answer += `\n**Out of stock** (${outOfStock.length} items):\n`;
    for (const p of outOfStock.slice(0, 5)) { answer += `1. **${p.name}** — reorder immediately\n`; }
    if (outOfStock.length === 0) answer += `No products are completely out of stock.\n`;
    answer += `\n**Recommended actions**\n- Reorder the items above before the weekend rush\n- Prioritise fast-selling items that are near their minimum\n- Consider increasing minimum levels for consistently fast sellers\n`;
  } else if (q.includes('basket') || q.includes('average') || q.includes('increase')) {
    answer = `**Average basket analysis**\n\nAverage sale value: **UGX ${Math.round(avgSale).toLocaleString()}** across ${sales.length} transactions.\n\n`;
    if (topSellers.length) { answer += `**Top sellers by revenue:**\n`; for (const [name, info] of topSellers.slice(0, 3)) { answer += `1. **${name}** — ${info.qty} units, UGX ${Math.round(info.rev).toLocaleString()}\n`; } }
    answer += `\n**Recommended actions**\n- Bundle complementary products (e.g. bread + eggs + milk)\n- Place impulse-buy items near the register\n- Suggest add-ons when customers buy single items\n- Run "buy 3 get 1 free" promotions on fast sellers\n`;
  } else {
    answer = `**Sales summary**\n\n`;
    answer += `**Key findings**\n`;
    answer += `- Total revenue: UGX ${Math.round(totalRevenue).toLocaleString()} from ${sales.length} sales\n`;
    answer += `- Average sale: UGX ${Math.round(avgSale).toLocaleString()}\n`;
    if (topSellers.length) answer += `- Best seller: **${topSellers[0][0]}** (${topSellers[0][1].qty} units, UGX ${Math.round(topSellers[0][1].rev).toLocaleString()})\n`;
    if (slowSellers.length) answer += `- Slowest seller: **${slowSellers[0][0]}** (${slowSellers[0][1].qty} units)\n`;
    answer += `- Low stock items: ${lowStock.length} at or below minimum\n`;
    answer += `- Out of stock: ${outOfStock.length} products\n`;
    if (paymentBreakdown.length) answer += `- Most common payment: ${paymentBreakdown[0][0]} (${paymentBreakdown[0][1]} transactions)\n`;
    answer += `\n**Recommended actions**\n`;
    if (lowStock.length) answer += `1. Reorder ${lowStock.slice(0, 3).map((p) => p.name).join(', ')} — they are at or below minimum stock\n`;
    if (slowSellers.length) answer += `2. Run a promotion on ${slowSellers[0][0]} to move slow inventory\n`;
    answer += `3. Promote top sellers like ${topSellers.length ? topSellers[0][0] : 'your best products'} with visible placement\n`;
    answer += `4. Train staff to suggest add-ons at checkout to increase basket size\n`;
  }
  return answer;
}

function localRestockPlan(question: string, data: { products: ProductDatum[]; periodDays?: number }): string {
  const products = (data.products ?? []).filter((p) => p.active !== false);
  const days = data.periodDays ?? 14;
  const items = products.map((p) => {
    const stock = p.stock ?? 0; const min = p.minimum ?? 0; const sold = p.unitsSoldLast14Days ?? 0;
    const dailyRate = sold / days; const daysLeft = dailyRate > 0 ? Math.floor(stock / dailyRate) : stock > 0 ? 999 : 0;
    const suggestedQty = dailyRate > 0 ? Math.max(Math.ceil(dailyRate * 7) - stock, 0) : min > 0 ? min : 10;
    const cost = (p.cost ?? 0) * suggestedQty;
    return { name: p.name, stock, min, sold, dailyRate, daysLeft, suggestedQty, cost, unit: p.unit ?? 'units' };
  });
  const urgent = items.filter((i) => i.stock <= i.min || i.daysLeft <= 3).sort((a, b) => a.daysLeft - b.daysLeft);
  const canWait = items.filter((i) => i.stock > i.min && i.daysLeft > 3).sort((a, b) => b.daysLeft - a.daysLeft);
  const totalCost = urgent.reduce((v, i) => v + i.cost, 0);
  let answer = `**Restock summary**\n\n${urgent.length} items need reordering now. Estimated total cost: **UGX ${Math.round(totalCost).toLocaleString()}**.\n\n`;
  answer += `**Restock order** (most urgent first)\n`;
  for (const i of urgent.slice(0, 8)) { const reason = i.stock === 0 ? 'OUT OF STOCK' : i.daysLeft <= 3 ? `~${i.daysLeft} days left` : 'below minimum'; answer += `1. **${i.name}** — order ${i.suggestedQty} ${i.unit} (UGX ${Math.round(i.cost).toLocaleString()}) — ${reason}, ${i.sold} sold in ${days} days\n`; }
  if (urgent.length === 0) answer += `All products are well-stocked. No urgent reorders needed.\n`;
  answer += `\n**Can wait**\n`;
  for (const i of canWait.slice(0, 5)) { answer += `1. **${i.name}** — ${i.stock} ${i.unit} in stock, ~${i.daysLeft} days left\n`; }
  if (canWait.length === 0) answer += `Everything else is already flagged for reorder above.\n`;
  answer += `\n_Tip: Sales history covers only ${days} days. For newer products, minimum stock levels are the primary guide._\n`;
  return answer;
}

function localProductMatch(question: string, data: { products: ProductDatum[] }): string {
  const q = question.toLowerCase(); const products = data.products ?? [];
  const keywords = q.split(/\s+/).filter((w) => w.length > 2);
  const scored = products.map((p) => {
    const name = p.name.toLowerCase(); const cat = (p.category ?? '').toLowerCase(); let score = 0;
    for (const kw of keywords) { if (name.includes(kw)) score += 3; if (cat.includes(kw)) score += 2; }
    if (q.includes('breakfast') && ['eggs', 'bread', 'milk', 'honey', 'bananas', 'coffee', 'juice'].some((f) => name.includes(f))) score += 5;
    if (q.includes('snack') && ['bananas', 'juice', 'bread'].some((f) => name.includes(f))) score += 4;
    if (q.includes('smoothie') && ['bananas', 'milk', 'honey', 'avocado'].some((f) => name.includes(f))) score += 5;
    if (q.includes('coffee') && name.includes('coffee')) score += 6;
    if (q.includes('healthy') && ['avocado', 'bananas', 'eggs', 'honey', 'apples'].some((f) => name.includes(f))) score += 4;
    if (q.includes('bake') || q.includes('cake')) { if (['eggs', 'milk', 'bananas', 'honey'].some((f) => name.includes(f))) score += 4; }
    if (q.includes('family')) score += 1;
    if (q.includes('kids')) { if (['bananas', 'juice', 'milk', 'bread'].some((f) => name.includes(f))) score += 3; }
    return { ...p, score };
  }).filter((p) => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  if (scored.length === 0) {
    return `**No close matches found**\n\nI couldn't find products that clearly match "${question}". Here are some popular options:\n\n${products.slice(0, 3).map((p, i) => `${i + 1}. **${p.name}** — UGX ${p.price.toLocaleString()} (${p.inStock ?? p.stock ?? 0} in stock)`).join('\n')}\n\n_Tip: Try describing the meal or occasion (e.g. "breakfast for the family") for better matches._\n`;
  }
  let answer = `**Recommended for your customer**\n\nBased on "${question}", here are the best matches from your current stock:\n\n`;
  for (let i = 0; i < scored.length; i++) { const p = scored[i]; answer += `${i + 1}. **${p.name}** — UGX ${p.price.toLocaleString()} (${p.inStock ?? p.stock ?? 0} ${p.unit ?? 'units'} in stock)\n`; }
  const total = scored.reduce((v, p) => v + p.price, 0);
  answer += `\n**Suggested basket total:** UGX ${Math.round(total).toLocaleString()} for all ${scored.length} items.\n`;
  return answer;
}

export async function analyzeSales(question: string, data: unknown, system?: string) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 400));
    const d = data as { products: ProductDatum[]; sales: SaleDatum[]; periodDays?: number };
    if (system?.includes('inventory planner')) return localRestockPlan(question, d);
    if (system?.includes('shop assistant')) return localProductMatch(question, d);
    return localSalesInsight(question, d);
  }
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: 'https://ai.gateway.lovable.dev/v1',
    apiKey,
    headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' },
    fetch: runIdFetch.fetch,
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses('openai/gpt-6-astra'),
    system: system ?? 'You are a retail analyst for a grocery store in Kampala. Prices are in UGX. Answer the manager\'s question using ONLY the POS data provided. Be concise (under 250 words). Use markdown: a one-line answer, then "Key findings" bullets with numbers, then "Recommended actions" as 2-4 concrete steps. If the data is insufficient, say so and suggest what to track.',
    prompt: `Question: ${question}\n\nPOS data (JSON):\n${JSON.stringify(data)}`,
    maxRetries: 0,
    onError: ({ error }) => { failure = error; },
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', store: false, include: ['reasoning.encrypted_content'] } },
  });
  let text = '';
  try { text = await result.text; } catch (e) { failure ??= e; }
  if (failure || !text) {
    const status = (failure as { statusCode?: number })?.statusCode ?? 500;
    const msg = status === 402 ? 'AI credits are used up. Add credits in workspace billing to keep using insights.' : status === 429 ? 'Too many requests right now. Please wait a moment and try again.' : status === 403 ? 'AI access is blocked for this workspace.' : 'The analysis could not be completed. Please try again.';
    throw new GatewayError(status, msg);
  }
  return text;
}
