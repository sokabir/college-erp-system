# College ERP System

A comprehensive Enterprise Resource Planning system for educational institutions built with React, Node.js, Express, and MySQL.

## 🎯 Project Overview

This College ERP System is a full-stack web application designed to streamline college administration, faculty management, and student services. It provides role-based access for three user types: Admin, Faculty, and Students.

## ✨ Key Features

### Admin Module
- **Dashboard**: Real-time statistics and overview
- **Admission Management**: Review, approve, reject, or request reapplication
- **Student Management**: View and manage enrolled students
- **Faculty Management**: Add, view, and manage faculty members
- **Course Management**: Create courses, add subjects, manage curriculum
- **Finance Management**: 
  - Component-based fee structure (Tuition, Library, Lab, Exam)
  - Student fee tracking with payment status
  - Payment history with detailed transaction records
- **Examination Management**: Create exam schedules and timetables
- **Notice System**: Send targeted notices to students, faculty, or specific courses/semesters
- **Events Management**: Create and manage college events

### Faculty Module
- **Dashboard**: Overview of assigned classes and schedules
- **Attendance Management**: Mark and view attendance history
- **Study Materials**: Upload and manage course materials
- **Assignments**: Create assignments and review submissions
- **Marks Entry**: Enter and manage student marks
- **Results**: Publish exam results
- **Leave Management**: Apply for and track leave requests

### Student Module
- **Dashboard**: Personalized overview with attendance, notices, and upcoming exams
- **Profile**: View personal and academic information
- **Study Materials**: Access course materials by semester
- **Assignments**: View assignments, submit work, and check grades
- **Exam Timetable**: View upcoming exam schedules
- **Results**: Check published exam results
- **Fee Payment**: 
  - Component-wise fee breakdown
  - Multiple payment methods (Card, UPI, Net Banking, Wallet)
  - Payment history with downloadable receipts
  - Real-time payment status tracking

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **CSS3** - Styling with custom properties

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email notifications

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd college-erp
```

### 2. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
CREATE DATABASE college_erp;
USE college_erp;
SOURCE database_setup.sql;
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=college_erp
# JWT_SECRET=your_secret_key
# PORT=5000

# Start backend server
npm start
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 👥 Demo Credentials

### Admin
- Email: `admin@college.edu`
- Password: `admin123`

### Faculty
- Email: `rajesh.verma@faculty.edu`
- Password: `faculty`

### Student
- Email: `kabilkamble101@gmail.com`
- Password: `student`

## 📁 Project Structure

```
college-erp/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication & validation
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── uploads/         # File storage
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Auth)
│   │   ├── layouts/     # Layout components
│   │   ├── pages/       # Page components
│   │   │   ├── Admin/
│   │   │   ├── Faculty/
│   │   │   └── Student/
│   │   ├── services/    # API service layer
│   │   └── App.jsx      # Main app component
│   └── index.html
└── database_setup.sql   # Database schema
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- SQL injection prevention
- XSS protection
- CORS configuration

## 💳 Payment System

The system includes a mock payment gateway that simulates real payment processing:

- **Payment Methods**: Credit/Debit Card, UPI, Net Banking, Wallet
- **Component-based Fees**: Separate tracking for Tuition, Library, Lab, and Exam fees
- **Payment Status**: Real-time status updates (Pending, Partial, Paid)
- **Receipt Generation**: Downloadable payment receipts
- **Transaction History**: Complete payment audit trail

## 📧 Email Notifications

Automated email notifications for:
- Admission approval with password setup link
- Faculty account creation
- Admission rejection/reapply requests

## 🎨 UI/UX Features

- Responsive design for all screen sizes
- Glass-morphism design aesthetic
- Smooth animations and transitions
- Intuitive navigation
- Color-coded status indicators
- Real-time data updates

## 📊 Database Schema

The system uses a normalized MySQL database with the following main tables:
- `users` - User authentication
- `students` - Student records
- `faculty` - Faculty records
- `courses` - Course information
- `subjects` - Subject details
- `admission_applications` - Admission tracking
- `student_fee_components` - Fee breakdown
- `component_payments` - Payment transactions
- `attendance` - Attendance records
- `assignments` - Assignment management
- `exam_schedules` - Exam planning
- `notices` - Notice board
- `events` - Event management

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions including:
- Free hosting options (Vercel + Render)
- VPS deployment (DigitalOcean, AWS)
- Domain setup
- SSL configuration
- Production best practices

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=college_erp
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/set-password` - Set password with token

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/admissions` - Get all applications
- `POST /api/admin/admissions/:id/decide` - Approve/reject admission
- `GET /api/admin/students` - Get all students
- `GET /api/admin/faculty` - Get all faculty
- `POST /api/admin/faculty` - Add faculty member
- `GET /api/admin/courses` - Get all courses
- `POST /api/admin/courses` - Add new course

### Faculty Routes
- `GET /api/faculty/dashboard` - Faculty dashboard
- `GET /api/faculty/subjects` - Get assigned subjects
- `POST /api/faculty/attendance` - Mark attendance
- `GET /api/faculty/attendance-history` - View attendance history
- `POST /api/faculty/study-materials` - Upload materials
- `POST /api/faculty/assignments` - Create assignment

### Student Routes
- `GET /api/student/profile` - Get student profile
- `GET /api/student/fee-components` - Get fee breakdown
- `POST /api/student/process-component-payment` - Process payment
- `GET /api/student/payment-history` - Get payment history
- `GET /api/student/assignments` - Get assignments
- `GET /api/student/exam-timetable` - Get exam schedule

## 🐛 Known Issues & Limitations

- Email functionality requires SMTP configuration
- File uploads limited to 10MB
- Payment gateway is simulated (not real transactions)
- No real-time notifications (polling-based updates)

## 🔮 Future Enhancements

- Real-time notifications using WebSockets
- Mobile application (React Native)
- Integration with real payment gateways (Razorpay, Stripe)
- Advanced analytics and reporting
- Automated timetable generation
- Library management system
- Hostel management
- Transport management
- Alumni portal

## 🤝 Contributing

This is a college project. For any suggestions or improvements, please contact the project team.

## 📄 License

This project is created for educational purposes as part of a college project.

## 👨‍💻 Project Team

[Add your team member names and roles here]

## 📞 Contact

For any queries regarding this project, please contact:
- Email: [your-email@example.com]
- GitHub: [your-github-profile]

## 🙏 Acknowledgments

- Thanks to our college faculty for guidance
- Open source community for amazing tools and libraries
- All team members for their dedication and hard work

---

**Note**: This is a college project created for educational purposes. The payment system is simulated and does not process real transactions.
