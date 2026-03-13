import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Check, X, Eye, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminLeaveManagement = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewAction, setReviewAction] = useState(null);
    const [adminComments, setAdminComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/admin/leave-applications');
            setApplications(res.data);
        } catch (error) {
            console.error('Error fetching leave applications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleReview = (app, status) => {
        setReviewAction({ app, status });
        setAdminComments('');
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        setSubmitting(true);
        try {
            await api.post(`/admin/leave-applications/${reviewAction.app.id}/review`, {
                status: reviewAction.status,
                admin_comments: adminComments
            });
            
            alert(`Leave application ${reviewAction.status.toLowerCase()} successfully`);
            setShowReviewModal(false);
            setReviewAction(null);
            setAdminComments('');
            setSelectedApp(null);
            fetchApplications();
        } catch (error) {
            alert('Failed to process leave application');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: { bg: '#fef3c7', color: '#92400e', icon: <Clock size={14} /> },
            APPROVED: { bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle size={14} /> },
            REJECTED: { bg: '#fee2e2', color: '#dc2626', icon: <XCircle size={14} /> }
        };
        const style = styles[status] || styles.PENDING;
        
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: style.bg,
                color: style.color,
                fontSize: '0.875rem',
                fontWeight: '500'
            }}>
                {style.icon} {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading leave applications...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Calendar size={28} /> Faculty Leave Management
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Review and manage faculty leave applications.</p>
            </div>

            {applications.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Calendar size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                    <div style={{ color: 'var(--text-muted)' }}>No leave applications found.</div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Faculty Name</th>
                                <th>Leave Type</th>
                                <th>From Date</th>
                                <th>To Date</th>
                                <th>Days</th>
                                <th>Applied On</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app.id}>
                                    <td style={{ fontWeight: 500 }}>
                                        {app.faculty_name}
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {app.employee_id}
                                        </div>
                                    </td>
                                    <td>{app.leave_type}</td>
                                    <td>
                                        {new Date(app.from_date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td>
                                        {new Date(app.to_date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td>
                                        <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                                            {app.total_days} {app.total_days === 1 ? 'day' : 'days'}
                                        </span>
                                    </td>
                                    <td>
                                        {new Date(app.created_at).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td>{getStatusBadge(app.status)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => setSelectedApp(app)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: 'var(--text-color)' }}
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                            {app.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleReview(app, 'APPROVED')}
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#10b981' }}
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReview(app, 'REJECTED')}
                                                        className="btn btn-danger"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Details Modal */}
            {selectedApp && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', position: 'relative', padding: '2rem' }}>
                        <button
                            onClick={() => setSelectedApp(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{ marginBottom: '0.5rem' }}>Leave Application Details</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            Application ID: #{selectedApp.id}
                        </p>

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Faculty Name</div>
                                <div style={{ fontWeight: 600 }}>{selectedApp.faculty_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedApp.employee_id}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Leave Type</div>
                                    <div style={{ fontWeight: 600 }}>{selectedApp.leave_type}</div>
                                </div>

                                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Days</div>
                                    <div style={{ fontWeight: 600 }}>{selectedApp.total_days} {selectedApp.total_days === 1 ? 'day' : 'days'}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>From Date</div>
                                    <div style={{ fontWeight: 600 }}>
                                        {new Date(selectedApp.from_date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>To Date</div>
                                    <div style={{ fontWeight: 600 }}>
                                        {new Date(selectedApp.to_date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Reason</div>
                                <div style={{ lineHeight: '1.6' }}>{selectedApp.reason}</div>
                            </div>

                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</div>
                                <div>{getStatusBadge(selectedApp.status)}</div>
                            </div>

                            {selectedApp.admin_remarks && (
                                <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.5rem', fontWeight: 600 }}>Admin Comments</div>
                                    <div style={{ color: '#92400e' }}>{selectedApp.admin_remarks}</div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>Close</button>
                            {selectedApp.status === 'PENDING' && (
                                <>
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={() => {
                                            setSelectedApp(null);
                                            handleReview(selectedApp, 'REJECTED');
                                        }}
                                    >
                                        <X size={16} style={{ marginRight: '0.5rem' }} /> Reject
                                    </button>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => {
                                            setSelectedApp(null);
                                            handleReview(selectedApp, 'APPROVED');
                                        }}
                                        style={{ backgroundColor: '#10b981' }}
                                    >
                                        <Check size={16} style={{ marginRight: '0.5rem' }} /> Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && reviewAction && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', position: 'relative', padding: '2rem' }}>
                        <button
                            onClick={() => {
                                setShowReviewModal(false);
                                setReviewAction(null);
                                setAdminComments('');
                            }}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={24} />
                            {reviewAction.status === 'APPROVED' ? 'Approve Leave Application' : 'Reject Leave Application'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {reviewAction.status === 'APPROVED' 
                                ? 'Add any comments for the faculty member (optional).'
                                : 'Provide a reason for rejection.'}
                        </p>

                        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                <strong>{reviewAction.app.faculty_name}</strong> - {reviewAction.app.leave_type}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(reviewAction.app.from_date).toLocaleDateString()} to {new Date(reviewAction.app.to_date).toLocaleDateString()} ({reviewAction.app.total_days} days)
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Comments {reviewAction.status === 'REJECTED' && '*'}
                            </label>
                            <textarea
                                className="form-input"
                                rows="4"
                                value={adminComments}
                                onChange={(e) => setAdminComments(e.target.value)}
                                placeholder={reviewAction.status === 'APPROVED' 
                                    ? 'e.g., Approved. Enjoy your leave.'
                                    : 'e.g., Cannot approve due to insufficient staff coverage...'}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setReviewAction(null);
                                    setAdminComments('');
                                }}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn"
                                onClick={handleSubmitReview}
                                disabled={submitting || (reviewAction.status === 'REJECTED' && !adminComments.trim())}
                                style={{ 
                                    backgroundColor: reviewAction.status === 'APPROVED' ? '#10b981' : '#dc2626',
                                    color: 'white',
                                    opacity: (submitting || (reviewAction.status === 'REJECTED' && !adminComments.trim())) ? 0.6 : 1
                                }}
                            >
                                {submitting ? 'Processing...' : (reviewAction.status === 'APPROVED' ? 'Approve Leave' : 'Reject Leave')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLeaveManagement;
