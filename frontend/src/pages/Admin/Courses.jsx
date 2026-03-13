import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, BookOpen, Users, Clock, DollarSign, Trash2, X, List, Edit } from 'lucide-react';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSubjectsModal, setShowSubjectsModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        short_code: '',
        description: '',
        duration_years: '3',
        total_fees: ''
    });
    const [subjectFormData, setSubjectFormData] = useState({
        name: '',
        code: '',
        semester: '1'
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses');
            // Filter out courses without short_code (old B.Tech, MBA)
            setCourses(res.data.filter(c => c.short_code));
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/courses', formData);
            alert('Course added successfully!');
            setShowAddModal(false);
            setFormData({ name: '', short_code: '', description: '', duration_years: '3', total_fees: '' });
            fetchCourses();
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding course');
        }
    };

    const handleDeleteCourse = async (id, name) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            await api.delete(`/admin/courses/${id}`);
            alert('Course deleted successfully!');
            fetchCourses();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting course');
        }
    };

    const handleViewSubjects = async (course) => {
        setSelectedCourse(course);
        setShowSubjectsModal(true);
        try {
            const res = await api.get(`/admin/courses/${course.id}/subjects`);
            setSubjects(res.data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/courses/${selectedCourse.id}/subjects`, subjectFormData);
            alert('Subject added successfully!');
            setSubjectFormData({ name: '', code: '', semester: '1' });
            // Refresh subjects
            const res = await api.get(`/admin/courses/${selectedCourse.id}/subjects`);
            setSubjects(res.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding subject');
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;
        try {
            await api.delete(`/admin/subjects/${subjectId}`);
            alert('Subject deleted successfully!');
            // Refresh subjects
            const res = await api.get(`/admin/courses/${selectedCourse.id}/subjects`);
            setSubjects(res.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting subject');
        }
    };

    const getDepartmentColor = (shortCode) => {
        const colors = {
            'CM': { bg: '#dbeafe', icon: '#3b82f6', text: '#1e3a8a' },
            'CE': { bg: '#fed7aa', icon: '#f97316', text: '#9a3412' },
            'EE': { bg: '#fef08a', icon: '#eab308', text: '#713f12' },
            'ME': { bg: '#bbf7d0', icon: '#10b981', text: '#064e3b' }
        };
        return colors[shortCode] || { bg: '#f3f4f6', icon: '#6b7280', text: '#374151' };
    };

    if (loading) return <div>Loading courses...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Course Management</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage departments and course offerings</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Add New Course
                </button>
            </div>

            {/* Courses Grid */}
            {courses.length > 0 ? (
                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {courses.map((course) => {
                        const colors = getDepartmentColor(course.short_code);
                        return (
                            <div key={course.id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                                {/* Header */}
                                <div style={{ 
                                    backgroundColor: colors.bg, 
                                    padding: '1.5rem',
                                    borderBottom: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div style={{
                                            backgroundColor: 'white',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            color: colors.icon,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }}>
                                            <BookOpen size={24} />
                                        </div>
                                        <span style={{
                                            fontSize: '2rem',
                                            fontWeight: 'bold',
                                            color: colors.text,
                                            letterSpacing: '0.05em'
                                        }}>
                                            {course.short_code}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text, margin: 0 }}>
                                        {course.name}
                                    </h3>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '1.5rem' }}>
                                    <p style={{ 
                                        color: 'var(--text-muted)', 
                                        fontSize: '0.875rem', 
                                        marginBottom: '1.5rem',
                                        minHeight: '40px',
                                        lineHeight: '1.5'
                                    }}>
                                        {course.description}
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                backgroundColor: '#f8fafc',
                                                padding: '0.5rem',
                                                borderRadius: '6px',
                                                color: colors.icon
                                            }}>
                                                <Clock size={16} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{course.duration_years} Years</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                backgroundColor: '#f8fafc',
                                                padding: '0.5rem',
                                                borderRadius: '6px',
                                                color: colors.icon
                                            }}>
                                                <DollarSign size={16} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Fees</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                    ₹{parseFloat(course.total_fees).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                backgroundColor: '#f8fafc',
                                                padding: '0.5rem',
                                                borderRadius: '6px',
                                                color: colors.icon
                                            }}>
                                                <Users size={16} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enrolled</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                    {course.student_count || 0} Students
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleViewSubjects(course)}
                                            className="btn btn-secondary"
                                            style={{ 
                                                flex: 1,
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '0.5rem',
                                                padding: '0.625rem',
                                                fontSize: '0.875rem',
                                                backgroundColor: '#f1f5f9',
                                                color: 'var(--text-color)'
                                            }}
                                        >
                                            <List size={16} />
                                            Subjects
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id, course.name)}
                                            className="btn btn-danger"
                                            style={{ 
                                                flex: 1,
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '0.5rem',
                                                padding: '0.625rem',
                                                fontSize: '0.875rem',
                                                backgroundColor: '#ef4444'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{
                        backgroundColor: '#f3f4f6',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <BookOpen size={40} style={{ color: '#9ca3af' }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        No Courses Found
                    </h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Get started by adding your first course
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} />
                        Add Course
                    </button>
                </div>
            )}

            {/* Add Course Modal */}
            {showAddModal && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 1000, 
                    padding: '2rem' 
                }}>
                    <div className="glass-card animate-fade-in" style={{ 
                        width: '100%', 
                        maxWidth: '500px', 
                        maxHeight: '90vh', 
                        overflowY: 'auto', 
                        position: 'relative', 
                        padding: '2rem' 
                    }}>
                        <button
                            onClick={() => setShowAddModal(false)}
                            style={{ 
                                position: 'absolute', 
                                top: '1.5rem', 
                                right: '1.5rem', 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                color: 'var(--text-muted)' 
                            }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '1.5rem' }}>Add New Course</h2>
                        
                        <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Course Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Computer Technology"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Short Code * (2 letters)</label>
                                <input
                                    type="text"
                                    required
                                    maxLength="2"
                                    className="form-input"
                                    value={formData.short_code}
                                    onChange={(e) => setFormData({ ...formData, short_code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., CM"
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <textarea
                                    required
                                    className="form-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    placeholder="Brief description of the course"
                                />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Duration (Years) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="6"
                                        className="form-input"
                                        value={formData.duration_years}
                                        onChange={(e) => setFormData({ ...formData, duration_years: e.target.value })}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Total Fees (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="form-input"
                                        value={formData.total_fees}
                                        onChange={(e) => setFormData({ ...formData, total_fees: e.target.value })}
                                        placeholder="150000"
                                    />
                                </div>
                            </div>
                            
                            <div style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                justifyContent: 'flex-end', 
                                paddingTop: '1rem', 
                                borderTop: '1px solid var(--border-color)',
                                marginTop: '0.5rem'
                            }}>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Subjects Modal */}
            {showSubjectsModal && selectedCourse && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 1000, 
                    padding: '2rem' 
                }}>
                    <div className="glass-card animate-fade-in" style={{ 
                        width: '100%', 
                        maxWidth: '700px', 
                        maxHeight: '90vh', 
                        overflowY: 'auto', 
                        position: 'relative', 
                        padding: '2rem' 
                    }}>
                        <button
                            onClick={() => {
                                setShowSubjectsModal(false);
                                setSelectedCourse(null);
                                setSubjects([]);
                            }}
                            style={{ 
                                position: 'absolute', 
                                top: '1.5rem', 
                                right: '1.5rem', 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                color: 'var(--text-muted)' 
                            }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '0.5rem' }}>
                            Subjects - {selectedCourse.name} ({selectedCourse.short_code})
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Manage subjects for this course
                        </p>

                        {/* Add Subject Form */}
                        <div style={{ 
                            backgroundColor: '#f8fafc', 
                            padding: '1.5rem', 
                            borderRadius: '8px', 
                            marginBottom: '2rem' 
                        }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>
                                Add New Subject
                            </h3>
                            <form onSubmit={handleAddSubject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Subject Name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="form-input"
                                            value={subjectFormData.name}
                                            onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                                            placeholder="e.g., Data Structures"
                                        />
                                    </div>
                                    
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Code *</label>
                                        <input
                                            type="text"
                                            required
                                            className="form-input"
                                            value={subjectFormData.code}
                                            onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value.toUpperCase() })}
                                            placeholder="e.g., CS101"
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </div>
                                    
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Semester *</label>
                                        <select
                                            required
                                            className="form-input"
                                            value={subjectFormData.semester}
                                            onChange={(e) => setSubjectFormData({ ...subjectFormData, semester: e.target.value })}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(sem => (
                                                <option key={sem} value={sem}>Sem {sem}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '0.5rem',
                                        width: 'auto',
                                        alignSelf: 'flex-end'
                                    }}
                                >
                                    <Plus size={16} />
                                    Add Subject
                                </button>
                            </form>
                        </div>

                        {/* Subjects List */}
                        <div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>
                                Current Subjects ({subjects.length})
                            </h3>
                            
                            {subjects.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Code</th>
                                                <th>Subject Name</th>
                                                <th>Semester</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjects.map(subject => (
                                                <tr key={subject.id}>
                                                    <td>
                                                        <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                            {subject.code}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: 500 }}>{subject.name}</td>
                                                    <td>Semester {subject.semester}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleDeleteSubject(subject.id)}
                                                            className="btn btn-danger"
                                                            style={{ 
                                                                padding: '0.25rem 0.5rem', 
                                                                fontSize: '0.75rem', 
                                                                backgroundColor: '#ef4444' 
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '2rem', 
                                    backgroundColor: '#f8fafc', 
                                    borderRadius: '8px',
                                    color: 'var(--text-muted)'
                                }}>
                                    No subjects added yet. Add your first subject above.
                                </div>
                            )}
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            paddingTop: '1.5rem', 
                            borderTop: '1px solid var(--border-color)',
                            marginTop: '2rem'
                        }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => {
                                    setShowSubjectsModal(false);
                                    setSelectedCourse(null);
                                    setSubjects([]);
                                }}
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

export default AdminCourses;
