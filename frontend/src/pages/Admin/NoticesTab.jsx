import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, X, Bell, AlertCircle, Users, GraduationCap } from 'lucide-react';

const NoticesTab = () => {
    const [notices, setNotices] = useState([]);
    const [courses, setCourses] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        priority: 'NORMAL',
        target_audience: 'ALL',
        target_course_id: '',
        target_semester: ''
    });

    useEffect(() => {
        fetchNotices();
        fetchCourses();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await api.get('/admin/notices');
            setNotices(res.data);
        } catch (error) {
            console.error('Error fetching notices:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses');
            setCourses(res.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleAddNotice = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                target_course_id: formData.target_course_id || null,
                target_semester: formData.target_semester || null
            };
            await api.post('/admin/notices', payload);
            alert('Notice published successfully!');
            setShowAddModal(false);
            setFormData({ 
                title: '', 
                message: '', 
                priority: 'NORMAL',
                target_audience: 'ALL',
                target_course_id: '',
                target_semester: ''
            });
            fetchNotices();
        } catch (error) {
            alert(error.response?.data?.message || 'Error publishing notice');
        }
    };

    const handleDeleteNotice = async (id) => {
        if (!confirm('Are you sure you want to delete this notice?')) return;
        try {
            await api.delete(`/admin/notices/${id}`);
            alert('Notice deleted successfully!');
            fetchNotices();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting notice');
        }
    };

    const getPriorityStyle = (priority) => {
        const styles = {
            'HIGH': { bg: '#fee2e2', color: '#dc2626', icon: <AlertCircle size={16} /> },
            'NORMAL': { bg: '#dbeafe', color: '#2563eb', icon: <Bell size={16} /> },
            'LOW': { bg: '#f3f4f6', color: '#6b7280', icon: <Bell size={16} /> }
        };
        return styles[priority] || styles.NORMAL;
    };

    const getTargetLabel = (notice) => {
        const parts = [];
        
        if (notice.target_audience === 'ALL') {
            parts.push('Everyone');
        } else if (notice.target_audience === 'STUDENTS') {
            parts.push('Students');
        } else if (notice.target_audience === 'FACULTY') {
            parts.push('Faculty');
        } else if (notice.target_audience === 'BOTH') {
            parts.push('Students & Faculty');
        }
        
        if (notice.target_course_name) {
            parts.push(notice.target_course_name);
        }
        
        if (notice.target_semester) {
            parts.push(`Sem ${notice.target_semester}`);
        }
        
        return parts.join(' • ');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Notices</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Publish targeted announcements and notices</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Publish Notice
                </button>
            </div>

            {notices.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {notices.map(notice => {
                        const priorityStyle = getPriorityStyle(notice.priority);
                        return (
                            <div key={notice.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                        <div style={{ 
                                            backgroundColor: priorityStyle.bg, 
                                            color: priorityStyle.color,
                                            padding: '0.5rem',
                                            borderRadius: '0.5rem'
                                        }}>
                                            {priorityStyle.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{notice.title}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {new Date(notice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <span style={{ 
                                                    fontSize: '0.75rem', 
                                                    padding: '0.25rem 0.5rem',
                                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                    color: '#8b5cf6',
                                                    borderRadius: '0.25rem',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    <Users size={12} />
                                                    {getTargetLabel(notice)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNotice(notice.id)}
                                        className="btn btn-danger"
                                        style={{ padding: '0.5rem', minWidth: 'auto' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{notice.message}</p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)' }}>No notices published yet</p>
                </div>
            )}

            {/* Add Notice Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}>
                        <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bell size={24} /> Publish Notice
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                            Create and publish a notice to specific audiences
                        </p>

                        <form onSubmit={handleAddNotice}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="Enter notice title"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea
                                    className="form-input"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    rows="4"
                                    placeholder="Enter notice message"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select
                                    className="form-input"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>

                            <div style={{ 
                                padding: '1.5rem', 
                                backgroundColor: 'rgba(139, 92, 246, 0.05)', 
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                marginBottom: '1.5rem'
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Users size={18} color="#8b5cf6" />
                                    Target Audience
                                </h3>

                                <div className="form-group">
                                    <label className="form-label">Send To</label>
                                    <select
                                        className="form-input"
                                        value={formData.target_audience}
                                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                    >
                                        <option value="ALL">Everyone (Students & Faculty)</option>
                                        <option value="STUDENTS">Students Only</option>
                                        <option value="FACULTY">Faculty Only</option>
                                        <option value="BOTH">Both Students & Faculty</option>
                                    </select>
                                </div>

                                {(formData.target_audience === 'STUDENTS' || formData.target_audience === 'BOTH') && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Specific Course (Optional)</label>
                                            <select
                                                className="form-input"
                                                value={formData.target_course_id}
                                                onChange={(e) => setFormData({ ...formData, target_course_id: e.target.value })}
                                            >
                                                <option value="">All Courses</option>
                                                {courses.map(course => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.name} ({course.short_code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Specific Semester (Optional)</label>
                                            <select
                                                className="form-input"
                                                value={formData.target_semester}
                                                onChange={(e) => setFormData({ ...formData, target_semester: e.target.value })}
                                            >
                                                <option value="">All Semesters</option>
                                                <option value="1">Semester 1</option>
                                                <option value="2">Semester 2</option>
                                                <option value="3">Semester 3</option>
                                                <option value="4">Semester 4</option>
                                                <option value="5">Semester 5</option>
                                                <option value="6">Semester 6</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div style={{ 
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    color: '#3b82f6'
                                }}>
                                    <strong>Preview:</strong> This notice will be sent to{' '}
                                    {formData.target_audience === 'ALL' && 'everyone'}
                                    {formData.target_audience === 'STUDENTS' && 'students'}
                                    {formData.target_audience === 'FACULTY' && 'faculty'}
                                    {formData.target_audience === 'BOTH' && 'students and faculty'}
                                    {formData.target_course_id && ` in ${courses.find(c => c.id === parseInt(formData.target_course_id))?.name}`}
                                    {formData.target_semester && ` (Semester ${formData.target_semester})`}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Bell size={16} style={{ marginRight: '0.5rem' }} />
                                    Publish Notice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticesTab;
