# ParkerJoe Vercel Deployment Guide

## Prerequisites

1. [Vercel Account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/download) (optional)
3. Environment variables configured

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import Project**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the repository

3. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `cd app && npm run build`
   - Output Directory: `app/dist`
   - Root Directory: `./`

4. **Add Environment Variables**
   Copy these from your `.env` file:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_SHOPIFY_STORE_DOMAIN
   VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN
   VITE_KLAVIYO_PUBLIC_API_KEY
   VITE_GA4_MEASUREMENT_ID
   VITE_ANTHROPIC_API_KEY
   VITE_APP_NAME
   VITE_APP_URL
   ```

5. **Deploy**
   Click "Deploy" and wait for the build to complete!

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 3: Deploy from Root Directory

If you want to deploy just the `app` folder:

1. **Update vercel.json in app folder**
   (Already configured in `app/vercel.json`)

2. **Deploy from app directory**
   ```bash
   cd app
   vercel --prod
   ```

## Post-Deployment

1. **Verify Build**
   - Check the deployment logs
   - Ensure no build errors

2. **Test Features**
   - AI Chat Widget
   - COPPA compliance
   - Responsive design

3. **Configure Domain** (Optional)
   - Go to Project Settings > Domains
   - Add your custom domain

4. **Enable Analytics**
   - Go to Project Settings > Analytics
   - Enable Vercel Analytics

## Troubleshooting

### Build Errors

**Error: `module is not defined`**
- Fixed: Config files renamed to `.cjs` (CommonJS)

**Error: PostCSS config issues**
- Fixed: Use `module.exports` in `.cjs` files

### Environment Variables

Make sure all `VITE_` prefixed variables are set in Vercel dashboard.

### Database Connection

Ensure Supabase project is active and migrations have been run.

## Security Checklist

- [ ] All secrets in environment variables (not code)
- [ ] `.env` files in `.gitignore`
- [ ] CSP headers configured in `vercel.json`
- [ ] Security headers enabled
- [ ] No console.logs with sensitive data

## Performance Optimization

- [ ] Images optimized (WebP format)
- [ ] Lazy loading enabled
- [ ] GSAP animations optimized
- [ ] Code splitting enabled (Vite default)
