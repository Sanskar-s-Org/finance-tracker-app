# IMPORTANT: For Vercel Deployment

## Environment Variables Required

When deploying to Vercel, you MUST set these environment variables:

### Backend Project
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-tracker
JWT_SECRET=your-super-secret-random-string-here-make-it-long
JWT_EXPIRE=30d
NODE_ENV=production
PORT=3000
```

### Frontend Project  
```
VITE_API_URL=https://your-backend-name.vercel.app/api
```

## Quick Start

1. Push to GitHub
2. Import project to Vercel (vercel.com)
3. Deploy backend first, note the URL
4. Deploy frontend, set VITE_API_URL to backend URL
5. Access your app!

See vercel_deployment.md for full guide.
