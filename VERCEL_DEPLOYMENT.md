# Vercel Deployment Guide

This guide will help you deploy the MindForge frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Backend API**: Your backend API should be deployed separately (Railway, Render, Heroku, etc.)

## Step 1: Prepare Your Repository

Ensure your code is committed and pushed to your Git repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"

2. **Import Your Repository**
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select the `mind-forge` repository
   - Click "Import"

3. **Configure Project Settings**
   
   **Root Directory**: Set to `client`
   
   **Build Settings**:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build` (or leave default)
   - Output Directory: `.next` (or leave default)
   - Install Command: `npm install` (or leave default)

4. **Environment Variables**
   
   Add the following environment variables in Vercel dashboard:
   
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
   ```
   
   **Important**: Replace `https://your-backend-api-url.com` with your actual backend API URL.

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Client Directory**
   ```bash
   cd client
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Set root directory to `client` (if asked)
   - Add environment variables when prompted

5. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   ```
   Enter your backend API URL when prompted.

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.mindforge.com` |

### For Different Environments

You can set different values for:
- **Production**: Your production backend URL
- **Preview**: Your staging/development backend URL
- **Development**: Your local backend URL (for local development)

## Step 4: Update Backend CORS Settings

Make sure your backend API allows requests from your Vercel domain:

In your backend `.env`:
```env
CORS_ORIGIN=https://your-project.vercel.app,https://your-custom-domain.com
```

## Step 5: Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CORS_ORIGIN` in backend to include your custom domain

## Step 6: Verify Deployment

1. Visit your Vercel deployment URL
2. Test the application:
   - Login/Register
   - Browse bootcamps
   - Check dashboard functionality
   - Verify API calls are working

## Troubleshooting

### Build Fails

**Issue**: Build fails with module not found errors
**Solution**: 
- Ensure `rootDirectory` is set to `client` in Vercel settings
- Check that all dependencies are in `client/package.json`

**Issue**: TypeScript errors
**Solution**:
- Run `npm run type-check` locally first
- Fix any TypeScript errors before deploying

### API Calls Fail

**Issue**: API calls return CORS errors
**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check backend CORS settings include your Vercel domain
- Check browser console for actual API URL being used

**Issue**: API calls return 404
**Solution**:
- Verify backend is deployed and accessible
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend routes match frontend expectations

### Environment Variables Not Working

**Issue**: Environment variables not available in app
**Solution**:
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables
- Check Vercel build logs for variable injection

## Continuous Deployment

Vercel automatically deploys:
- **Production**: On push to `main` branch
- **Preview**: On push to other branches or pull requests

## Monitoring

- **Build Logs**: Vercel Dashboard → Deployments → Click deployment → Build Logs
- **Function Logs**: Vercel Dashboard → Functions tab
- **Analytics**: Vercel Dashboard → Analytics tab (if enabled)

## Next Steps

1. **Set up backend deployment** (Railway, Render, Heroku, etc.)
2. **Configure database** (PostgreSQL on Railway, Supabase, etc.)
3. **Set up monitoring** (Sentry, LogRocket, etc.)
4. **Configure CI/CD** (already handled by Vercel)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

