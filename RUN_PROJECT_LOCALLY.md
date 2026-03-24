# How to Run College ERP System Locally

## Prerequisites
- Node.js installed
- PostgreSQL database (use the one on Render or set up locally)

## Step 1: Start the Backend

Open a terminal and run:
```bash
cd backend
npm start
```

The backend will start on **http://localhost:5000**

## Step 2: Start the Frontend

Open a NEW terminal (keep the backend running) and run:
```bash
cd frontend
npm run dev
```

The frontend will start on **http://localhost:5173**

## Step 3: Access the Application

Open your browser and go to: **http://localhost:5173**

## Demo Credentials

**Admin:**
- Email: admin@college.edu
- Password: admin123

**Faculty:**
- Email: rajesh.verma@faculty.edu
- Password: faculty

**Student:**
- Email: kabilkamble101@gmail.com
- Password: student

## For Presentation

1. Start both backend and frontend 5 minutes before presenting
2. Open the application in your browser
3. Login with admin credentials to show all features
4. Keep both terminal windows visible to show it's running

## Troubleshooting

If login fails, make sure:
1. Backend is running (check terminal for "Server running on port 5000")
2. Frontend is running (check terminal for "Local: http://localhost:5173")
3. Database connection is working (check backend .env file)

## Note
Running locally is perfectly acceptable for college project presentations and often preferred because it's more reliable than free-tier cloud hosting.
