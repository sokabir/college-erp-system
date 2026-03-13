import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, Trash2, X } from 'lucide-react';

const FacultyLeaveManagement = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        leave_type: 'CASUAL',
        from_date: '',
        to_date: '',
        reason: ''
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/faculty/leave-applications');
            setApplications(res.data);
        } catch (error) {
            console.error('Error fetching leave applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fromDate = new Date(formData.from_date);
        const toDate = new Date(formData.to_date);
        if (toDate < fromDate) {
            alert('To date cannot be before from date');
            return;
        }
        try {
            await api.post('/faculty/leave-applications', formData);
            alert('Leave application submitted successfully');
            setShowModal(false);
            setFormData({ leave_type: 'CASUAL', from_date: '', to_date: '', reason: '' });
            fetchApplications();
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting leave application');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
        try {
            await api.delete(`/faculty/leave-applications/${id}`);
            alert('Leave application cancelled successfully');
            fetchApplications();
        } catch (error) {
            alert(error.response?.data?.message || 'Error cancelling application');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: { bg: '#fef3c7', color: '#92400e', icon: Clock },
            APPROVED: { bg: '#d1fae5', color: '#065f46', icon: CheckCircle },
            REJECTED: { bg: '#fee2e2', color: '#991b1b', icon: XCircle }
        };
        const style = styles[status];
        const Icon = style.icon;
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: style.bg, color: style.color, fontSize: '0.875rem', fontWeight: '500' }}>
                <Icon size={14} />
                {status}
            </span>
        );
    };

    if (loading) return <div className="animate-fade-in">Loading...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Leave Management</h2>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Apply for Leave
                </button>
            </div>
            {applications.length === 0 ? (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p style={{ color: '#999' }}>No leave applications yet</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {applications.map(app => (
                        <div key={app.id} className="glass-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0 }}>{app.leave_type} Leave</h4>
                                {getStatusBadge(app.status)}
                            </div>
                            <p>From: {new Date(app.from_date).toLocaleDateString()} To: {new Date(app.to_date).toLocaleDateString()} ({app.total_days} days)</p>
                            <p>Reason: {app.reason}</p>
                            {app.admin_remarks && <p>Admin Remarks: {app.admin_remarks}</p>}
                            {app.status === 'PENDING' && (
                                <button onClick={() => handleCancel(app.id)} className="btn btn-danger">Cancel</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="glass-card" style={{ padding: '1.5rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Apply for Leave</h3>
                            <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Leave Type</label>
                                <select className="form-input" value={formData.leave_type} onChange={(e) => setFormData({...formData, leave_type: e.target.value})} style={{ width: '100%' }}>
                                    <option value="CASUAL">Casual Leave</option>
                                    <option value="SICK">Sick Leave</option>
                                    <option value="EARNED">Earned Leave</option>
                                    <option value="MATERNITY">Maternity Leave</option>
                                    <option value="PATERNITY">Paternity Leave</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>From Date</label>
                                <input type="date" className="form-input" value={formData.from_date} onChange={(e) => setFormData({...formData, from_date: e.target.value})} required style={{ width: '100%' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>To Date</label>
                                <input type="date" className="form-input" value={formData.to_date} onChange={(e) => setFormData({...formData, to_date: e.target.value})} required style={{ width: '100%' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Reason</label>
                                <textarea className="form-input" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} required rows="3" style={{ width: '100%', resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyLeaveManagement;
