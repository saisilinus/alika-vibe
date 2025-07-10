# Alika Platform

A modern banner generation platform built with Next.js, MongoDB, and NextAuth.

## Features

- 🎨 **Banner Generation** - Create custom banners from templates
- 🔐 **Authentication** - Google OAuth and Email authentication
- 📊 **Admin Dashboard** - Role-based admin panel with analytics
- 🏷️ **Campaign Management** - Organize banners by categories and tags
- 💬 **Comments System** - User feedback on campaigns
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: MongoDB with native driver
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Image Processing**: Sharp

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB Atlas account

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd alika-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your MongoDB URI and authentication credentials.

4. **Initialize the database**
   \`\`\`bash
   node scripts/init-database.js
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ |
| `EMAIL_SERVER_HOST` | SMTP server host | ❌ |
| `EMAIL_SERVER_PORT` | SMTP server port | ❌ |
| `EMAIL_SERVER_USER` | SMTP username | ❌ |
| `EMAIL_SERVER_PASSWORD` | SMTP password | ❌ |
| `EMAIL_FROM` | From email address | ❌ |

## Database Schema

### Collections

- **users** - User accounts and roles
- **campaigns** - Banner templates and campaigns
- **generated_banners** - User-generated banners
- **comments** - Campaign comments and feedback
- **accounts** - NextAuth account linking
- **sessions** - User sessions
- **verification_tokens** - Email verification tokens

## API Routes

### Public Routes
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/trending` - Trending campaigns
- `GET /api/campaigns/latest` - Latest campaigns
- `GET /api/campaigns/[id]` - Campaign details

### Protected Routes
- `POST /api/campaigns/[id]/generate` - Generate banner
- `POST /api/campaigns/[id]/view` - Track view

### Admin Routes
- `POST /api/campaigns` - Create campaign
- `GET /api/admin/stats` - Admin statistics

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm setup` - Install dependencies and initialize database
- `node scripts/init-database.js` - Initialize database with indexes and sample data

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**
   \`\`\`bash
   pnpm build
   \`\`\`

2. **Start the production server**
   \`\`\`bash
   pnpm start
   \`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
