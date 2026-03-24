import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    User, 
    BookOpen, 
    Calendar, 
    Bell,
    TrendingUp,
    Award,
    Clock,
    CheckCircle
} from 'lucide-react';

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [profileRes, statsRes] = await Promise.all([
                api.get('/student/profile'),
                api.get('/student/dashboard-stats')
            ]);
            setProfile(profileRes.data);
            setStats(statsRes.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Admission Pending or Profile not found.');
            } else {
                setError('Failed to load dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '1.2rem', color: '#999' }}>Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ marginBottom: '1rem', color: '#f59e0b' }}>Profile Status</h2>
                <div style={{ 
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: '#fef3c7', 
                    color: '#92400e',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '500'
                }}>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Welcome Section with Profile Picture */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid var(--primary-color)',
                    flexShrink: 0,
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {profile.profile_pic ? (
                        <img 
                            src={`http://localhost:5000/${profile.profile_pic}`}
                            alt={`${profile.first_name} ${profile.last_name}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div style={{
                        display: profile.profile_pic ? 'none' : 'flex',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--primary-color)',
                        backgroundColor: '#e0f2fe'
                    }}>
                        {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                    </div>
                </div>
                <div>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem' }}>
                        Welcome back, {profile.first_name}! 👋
                    </h2>
                    <p style={{ color: '#999', margin: 0 }}>
                        Here's what's happening with your academics today
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#999', textTransform: 'uppercase' }}>
                                Enrollment No.
                            </p>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                                {profile.enrollment_number}
                            </h3>
                        </div>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px', 
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <User size={24} color="#10b981" />
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#999', textTransform: 'uppercase' }}>
                                Current Semester
                            </p>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                                Semester {profile.current_semester}
                            </h3>
                        </div>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px', 
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <BookOpen size={24} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#999', textTransform: 'uppercase' }}>
                                Course
                            </p>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                                {profile.course_name}
                            </h3>
                        </div>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px', 
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Award size={24} color="#8b5cf6" />
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#999', textTransform: 'uppercase' }}>
                                Attendance
                            </p>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: stats?.attendance_percentage >= 75 ? '#10b981' : '#ef4444' }}>
                                {stats?.attendance_percentage || 0}%
                            </h3>
                        </div>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px', 
                            backgroundColor: stats?.attendance_percentage >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircle size={24} color={stats?.attendance_percentage >= 75 ? '#10b981' : '#ef4444'} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Upcoming Exams */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Calendar size={24} color="#3b82f6" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Upcoming Exams</h3>
                    </div>
                    {stats?.upcoming_exams && stats.upcoming_exams.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.upcoming_exams.map(exam => (
                                <div 
                                    key={exam.id} 
                                    style={{ 
                                        padding: '1.25rem', 
                                        backgroundColor: 'rgba(255,255,255,0.05)', 
                                        borderRadius: '0.75rem',
                                        borderLeft: '4px solid #3b82f6'
                                    }}
                                >
                                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', fontSize: '1rem' }}>
                                        {exam.subject_name}
                                    </p>
                                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#ccc' }}>
                                        {exam.exam_name}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#999' }}>
                                        <Clock size={16} />
                                        {new Date(exam.exam_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {exam.exam_time_from}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
                            <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p style={{ margin: 0, fontSize: '1rem' }}>No upcoming exams scheduled</p>
                        </div>
                    )}
                </div>

                {/* Upcoming Events */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Calendar size={24} color="#8b5cf6" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Upcoming Events</h3>
                    </div>
                    {stats?.upcoming_events && stats.upcoming_events.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.upcoming_events.map(event => (
                                <div 
                                    key={event.id} 
                                    style={{ 
                                        padding: '1.25rem', 
                                        backgroundColor: 'rgba(255,255,255,0.05)', 
                                        borderRadius: '0.75rem',
                                        borderLeft: '4px solid #8b5cf6'
                                    }}
                                >
                                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', fontSize: '1rem' }}>
                                        {event.title}
                                    </p>
                                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#ccc', lineHeight: '1.5' }}>
                                        {event.description}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#999' }}>
                                        <Clock size={16} />
                                        {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
                            <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p style={{ margin: 0, fontSize: '1rem' }}>No upcoming events</p>
                        </div>
                    )}
                </div>

                {/* Recent Notices */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Bell size={24} color="#f59e0b" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Recent Notices</h3>
                    </div>
                    {stats?.recent_notices && stats.recent_notices.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.recent_notices.map(notice => (
                                <div 
                                    key={notice.id} 
                                    style={{ 
                                        padding: '1.25rem', 
                                        backgroundColor: 'rgba(255,255,255,0.05)', 
                                        borderRadius: '0.75rem',
                                        borderLeft: notice.priority === 'HIGH' ? '4px solid #ef4444' : '4px solid #10b981'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>
                                            {notice.title}
                                        </p>
                                        {notice.priority === 'HIGH' && (
                                            <span style={{ 
                                                padding: '0.25rem 0.5rem', 
                                                backgroundColor: '#fee2e2', 
                                                color: '#991b1b',
                                                borderRadius: '0.25rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                HIGH
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#ccc', lineHeight: '1.5' }}>
                                        {notice.message}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>
                                        {new Date(notice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
                            <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p style={{ margin: 0, fontSize: '1rem' }}>No recent notices</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
