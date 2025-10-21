# Vercel Deployment Guide for Licrorice Backend

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```

## Database Setup

### Option 1: Use a Managed PostgreSQL (Recommended)

1. **Neon** (Free tier available):
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Supabase** (Free tier available):
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Get the connection string from Settings > Database

3. **Railway** (Free tier available):
   - Sign up at [railway.app](https://railway.app)
   - Create a PostgreSQL database
   - Copy the connection string

### Option 2: Use Your Own PostgreSQL Instance

Ensure your database is accessible from the internet.

## Environment Variables

Before deploying, you need to set up these environment variables in Vercel:

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="production"
CLIENT_URL="https://your-frontend-url.vercel.app"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Shippo
SHIPPO_API_TOKEN="your_shippo_api_token"

# Email (Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-specific-password"
EMAIL_FROM="noreply@licorice4good.com"

# Google OAuth (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary (if using image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your repository
   - Select the `backend` folder as root directory

3. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: `backend` (or leave as is if deploying from backend folder)
   - Build Command: `npm run vercel-build`
   - Output Directory: Leave empty (serverless)
   - Install Command: `npm install`

4. **Add Environment Variables**:
   - Go to Project Settings > Environment Variables
   - Add all the required environment variables listed above
   - Make sure to add them for **Production**, **Preview**, and **Development**

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)

### Method 2: Deploy via Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Navigate to backend directory**:
   ```bash
   cd /Users/mac/Desktop/Ahmed\ Work/Licrorice/backend
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Set up environment variables**:
   ```bash
   vercel env add DATABASE_URL production
   vercel env add JWT_SECRET production
   vercel env add STRIPE_SECRET_KEY production
   # ... add all other variables
   ```

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

## Post-Deployment Steps

### 1. Run Database Migrations

After first deployment, you need to run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Or directly on Vercel (if using serverless)
# Migrations should run automatically via vercel-build script
```

### 2. Verify Deployment

Test your API endpoints:
```bash
# Replace with your Vercel URL
curl https://your-backend-name.vercel.app/api/health
```

### 3. Update Frontend Environment Variables

Update your frontend `.env` file with the new backend URL:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-name.vercel.app
```

### 4. Configure Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-backend-name.vercel.app/api/payments/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the webhook signing secret
5. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### 5. Configure CORS Origins

Update the allowed origins in your `src/server.ts`:
```typescript
const allowedOrigins = [
  "https://your-frontend.vercel.app",
  "https://www.your-domain.com",
  "http://localhost:3000", // for local development
];
```

Then redeploy:
```bash
vercel --prod
```

## Troubleshooting

### Build Fails

1. **Prisma Issues**:
   - Make sure `DATABASE_URL` is set correctly
   - Check if migrations are up to date
   - Try: `npx prisma generate` locally first

2. **TypeScript Errors**:
   - Run `npm run build` locally to check for errors
   - Fix any type errors before deploying

3. **Dependency Issues**:
   - Make sure all dependencies are in `dependencies` not `devDependencies`
   - Run `npm install` to ensure lock file is updated

### Runtime Errors

1. **Database Connection Failed**:
   - Verify `DATABASE_URL` environment variable
   - Check if database allows connections from 0.0.0.0/0
   - For Neon/Supabase, make sure connection pooling is enabled

2. **CORS Errors**:
   - Add your frontend URL to `allowedOrigins` in `server.ts`
   - Redeploy after updating

3. **Function Timeout**:
   - Increase `maxDuration` in `vercel.json` (max 60s for Pro plans)
   - Optimize slow queries

### Environment Variables Not Working

1. Make sure variables are set for the correct environment (Production/Preview)
2. Redeploy after adding new variables
3. Check for typos in variable names

## Monitoring

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Production logs
vercel logs --prod
```

### View in Dashboard

Go to your project in Vercel Dashboard > Deployments > Click on a deployment > View Function Logs

## Performance Optimization

1. **Database Connection Pooling**:
   - Use Prisma Accelerate or PgBouncer
   - Add `?pgbouncer=true` to your connection string

2. **Cold Starts**:
   - Keep functions warm with cron jobs
   - Use Vercel Pro for faster cold starts

3. **Caching**:
   - Implement Redis for session storage
   - Cache frequently accessed data

## Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update CORS origins and environment variables

## Useful Commands

```bash
# View project info
vercel ls

# View environment variables
vercel env ls

# Remove a deployment
vercel remove [deployment-url]

# View project settings
vercel project ls

# Pull environment variables
vercel env pull .env.production
```

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Prisma Docs: [prisma.io/docs](https://prisma.io/docs)
- Community: [vercel.com/community](https://vercel.com/community)

---

**Note**: Make sure to never commit `.env` files to git. Use `.gitignore` to exclude them.

