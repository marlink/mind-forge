# Quick Vercel Deployment with Project ID

Your Vercel project is already configured with ID: `prj_SwjnB9DHhpuCK1wJc8AVbGB93Hf3`

## Quick Deploy

```bash
cd client
vercel --prod
```

## Set Environment Variables

Make sure to set `NEXT_PUBLIC_API_URL` in Vercel Dashboard:
- Go to your project settings
- Navigate to Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-api-url.com`

## Link to Existing Project (if needed)

If you need to link locally:
```bash
cd client
vercel link
# Enter project ID: prj_SwjnB9DHhpuCK1wJc8AVbGB93Hf3
```

## Deploy

```bash
cd client
vercel --prod
```

Your project is configured and ready to deploy!

