const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const path = require('path');

// CORS configuration for production
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://college-erp-system-blue.vercel.app',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));

app.get('/', (req, res) => {
    res.send('College ERP API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Database Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`Database Port: ${process.env.DB_PORT || 3306}`);
    console.log(`Database Name: ${process.env.DB_NAME || 'college_erp_v2'}`);
    console.log(`Database User: ${process.env.DB_USER || 'root'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});
