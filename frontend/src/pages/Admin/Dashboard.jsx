import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, UserCheck, BookOpen, Clock, DollarSign, Calendar, FileText, CheckCircle, XCircle, ArrowRight, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                setStats(res.data);
            } catch (err) {
                setError('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div className="badge badge-danger">{error}</div>;

    const statCards = [
        { title: 'Total Students', value: stats?.students || 0, icon: <Users size={24} color="var(--primary-color)" />, bg: '#dcfce7' },
        { title: 'Faculty Members', value: stats?.faculty || 0, icon: <UserCheck size={24} color="var(--accent-color)" />, bg: '#dbeafe' },
        { title: 'Total Courses', value: stats?.courses || 0, icon: <BookOpen size={24} color="var(--warning-color)" />, bg: '#fef3c7' },
        { title: 'Pending Admissions', value: stats?.pendingAdmissions || 0, icon: <Clock size={24} color="var(--danger-color)" />, bg: '#fee2e2' },
    ];

    return (
        <div>
            <h2>Dashboard Overview</h2>
            <p style={{ marginBottom: '2rem' }}>Welcome to the admin dashboard.</p>

            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                {statCards.map((card, idx) => (
                    <div key={idx} className="glass-card stat-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: card.bg }}>
                            {card.icon}
                        </div>
                        <div>
                            <div className="stat-title">{card.title}</div>
                            <div className="stat-value">{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Admissions Overview */}
                    <div className="glass-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <FileText size={20} color="var(--primary-color)" /> Admissions Overview
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div className="stat-value">{stats?.admissions_overview?.total_today || 0}</div>
                                <div className="stat-title">Today's Applications</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div className="stat-value" style={{ color: 'var(--success-color)' }}>{stats?.admissions_overview?.accepted_today || 0}</div>
                                <div className="stat-title">Accepted Today</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div className="stat-value" style={{ color: 'var(--danger-color)' }}>{stats?.admissions_overview?.rejected_today || 0}</div>
                                <div className="stat-title">Rejected Today</div>
                            </div>
                        </div>
                        <Link to="/admin/admissions" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                            View Applications <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Financial Overview */}
                    <div className="glass-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <DollarSign size={20} color="var(--success-color)" /> Financial Overview
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div className="stat-title">Collected This Month</div>
                                <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--success-color)' }}>₹{stats?.finance_overview?.collected_this_month?.toLocaleString('en-IN') || 0}</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div className="stat-title">Pending Payments</div>
                                <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--warning-color)' }}>₹{stats?.finance_overview?.pending_total?.toLocaleString('en-IN') || 0}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div className="stat-title">Total Expected</div>
                                <div>₹{stats?.fees?.total_expected?.toLocaleString('en-IN') || 0}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div className="stat-title">Total Collected</div>
                                <div style={{ color: 'var(--success-color)' }}>₹{stats?.fees?.total_collected?.toLocaleString('en-IN') || 0}</div>
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${stats?.fees?.total_expected ? (stats.fees.total_collected / stats.fees.total_expected) * 100 : 0}%`,
                                    height: '100%',
                                    backgroundColor: 'var(--success-color)'
                                }}></div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Recent Payments</h4>
                        {stats?.finance_overview?.recent_payments?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {stats.finance_overview.recent_payments.map((payment, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{payment.first_name} {payment.last_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(payment.payment_date).toLocaleDateString()} &middot; {payment.transaction_id}</div>
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'var(--success-color)' }}>
                                            +₹{payment.amount_paid.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No recent payments.</div>
                        )}
                        <Link to="/admin/finance" style={{ display: 'block', textAlign: 'center', fontSize: '0.875rem', marginTop: '1rem', color: 'var(--primary-color)', textDecoration: 'none' }}>Vew all finances</Link>
                    </div>

                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Upcoming Exams */}
                    <div className="glass-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Activity size={20} color="var(--warning-color)" /> Upcoming Exams
                        </h3>
                        {stats?.upcoming_exams?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {stats.upcoming_exams.map((exam, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--warning-color)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0.5rem', backgroundColor: 'white', borderRadius: '6px', minWidth: '60px' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                {new Date(exam.start_date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                                {new Date(exam.start_date).getDate()}
                                            </span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{exam.exam_name}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                Semester {exam.semester} • {exam.subject_count} subject{exam.subject_count !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No upcoming exams scheduled.</div>
                        )}
                        <Link to="/admin/courses" style={{ display: 'block', textAlign: 'center', fontSize: '0.875rem', marginTop: '1rem', color: 'var(--primary-color)', textDecoration: 'none' }}>Manage courses & exams</Link>
                    </div>

                    {/* Upcoming Events */}
                    <div className="glass-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Calendar size={20} color="var(--accent-color)" /> Upcoming Events
                        </h3>
                        {stats?.upcoming_events?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {stats.upcoming_events.map((evt, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0.5rem', backgroundColor: 'white', borderRadius: '6px', minWidth: '60px' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                {new Date(evt.event_date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                                {new Date(evt.event_date).getDate()}
                                            </span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{evt.title}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{evt.type} &middot; {evt.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No upcoming events scheduled.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
