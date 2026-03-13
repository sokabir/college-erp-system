import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    LogOut,
    UserPlus,
    Users,
    BookOpen,
    FileText,
    CreditCard,
    CheckSquare,
    ClipboardList,
    Calendar
} from 'lucide-react';

const DashboardLayout = ({ role }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavLinks = () => {
        if (role === 'admin') {
            return [
                { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                { path: '/admin/admissions', icon: <UserPlus size={20} />, label: 'Admissions' },
                { path: '/admin/students', icon: <Users size={20} />, label: 'Students' },
                { path: '/admin/faculty', icon: <Users size={20} />, label: 'Faculty' },
                { path: '/admin/courses', icon: <BookOpen size={20} />, label: 'Academic Management' },
                { path: '/admin/finance', icon: <CreditCard size={20} />, label: 'Finance' },
            ];
        }
        if (role === 'student') {
            return [
                { path: '/student/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                { path: '/student/profile', icon: <Users size={20} />, label: 'Profile' },
                { path: '/student/study-materials', icon: <BookOpen size={20} />, label: 'Study Materials' },
                { path: '/student/assignments', icon: <ClipboardList size={20} />, label: 'Assignments' },
                { path: '/student/exam-timetable', icon: <Calendar size={20} />, label: 'Exam Timetable' },
                { path: '/student/results', icon: <CheckSquare size={20} />, label: 'Results' },
                { path: '/student/fees', icon: <CreditCard size={20} />, label: 'Fees' },
            ];
        }
        if (role === 'faculty') {
            return [
                { path: '/faculty/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                { path: '/faculty/attendance', icon: <CheckSquare size={20} />, label: 'Attendance' },
                { path: '/faculty/marks', icon: <FileText size={20} />, label: 'Enter Marks' },
                { path: '/faculty/results', icon: <FileText size={20} />, label: 'View Results' },
                { path: '/faculty/assignments', icon: <ClipboardList size={20} />, label: 'Assignments' },
                { path: '/faculty/study-materials', icon: <BookOpen size={20} />, label: 'Study Materials' },
                { path: '/faculty/leave-management', icon: <Calendar size={20} />, label: 'Leave Management' },
            ];
        }
        return [];
    };

    const links = getNavLinks();

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    College ERP
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '1rem 0' }}>
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    ))}

                    <div style={{ marginTop: 'auto' }}>
                        <button
                            onClick={handleLogout}
                            className="nav-link"
                            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </nav>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            {user?.email} ({role})
                        </span>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user?.email ? user.email[0].toUpperCase() : 'U'}
                        </div>
                    </div>
                </header>
                <div className="page-content animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div >
    );
};

export default DashboardLayout;
