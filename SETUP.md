# SmartHire Setup Guide

## Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

## Quick Start

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/smarthire
JWT_SECRET=your_secret_min_32_chars_change_this
CORS_ORIGIN=http://localhost:3000
PORT=5001
NODE_ENV=development
```

### 3. Start development servers
```bash
# From project root
npm run dev
```
Or on Windows: double-click `start-dev.bat`

The server will automatically create default admin and recruiter users on first startup.

### 4. Optional: Add sample drives and candidates
```bash
cd backend
npm run init
```

### 5. Access app
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/health

## Default Login Credentials
```
Admin:     admin@smarthire.com    / password123
Recruiter: recruiter@smarthire.com / password123
```

These users are automatically created when the server starts for the first time.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/drives | List drives |
| POST | /api/drives | Create drive |
| GET | /api/drives/:id | Get drive |
| PUT | /api/drives/:id | Update drive |
| DELETE | /api/drives/:id | Delete drive |
| GET | /api/drives/:id/stats | Drive statistics |
| GET | /api/candidates | List candidates |
| POST | /api/candidates | Add candidate |
| GET | /api/candidates/:id | Get candidate |
| PUT | /api/candidates/:id | Update candidate |
| DELETE | /api/candidates/:id | Remove candidate |
| PUT | /api/candidates/:id/scores | Update scores |
| GET | /api/candidates/drive/:id/rankings | Drive rankings |

## Troubleshooting

**MongoDB connection fails:**
- Check `MONGODB_URI` in .env
- Ensure your IP is whitelisted in Atlas Network Access

**CORS errors:**
- Ensure `CORS_ORIGIN=http://localhost:3000` in .env

**Port conflicts:**
- Change `PORT` in backend/.env
- Change port in `frontend/vite.config.js`
