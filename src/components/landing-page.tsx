import { Link } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { ShoppingBasket, LogIn, Zap, Printer, Boxes, Sparkles, ShieldCheck, ChartNoAxesCombined, Users, Check, ArrowRight, Phone, Mail, MapPin, TrendingUp, Wallet, ShoppingCart, BarChart3, Smartphone, Clock, FileText, Package, Bell, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hero from '@/assets/landing-hero.jpg';

const links = [['#features', 'Features'], ['#how', 'How it works'], ['#roles', 'Roles'], ['#ai', 'AI tools'], ['#pricing', 'Pricing'], ['#faq', 'FAQ'], ['#contact', 'Contact']];
const features = [
  { icon: Zap, title: 'Lightning-fast checkout', text: 'Tap products, apply discounts and take cash, mobile money or card in seconds. The register is designed for speed — no menus, no friction.' },
  { icon: Printer, title: 'Thermal receipts', text: 'Print clean 80mm receipts with your shop name, address and phone on every sale. Works with standard USB and Bluetooth receipt printers.' },
  { icon: Boxes, title: 'Live stock control', text: 'Stock drops automatically with every sale. Low-stock alerts tell managers exactly what to reorder before shelves go empty.' },
  { icon: ChartNoAxesCombined, title: 'Sales dashboards', text: 'Daily totals, payment breakdowns, top sellers and category revenue — all visualised with charts that update as you sell.' },
  { icon: Wallet, title: 'Mobile money ready', text: 'Accept MTN MoMo and Airtel Money directly at the till. Record provider and phone number with every mobile payment.' },
  { icon: Sparkles, title: 'AI assistance', text: 'Recommend products to customers, explain sales trends and get prioritised restock plans — all powered by AI and your store data.' },
  { icon: ShieldCheck, title: 'Role-based security', text: 'Cashiers sell, managers manage stock, admins control settings. The database checks permissions on every write — not just the UI.' },
  { icon: FileText, title: 'CSV reports', text: 'Export sales, profit, inventory, best sellers, low stock, cashier performance and payment breakdowns to CSV with one click.' },
];
const roles = [
  { title: 'Cashier', icon: ShoppingCart, items: ['Point of sale & receipts', 'AI product finder', 'Shift summary with payment breakdown', 'Check stock levels', 'Mobile money checkout'] },
  { title: 'Store manager', icon: BarChart3, items: ['Everything a cashier can do', 'Edit products & adjust stock', 'Refunds & full transaction log', 'Sales insights & AI restock advice', 'Purchasing: suppliers, POs, invoices', 'Manager dashboard with charts'] },
  { title: 'Administrator', icon: ShieldCheck, items: ['Everything a manager can do', 'Team & role management', 'Store & receipt settings', 'Full business dashboard with charts', 'Brand color customization', 'All reports & CSV exports'] },
];
const plans = [
  { name: 'Starter', price: 'UGX 75,000', text: 'One till for a small shop.', items: ['1 register', 'Receipts & stock', 'Up to 3 staff', 'Daily sales dashboard', 'CSV reports'] },
  { name: 'Business', price: 'UGX 180,000', text: 'For busy supermarkets.', items: ['3 registers', 'AI tools included', 'Unlimited staff', 'Full dashboard with charts', 'Mobile money checkout', 'Purchasing & suppliers'], featured: true },
  { name: 'Enterprise', price: 'Custom', text: 'Multiple branches.', items: ['Unlimited registers', 'Priority support', 'Onboarding & training', 'Custom integrations', 'Multi-branch analytics'] },
];
const faqs = [
  ['Do I need special hardware?', 'No. Tillpoint runs in any modern browser on a tablet, laptop or desktop, and prints to standard 80mm receipt printers via the browser print dialog.'],
  ['Can cashiers change prices or stock?', 'No. Cashiers can only sell and view stock. Managers and administrators control products, stock and refunds. The database enforces this — not just the UI.'],
  ['How do new staff get access?', 'An administrator creates staff accounts and assigns their role (cashier, manager, or admin) in the Team & roles page. The first account automatically becomes admin.'],
  ['Is my sales data safe?', 'Every screen requires sign-in, and the database checks each staff member\'s role before any change is saved. Row-level security prevents cashiers from accessing manager-only data.'],
  ['Does it work offline?', 'Tillpoint requires an internet connection to sync sales and stock to the cloud. Once connectivity returns, all data is automatically synchronised.'],
  ['Can I accept mobile money?', 'Yes. MTN MoMo and Airtel Money are built into the checkout flow. Record the provider and customer phone number with each mobile payment for your records.'],
  ['What reports can I export?', 'Sales, profit, inventory, low stock, best sellers, by cashier, and by payment method — all exportable to CSV for accounting or further analysis.'],
];
const stats = [
  { icon: Zap, value: '3s', label: 'Average checkout time' },
  { icon: Users, value: '3', label: 'Staff roles built in' },
  { icon: Clock, value: '24/7', label: 'Live sales reports' },
  { icon: Award, value: '8+', label: 'Report types' },
];

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.landing-hero-copy > .landing-pill', { y: 20, opacity: 0, duration: 0.6 })
        .from('.landing-hero-copy > h1', { y: 30, opacity: 0, duration: 0.7 }, '-=0.3')
        .from('.landing-hero-copy > p', { y: 25, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.landing-hero-copy > .landing-cta', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.landing-hero-copy > .landing-stats > div', { y: 15, opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.2');
      gsap.from(imgRef.current, { x: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.3 });
      gsap.to(imgRef.current, { y: -12, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });

      gsap.utils.toArray<HTMLElement>('.landing-section').forEach(section => {
        const head = section.querySelector('.landing-head');
        if (head) {
          gsap.from(head.children, {
            y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: head, start: 'top 85%' },
          });
        }
        const cards = section.querySelectorAll('.landing-grid .landing-card');
        if (cards.length) {
          gsap.from(cards, {
            y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: section.querySelector('.landing-grid'), start: 'top 85%' },
          });
        }
        const steps = section.querySelectorAll('.landing-steps .landing-step');
        if (steps.length) {
          gsap.from(steps, {
            x: -30, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: section.querySelector('.landing-steps'), start: 'top 85%' },
          });
        }
        const faqItems = section.querySelectorAll('.landing-faq > *');
        if (faqItems.length) {
          gsap.from(faqItems, {
            y: 30, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: section.querySelector('.landing-faq'), start: 'top 85%' },
          });
        }
        const splitSides = section.querySelectorAll('.landing-split > *');
        if (splitSides.length) {
          gsap.from(splitSides, {
            y: 40, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 80%' },
          });
        }
        const aiFeatures = section.querySelectorAll('.landing-ai-feature');
        if (aiFeatures.length) {
          gsap.from(aiFeatures, {
            x: -25, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: section.querySelector('.landing-ai-features'), start: 'top 85%' },
          });
        }
        const bubbles = section.querySelectorAll('.landing-bubble');
        if (bubbles.length) {
          gsap.from(bubbles, {
            x: 20, opacity: 0, duration: 0.5, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: section.querySelector('.landing-chat'), start: 'top 85%' },
          });
        }
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);
  return <div className="landing" ref={rootRef}>
    <header className="landing-nav"><Link to="/" className="brand"><span className="brand-symbol"><ShoppingBasket size={23}/></span>till<span className="text-primary">point</span><span className="brand-dot">.</span></Link>
      <nav>{links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</nav>
      <Button asChild><Link to="/auth"><LogIn/>Sign in</Link></Button></header>

    <section className="landing-hero" ref={heroRef}><div className="landing-hero-copy"><span className="landing-pill"><Sparkles size={14}/> Point of sale built for East African retail</span>
      <h1>Run your store's till, stock and sales from one screen.</h1>
      <p>Tillpoint helps cashiers check out faster, gives managers live stock and sales numbers with visual dashboards, and uses AI to recommend products, explain trends and plan restocks — all in one place.</p>
      <div className="landing-cta"><Button size="lg" asChild><Link to="/auth">Sign in to your store <ArrowRight/></Link></Button><Button size="lg" variant="outline" asChild><a href="#features">Explore features</a></Button></div>
      <div className="landing-stats">{stats.map(s => <div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>)}</div></div>
      <img src={hero} alt="Cashier serving a customer at a Tillpoint checkout" width={1600} height={1008} className="landing-hero-img" ref={imgRef}/></section>

    <section id="features" className="landing-section"><div className="landing-head"><span className="eyebrow">FEATURES</span><h2>Everything a modern counter needs</h2><p>From the first sale to the end-of-day report — Tillpoint covers every part of running your store.</p></div>
      <div className="landing-grid">{features.map(f => <article key={f.title} className="landing-card"><span className="landing-icon"><f.icon size={20}/></span><h3>{f.title}</h3><p>{f.text}</p></article>)}</div></section>

    <section id="how" className="landing-section landing-alt"><div className="landing-head"><span className="eyebrow">HOW IT WORKS</span><h2>Up and selling in three steps</h2></div>
      <div className="landing-steps">{[['Sign in', 'Staff sign in and land on a role-specific dashboard with tasks, KPIs and charts tailored to their job.'], ['Sell', 'Ring up items with a tap, take cash or mobile money, and print a clean 80mm receipt in seconds.'], ['Review', 'Managers watch live sales charts, stock alerts and AI advice. Admins see the full business picture.']].map(([t, d], i) => <div key={t} className="landing-step"><span>{i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}</div></section>

    <section id="roles" className="landing-section"><div className="landing-head"><span className="eyebrow">ROLES</span><h2>The right tools for every team member</h2><p>Each role sees exactly what they need — nothing more, nothing less.</p></div>
      <div className="landing-grid three">{roles.map(r => <article key={r.title} className="landing-card"><span className="landing-icon"><r.icon size={20}/></span><h3>{r.title}</h3><ul>{r.items.map(i => <li key={i}><Check size={15}/>{i}</li>)}</ul></article>)}</div></section>

    <section id="ai" className="landing-section landing-dark"><div className="landing-split"><div><span className="eyebrow">AI TOOLS</span><h2>An assistant behind every counter</h2><p>Three AI tools work alongside your staff: a <strong>product finder</strong> that matches customer requests to in-stock items, a <strong>sales insights</strong> engine that answers questions about your store performance, and a <strong>restock planner</strong> that prioritises what to reorder based on stock levels and recent sales.</p>
      <div className="landing-ai-features"><div className="landing-ai-feature"><Sparkles size={18}/><div><strong>Product finder</strong><span>Cashier describes what the customer needs, AI matches it to real stock.</span></div></div><div className="landing-ai-feature"><TrendingUp size={18}/><div><strong>Sales insights</strong><span>Ask why sales dipped, which products earn the most, or how to grow basket size.</span></div></div><div className="landing-ai-feature"><Package size={18}/><div><strong>Restock planner</strong><span>Get a prioritised reorder list with quantities, costs and urgency reasons.</span></div></div></div></div>
      <div className="landing-chat"><div className="landing-bubble">"Customer wants a healthy breakfast for two — something quick."</div><div className="landing-bubble reply"><strong>Recommended:</strong> Farm fresh eggs (UGX 12,000) · Sourdough bread (UGX 8,000) · Fresh bananas (UGX 4,500) · Pure natural honey (UGX 15,000) — Total: UGX 39,500</div><div className="landing-bubble">"Why were last week's sales lower than usual?"</div><div className="landing-bubble reply"><strong>Key findings:</strong> Wednesday sales dropped 40%. Top seller (bananas) was out of stock for 2 days. Cash payments declined while mobile money grew.</div></div></div></section>

    <section id="pricing" className="landing-section"><div className="landing-head"><span className="eyebrow">PRICING</span><h2>Simple monthly plans</h2><p>Example prices shown in UGX. No hidden fees.</p></div>
      <div className="landing-grid three">{plans.map(p => <article key={p.name} className={`landing-card ${p.featured ? 'featured' : ''}`}><h3>{p.name}</h3><strong className="landing-price">{p.price}<small>{p.price !== 'Custom' ? ' / month' : ''}</small></strong><p>{p.text}</p><ul>{p.items.map(i => <li key={i}><Check size={15}/>{i}</li>)}</ul></article>)}</div></section>

    <section id="faq" className="landing-section landing-alt"><div className="landing-head"><span className="eyebrow">FAQ</span><h2>Questions, answered</h2></div>
      <div className="landing-faq">{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>

    <section id="contact" className="landing-section"><div className="landing-split"><div><span className="eyebrow">CONTACT</span><h2>Talk to our team</h2><p>We help stores set up registers, receipt printers and staff accounts. Get a free demo or ask anything — we typically respond within one business day.</p></div>
      <div className="landing-contact"><p><MapPin size={17}/> Plot 12, Kampala Road, Kampala</p><p><Phone size={17}/> +256 786 021431</p><p><Mail size={17}/> hello@tillpoint.ug</p><Button asChild><Link to="/auth"><LogIn/>Staff sign in</Link></Button></div></div></section>

    <footer className="landing-footer"><div className="landing-footer-brand"><Link to="/" className="brand"><span className="brand-symbol"><ShoppingBasket size={20}/></span>till<span className="text-primary">point</span><span className="brand-dot">.</span></Link><span>The point of sale built for Ugandan retail.</span></div><div className="landing-footer-links"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><a href="#contact">Contact</a><Link to="/auth">Sign in</Link></div><span>© 2026 Tillpoint. All rights reserved. Made for retailers in Uganda.</span></footer>
  </div>;
}
