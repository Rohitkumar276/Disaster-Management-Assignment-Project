# Railway Deployment Guide

## Step-by-Step Instructions

### 1. Sign Up for Railway
- Go to [railway.app](https://railway.app)
- Click "Sign Up" and choose "Continue with GitHub"
- Authorize Railway to access your GitHub account

### 2. Create New Project
- Click "New Project" in Railway dashboard
- Select "Deploy from GitHub repo"
- Find and select your disaster management repository
- Click "Deploy Now"

### 3. Configure Environment Variables
Railway will need these environment variables (add them in Railway dashboard):

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Optional:**
```
GEMINI_API_KEY=your_gemini_api_key
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET_KEY=your_twitter_api_secret
LOG_LEVEL=info
```

### 4. Deploy
- Railway will automatically detect it's a Next.js project
- Build command: `npm run build` (auto-detected)
- Start command: `npm start` (auto-detected)
- Railway will deploy your app and provide a URL

### 5. Access Your App
- Once deployed, Railway will show your app URL
- Click on the URL to access your disaster management platform
- The URL will be something like: `https://your-app-name.railway.app`

## Troubleshooting

If deployment fails:
1. Check the build logs in Railway dashboard
2. Ensure all environment variables are set
3. Verify your Supabase credentials are correct
4. Make sure your GitHub repository is public or Railway has access

## Railway Free Tier Limits
- 500 hours/month of runtime
- 1GB RAM per service
- Shared CPU resources
- Automatic deployments from GitHub 