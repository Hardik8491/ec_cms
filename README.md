# EC_CMS – Multi-Tenant Role-Based eCommerce CMS

![EC_CMS Banner](/public/images/ec-cms-banner.png)

EC_CMS is a scalable, multi-tenant, role-based Content Management System designed for agencies to create and manage their own eCommerce stores under unique subdomains. The platform enables agency-level store management, where each agency can independently manage its products, categories, orders, customers, revenue, and analytics through a dedicated dashboard, while a super admin has full control over all agencies and stores.

## 🚀 Features

- **Multi-role authentication**
  - Secure login for Admin, Agency, and Customer roles
  - Role-based access control (RBAC) for all system features
  - JWT-based authentication with secure password handling

- **Agency onboarding**
  - Self-service registration for new agencies
  - Approval workflow managed by admin
  - Custom subdomain assignment

- **Subdomain multi-tenancy**
  - Each store runs under a unique subdomain (e.g., `store1.ec-cms.com`)
  - Isolated data and user management per agency
  - Shared infrastructure for cost efficiency

- **Store management**
  - Complete CRUD operations for products and categories
  - Order management system with status tracking
  - Inventory management with stock alerts

- **Customer management**
  - Customer profiles and purchase history
  - Agency can view and interact with their store customers
  - Customer segmentation for targeted marketing

- **Revenue & analytics dashboard**
  - Real-time sales tracking and reporting
  - Product performance metrics
  - Customer acquisition and retention analytics
  - Customizable date ranges for data analysis

- **Admin panel**
  - Super admin can manage all agencies
  - Global analytics across all stores
  - System configuration and maintenance tools

- **Public APIs**
  - RESTful API endpoints for each store
  - Secure API authentication
  - Documentation for third-party integration

## 🛠️ Tech Stack

### Frontend
- **Next.js** - React framework with server-side rendering
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Recharts** - Composable charting library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma ORM** - Next-generation ORM for Node.js
- **PostgreSQL** - Relational database

### Authentication & Security
- **NextAuth.js** - Authentication for Next.js
- **JWT** - JSON Web Tokens for secure authentication
- **bcrypt** - Password hashing

### Deployment & Infrastructure
- **Vercel** - Frontend hosting and deployment
- **Railway/Render** - Backend hosting
- **DNS Configuration** - For subdomain handling

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](/public/images/admin-dashboard.png)

### Agency Dashboard
![Agency Dashboard](/public/images/agency-dashboard.png)

### Product Management
![Product Management](/public/images/product-management.png)

### Analytics View
![Analytics View](/public/images/analytics-view.png)

## 🏗️ Project Structure

\`\`\`
ec_cms/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin routes
│   ├── agency/             # Agency routes
│   ├── api/                # API routes
│   │   ├── admin/          # Admin-only APIs
│   │   ├── agency/         # Agency-only APIs
│   │   └── auth/           # Authentication APIs
│   └── user/               # User/Customer routes
├── components/             # React components
│   ├── admin/              # Admin-specific components
│   ├── agency/             # Agency-specific components
│   ├── layout/             # Layout components
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility functions and shared code
├── hooks/                  # Custom React hooks
├── prisma/                 # Prisma schema and migrations
│   └── schema.prisma       # Database schema
├── public/                 # Static assets
└── styles/                 # Global styles
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- DNS configuration for subdomain support (for production)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/ec_cms.git
   cd ec_cms
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   Edit `.env.local` with your database connection string and other configuration.

4. Run database migrations:
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

5. Seed the database with initial data:
   \`\`\`bash
   npx prisma db seed
   \`\`\`

6. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Setting Up Subdomains for Local Development

For local development with subdomain support:

1. Edit your hosts file:
   - On Windows: `C:\Windows\System32\drivers\etc\hosts`
   - On Mac/Linux: `/etc/hosts`

2. Add the following entries:
   \`\`\`
   127.0.0.1 ec-cms.localhost
   127.0.0.1 agency1.ec-cms.localhost
   127.0.0.1 agency2.ec-cms.localhost
   \`\`\`

3. Access the subdomains in your browser:
   - Main site: [http://ec-cms.localhost:3000](http://ec-cms.localhost:3000)
   - Agency 1: [http://agency1.ec-cms.localhost:3000](http://agency1.ec-cms.localhost:3000)

## 🧪 Testing

Run the test suite:

\`\`\`bash
npm test
\`\`\`

## 🚢 Deployment

### Frontend (Next.js)

1. Deploy to Vercel:
   \`\`\`bash
   vercel
   \`\`\`

2. Configure custom domain and wildcard DNS for subdomains.

### Backend (if separate)

1. Deploy to Railway or Render using their respective deployment workflows.

2. Set up environment variables in the deployment platform.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)

---

Built with ❤️ by [Your Name](https://github.com/yourusername)
