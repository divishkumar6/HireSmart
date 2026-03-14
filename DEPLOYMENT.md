# SmartHire Deployment Guide

## Architecture
- **Frontend**: Deployed on Vercel (React/Vite)
- **Backend**: Deployed on Render (Node.js/Express)
- **Database**: MongoDB Atlas (Cloud)

## Prerequisites
1. GitHub repository with your code
2. MongoDB Atlas account with database setup
3. Vercel account
4. Render account

## Step 1: Deploy Backend to Render

### 1.1 Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `smarthire-api`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`

### 1.2 Set Environment Variables in Render
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smarthire
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### 1.3 Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note your backend URL: `https://smarthire-api-xxxx.onrender.com`

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (IMPORTANT: Set this to frontend)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (or leave default)
   - **Install Command**: `npm install` (or leave default)

### 2.2 Set Environment Variables in Vercel
```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

### 2.3 Deploy
- Click "Deploy"
- Wait for deployment to complete
- Note your frontend URL: `https://your-project.vercel.app`

## Step 3: Update CORS Configuration

After both deployments are complete:

1. Go back to Render dashboard
2. Update the `CORS_ORIGIN` environment variable with your actual Vercel URL
3. Redeploy the backend service

## Step 4: Verify Deployment

### Backend Health Check
Visit: `https://your-render-backend-url.onrender.com/health`
Should return: `{"success": true, "timestamp": "..."}`

### Frontend Access
Visit: `https://your-project.vercel.app`
Should load the SmartHire application

### Test Login
Use default credentials:
- **Admin**: admin@smarthire.com / password123
- **Recruiter**: recruiter@smarthire.com / password123

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `CORS_ORIGIN` in Render matches your Vercel URL exactly
- Include `https://` protocol in the URL

**2. API Connection Failed**
- Verify `VITE_API_URL` in Vercel points to correct Render URL
- Check if Render service is running (not sleeping)

**3. Database Connection Issues**
- Verify MongoDB Atlas connection string
- Ensure IP whitelist includes `0.0.0.0/0` for Render
- Check database user permissions

**4. Build Failures**
- Check build logs in respective platforms
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Render Free Tier Limitations
- Service sleeps after 15 minutes of inactivity
- 750 hours/month limit
- Cold start delay when waking up

### Vercel Free Tier Limitations
- 100GB bandwidth/month
- 6000 minutes build time/month
- Custom domains available

## Environment Variables Reference

### Render (Backend)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smarthire
JWT_SECRET=your-jwt-secret-min-32-characters
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-vercel-url.vercel.app
```

### Vercel (Frontend)
```
VITE_API_URL=https://your-render-url.onrender.com/api
```

## Post-Deployment

1. **Test all functionality**: Login, create drives, add candidates
2. **Monitor performance**: Check Render logs for errors
3. **Set up monitoring**: Consider uptime monitoring for Render service
4. **Custom domains**: Configure custom domains if needed

## Updates and Redeployment

- **Frontend**: Push to GitHub main branch → Auto-deploys on Vercel
- **Backend**: Push to GitHub main branch → Auto-deploys on Render
- **Environment changes**: Update in respective dashboards and redeploy