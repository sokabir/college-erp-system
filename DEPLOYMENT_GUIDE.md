# College ERP System - Deployment Guide

## Overview
This guide will help you deploy your College ERP system to make it accessible online as a web application.

## Current Status
✅ Your application is already a web application!
- Frontend: React (Vite) - Currently running on http://localhost:5173
- Backend: Node.js/Express - Currently running on http://localhost:5000
- Database: MySQL

## Deployment Options

### Option 1: Free Hosting (Recommended for Testing)

#### A. Frontend Deployment - Vercel (Free)
**Best for:** React applications, automatic deployments

1. **Prepare Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   - Sign up at https://vercel.com
   - Install Vercel CLI: `npm install -g vercel`
   - Run: `vercel` in the frontend folder
   - Follow prompts
   - Your frontend will be live at: `https://your-app.vercel.app`

3. **Update API URL:**
   - Create `frontend/.env.production`:
     ```
     VITE_API_URL=https://your-backend-url.com/api
     ```

#### B. Backend Deployment - Render (Free)
**Best for:** Node.js backends, includes database

1. **Prepare Backend:**
   - Create `backend/.env.production` with production values
   - Ensure `backend/package.json` has start script:
     ```json
     "scripts": {
       "start": "node server.js"
     }
     ```

2. **Deploy to Render:**
   - Sign up at https://render.com
   - Create new "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Add environment variables from `.env`

3. **Database on Render:**
   - Create MySQL database on Render
   - Update connection string in environment variables

---

### Option 2: VPS Hosting (Full Control)

#### Providers:
- **DigitalOcean** ($4-6/month)
- **Linode** ($5/month)
- **AWS EC2** (Free tier for 1 year)
- **Google Cloud** (Free tier)

#### Setup Steps:

1. **Get a VPS Server:**
   - Ubuntu 22.04 LTS recommended
   - Minimum: 1GB RAM, 1 CPU

2. **Initial Server Setup:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MySQL
   sudo apt install mysql-server -y
   sudo mysql_secure_installation
   
   # Install Nginx (web server)
   sudo apt install nginx -y
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

3. **Upload Your Code:**
   ```bash
   # On your local machine
   scp -r backend/ user@your-server-ip:/var/www/
   scp -r frontend/ user@your-server-ip:/var/www/
   ```

4. **Setup Database:**
   ```bash
   # On server
   mysql -u root -p
   CREATE DATABASE college_erp;
   # Import your database
   mysql -u root -p college_erp < database_setup.sql
   ```

5. **Configure Backend:**
   ```bash
   cd /var/www/backend
   npm install
   
   # Create .env file with production values
   nano .env
   
   # Start with PM2
   pm2 start server.js --name college-erp-api
   pm2 save
   pm2 startup
   ```

6. **Build and Serve Frontend:**
   ```bash
   cd /var/www/frontend
   npm install
   npm run build
   
   # Move build to nginx directory
   sudo cp -r dist/* /var/www/html/
   ```

7. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/college-erp
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /var/www/html;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # File uploads
       location /uploads {
           alias /var/www/backend/uploads;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/college-erp /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL (HTTPS):**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 3: Shared Hosting (Budget Option)

#### Providers:
- **Hostinger** ($2-4/month)
- **Namecheap** ($3-5/month)
- **Bluehost** ($3-7/month)

**Requirements:**
- Node.js support
- MySQL database
- SSH access

**Steps:**
1. Upload files via FTP/SSH
2. Setup database through cPanel
3. Configure Node.js application
4. Point domain to application

---

## Domain Setup

### Get a Domain Name:
- **Namecheap** (~$10/year)
- **GoDaddy** (~$12/year)
- **Google Domains** (~$12/year)
- **Freenom** (Free .tk, .ml domains)

### Point Domain to Server:
1. Get your server IP address
2. Add DNS A record:
   - Type: A
   - Name: @
   - Value: Your server IP
   - TTL: 3600

---

## Pre-Deployment Checklist

### Security:
- [ ] Change all default passwords
- [ ] Update JWT secret in production
- [ ] Enable CORS only for your domain
- [ ] Setup rate limiting
- [ ] Enable HTTPS/SSL
- [ ] Secure database (strong passwords, limited access)

### Configuration:
- [ ] Update API URLs in frontend
- [ ] Set NODE_ENV=production
- [ ] Configure proper error handling
- [ ] Setup logging
- [ ] Configure file upload limits

### Database:
- [ ] Backup database regularly
- [ ] Remove demo/test data
- [ ] Optimize database queries
- [ ] Setup database backups

### Code:
- [ ] Remove console.logs
- [ ] Minify frontend code
- [ ] Optimize images
- [ ] Enable gzip compression

---

## Environment Variables for Production

### Backend (.env):
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=strong-password
DB_NAME=college_erp
JWT_SECRET=your-very-long-random-secret-key
FRONTEND_URL=https://your-domain.com
```

### Frontend (.env.production):
```env
VITE_API_URL=https://your-domain.com/api
```

---

## Monitoring & Maintenance

### Tools:
- **PM2**: Process monitoring
- **Nginx logs**: `/var/log/nginx/`
- **Application logs**: Setup Winston or Morgan
- **Uptime monitoring**: UptimeRobot (free)

### Regular Tasks:
- Daily database backups
- Weekly security updates
- Monthly performance reviews
- Monitor disk space and memory

---

## Cost Breakdown

### Free Option:
- Frontend: Vercel (Free)
- Backend: Render (Free tier)
- Database: Render MySQL (Free tier)
- Domain: Freenom (Free)
- **Total: $0/month**

### Budget Option:
- VPS: DigitalOcean ($6/month)
- Domain: Namecheap ($10/year = $0.83/month)
- **Total: ~$7/month**

### Professional Option:
- VPS: DigitalOcean ($12/month)
- Domain: .com domain ($12/year = $1/month)
- SSL: Let's Encrypt (Free)
- Backups: DigitalOcean ($1/month)
- **Total: ~$14/month**

---

## Quick Start (Easiest Method)

### Using Vercel + Render (Free):

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/college-erp.git
   git push -u origin main
   ```

2. **Deploy Frontend (Vercel):**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repo
   - Set root directory to `frontend`
   - Deploy!

3. **Deploy Backend (Render):**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repo
   - Set root directory to `backend`
   - Add environment variables
   - Deploy!

4. **Setup Database (Render):**
   - Create MySQL database
   - Import your schema
   - Update backend env variables

5. **Update Frontend API URL:**
   - Add environment variable in Vercel:
     - `VITE_API_URL` = your Render backend URL
   - Redeploy

**Done! Your app is live! 🎉**

---

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Update backend CORS configuration
   - Add your frontend domain to allowed origins

2. **Database Connection Failed:**
   - Check database credentials
   - Ensure database is accessible from backend server
   - Check firewall rules

3. **File Upload Issues:**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure uploads folder exists

4. **API Not Responding:**
   - Check if backend is running: `pm2 status`
   - Check logs: `pm2 logs`
   - Verify port is open

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials
- **Nginx Configuration**: https://nginx.org/en/docs/

---

## Next Steps

1. Choose your deployment option
2. Follow the setup steps
3. Test thoroughly
4. Monitor performance
5. Setup backups
6. Plan for scaling

Good luck with your deployment! 🚀
