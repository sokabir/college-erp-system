import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Check, X, FileText, Eye, Download, User, MapPin, GraduationCap, Users, Trash2, RefreshCw, MessageSquare } from 'lucide-react';

const AdmissionManagement = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null); // For the modal
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentAction, setCommentAction] = useState(null); // 'REJECTED' or 'REAPPLY'
    const [adminComments, setAdminComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/admin/admissions');
            setApplications(res.data);
        } catch (error) {
            console.error('Failed to fetch applications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleDecision = async (id, status) => {
        if (status === 'APPROVED') {
            if (!window.confirm(`Are you sure you want to approve this application?`)) return;
            
            try {
                await api.post(`/admin/admissions/${id}/decide`, { status });
                if (selectedApp && selectedApp.id === id) {
                    setSelectedApp(null);
                }
                fetchApplications();
            } catch (error) {
                alert('Error processing application');
            }
        } else {
            // For REJECTED and REAPPLY, show comment modal
            setCommentAction({ id, status });
            setShowCommentModal(true);
            setAdminComments('');
        }
    };

    const handleCommentSubmit = async () => {
        if (!adminComments.trim()) {
            alert('Please provide comments explaining the reason');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/admin/admissions/${commentAction.id}/decide`, {
                status: commentAction.status,
                admin_comments: adminComments
            });
            
            setShowCommentModal(false);
            setCommentAction(null);
            setAdminComments('');
            
            if (selectedApp && selectedApp.id === commentAction.id) {
                setSelectedApp(null);
            }
            
            fetchApplications();
            alert(`Application ${commentAction.status.toLowerCase()} successfully. Email sent to applicant.`);
        } catch (error) {
            alert('Error processing application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to completely delete this application? This action cannot be undone.")) return;

        try {
            await api.delete(`/admin/admissions/${id}`);
            // Close modal if open
            if (selectedApp && selectedApp.id === id) {
                setSelectedApp(null);
            }
            // Refresh list
            fetchApplications();
            alert('Application deleted successfully.');
        } catch (error) {
            alert('Error deleting application. It might be linked to other records.');
        }
    };

    // Helper to render document links
    const renderDocumentLink = (label, path) => {
        if (!path) return <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Not Provided</span>;

        // Use the backend URL (assuming it runs on port 5000)
        const fileUrl = `http://localhost:5000${path}`;

        return (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontWeight: 500, textDecoration: 'none', backgroundColor: '#e0f2fe', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                <FileText size={16} /> {label}
            </a>
        );
    };

    if (loading) return <div>Loading applications...</div>;

    return (
        <div style={{ position: 'relative' }}>
            <h2>Admission Management</h2>
            <p style={{ marginBottom: '2rem' }}>Review and process pending student applications.</p>

            <div className="table-container animate-fade-in">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Applicant Name</th>
                            <th>Course Applied</th>
                            <th>Previous Marks</th>
                            <th>Date Applied</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No pending applications found.</td>
                            </tr>
                        ) : (
                            applications.map(app => (
                                <tr key={app.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{app.first_name} {app.last_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DOB: {new Date(app.dob).toLocaleDateString()}</div>
                                    </td>
                                    <td>{app.course_name}</td>
                                    <td>{app.marks}%</td>
                                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${
                                            app.status === 'APPROVED' ? 'badge-success' : 
                                            app.status === 'REJECTED' ? 'badge-danger' : 
                                            app.status === 'REAPPLY' ? '' : 
                                            'badge-warning'
                                        }`} style={app.status === 'REAPPLY' ? { backgroundColor: '#f59e0b', color: 'white' } : {}}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => setSelectedApp(app)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: 'var(--text-color)' }}
                                            >
                                                <Eye size={14} /> Review
                                            </button>
                                            {app.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleDecision(app.id, 'APPROVED')}
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#10b981' }}
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleDecision(app.id, 'REAPPLY')}
                                                        className="btn"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#f59e0b', color: 'white' }}
                                                    >
                                                        <RefreshCw size={14} /> Reapply
                                                    </button>
                                                    <button
                                                        onClick={() => handleDecision(app.id, 'REJECTED')}
                                                        className="btn btn-danger"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(app.id)}
                                                className="btn btn-danger"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#ef4444', color: 'white' }}
                                                title="Delete completely"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Application Detail Modal */}
            {selectedApp && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}>

                        <button
                            onClick={() => setSelectedApp(null)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {selectedApp.first_name} {selectedApp.last_name} <span className="badge badge-warning" style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}>Pending</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Applying for: <strong>{selectedApp.course_name}</strong></p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            {/* Personal Details */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><User size={18} /> Personal Info</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {selectedApp.email || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Mobile:</span> {selectedApp.mobile_number || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>DOB:</span> {new Date(selectedApp.dob).toLocaleDateString()}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Gender:</span> {selectedApp.gender || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Nationality:</span> {selectedApp.nationality || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Category:</span> {selectedApp.category || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Address Details */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><MapPin size={18} /> Address</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div>{selectedApp.address}</div>
                                    <div>{selectedApp.city}, {selectedApp.district}</div>
                                    <div>{selectedApp.state} - {selectedApp.pin_code}</div>
                                </div>
                            </div>

                            {/* Guardian Details */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><Users size={18} /> Guardian</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> {selectedApp.guardian_name || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Relation:</span> {selectedApp.guardian_relation || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Contact:</span> {selectedApp.guardian_number || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Qualifications Details */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><GraduationCap size={18} /> Qualification</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Level:</span> {selectedApp.qualification_level || selectedApp.previous_education}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Board:</span> {selectedApp.board_university || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>School:</span> {selectedApp.school_college_name || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Passed:</span> {selectedApp.year_of_passing || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Marks:</span> <strong style={{ color: 'var(--success-color)' }}>{selectedApp.marks}%</strong></div>
                                </div>
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><Download size={18} /> Uploaded Documents</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {renderDocumentLink('Passport Photo', selectedApp.document_photo)}
                                {renderDocumentLink('10th Marksheet', selectedApp.document_10th)}
                                {renderDocumentLink('12th / Diploma', selectedApp.document_12th_diploma)}
                                {renderDocumentLink('Leaving Cert.', selectedApp.document_leaving_cert)}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>Close</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(selectedApp.id)} style={{ backgroundColor: '#ef4444' }}><Trash2 size={16} style={{ marginRight: '0.5rem' }} /> Delete</button>
                            {selectedApp.status === 'PENDING' && (
                                <>
                                    <button className="btn" onClick={() => handleDecision(selectedApp.id, 'REAPPLY')} style={{ backgroundColor: '#f59e0b', color: 'white' }}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} /> Send for Reapply</button>
                                    <button className="btn btn-danger" onClick={() => handleDecision(selectedApp.id, 'REJECTED')}><X size={16} style={{ marginRight: '0.5rem' }} /> Reject</button>
                                    <button className="btn btn-primary" onClick={() => handleDecision(selectedApp.id, 'APPROVED')} style={{ backgroundColor: '#10b981' }}><Check size={16} style={{ marginRight: '0.5rem' }} /> Approve</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Comment Modal for Reject/Reapply */}
            {showCommentModal && commentAction && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', position: 'relative', padding: '2rem' }}>
                        <button
                            onClick={() => {
                                setShowCommentModal(false);
                                setCommentAction(null);
                                setAdminComments('');
                            }}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={24} />
                            {commentAction.status === 'REJECTED' ? 'Reject Application' : 'Send for Reapply'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {commentAction.status === 'REJECTED' 
                                ? 'Provide a reason for rejection. An email will be sent to the applicant.'
                                : 'Explain what needs to be corrected. The applicant will receive an email with instructions to reapply.'}
                        </p>

                        <div className="form-group">
                            <label className="form-label">Comments / Reason *</label>
                            <textarea
                                className="form-input"
                                rows="6"
                                value={adminComments}
                                onChange={(e) => setAdminComments(e.target.value)}
                                placeholder={commentAction.status === 'REJECTED' 
                                    ? 'e.g., Marks do not meet minimum requirements...'
                                    : 'e.g., Please upload a clearer copy of your 12th marksheet...'}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => {
                                    setShowCommentModal(false);
                                    setCommentAction(null);
                                    setAdminComments('');
                                }}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn"
                                onClick={handleCommentSubmit}
                                disabled={submitting || !adminComments.trim()}
                                style={{ 
                                    backgroundColor: commentAction.status === 'REJECTED' ? '#dc2626' : '#f59e0b',
                                    color: 'white',
                                    opacity: (submitting || !adminComments.trim()) ? 0.6 : 1
                                }}
                            >
                                {submitting ? 'Processing...' : (commentAction.status === 'REJECTED' ? 'Reject & Send Email' : 'Send Reapply Request')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdmissionManagement;
