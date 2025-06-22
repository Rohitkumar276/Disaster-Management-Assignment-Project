# Local Development Setup

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for database)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional Services
GEMINI_API_KEY=your_gemini_api_key
GEOCODING_API_KEY=your_geocoding_api_key
```

### 3. Database Setup
```bash
# Run Supabase migrations
npx supabase db push
```

### 4. Start Development Server

**Option 1: Using npm scripts**
```bash
npm run dev
```

**Option 2: Using provided scripts**
- Windows: `start-local.bat`
- PowerShell: `start-local.ps1`

### 5. Access the Application
- Frontend: http://localhost:3000

## Development Commands

```bash
# Start Next.js server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Troubleshooting

### Database Connection Issues
- Verify Supabase credentials are correct
- Ensure database migrations have been run
- Check network connectivity to Supabase

### Port Conflicts
- If port 3000 is in use, Next.js will automatically use the next available port

## Features

- ✅ Geocoding integration
- ✅ AI-powered image verification
- ✅ Social media integration
- ✅ Resource management
- ✅ Admin dashboard
- ✅ Mobile-responsive design 