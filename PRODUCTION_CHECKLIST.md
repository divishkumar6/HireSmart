# Production Deployment Checklist

## Pre-Deployment

### Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 for cloud deployment)
- [ ] Connection string obtained

### Code Preparation
- [ ] All environment variables documented
- [ ] Production configurations updated
- [ ] Build process tested locally
- [ ] Health check endpoint working

## Render Backend Deployment

### Service Configuration
- [ ] GitHub repository connected
- [ ] Service name: `smarthire-api`
- [ ] Region: Oregon (US West)
- [ ] Runtime: Node
- [ ] Build command: `npm ci`
- [ ] Start command: `npm start`
- [ ] Root directory: `backend`

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `MONGODB_URI` (from Atlas)
- [ ] `JWT_SECRET` (32+ characters)
- [ ] `JWT_EXPIRE=7d`
- [ ] `CORS_ORIGIN` (will update after Vercel deployment)

### Verification
- [ ] Service deployed successfully
- [ ] Health check responds: `/health`
- [ ] Backend URL noted for frontend config

## Vercel Frontend Deployment

### Project Configuration
- [ ] GitHub repository imported
- [ ] Framework: Vite detected
- [ ] Build command: `cd frontend && npm ci && npm run build`
- [ ] Output directory: `frontend/dist`
- [ ] Install command: `npm ci && cd frontend && npm ci`

### Environment Variables
- [ ] `VITE_API_URL` (Render backend URL + /api)

### Verification
- [ ] Frontend deployed successfully
- [ ] Application loads correctly
- [ ] API calls working (check network tab)

## Post-Deployment

### CORS Update
- [ ] Update Render `CORS_ORIGIN` with actual Vercel URL
- [ ] Redeploy backend service
- [ ] Test cross-origin requests

### Functionality Testing
- [ ] Login with default admin credentials
- [ ] Login with default recruiter credentials
- [ ] Create a new drive
- [ ] Add candidates to drive
- [ ] Check ATS functionality
- [ ] Generate offer letters
- [ ] Test all major features

### Performance & Monitoring
- [ ] Check initial load times
- [ ] Monitor Render service logs
- [ ] Test mobile responsiveness
- [ ] Verify SSL certificates

## URLs to Document
- [ ] Frontend URL: `https://______.vercel.app`
- [ ] Backend URL: `https://______.onrender.com`
- [ ] Health Check: `https://______.onrender.com/health`

## Default Credentials
- [ ] Admin: admin@smarthire.com / password123
- [ ] Recruiter: recruiter@smarthire.com / password123

## Troubleshooting Checklist

### If Frontend Won't Load
- [ ] Check Vercel build logs
- [ ] Verify `VITE_API_URL` environment variable
- [ ] Test API endpoint directly

### If API Calls Fail
- [ ] Check CORS configuration
- [ ] Verify backend service is running
- [ ] Check Render service logs
- [ ] Test health endpoint

### If Database Connection Fails
- [ ] Verify MongoDB Atlas connection string
- [ ] Check network access settings
- [ ] Verify database user permissions
- [ ] Test connection from Render logs

## Success Criteria
- [ ] Application loads without errors
- [ ] Users can login successfully
- [ ] All CRUD operations work
- [ ] File uploads function correctly
- [ ] ATS scoring works
- [ ] Offer letter generation works
- [ ] No console errors in browser
- [ ] Mobile responsive design works