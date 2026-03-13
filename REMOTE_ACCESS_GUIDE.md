# Remote Access Setup Guide

## Current Setup
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Both are only accessible on your computer

## Option 1: Local Network Access (Same WiFi) ⭐ EASIEST

### Step 1: Find Your Local IP Address
Open Command Prompt and run:
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

### Step 2: Update Backend to Listen on All Interfaces
Edit `backend/server.js`, change the last line to:
```javascript
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
```

### Step 3: Update Frontend API URL
Edit `frontend/src/services/api.js`, replace `localhost` with your IP:
```javascript
baseURL: 'http://192.168.1.100:5000/api', // Use YOUR IP address
```

### Step 4: Update .env FRONTEND_URL
Edit `backend/.env`, add your IP:
```
FRONTEND_URL=http://192.168.1.100:5173
```

### Step 5: Allow Firewall Access
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Enter ports: 5000, 5173 → Next
6. Allow the connection → Next
7. Apply to all profiles → Next
8. Name it "College ERP" → Finish

### Step 6: Restart Servers
Stop both servers (Ctrl+C) and restart:
```bash
# Backend
cd backend
node server.js

# Frontend (new terminal)
cd frontend
npm run dev -- --host
```

### Step 7: Share Access
Your friend can now access:
- Frontend: `http://192.168.1.100:5173` (use YOUR IP)
- They must be on the SAME WiFi network

---

## Option 2: Internet Access (Anywhere) 🌐

For access from anywhere (not just same WiFi), you need to deploy online:

### A. Free Hosting Options:

1. **Render.com** (Recommended)
   - Free tier available
   - Deploy both frontend and backend
   - Automatic HTTPS
   - Guide: https://render.com/docs

2. **Railway.app**
   - Free $5 credit monthly
   - Easy deployment
   - Guide: https://railway.app/

3. **Vercel (Frontend) + Railway (Backend)**
   - Vercel for React frontend (free)
   - Railway for Node.js backend (free tier)

### B. Ngrok (Quick Testing - Not for Production)
Temporary public URL for testing:

```bash
# Install ngrok: https://ngrok.com/download

# Expose backend
ngrok http 5000

# You'll get a URL like: https://abc123.ngrok.io
# Update frontend api.js to use this URL
```

---

## Option 3: VPN Solution

Use a VPN like Tailscale or ZeroTier to create a virtual network:
- Install on both computers
- Access via VPN IP addresses
- More secure than exposing ports

---

## Recommended Approach

**For Testing with Friends (Same Location):**
→ Use Option 1 (Local Network)

**For Production/Real Use:**
→ Use Option 2 (Deploy to Render/Railway)

**For Quick Demo:**
→ Use Ngrok (Option 2B)

---

## Important Notes

1. **Database Access**: Your MySQL database also needs to be accessible
   - For local network: MySQL must allow remote connections
   - For production: Use hosted database (like PlanetScale, Railway, or AWS RDS)

2. **Security**: 
   - Never expose your database directly to the internet
   - Use environment variables for sensitive data
   - Enable HTTPS in production

3. **Email**: 
   - Gmail SMTP works from anywhere
   - No changes needed for email functionality

---

## Need Help?

If you want to deploy this to production (accessible from anywhere), I can help you:
1. Set up a free hosting account
2. Configure the database
3. Deploy both frontend and backend
4. Set up a custom domain (optional)

Let me know which option you'd like to pursue!
