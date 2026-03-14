# Quick Deploy Commands

## 1. Deploy Backend to Render
```bash
# Render will automatically deploy from GitHub
# Just push your changes:
git add .
git commit -m "Deploy to production"
git push origin main
```

## 2. Deploy Frontend to Vercel
```bash
# Vercel will automatically deploy from GitHub
# Or manually deploy:
cd frontend
npm run build
npx vercel --prod
```

## 3. Environment Variables Setup

### Render Environment Variables:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smarthire
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
CORS_ORIGIN=https://your-vercel-url.vercel.app
```

### Vercel Environment Variables:
```
VITE_API_URL=https://your-render-url.onrender.com/api
```

## 4. URLs After Deployment
- **Backend**: https://smarthire-api-xxxx.onrender.com
- **Frontend**: https://your-project.vercel.app
- **Health Check**: https://smarthire-api-xxxx.onrender.com/health

## 5. Default Login
- **Admin**: admin@smarthire.com / password123
- **Recruiter**: recruiter@smarthire.com / password123