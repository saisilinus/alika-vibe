# Alika Platform

A modern banner generation platform built with Next.js, MongoDB, and NextAuth.

## Features

- 🎨 **Banner Generation** - Create personalized banners from templates
- 🔐 **Authentication** - Google OAuth and Email authentication
- 📊 **Admin Dashboard** - Role-based admin panel with analytics
- 🗄️ **MongoDB Integration** - Native MongoDB driver for optimal performance
- 🎯 **Campaign Management** - Create and manage banner campaigns
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js
- **Image Processing**: Sharp
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
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
   
   Fill in your environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `NEXTAUTH_SECRET` - Random secret for NextAuth
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
   - Email provider settings (optional)

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
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `NEXTAUTH_URL` | Your app's URL | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `EMAIL_SERVER_HOST` | SMTP server host | No |
| `EMAIL_SERVER_PORT` | SMTP server port | No |
| `EMAIL_SERVER_USER` | SMTP username | No |
| `EMAIL_SERVER_PASSWORD` | SMTP password | No |
| `EMAIL_FROM` | From email address | No |

## Database Schema

### Collections

- **users** - User accounts and profiles
- **campaigns** - Banner templates and campaigns
- **generated_banners** - User-generated banners
- **comments** - Campaign comments and feedback
- **accounts** - NextAuth account linking
- **sessions** - NextAuth sessions

## API Routes

### Public Routes
- `GET /api/campaigns` - List campaigns with pagination
- `GET /api/campaigns/trending` - Get trending campaigns
- `GET /api/campaigns/latest` - Get latest campaigns
- `GET /api/campaigns/[id]` - Get campaign details
- `POST /api/campaigns/[id]/view` - Increment view count
- `POST /api/campaigns/[id]/generate` - Generate banner

### Admin Routes
- `GET /api/admin/stats` - Get platform statistics
- `POST /api/campaigns` - Create new campaign (admin/moderator only)

### Authentication Routes
- `/api/auth/*` - NextAuth endpoints

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy**

The app will automatically deploy on every push to main branch.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## Development

### Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   └── campaign/          # Campaign pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility functions
│   ├── database.ts       # MongoDB utilities
│   ├── auth.ts           # NextAuth configuration
│   └── types.ts          # TypeScript types
├── scripts/              # Database scripts
└── public/               # Static assets
\`\`\`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
