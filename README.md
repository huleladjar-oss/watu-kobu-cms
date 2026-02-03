# Watu Kobu CMS

Sistem Manajemen Aset & Penagihan Terintegrasi untuk PT. Watu Kobu Multiniaga.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js v4
- **Icons:** Lucide React

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/          # Admin Dashboard (ADMIN role)
│   │   ├── dashboard/
│   │   ├── registry/
│   │   ├── assignments/
│   │   ├── validation/
│   │   └── documents/
│   ├── management/     # Manager Dashboard (MANAGER role)
│   │   ├── dashboard/
│   │   ├── team/
│   │   ├── assets/
│   │   ├── reports/
│   │   └── configuration/
│   ├── mobile/         # Collector App (COLLECTOR role)
│   │   ├── task/
│   │   ├── collect/
│   │   ├── report/
│   │   ├── history/
│   │   └── profile/
│   ├── login/          # Login Page
│   └── api/auth/       # NextAuth API Routes
├── components/
│   └── providers/      # SessionProvider
├── context/            # React Context (Auth, Asset, Validation, Document)
├── lib/                # Utilities (Prisma, Auth config)
└── data/               # Mock data
```

## 🔐 User Roles

| Role | Dashboard | Description |
|------|-----------|-------------|
| ADMIN | `/admin/dashboard` | Full system access, asset registry, validation |
| MANAGER | `/management/dashboard` | Team management, reports, configuration |
| COLLECTOR | `/mobile` | Field collection tasks, reports |

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` file:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 👥 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@watukobu.co.id | admin123 |
| Manager | manager@watukobu.co.id | manager123 |
| Collector | budi.santoso@watukobu.co.id | collector123 |

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## 🌐 Deployment (Vercel)

### Environment Variables for Vercel

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase pooler connection string |
| `DIRECT_URL` | Your Supabase direct connection string |
| `NEXTAUTH_SECRET` | Your secret key |
| `NEXTAUTH_URL` | Your production URL (e.g., https://your-app.vercel.app) |

## 📄 License

Private - PT. Watu Kobu Multiniaga
