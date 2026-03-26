# College ERP Deployment Guide

## Stack
- **Database**: Railway MySQL
- **Backend**: Railway Node.js
- **Frontend**: Vercel

## Step-by-Step Deployment

### 1. Database (Railway)
1. Go to https://railway.app
2. New Project → Provision MySQL
3. Copy connection details from Variables tab
4. Import data:
   ```bash
   mysqldump -u root -padmin college_erp_v2 > backup.sql
   mysql -h RAILWAY_HOST -P RAILWAY_PORT -u root -p railway < backup.sql
   mysql -h RAILWAY_HOST -P RAILWAY_PORT -u root -p railway < update_admission_documents.sql
   ```

### 2. Backend (Railway)
1. New → GitHub Repo → Select this repo
2. Settings → Root Directory: `/backend`
3. Add Environment Variables:
   ```
   DB_HOST=<from Railway MySQL>
   DB_PORT=<from Railway MySQL>
   DB_USER=root
   DB_PASSWORD=<from Railway MySQL>
   DB_NAME=railway
   JWT_SECRET=<generate strong secret>
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=kabirkamble101@gmail.com
   EMAIL_PASS=hksx untq aieo kqwh
   FRONTEND_URL=<will add after Vercel>
   PORT=5000
   ```
4. Settings → Networking → Generate Domain
5. Copy backend URL

### 3. Frontend (Vercel)
1. Go to https://vercel.com
2. New Project → Import from GitHub
3. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   ```
   VITE_API_URL=<your Railway backend URL>
   ```
5. Deploy
6. Copy frontend URL

### 4. Update Backend
1. Go back to Railway backend
2. Update `FRONTEND_URL` with Vercel URL
3. Redeploy

## Testing
1. Visit your Vercel URL
2. Test admission application
3. Test admin login and approval
4. Test student login

## Important Notes

### File Uploads
Railway has ephemeral storage. Uploaded files are deleted on restart.

**Solution**: Use Cloudinary for file storage (free tier available)

### Free Tier Limits
- Railway: 500 hours/month, $5 credit/month
- Vercel: Unlimited deployments, 100GB bandwidth/month

## Troubleshooting

### Backend not connecting to database
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in Railway
- Ensure database is running

### Frontend can't reach backend
- Check VITE_API_URL in Vercel
- Check CORS settings in backend
- Ensure backend is deployed and running

### File uploads not working
- Expected on Railway free tier (ephemeral storage)
- Implement Cloudinary integration

## Support
For issues, check:
1. Railway logs (Backend service → Deployments → Logs)
2. Vercel logs (Deployment → Function Logs)
3. Browser console for frontend errors
