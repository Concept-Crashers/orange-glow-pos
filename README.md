# Orange Glow POS

Orange Glow POS is a role-based point-of-sale workspace for Fresh Market. It includes checkout, inventory, sales reporting, staff dashboards, restock advice, and store administration.

## Competition Submission

Complete the placeholders below before submitting the project.

### 1. Live System URL

`TODO: Add the deployed application URL.`

### 2. Test Login Credentials

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `TODO` | `TODO` |
| Manager | `TODO` | `TODO` |
| Cashier | `TODO` | `TODO` |

### 3. Source Code Repository

`TODO: Add the public source repository URL.`

### 4. Database Structure and Schema

The database schema is defined in [drizzle/schema.ts](drizzle/schema.ts), with generated migrations in [drizzle/migrations](drizzle/migrations). The main data areas are:

- Profiles and staff roles
- Products and product categories
- Sales, sale items, payments, and refunds
- Inventory adjustments and stock history
- Store settings

Database access is protected with role-based authorization and row-level security policies in Supabase.

### 5. Short Technical Documentation

The application is a TanStack Start and React POS application. Shared POS state is provided by the root-mounted POS provider so the cart, catalog, sales, inventory history, and settings remain available while navigating. TanStack Router handles top-level workspace routes. Supabase provides authentication, persistence, server-side functions, and role-aware database access. AI sales insights and restock recommendations run through role-checked server functions.

### 6. Screenshots

Add screenshots of the following workflows before submission:

- Sign-in and role selection
- Point of sale checkout
- Business overview dashboard
- Inventory and stock adjustment
- Cashier and manager dashboards
- Restock advice and sales insights

`TODO: Add screenshots to a submission-assets/screenshots directory and link them here.`

### 7. Technologies Used

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite
- Supabase Auth and PostgreSQL
- Drizzle ORM and SQL migrations
- Tailwind CSS and the shared CSS design system
- Radix UI components
- Lucide React icons
- Vitest and Testing Library
- Lovable Cloud and AI Gateway integrations

### 8. Implemented Features

- Role-based access for administrators, managers, and cashiers
- Product catalog and product management
- POS checkout with cart, discounts, payment methods, and receipts
- Inventory tracking, stock adjustments, low-stock warnings, and stock history
- Business overview with sales, transactions, profit, and product KPIs
- Cashier dashboard and personal shift summary
- Manager dashboard with daily activity and attention items
- Sales transactions, refunds, filters, and CSV export
- Sales and inventory reports
- AI sales insights and restock recommendations
- In-stock product finder for customer assistance
- Store settings and team role management
- Responsive layouts for desktop and mobile screens

### 9. Setup and Deployment Instructions

Prerequisites: Node.js, npm, a Supabase project, and the required environment variables.

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

For a production check and deployment build:

```sh
npm run lint
npm test
npm run build
```

Configure Supabase credentials and server-side secrets in the deployment environment before publishing. Apply the SQL migrations in [drizzle/migrations](drizzle/migrations) to the target database.

### 10. Optional Demonstration Video

`TODO: Add a short demonstration video URL showing sign-in, checkout, inventory, dashboards, reporting, and AI advice.`

## Lovable Development

This project was built with [Lovable](https://lovable.dev). Continue development in the [Lovable editor](https://lovable.dev/projects/0243843a-e010-4fcd-a61c-56f56ca5f428).
