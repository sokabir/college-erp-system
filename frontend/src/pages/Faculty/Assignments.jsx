import { useState, useEffect } from 'react';
import api, { getFileUrl } from '../../services/api';
import { Plus, Calendar, BookOpen, Edit2, Trash2, X, Clock, Upload, FileText, Download, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const FacultyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentAssignment, setCurrentAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [formData, setFormData] = useState({
        subject_id: '',
        title: '',
        description: '',
        due_date: '',
        max_marks: 100
    });

    useEffect(() => {
        fetchAssignments();
        fetchSubjects();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/faculty/assignments');
            setAssignments(res.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/faculty/dashboard');
            setSubjects(res.data.subjects);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('subject_id', formData.subject_id);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('due_date', formData.due_date);
            formDataToSend.append('max_marks', formData.max_marks);
            
            if (selectedFile) {
                formDataToSend.append('file', selectedFile);
            }
            
            if (editingAssignment) {
                await api.put(`/faculty/assignments/${editingAssignment.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Assignment updated successfully');
            } else {
                await api.post('/faculty/assignments', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Assignment created successfully');
            }
            
            setShowModal(false);
            setEditingAssignment(null);
            setSelectedFile(null);
            setFormData({ subject_id: '', title: '', description: '', due_date: '', max_marks: 100 });
            fetchAssignments();
        } catch (error) {
            alert('Error saving assignment');
            console.error(error);
        }
    };

    const handleEdit = (assignment) => {
        setEditingAssignment(assignment);
        setFormData({
            subject_id: assignment.subject_id || subjects.find(s => s.code === assignment.subject_code)?.id || '',
            title: assignment.title,
            description: assignment.description || '',
            due_date: assignment.due_date.split('T')[0],
            max_marks: assignment.max_marks
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        
        try {
            await api.delete(`/faculty/assignments/${id}`);
            alert('Assignment deleted successfully');
            fetchAssignments();
        } catch (error) {
            alert('Error deleting assignment');
            console.error(error);
        }
    };

    const openCreateModal = () => {
        setEditingAssignment(null);
        setSelectedFile(null);
        setFormData({ subject_id: '', title: '', description: '', due_date: '', max_marks: 100 });
        setShowModal(true);
    };

    const openSubmissionsModal = async (assignment) => {
        setCurrentAssignment(assignment);
        setShowSubmissionsModal(true);
        try {
            const res = await api.get(`/faculty/assignments/${assignment.id}/submissions`);
            setSubmissions(res.data.submissions);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            alert('Error loading submissions');
        }
    };

    const handleSubmissionToggle = async (studentId, currentStatus) => {
        const newStatus = currentStatus === 'SUBMITTED' ? 'NOT_SUBMITTED' : 'SUBMITTED';
        // Format date as YYYY-MM-DD for MySQL DATE column
        const today = new Date();
        const submitted_date = newStatus === 'SUBMITTED' 
            ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            : null;
        
        try {
            await api.post(`/faculty/assignments/${currentAssignment.id}/submissions`, {
                student_id: studentId,
                status: newStatus,
                submitted_date: submitted_date,
                marks_obtained: null,
                remarks: null
            });
            
            // Update local state
            setSubmissions(submissions.map(sub => 
                sub.id === studentId 
                    ? { ...sub, status: newStatus, submitted_date: submitted_date }
                    : sub
            ));
        } catch (error) {
            console.error('Error updating submission:', error);
            alert('Error updating submission status');
        }
    };

    const handleMarkSubmission = async (studentId, marks, remarks) => {
        try {
            const submission = submissions.find(s => s.id === studentId);
            
            // Convert marks to number or null
            const marksValue = marks === '' || marks === null ? null : parseFloat(marks);
            
            // Ensure submitted_date is in YYYY-MM-DD format
            let submittedDate = submission.submitted_date;
            if (submittedDate && submittedDate.includes('T')) {
                // Convert ISO format to YYYY-MM-DD
                submittedDate = submittedDate.split('T')[0];
            }
            
            await api.post(`/faculty/assignments/${currentAssignment.id}/submissions`, {
                student_id: studentId,
                status: submission.status,
                submitted_date: submittedDate,
                marks_obtained: marksValue,
                remarks: remarks
            });
            
            // Update local state
            setSubmissions(submissions.map(sub => 
                sub.id === studentId 
                    ? { ...sub, marks_obtained: marksValue, remarks: remarks }
                    : sub
            ));
            
            alert('Marks updated successfully');
        } catch (error) {
            console.error('Error updating marks:', error);
            alert('Error updating marks');
        }
    };

    const getSubmissionStats = () => {
        const submitted = submissions.filter(s => s.status === 'SUBMITTED').length;
        const notSubmitted = submissions.filter(s => s.status === 'NOT_SUBMITTED').length;
        const late = submissions.filter(s => {
            if (s.status === 'SUBMITTED' && s.submitted_date && currentAssignment) {
                return new Date(s.submitted_date) > new Date(currentAssignment.due_date);
            }
            return false;
        }).length;
        
        return { submitted, notSubmitted, late, total: submissions.length };
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    const getDaysRemaining = (dueDate) => {
        const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    // Group assignments by status
    const upcomingAssignments = assignments.filter(a => !isOverdue(a.due_date));
    const overdueAssignments = assignments.filter(a => isOverdue(a.due_date));

    if (loading) {
        return <div>Loading assignments...</div>;
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Assignments</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Create and manage assignments for your subjects
                    </p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Create Assignment
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary-color)', borderRadius: '12px', display: 'flex' }}>
                            <BookOpen size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Assignments</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{assignments.length}</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: '#10b981', borderRadius: '12px', display: 'flex' }}>
                            <Clock size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Upcoming</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{upcomingAssignments.length}</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: '#ef4444', borderRadius: '12px', display: 'flex' }}>
                            <Calendar size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Overdue</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{overdueAssignments.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Assignments */}
            {upcomingAssignments.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Upcoming Assignments</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {upcomingAssignments.map(assignment => {
                            const daysRemaining = getDaysRemaining(assignment.due_date);
                            return (
                                <div key={assignment.id} className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #10b981' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{assignment.title}</h4>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                {assignment.subject_name} ({assignment.subject_code})
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {assignment.course_name} • Sem {assignment.semester}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={() => openSubmissionsModal(assignment)} 
                                                className="btn btn-primary" 
                                                style={{ padding: '0.5rem', minWidth: 'auto' }}
                                                title="Track Submissions"
                                            >
                                                <Users size={16} />
                                            </button>
                                            <button onClick={() => handleEdit(assignment)} className="btn btn-secondary" style={{ padding: '0.5rem', minWidth: 'auto' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(assignment.id)} className="btn btn-danger" style={{ padding: '0.5rem', minWidth: 'auto' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {assignment.description && (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                                            {assignment.description}
                                        </p>
                                    )}

                                    {assignment.file_path && (
                                        <a 
                                            href={getFileUrl(assignment.file_path)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '0.5rem', 
                                                fontSize: '0.875rem', 
                                                color: 'var(--primary-color)', 
                                                textDecoration: 'none',
                                                marginBottom: '1rem',
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#dbeafe',
                                                borderRadius: '6px'
                                            }}
                                        >
                                            <Download size={16} />
                                            Download Assignment PDF
                                        </a>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Due Date</div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                {new Date(assignment.due_date).toLocaleDateString('en-IN')}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="badge" style={{ 
                                                backgroundColor: daysRemaining <= 3 ? '#fef3c7' : '#dcfce7',
                                                color: daysRemaining <= 3 ? '#ca8a04' : '#16a34a'
                                            }}>
                                                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                                            </span>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Max Marks</div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{assignment.max_marks}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Overdue Assignments */}
            {overdueAssignments.length > 0 && (
                <div>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#ef4444' }}>Overdue Assignments</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {overdueAssignments.map(assignment => (
                            <div key={assignment.id} className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #ef4444' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{assignment.title}</h4>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                            {assignment.subject_name} ({assignment.subject_code})
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {assignment.course_name} • Sem {assignment.semester}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            onClick={() => openSubmissionsModal(assignment)} 
                                            className="btn btn-primary" 
                                            style={{ padding: '0.5rem', minWidth: 'auto' }}
                                            title="Track Submissions"
                                        >
                                            <Users size={16} />
                                        </button>
                                        <button onClick={() => handleEdit(assignment)} className="btn btn-secondary" style={{ padding: '0.5rem', minWidth: 'auto' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(assignment.id)} className="btn btn-danger" style={{ padding: '0.5rem', minWidth: 'auto' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {assignment.description && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                                        {assignment.description}
                                    </p>
                                )}

                                {assignment.file_path && (
                                    <a 
                                        href={getFileUrl(assignment.file_path)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem', 
                                            fontSize: '0.875rem', 
                                            color: 'var(--primary-color)', 
                                            textDecoration: 'none',
                                            marginBottom: '1rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#dbeafe',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        <Download size={16} />
                                        Download Assignment PDF
                                    </a>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Due Date</div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#ef4444' }}>
                                            {new Date(assignment.due_date).toLocaleDateString('en-IN')}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                            Overdue
                                        </span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Max Marks</div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{assignment.max_marks}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {assignments.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No assignments created yet</p>
                    <button onClick={openCreateModal} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Create Your First Assignment
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>

                        <h3 style={{ marginBottom: '1.5rem' }}>{editingAssignment ? 'Edit Assignment' : 'Create Assignment'}</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Subject *</label>
                                <select
                                    className="form-input"
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                    required
                                    disabled={editingAssignment}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name} ({subject.code}) - Sem {subject.semester}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Data Structures Assignment 1"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    placeholder="Assignment details and instructions..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="4"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Upload size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Upload PDF (Optional)
                                </label>
                                <input
                                    type="file"
                                    className="form-input"
                                    accept=".pdf"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    style={{ padding: '0.5rem' }}
                                />
                                {selectedFile && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        Selected: {selectedFile.name}
                                    </div>
                                )}
                                {editingAssignment && editingAssignment.file_path && !selectedFile && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--success-color)' }}>
                                        <FileText size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                        Current file attached
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Due Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Max Marks *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.max_marks}
                                        onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingAssignment ? 'Update' : 'Create'} Assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Submissions Tracking Modal */}
            {showSubmissionsModal && currentAssignment && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto', padding: '2rem', position: 'relative' }}>
                        <button onClick={() => setShowSubmissionsModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>

                        <h3 style={{ marginBottom: '0.5rem' }}>Track Submissions</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            {currentAssignment.title} • {currentAssignment.subject_name}
                        </p>

                        {/* Stats */}
                        {submissions.length > 0 && (() => {
                            const stats = getSubmissionStats();
                            return (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.25rem' }}>Submitted</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#166534' }}>
                                            {stats.submitted}/{stats.total}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.25rem' }}>Not Submitted</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#991b1b' }}>
                                            {stats.notSubmitted}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.25rem' }}>Late Submission</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#92400e' }}>
                                            {stats.late}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.25rem' }}>Submission Rate</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e40af' }}>
                                            {stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Student List */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Enrollment</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Student Name</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>Submitted Date</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(student => {
                                        const isLate = student.status === 'SUBMITTED' && student.submitted_date && 
                                                      new Date(student.submitted_date) > new Date(currentAssignment.due_date);
                                        
                                        return (
                                            <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{student.enrollment_number}</td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                                    {student.first_name} {student.last_name}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => handleSubmissionToggle(student.id, student.status)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '500',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            backgroundColor: student.status === 'SUBMITTED' ? '#dcfce7' : '#fee2e2',
                                                            color: student.status === 'SUBMITTED' ? '#166534' : '#991b1b'
                                                        }}
                                                    >
                                                        {student.status === 'SUBMITTED' ? (
                                                            <><CheckCircle size={16} /> Submitted</>
                                                        ) : (
                                                            <><XCircle size={16} /> Not Submitted</>
                                                        )}
                                                    </button>
                                                    {isLate && (
                                                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#ca8a04' }}>
                                                            <AlertCircle size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                                            Late
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem' }}>
                                                    {student.submitted_date ? new Date(student.submitted_date).toLocaleDateString('en-IN') : '-'}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    {student.status === 'SUBMITTED' ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={currentAssignment.max_marks}
                                                            value={student.marks_obtained || ''}
                                                            onChange={(e) => {
                                                                const marks = e.target.value;
                                                                // Only update local state, don't save yet
                                                                if (marks === '' || (marks >= 0 && marks <= currentAssignment.max_marks)) {
                                                                    setSubmissions(submissions.map(sub => 
                                                                        sub.id === student.id 
                                                                            ? { ...sub, marks_obtained: marks }
                                                                            : sub
                                                                    ));
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                // Save when user clicks away
                                                                const marks = e.target.value;
                                                                if (marks !== '' && marks !== null) {
                                                                    handleMarkSubmission(student.id, marks, student.remarks);
                                                                }
                                                            }}
                                                            onKeyPress={(e) => {
                                                                // Save when user presses Enter
                                                                if (e.key === 'Enter') {
                                                                    const marks = e.target.value;
                                                                    if (marks !== '' && marks !== null) {
                                                                        handleMarkSubmission(student.id, marks, student.remarks);
                                                                        e.target.blur(); // Remove focus
                                                                    }
                                                                }
                                                            }}
                                                            placeholder={`/${currentAssignment.max_marks}`}
                                                            style={{
                                                                width: '80px',
                                                                padding: '0.5rem',
                                                                borderRadius: '6px',
                                                                border: '1px solid var(--border-color)',
                                                                fontSize: '0.875rem',
                                                                textAlign: 'center'
                                                            }}
                                                        />
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {submissions.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <p>No students enrolled in this subject</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyAssignments;
