import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Mail, Briefcase, Trash2, Eye, Plus, X, User, BookOpen, MoreVertical, Calendar, Users as UsersIcon, Clock, Check, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const AdminFaculty = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'leave'
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [facultySubjects, setFacultySubjects] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [subjectForm, setSubjectForm] = useState({ subject_id: '', semester: '' });
    const [openMenuId, setOpenMenuId] = useState(null);
    const [openTableMenuId, setOpenTableMenuId] = useState(null);
    
    // Leave Management States
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [selectedLeaveApp, setSelectedLeaveApp] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewAction, setReviewAction] = useState(null);
    const [adminComments, setAdminComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile_number: '',
        gender: '',
        dob: '',
        address: '',
        department: '',
        designation: '',
        qualification: ''
    });
    const [profilePic, setProfilePic] = useState(null);

    const fetchFaculty = async () => {
        try {
            const response = await api.get('/admin/faculty');
            setFacultyList(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching faculty', error);
            setLoading(false);
        }
    };

    const fetchFacultySubjects = async (facultyId) => {
        try {
            const response = await api.get(`/admin/faculty/${facultyId}/subjects`);
            setFacultySubjects(response.data);
        } catch (error) {
            console.error('Error fetching faculty subjects', error);
        }
    };

    const fetchAvailableSubjects = async (department, semester) => {
        if (!semester) {
            setAvailableSubjects([]);
            return;
        }
        
        try {
            console.log('Fetching subjects for department:', department, 'semester:', semester);
            // Get course by department - match by name or short_code
            const coursesRes = await api.get('/admin/courses');
            console.log('All courses:', coursesRes.data);
            
            // Try to match by short_code first, then by name containing the department
            let course = coursesRes.data.find(c => c.short_code === department);
            if (!course) {
                // Try matching by name (e.g., "Mechanical Engineering" matches "ME - Mechanical Engineering")
                course = coursesRes.data.find(c => 
                    c.name && c.name.toLowerCase().includes(department.toLowerCase())
                );
            }
            console.log('Matching course:', course);
            
            if (course) {
                const subjectsRes = await api.get(`/admin/courses/${course.id}/subjects`);
                console.log('All subjects for course:', subjectsRes.data);
                // Filter subjects by semester
                const filteredSubjects = subjectsRes.data.filter(s => s.semester === parseInt(semester));
                console.log('Filtered subjects:', filteredSubjects);
                setAvailableSubjects(filteredSubjects);
            } else {
                console.log('No matching course found');
                setAvailableSubjects([]);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setAvailableSubjects([]);
        }
    };

    const handleManageSubjects = async (faculty) => {
        setSelectedFaculty(faculty);
        await fetchFacultySubjects(faculty.id);
        setShowSubjectModal(true);
    };

    const handleSemesterChange = (semester) => {
        setSubjectForm({ semester, subject_id: '' });
        fetchAvailableSubjects(selectedFaculty.department, semester);
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        
        if (!subjectForm.subject_id) {
            alert('Please select a subject');
            return;
        }
        
        try {
            await api.post(`/admin/faculty/${selectedFaculty.id}/subjects`, { subject_id: subjectForm.subject_id });
            setSubjectForm({ subject_id: '', semester: '' });
            setAvailableSubjects([]);
            await fetchFacultySubjects(selectedFaculty.id);
            alert('Subject assigned successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error assigning subject');
        }
    };

    const handleRemoveSubject = async (subjectId) => {
        if (!window.confirm('Remove this subject assignment?')) return;
        try {
            await api.delete(`/admin/faculty/subjects/${subjectId}`);
            await fetchFacultySubjects(selectedFaculty.id);
            alert('Subject assignment removed');
        } catch (error) {
            alert('Error removing subject assignment');
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });
        if (profilePic) {
            submitData.append('profile_pic', profilePic);
        }

        try {
            await api.post('/admin/faculty', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowAddModal(false);
            setFormData({
                first_name: '', last_name: '', email: '', mobile_number: '',
                gender: '', dob: '', address: '', department: '',
                designation: '', qualification: ''
            });
            setProfilePic(null);
            fetchFaculty();
            alert('Faculty member added successfully. Setup email sent!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding faculty member');
        }
    };

    const handleFileChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this faculty member? This removes their login access and profile.")) return;

        try {
            await api.delete(`/admin/faculty/${id}`);
            if (selectedFaculty && selectedFaculty.id === id) setSelectedFaculty(null);
            fetchFaculty();
            alert('Faculty member deleted.');
        } catch (error) {
            alert('Error deleting faculty member.');
        }
    };

    if (loading) return <div>Loading faculty...</div>;

    return (
        <>
            <div className="animate-fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.5rem' }}>Faculty Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage all teaching staff and their leave applications</p>
                </div>

                {/* Tabs */}
                <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginBottom: '2rem',
                    borderBottom: '2px solid rgba(255,255,255,0.1)'
                }}>
                    <button
                        onClick={() => setActiveTab('list')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'list' ? '3px solid var(--primary-color)' : '3px solid transparent',
                            color: activeTab === 'list' ? 'var(--primary-color)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'list' ? '600' : '400',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <UsersIcon size={20} />
                        Faculty List
                    </button>
                    <button
                        onClick={() => setActiveTab('leave')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'leave' ? '3px solid var(--primary-color)' : '3px solid transparent',
                            color: activeTab === 'leave' ? 'var(--primary-color)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'leave' ? '600' : '400',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Calendar size={20} />
                        Leave Applications
                    </button>
                </div>

                {/* Faculty List Tab */}
                {activeTab === 'list' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowAddModal(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={18} /> Add Faculty
                            </button>
                        </div>

                        <div className="table-container animate-fade-in">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facultyList.length === 0 ? (
                                        <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        No faculty members found.
                                    </td>
                                </tr>
                            ) : (
                                facultyList.map(fac => (
                                    <tr key={fac.id}>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                {fac.employee_id}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>
                                            {fac.first_name} {fac.last_name}
                                        </td>
                                        <td>{fac.department}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                <Mail size={14} /> {fac.email}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
                                                <button
                                                    onClick={() => setSelectedFaculty(fac)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: 'var(--text-color)' }}
                                                >
                                                    <Eye size={14} /> View
                                                </button>
                                                <button
                                                    onClick={() => handleManageSubjects(fac)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#dbeafe', color: '#1e40af' }}
                                                    title="Manage Subjects"
                                                >
                                                    <BookOpen size={14} /> Subjects
                                                </button>
                                                <div style={{ position: 'relative' }}>
                                                    <button
                                                        onClick={() => setOpenTableMenuId(openTableMenuId === fac.id ? null : fac.id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {openTableMenuId === fac.id && (
                                                        <div style={{ position: 'absolute', right: 0, top: '100%', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '140px', marginTop: '0.25rem' }}>
                                                            <button
                                                                onClick={() => {
                                                                    setOpenTableMenuId(null);
                                                                    handleDelete(fac.id);
                                                                }}
                                                                style={{ width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.875rem', textAlign: 'left' }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                </div>
                )}

                {/* Leave Management Tab */}
                {activeTab === 'leave' && (
                    <LeaveManagementTab />
                )}
            </div>

            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}>
                        <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add New Faculty</h2>

                        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input type="text" className="form-input" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input type="text" className="form-input" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Email (Login ID)</label>
                                    <input type="email" className="form-input" name="email" value={formData.email} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mobile Number</label>
                                    <input type="text" className="form-input" name="mobile_number" value={formData.mobile_number} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select className="form-input" name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <input type="date" className="form-input" name="dob" value={formData.dob} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea className="form-input" name="address" value={formData.address} onChange={handleInputChange} rows="2"></textarea>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <input type="text" className="form-input" name="department" value={formData.department} onChange={handleInputChange} required placeholder="e.g. CS" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Designation</label>
                                    <input type="text" className="form-input" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="e.g. Professor" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Qualification</label>
                                    <input type="text" className="form-input" name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="e.g. Ph.D" />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Profile Picture (Optional)</label>
                                <input type="file" className="form-input" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Subjects Modal */}
            {showSubjectModal && selectedFaculty && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', position: 'relative', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => { setShowSubjectModal(false); setSelectedFaculty(null); setSubjectForm({ subject_id: '', semester: '' }); setAvailableSubjects([]); setOpenMenuId(null); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={24} /> Manage Subject Assignments
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                            {selectedFaculty.first_name} {selectedFaculty.last_name} - {selectedFaculty.employee_id}
                        </p>

                        {/* Add New Subject Assignment */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Assign Subject</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Department: <strong>{selectedFaculty.department}</strong>
                            </p>
                            <form onSubmit={handleAddSubject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label className="form-label">Semester</label>
                                        <select 
                                            className="form-input" 
                                            value={subjectForm.semester} 
                                            onChange={(e) => handleSemesterChange(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Semester</option>
                                            {[1, 2, 3, 4, 5, 6].map(sem => (
                                                <option key={sem} value={sem}>Semester {sem}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label className="form-label">Subject</label>
                                        <select 
                                            className="form-input" 
                                            value={subjectForm.subject_id} 
                                            onChange={(e) => setSubjectForm({ ...subjectForm, subject_id: e.target.value })}
                                            required
                                            disabled={!subjectForm.semester}
                                        >
                                            <option value="">
                                                {!subjectForm.semester ? 'Select semester first' : 'Select Subject'}
                                            </option>
                                            {availableSubjects.map(subject => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.code} - {subject.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                        <Plus size={16} /> Assign
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Current Assignments */}
                        <div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Assigned Subjects</h3>
                            {facultySubjects.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    No subjects assigned yet. Assign one above.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                                    {facultySubjects.map(sub => (
                                        <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                    {sub.code} - {sub.name}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    Semester {sub.semester}
                                                </div>
                                            </div>
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === sub.id ? null : sub.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {openMenuId === sub.id && (
                                                    <div style={{ position: 'absolute', right: 0, top: '100%', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '120px', marginTop: '0.25rem' }}>
                                                        <button
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                handleRemoveSubject(sub.id);
                                                            }}
                                                            style={{ width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.875rem', textAlign: 'left' }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                        >
                                                            <Trash2 size={14} /> Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                            <button className="btn btn-secondary" onClick={() => { setShowSubjectModal(false); setSelectedFaculty(null); setSubjectForm({ subject_id: '', semester: '' }); setAvailableSubjects([]); setOpenMenuId(null); }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedFaculty && !showSubjectModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', position: 'relative', padding: '2.5rem' }}>
                        <button onClick={() => setSelectedFaculty(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: '64px', height: '64px', backgroundColor: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#64748b', overflow: 'hidden' }}>
                                {selectedFaculty.profile_pic ? (
                                    <img src={`http://localhost:5000/uploads/${selectedFaculty.profile_pic}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={32} />
                                )}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{selectedFaculty.first_name} {selectedFaculty.last_name}</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{selectedFaculty.designation || 'Faculty Member'}</p>
                            <span className="badge badge-success" style={{ display: 'inline-block' }}>{selectedFaculty.employee_id}</span>
                        </div>

                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '50vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Briefcase size={18} style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department</div>
                                    <div style={{ fontWeight: 500 }}>{selectedFaculty.department}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Mail size={18} style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Access Email</div>
                                    <div style={{ fontWeight: 500 }}>{selectedFaculty.email}</div>
                                </div>
                            </div>
                            {selectedFaculty.mobile_number && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '18px', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>M</div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile Number</div>
                                        <div style={{ fontWeight: 500 }}>{selectedFaculty.mobile_number}</div>
                                    </div>
                                </div>
                            )}

                            {selectedFaculty.qualification && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '18px', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>Q</div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qualification</div>
                                        <div style={{ fontWeight: 500 }}>{selectedFaculty.qualification}</div>
                                    </div>
                                </div>
                            )}

                            {selectedFaculty.address && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '18px', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>A</div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address</div>
                                        <div style={{ fontWeight: 500 }}>{selectedFaculty.address}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedFaculty(null)} style={{ width: '100%' }}>Close Profile</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Leave Management Tab Component
const LeaveManagementTab = () => {
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
            APPROVED: { bg: '#dcfce7', color: '#16a34a', icon: <Calendar size={14} /> },
            REJECTED: { bg: '#fee2e2', color: '#dc2626', icon: <X size={14} /> }
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
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading leave applications...</div>
            </div>
        );
    }

    return (
        <>
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

            {/* View Details Modal - Simplified version */}
            {selectedApp && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', position: 'relative', padding: '2rem' }}>
                        <button
                            onClick={() => setSelectedApp(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{ marginBottom: '1.5rem' }}>Leave Application Details</h3>

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Faculty</div>
                                <div style={{ fontWeight: 600 }}>{selectedApp.faculty_name}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Leave Type</div>
                                    <div style={{ fontWeight: 600 }}>{selectedApp.leave_type}</div>
                                </div>

                                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Days</div>
                                    <div style={{ fontWeight: 600 }}>{selectedApp.total_days} days</div>
                                </div>
                            </div>

                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Reason</div>
                                <div>{selectedApp.reason}</div>
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
                            {reviewAction.status === 'APPROVED' ? 'Approve Leave' : 'Reject Leave'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {reviewAction.status === 'APPROVED' 
                                ? 'Add comments (optional)'
                                : 'Provide reason for rejection'}
                        </p>

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
                                {submitting ? 'Processing...' : (reviewAction.status === 'APPROVED' ? 'Approve' : 'Reject')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminFaculty;
