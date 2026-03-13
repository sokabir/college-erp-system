import { useState, useEffect } from 'react';
import api, { getFileUrl } from '../../services/api';
import { Calendar, Clock, FileText, Download, CheckCircle, XCircle, AlertCircle, Eye, X } from 'lucide-react';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/student/assignments');
            setAssignments(res.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (assignment) => {
        const dueDate = new Date(assignment.due_date);
        const today = new Date();
        const isOverdue = dueDate < today;
        
        if (assignment.submission_status === 'SUBMITTED') {
            return (
                <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    backgroundColor: '#d1fae5', 
                    color: '#065f46',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                }}>
                    <CheckCircle size={14} />
                    Submitted
                </span>
            );
        } else if (isOverdue) {
            return (
                <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    backgroundColor: '#fee2e2', 
                    color: '#991b1b',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                }}>
                    <XCircle size={14} />
                    Overdue
                </span>
            );
        } else {
            return (
                <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    backgroundColor: '#fef3c7', 
                    color: '#92400e',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                }}>
                    <AlertCircle size={14} />
                    Pending
                </span>
            );
        }
    };

    const getDaysRemaining = (dueDate) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `${Math.abs(diffDays)} days overdue`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return '1 day remaining';
        } else {
            return `${diffDays} days remaining`;
        }
    };

    if (loading) {
        return <div className="animate-fade-in">Loading assignments...</div>;
    }

    // Group assignments by status
    const upcoming = assignments.filter(a => {
        const dueDate = new Date(a.due_date);
        return dueDate >= new Date() && a.submission_status !== 'SUBMITTED';
    });
    
    const overdue = assignments.filter(a => {
        const dueDate = new Date(a.due_date);
        return dueDate < new Date() && a.submission_status !== 'SUBMITTED';
    });
    
    const submitted = assignments.filter(a => a.submission_status === 'SUBMITTED');

    const AssignmentCard = ({ assignment, showViewButton = true }) => (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>{assignment.title}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#999', fontSize: '0.875rem' }}>
                        {assignment.subject_name} ({assignment.subject_code})
                    </p>
                </div>
                {getStatusBadge(assignment)}
            </div>

            {assignment.description && (
                <p style={{ margin: '0 0 1rem 0', color: '#ccc', lineHeight: '1.6' }}>
                    {assignment.description.length > 100 && showViewButton
                        ? `${assignment.description.substring(0, 100)}...` 
                        : assignment.description}
                </p>
            )}

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
            }}>
                <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#999' }}>Due Date</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <Calendar size={14} />
                        <span style={{ fontWeight: '500' }}>{new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#999' }}>Time Left</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <Clock size={14} />
                        <span style={{ fontWeight: '500' }}>{getDaysRemaining(assignment.due_date)}</span>
                    </div>
                </div>
                <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#999' }}>Max Marks</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <FileText size={14} />
                        <span style={{ fontWeight: '500' }}>{assignment.max_marks}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {showViewButton && (
                    <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Eye size={16} />
                        View Details
                    </button>
                )}
                {assignment.file_path && (
                    <a 
                        href={getFileUrl(assignment.file_path)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                    >
                        <Download size={16} />
                        Download File
                    </a>
                )}
            </div>

            {assignment.submission_status === 'SUBMITTED' && (
                <div style={{ 
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '0.5rem',
                    borderLeft: '3px solid #10b981'
                }}>
                    {assignment.marks_obtained !== null && (
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', fontSize: '1rem' }}>
                            Marks: {assignment.marks_obtained} / {assignment.max_marks}
                        </p>
                    )}
                    {assignment.submitted_date && (
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#ccc' }}>
                            Submitted on: {new Date(assignment.submitted_date).toLocaleDateString()}
                        </p>
                    )}
                    {assignment.remarks && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#ccc' }}>
                            Remarks: {assignment.remarks}
                        </p>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0' }}>My Assignments</h2>
                <p style={{ color: '#999', margin: 0 }}>
                    View all your assignments and submission status
                </p>
            </div>

            {/* Summary Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#999' }}>Total Assignments</p>
                    <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '600' }}>{assignments.length}</h3>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#999' }}>Submitted</p>
                    <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '600', color: '#10b981' }}>{submitted.length}</h3>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#999' }}>Pending</p>
                    <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '600', color: '#f59e0b' }}>{upcoming.length}</h3>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#999' }}>Overdue</p>
                    <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '600', color: '#ef4444' }}>{overdue.length}</h3>
                </div>
            </div>

            {/* Upcoming Assignments */}
            {upcoming.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Upcoming Assignments</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {upcoming.map(assignment => (
                            <AssignmentCard key={assignment.id} assignment={assignment} />
                        ))}
                    </div>
                </div>
            )}

            {/* Overdue Assignments */}
            {overdue.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#ef4444' }}>Overdue Assignments</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {overdue.map(assignment => (
                            <div key={assignment.id} style={{ borderLeft: '4px solid #ef4444' }}>
                                <AssignmentCard assignment={assignment} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Submitted Assignments */}
            {submitted.length > 0 && (
                <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Submitted Assignments</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {submitted.map(assignment => (
                            <AssignmentCard key={assignment.id} assignment={assignment} />
                        ))}
                    </div>
                </div>
            )}

            {assignments.length === 0 && (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <FileText size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p style={{ color: '#999', fontSize: '1.125rem' }}>No assignments yet</p>
                </div>
            )}

            {/* Assignment Detail Modal */}
            {selectedAssignment && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.7)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 1000,
                    padding: '2rem',
                    overflowY: 'auto'
                }}>
                    <div className="glass-card animate-fade-in" style={{ 
                        width: '100%', 
                        maxWidth: '800px', 
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative', 
                        padding: '2rem' 
                    }}>
                        <button 
                            onClick={() => setSelectedAssignment(null)} 
                            style={{ 
                                position: 'absolute', 
                                top: '1.5rem', 
                                right: '1.5rem', 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                color: '#999',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '0.5rem', paddingRight: '3rem' }}>
                            {selectedAssignment.title}
                        </h2>
                        <p style={{ color: '#999', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {selectedAssignment.subject_name} ({selectedAssignment.subject_code})
                        </p>

                        {getStatusBadge(selectedAssignment)}

                        <div style={{ 
                            marginTop: '1.5rem',
                            padding: '1.5rem',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#3b82f6', fontWeight: '600' }}>Description</h3>
                            <p style={{ margin: 0, lineHeight: '1.8', color: '#000000', fontSize: '0.95rem' }}>
                                {selectedAssignment.description || 'No description provided'}
                            </p>
                        </div>

                        <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginTop: '1.5rem'
                        }}>
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#999', textTransform: 'uppercase' }}>Due Date</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={18} color="#3b82f6" />
                                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                                        {new Date(selectedAssignment.due_date).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.5rem' }}>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#999', textTransform: 'uppercase' }}>Time Remaining</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={18} color="#8b5cf6" />
                                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                                        {getDaysRemaining(selectedAssignment.due_date)}
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#999', textTransform: 'uppercase' }}>Maximum Marks</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={18} color="#10b981" />
                                    <span style={{ fontWeight: '600', fontSize: '1.5rem' }}>
                                        {selectedAssignment.max_marks}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {selectedAssignment.submission_status === 'SUBMITTED' && (
                            <div style={{ 
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '0.75rem',
                                borderLeft: '4px solid #10b981'
                            }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#10b981' }}>Submission Details</h3>
                                {selectedAssignment.marks_obtained !== null && (
                                    <p style={{ margin: '0 0 0.75rem 0', fontWeight: '600', fontSize: '1.25rem' }}>
                                        Marks Obtained: {selectedAssignment.marks_obtained} / {selectedAssignment.max_marks}
                                    </p>
                                )}
                                {selectedAssignment.submitted_date && (
                                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#ccc' }}>
                                        Submitted on: {new Date(selectedAssignment.submitted_date).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                )}
                                {selectedAssignment.remarks && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>Faculty Remarks:</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#ccc', lineHeight: '1.6' }}>
                                            {selectedAssignment.remarks}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ 
                            marginTop: '2rem', 
                            paddingTop: '1.5rem', 
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'flex-end'
                        }}>
                            {selectedAssignment.file_path && (
                                <a 
                                    href={getFileUrl(selectedAssignment.file_path)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                                >
                                    <Download size={18} />
                                    Download Assignment File
                                </a>
                            )}
                            <button 
                                onClick={() => setSelectedAssignment(null)}
                                className="btn btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAssignments;
