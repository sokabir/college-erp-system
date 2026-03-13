# Quick Start Guide - Testing File Uploads

## 🚀 Test File Uploads Right Now

### 1. Start the Project
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Login as Faculty
- URL: `http://localhost:5173`
- Email: Any faculty email from database
- Password: `faculty`

### 3. Upload a Test File
1. Click "Assignments" in sidebar
2. Click "Create Assignment" button
3. Fill in the form:
   - Select a subject
   - Enter title: "Test Assignment"
   - Upload a PDF file
   - Set due date
4. Click "Create Assignment"

### 4. Verify Upload
```bash
# Check if file was saved
ls backend/uploads/

# Run test script
node backend/test_file_upload.js
```

### 5. Test Download
1. Go back to Assignments page
2. Find your assignment
3. Click "Download Assignment PDF"
4. File should open in new tab

## ✅ What to Check

- [ ] File appears in `backend/uploads/` directory
- [ ] Database has path: `uploads/filename.pdf` (not full Windows path)
- [ ] Download button works
- [ ] Direct URL works: `http://localhost:5000/uploads/filename.pdf`

## 🌐 For Production Deployment

### Backend
1. Deploy to hosting platform
2. Note your backend URL: `https://api.yourapp.com`

### Frontend
1. Update `frontend/.env`:
   ```env
   VITE_API_URL=https://api.yourapp.com
   ```
2. Rebuild:
   ```bash
   npm run build
   ```
3. Deploy `dist` folder

### Test Production
Files will be at: `https://api.yourapp.com/uploads/filename.pdf`

## 📚 More Information

- **Detailed explanation**: See `FILE_UPLOAD_EXPLAINED.md`
- **Deployment guide**: See `DEPLOYMENT_GUIDE.md`
- **Test script**: Run `node backend/test_file_upload.js`

## 🐛 Troubleshooting

**Can't see files?**
```bash
# Check uploads directory
ls -la backend/uploads/

# Check database
node backend/test_file_upload.js

# Check browser console for errors
```

**Files not downloading?**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`
- Clear browser cache and reload

**Wrong file path in database?**
- Should be: `uploads/filename.pdf`
- Not: `C:\Users\...\backend\uploads\filename.pdf`
- If wrong, the recent fix should prevent this

## 💡 Key Points

1. ✅ Files stored with relative paths (`uploads/filename.pdf`)
2. ✅ Backend serves files at `/uploads` endpoint
3. ✅ Frontend uses environment variable for API URL
4. ✅ Works in both development and production
5. ✅ No hardcoded URLs anywhere

## 🎯 Summary

**YES, your uploaded files will work when hosted!** The system is now configured to use environment variables, so files will be accessible at whatever domain you deploy to. Just update the `VITE_API_URL` environment variable before building for production.
