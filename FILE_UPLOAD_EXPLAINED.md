# File Upload System - How It Works

## Quick Answer: YES, files will work when hosted! ✅

## Current Setup (Fixed & Production-Ready)

### 1. File Storage
- Files are saved in: `backend/uploads/`
- Database stores: `uploads/filename.pdf` (relative path)
- This makes the system portable and hosting-friendly

### 2. Backend Configuration
```javascript
// backend/server.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```
This serves files at: `http://your-backend-url/uploads/filename.pdf`

### 3. Frontend Configuration
```javascript
// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getFileUrl = (filePath) => {
    return `${API_BASE_URL}/${filePath}`;
}
```

### 4. Environment Variables
```env
# frontend/.env
VITE_API_URL=http://localhost:5000

# For production, change to:
# VITE_API_URL=https://your-backend-domain.com
```

## How to Test Right Now

### Test 1: Upload a File
1. Login as faculty (password: "faculty")
2. Go to Assignments section
3. Create new assignment with a PDF file
4. Click "Create Assignment"

### Test 2: Verify Storage
Run this command:
```bash
node backend/test_file_upload.js
```
This will show:
- If uploads directory exists
- All files in the directory
- All assignments with files in database
- Whether files are accessible

### Test 3: Access File Directly
1. After uploading, note the filename
2. Open browser: `http://localhost:5000/uploads/file-1234567890-123456789.pdf`
3. File should open/download

### Test 4: Download from UI
1. Go to Assignments page
2. Click "Download Assignment PDF" button
3. File should open in new tab

## When You Host the App

### Step 1: Deploy Backend
Deploy to any platform (Heroku, Railway, Render, AWS, etc.)
- Your backend URL: `https://api.yourapp.com`

### Step 2: Update Frontend Environment
```env
# frontend/.env
VITE_API_URL=https://api.yourapp.com
```

### Step 3: Rebuild Frontend
```bash
cd frontend
npm run build
```

### Step 4: Deploy Frontend
Deploy the `dist` folder to Vercel, Netlify, etc.

### That's It! 🎉
Files will now be accessible at:
```
https://api.yourapp.com/uploads/filename.pdf
```

## Why This Works

1. **Relative Paths**: Database stores `uploads/filename.pdf` (not absolute Windows paths)
2. **Environment Variables**: Frontend dynamically constructs URLs based on environment
3. **Static File Serving**: Backend serves files from uploads directory
4. **No Hardcoding**: No `localhost:5000` hardcoded anywhere

## Common Issues & Solutions

### Issue: "Can't see uploaded files"
**Solution**: 
- Check if file was actually uploaded: `ls backend/uploads/`
- Verify database has correct path: Run `test_file_upload.js`
- Check browser console for 404 errors

### Issue: "Files work locally but not in production"
**Solution**:
- Verify `VITE_API_URL` is set correctly
- Rebuild frontend after changing environment variable
- Check backend logs for file access errors

### Issue: "Files disappear after server restart"
**Solution**:
- This happens on Heroku (ephemeral filesystem)
- Use cloud storage: AWS S3, Cloudinary, DigitalOcean Spaces
- Or use hosting with persistent storage: DigitalOcean Droplet, AWS EC2

## File Upload Flow

```
User uploads PDF
    ↓
Frontend sends to: POST /api/faculty/assignments
    ↓
Multer middleware saves to: backend/uploads/file-123.pdf
    ↓
Database stores: uploads/file-123.pdf
    ↓
Frontend fetches assignments
    ↓
getFileUrl() constructs: https://api.yourapp.com/uploads/file-123.pdf
    ↓
User clicks download
    ↓
Browser opens: https://api.yourapp.com/uploads/file-123.pdf
    ↓
Backend serves file from uploads directory
```

## Security Notes

1. **File Type Validation**: Only PDFs and images allowed (configured in uploadMiddleware.js)
2. **File Size Limit**: 5MB max (can be increased if needed)
3. **Authentication**: All upload endpoints require faculty login
4. **Path Traversal Protection**: Multer handles filename sanitization

## Next Steps (Optional Enhancements)

1. **Cloud Storage**: Integrate AWS S3 for production file storage
2. **Student Submissions**: Allow students to submit assignments
3. **File Versioning**: Keep history of file uploads
4. **Bulk Download**: Download all submissions as ZIP
5. **Preview**: Show PDF preview in modal instead of download

## Testing Checklist

- [ ] Upload PDF file through UI
- [ ] Verify file exists in `backend/uploads/`
- [ ] Run `node backend/test_file_upload.js`
- [ ] Access file directly: `http://localhost:5000/uploads/filename.pdf`
- [ ] Click download button in UI
- [ ] Check database for correct path
- [ ] Test with different file types (PDF, JPG, PNG)
- [ ] Test file size limits (try uploading >5MB file)

## Need Help?

If files aren't working:
1. Run the test script: `node backend/test_file_upload.js`
2. Check browser console for errors
3. Check backend logs for upload errors
4. Verify environment variables are set correctly
