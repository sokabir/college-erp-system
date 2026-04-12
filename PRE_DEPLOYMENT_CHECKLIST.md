# Pre-Deployment Checklist

## ✅ 1. Code & Repository
- [x] All changes committed and pushed to GitHub
- [x] No sensitive data in code (passwords in .env only)
- [x] `.gitignore` properly configured
- [x] Repository accessible (public or connected to Railway/Vercel)

**Status**: ✅ READY

---

## ✅ 2. Database
- [x] Database backup created: `college_erp_backup_20260326_225531.sql`
- [x] Migration files ready: `update_admission_documents.sql`
- [ ] Test data cleaned (optional - remove test applications/students)

**Action Items**:
```bash
# Optional: Clean test data before deployment
mysql -u root -padmin college_erp_v2 -e "DELETE FROM admission_applications WHERE email LIKE '%test%';"
mysql -u root -padmin college_erp_v2 -e "DELETE FROM users WHERE email LIKE '%test%';"
```

**Status**: ✅ READY (backup created)

---

## ✅ 3. Environment Variables

### Backend Variables Needed:
```
DB_HOST=<Railway MySQL host>
DB_PORT=<Railway MySQL port>
DB_USER=root
DB_PASSWORD=<Railway MySQL password>
DB_NAME=railway
JWT_SECRET=<CHANGE THIS - generate new secret>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=kabirkamble101@gmail.com
EMAIL_PASS=hksx untq aieo kqwh
FRONTEND_URL=<Vercel URL - add after frontend deployment>
PORT=5000
```

### Frontend Variables Needed:
```
VITE_API_URL=<Railway backend URL>
```

**Action Items**:
- [ ] Generate new JWT_SECRET (use: https://randomkeygen.com/)
- [ ] Prepare Railway MySQL credentials
- [ ] Get backend URL from Railway
- [ ] Get frontend URL from Vercel

**Status**: ⚠️ NEEDS ATTENTION

---

## ✅ 4. Email Configuration

**Current Setup**:
- Email: kabirkamble101@gmail.com
- App Password: hksx untq aieo kqwh

**Action Items**:
- [ ] Verify Gmail App Password still works
- [ ] Test email sending after deployment
- [ ] Consider using a professional email for production

**Status**: ✅ READY (using existing Gmail)

---

## ✅ 5. File Uploads

**Current Issue**: Railway has ephemeral storage - uploaded files will be deleted on restart.

**Options**:
1. **Cloudinary (Recommended - Free)**
   - Sign up: https://cloudinary.com
   - Free tier: 25GB storage, 25GB bandwidth/month
   - Requires code changes (I can help)

2. **Railway Volume (Paid)**
   - $5/month for persistent storage
   - No code changes needed

**Action Items**:
- [ ] Decide: Cloudinary or Railway Volume?
- [ ] If Cloudinary: Sign up and get credentials
- [ ] If Railway Volume: Add volume in Railway settings

**Status**: ⚠️ DECISION NEEDED

---

## ✅ 6. Dependencies & Build

**Check package.json files:**

### Backend Dependencies:
- [x] All dependencies in package.json
- [x] No dev dependencies in production
- [x] Start script defined: `"start": "node server.js"`

### Frontend Dependencies:
- [x] All dependencies in package.json
- [x] Build script defined: `"build": "vite build"`
- [x] Vite configured correctly

**Status**: ✅ READY

---

## ✅ 7. Security

**Action Items**:
- [ ] Change JWT_SECRET to a strong random string
- [ ] Remove any test/demo credentials from database
- [ ] Verify CORS settings in backend (currently allows all origins)
- [ ] Consider rate limiting for API endpoints
- [ ] Enable HTTPS (automatic on Railway/Vercel)

**Recommended Changes**:

1. **Update CORS in backend/server.js**:
```javascript
// Current (allows all):
app.use(cors());

// Production (specific origins):
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

**Status**: ⚠️ NEEDS ATTENTION

---

## ✅ 8. Testing Locally

**Before deploying, test these features**:
- [x] Login (admin, student, faculty)
- [x] Admission application submission
- [x] Admission approval
- [x] Student dashboard
- [x] Fee management
- [x] File uploads
- [x] Email notifications

**Status**: ✅ TESTED

---

## ✅ 9. Accounts & Access

**Required Accounts**:
- [x] GitHub account (sokabir)
- [ ] Railway account (sign up with GitHub)
- [ ] Vercel account (sign up with GitHub)
- [ ] Cloudinary account (optional, for file uploads)

**Status**: ⚠️ CREATE ACCOUNTS

---

## ✅ 10. Documentation

**Prepared**:
- [x] DEPLOYMENT_GUIDE.md
- [x] README.md
- [x] DEMO_CREDENTIALS.txt
- [x] Database backup

**Status**: ✅ READY

---

## 🚀 Ready to Deploy?

### Critical Items (Must Do):
1. ⚠️ Generate new JWT_SECRET
2. ⚠️ Create Railway account
3. ⚠️ Create Vercel account
4. ⚠️ Decide on file upload solution (Cloudinary vs Railway Volume)
5. ⚠️ Update CORS settings for production

### Optional Items (Recommended):
- Clean test data from database
- Use professional email for production
- Add rate limiting
- Review and update demo credentials

---

## Deployment Order

1. **Railway Database** (5 min)
   - Create MySQL service
   - Import backup
   - Run migration

2. **Railway Backend** (10 min)
   - Deploy from GitHub
   - Add environment variables
   - Generate domain

3. **Vercel Frontend** (5 min)
   - Deploy from GitHub
   - Add environment variables
   - Get domain

4. **Update & Test** (10 min)
   - Update FRONTEND_URL in Railway
   - Test all features
   - Fix any issues

**Total Time**: ~30 minutes

---

## Need Help?

If you encounter issues:
1. Check Railway logs (Backend → Deployments → Logs)
2. Check Vercel logs (Deployment → Function Logs)
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

## Next Steps

Run through this checklist and mark items as complete. Once all critical items are done, you're ready to deploy!

**Start with**: Creating Railway and Vercel accounts (both free, sign up with GitHub)
