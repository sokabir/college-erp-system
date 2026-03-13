import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Users, Calendar, TrendingUp, CheckCircle, Clock, Bell, ArrowRight, FileText, X } from 'lucide-react';

const FacultyDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [studentsBySemester, setStudentsBySemester] = useState({});

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/faculty/dashboard');
                setDashboardData(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/faculty/students');
            // Group students by semester
            const grouped = res.data.reduce((acc, student) => {
                if (!acc[student.semester]) {
                    acc[student.semester] = [];
                }
                acc[student.semester].push(student);
                return acc;
            }, {});
            setStudentsBySemester(grouped);
            setShowStudentsModal(true);
        } catch (error) {
            console.error('Error fetching students:', error);
            alert('Error loading students');
        }
    };

    if (loading) return <div>Loading dashboard...</div>;
    if (!dashboardData) return <div>Dashboard unavailable.</div>;

    const { profile, subjects, stats, upcoming_exams, recent_notices } = dashboardData;

    const statCards = [
        { title: 'Total Students', value: stats?.total_students || 0, icon: <Users size={24} />, color: '#3b82f6', bg: '#dbeafe' },
        { title: 'Subjects Teaching', value: stats?.total_subjects || 0, icon: <BookOpen size={24} />, color: '#10b981', bg: '#dcfce7' },
        { title: 'Upcoming Exams', value: stats?.upcoming_exams_count || 0, icon: <Calendar size={24} />, color: '#f59e0b', bg: '#fef3c7' },
        { title: 'Attendance Rate', value: `${stats?.attendance_rate || 0}%`, icon: <TrendingUp size={24} />, color: '#8b5cf6', bg: '#ede9fe' },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2>Welcome, {profile.first_name} {profile.last_name}!</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    {profile.designation} • {profile.department} • Employee ID: {profile.employee_id}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                {statCards.map((card, idx) => (
                    <div 
                        key={idx} 
                        className="glass-card stat-card" 
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            justifyContent: 'flex-start', 
                            gap: '1.5rem',
                            cursor: card.title === 'Total Students' ? 'pointer' : 'default'
                        }}
                        onClick={() => card.title === 'Total Students' && fetchStudents()}
                    >
                        <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: card.bg, color: card.color }}>
                            {card.icon}
                        </div>
                        <div>
                            <div className="stat-title">{card.title}</div>
                            <div className="stat-value">{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <Link to="/faculty/attendance" className="btn btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} /> Mark Attendance
                    </Link>
                    <Link to="/faculty/marks" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: 'white' }}>
                        <FileText size={18} /> Enter Marks
                    </Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Assigned Subjects */}
                <div className="glass-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <BookOpen size={20} color="var(--primary-color)" /> My Subjects
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {subjects.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No subjects assigned yet.
                            </div>
                        ) : (
                            subjects.map(sub => (
                                <div key={sub.id} style={{ 
                                    padding: '1rem', 
                                    backgroundColor: '#f8fafc', 
                                    borderRadius: '8px',
                                    borderLeft: '4px solid var(--primary-color)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{sub.name}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {sub.code} • {sub.course_name}
                                            </div>
                                        </div>
                                        <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
                                            Sem {sub.semester}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming Exams */}
                <div className="glass-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Calendar size={20} color="var(--warning-color)" /> Upcoming Exams
                    </h3>
                    {upcoming_exams && upcoming_exams.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {upcoming_exams.map((exam, i) => (
                                <div key={i} style={{ 
                                    display: 'flex', 
                                    gap: '1rem', 
                                    padding: '1rem', 
                                    backgroundColor: '#fef3c7', 
                                    borderRadius: '8px',
                                    borderLeft: '4px solid #f59e0b'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        padding: '0.5rem', 
                                        backgroundColor: 'white', 
                                        borderRadius: '6px', 
                                        minWidth: '60px' 
                                    }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                            {new Date(exam.exam_date).toLocaleString('default', { month: 'short' })}
                                        </span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                            {new Date(exam.exam_date).getDate()}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>{exam.subject_name} ({exam.subject_code})</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            {exam.exam_name} • Sem {exam.semester}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={14} /> {exam.exam_time_from} - {exam.exam_time_to}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No upcoming exams scheduled.
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Notices */}
            {recent_notices && recent_notices.length > 0 && (
                <div className="glass-card" style={{ marginTop: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Bell size={20} color="var(--accent-color)" /> Recent Notices
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recent_notices.slice(0, 3).map((notice, i) => (
                            <div key={i} style={{ 
                                padding: '1rem', 
                                backgroundColor: '#f8fafc', 
                                borderRadius: '8px',
                                borderLeft: `4px solid ${notice.priority === 'HIGH' ? '#ef4444' : notice.priority === 'MEDIUM' ? '#f59e0b' : '#3b82f6'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: 600 }}>{notice.title}</div>
                                    <span className="badge" style={{ 
                                        backgroundColor: notice.priority === 'HIGH' ? '#fee2e2' : notice.priority === 'MEDIUM' ? '#fef3c7' : '#dbeafe',
                                        color: notice.priority === 'HIGH' ? '#dc2626' : notice.priority === 'MEDIUM' ? '#d97706' : '#2563eb'
                                    }}>
                                        {notice.priority}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    {notice.message}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {new Date(notice.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Students Modal */}
            {showStudentsModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}>
                        <button onClick={() => setShowStudentsModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={24} /> My Students
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                            Students grouped by semester
                        </p>

                        {Object.keys(studentsBySemester).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                No students found
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {Object.keys(studentsBySemester).sort((a, b) => a - b).map(semester => (
                                    <div key={semester}>
                                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                                            Semester {semester} ({studentsBySemester[semester].length} students)
                                        </h3>
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Enrollment No.</th>
                                                        <th>Name</th>
                                                        <th>Course</th>
                                                        <th>Email</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {studentsBySemester[semester].map(student => (
                                                        <tr key={student.id}>
                                                            <td>
                                                                <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                                    {student.enrollment_number}
                                                                </span>
                                                            </td>
                                                            <td style={{ fontWeight: 500 }}>
                                                                {student.first_name} {student.last_name}
                                                            </td>
                                                            <td>{student.course_name}</td>
                                                            <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                                {student.email}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                            <button className="btn btn-secondary" onClick={() => setShowStudentsModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboard;
