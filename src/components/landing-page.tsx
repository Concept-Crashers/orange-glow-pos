import { Link } from '@tanstack/react-router';
import { ShoppingBasket, LogIn, Zap, Printer, Boxes, Sparkles, ShieldCheck, ChartNoAxesCombined, Users, Check, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hero from '@/assets/landing-hero.jpg';

const links = [['#features', 'Features'], ['#how', 'How it works'], ['#roles', 'Roles'], ['#ai', 'AI tools'], ['#pricing', 'Pricing'], ['#faq', 'FAQ'], ['#contact', 'Contact']];
const features = [
  { icon: Zap, title: 'Lightning-fast checkout', text: 'Tap products, apply discounts and take cash, mobile money or card in seconds.' },
  { icon: Printer, title: 'Thermal receipts', text: 'Print clean 80mm receipts with your shop name, address and phone on every sale.' },
  { icon: Boxes, title: 'Live stock control', text: 'Stock drops with every sale. Low-stock alerts tell managers what to reorder.' },
  { icon: ChartNoAxesCombined, title: 'Sales dashboards', text: 'Daily totals, payment breakdowns and top sellers — updated as you sell.' },
  { icon: Sparkles, title: 'AI assistance', text: 'Recommend products to customers, explain sales trends and plan restocks.' },
  { icon: ShieldCheck, title: 'Role-based security', text: 'Cashiers sell, managers manage stock, admins control settings. Nothing more.' },
];
const roles = [
  { title: 'Cashier', items: ['Point of sale & receipts', 'AI product finder', 'Shift summary', 'Check stock levels'] },
  { title: 'Store manager', items: ['Everything a cashier can do', 'Edit products & add stock', 'Refunds & transactions', 'Sales insights & restock advice'] },
  { title: 'Administrator', items: ['Everything a manager can do', 'Team & role management', 'Store & receipt settings', 'Full sales dashboard'] },
];
const plans = [
  { name: 'Starter', price: 'UGX 75,000', text: 'One till for a small shop.', items: ['1 register', 'Receipts & stock', 'Up to 3 staff'] },
  { name: 'Business', price: 'UGX 180,000', text: 'For busy supermarkets.', items: ['3 registers', 'AI tools included', 'Unlimited staff'], featured: true },
  { name: 'Enterprise', price: 'Custom', text: 'Multiple branches.', items: ['Unlimited registers', 'Priority support', 'Onboarding & training'] },
];
const faqs = [
  ['Do I need special hardware?', 'No. Tillpoint runs in any modern browser on a tablet, laptop or desktop, and prints to standard 80mm receipt printers.'],
  ['Can cashiers change prices or stock?', 'No. Cashiers can only sell and view stock. Managers and administrators control products, stock and refunds.'],
  ['How do new staff get access?', 'An administrator invites staff and assigns their role in Team & roles.'],
  ['Is my sales data safe?', 'Every screen requires sign-in, and the database checks each staff member’s role before any change is saved.'],
];

export function LandingPage() {
  return <div className="landing">
    <header className="landing-nav"><Link to="/" className="brand"><span className="brand-symbol"><ShoppingBasket size={23}/></span>till<span className="text-primary">point</span><span className="brand-dot">.</span></Link>
      <nav>{links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</nav>
      <Button asChild><Link to="/auth"><LogIn/>Sign in</Link></Button></header>

    <section className="landing-hero"><div className="landing-hero-copy"><span className="landing-pill"><Sparkles size={14}/> Point of sale built for East African retail</span>
      <h1>Run your store’s till, stock and sales from one screen.</h1>
      <p>Tillpoint helps cashiers check out faster, gives managers live stock and sales numbers, and uses AI to recommend products and plan restocks.</p>
      <div className="landing-cta"><Button size="lg" asChild><Link to="/auth">Sign in to your store <ArrowRight/></Link></Button><Button size="lg" variant="outline" asChild><a href="#features">Explore features</a></Button></div>
      <div className="landing-stats"><div><strong>3s</strong><span>Average checkout</span></div><div><strong>3</strong><span>Staff roles</span></div><div><strong>24/7</strong><span>Live reports</span></div></div></div>
      <img src={hero} alt="Cashier serving a customer at a Tillpoint checkout" width={1600} height={1008} className="landing-hero-img"/></section>

    <section id="features" className="landing-section"><div className="landing-head"><span className="eyebrow">FEATURES</span><h2>Everything a modern counter needs</h2><p>From the first sale to the end-of-day report.</p></div>
      <div className="landing-grid">{features.map(f => <article key={f.title} className="landing-card"><span className="landing-icon"><f.icon size={20}/></span><h3>{f.title}</h3><p>{f.text}</p></article>)}</div></section>

    <section id="how" className="landing-section landing-alt"><div className="landing-head"><span className="eyebrow">HOW IT WORKS</span><h2>Up and selling in three steps</h2></div>
      <div className="landing-steps">{[['Sign in', 'Staff sign in and land on the dashboard for their role.'], ['Sell', 'Ring up items, take payment and print the receipt.'], ['Review', 'Managers watch sales, stock and AI advice in real time.']].map(([t, d], i) => <div key={t} className="landing-step"><span>{i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}</div></section>

    <section id="roles" className="landing-section"><div className="landing-head"><span className="eyebrow">ROLES</span><h2>The right tools for every team member</h2></div>
      <div className="landing-grid three">{roles.map(r => <article key={r.title} className="landing-card"><span className="landing-icon"><Users size={20}/></span><h3>{r.title}</h3><ul>{r.items.map(i => <li key={i}><Check size={15}/>{i}</li>)}</ul></article>)}</div></section>

    <section id="ai" className="landing-section landing-dark"><div className="landing-split"><div><span className="eyebrow">AI TOOLS</span><h2>An assistant behind every counter</h2><p>Describe what a customer needs and get matching in-stock products. Ask why sales dipped. Get a restock list in priority order — all from your own store data.</p></div>
      <div className="landing-chat"><div className="landing-bubble">“Customer wants a healthy breakfast for two.”</div><div className="landing-bubble reply"><strong>Recommended:</strong> Farm fresh eggs · Sourdough bread · Fresh bananas · Pure natural honey</div></div></div></section>

    <section id="pricing" className="landing-section"><div className="landing-head"><span className="eyebrow">PRICING</span><h2>Simple monthly plans</h2><p>Example prices shown in UGX.</p></div>
      <div className="landing-grid three">{plans.map(p => <article key={p.name} className={`landing-card ${p.featured ? 'featured' : ''}`}><h3>{p.name}</h3><strong className="landing-price">{p.price}<small>{p.price !== 'Custom' ? ' / month' : ''}</small></strong><p>{p.text}</p><ul>{p.items.map(i => <li key={i}><Check size={15}/>{i}</li>)}</ul></article>)}</div></section>

    <section id="faq" className="landing-section landing-alt"><div className="landing-head"><span className="eyebrow">FAQ</span><h2>Questions, answered</h2></div>
      <div className="landing-faq">{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>

    <section id="contact" className="landing-section"><div className="landing-split"><div><span className="eyebrow">CONTACT</span><h2>Talk to our team</h2><p>We help stores set up registers, receipt printers and staff accounts.</p></div>
      <div className="landing-contact"><p><MapPin size={17}/> Plot 12, Kampala Road, Kampala</p><p><Phone size={17}/> +256 700 000 000</p><p><Mail size={17}/> hello@tillpoint.ug</p><Button asChild><Link to="/auth"><LogIn/>Staff sign in</Link></Button></div></div></section>

    <footer className="landing-footer"><span>© 2026 Tillpoint. All rights reserved.</span><span>Made for retailers in Uganda</span></footer>
  </div>;
}
