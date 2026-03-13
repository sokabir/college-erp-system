import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Mail, Phone, Calendar, Search, FileText, Eye, Trash2, X, MapPin, User, GraduationCap, ArrowUp } from 'lucide-react';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [targetSemester, setTargetSemester] = useState('');

    const fetchStudents = async () => {
        try {
            const res = await api.get('/admin/students');
            setStudents(res.data);
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to completely delete this student? This action cannot be undone and will remove all associated records (fees, attendance, user account).")) return;

        try {
            await api.delete(`/admin/students/${id}`);
            if (selectedStudent && selectedStudent.id === id) {
                setSelectedStudent(null);
            }
            fetchStudents();
            alert('Student deleted successfully.');
        } catch (error) {
            alert('Error deleting student. They might have restricted dependent records.');
        }
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s.id));
        }
    };

    const handlePromote = async () => {
        if (selectedStudents.length === 0) {
            alert('Please select at least one student');
            return;
        }
        if (!targetSemester) {
            alert('Please select target semester');
            return;
        }

        try {
            await api.post('/admin/students/promote', {
                student_ids: selectedStudents,
                target_semester: parseInt(targetSemester)
            });
            setShowPromoteModal(false);
            setSelectedStudents([]);
            setTargetSemester('');
            fetchStudents();
            alert(`Successfully promoted ${selectedStudents.length} student(s) to Semester ${targetSemester}`);
        } catch (error) {
            alert(error.response?.data?.message || 'Error promoting students');
        }
    };

    if (loading) return <div>Loading students...</div>;

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Manage Students</h2>
                    <p style={{ color: 'var(--text-muted)' }}>View all approved and enrolled students.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowPromoteModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    disabled={students.length === 0}
                >
                    <ArrowUp size={18} /> Promote Students
                </button>
            </div>

            <div className="table-container animate-fade-in">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedStudents.length === students.length && students.length > 0}
                                    onChange={handleSelectAll}
                                    style={{ cursor: 'pointer' }}
                                />
                            </th>
                            <th>Enrollment No.</th>
                            <th>Student Name</th>
                            <th>Course</th>
                            <th>Semester</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No students enrolled yet.
                                </td>
                            </tr>
                        ) : (
                            students.map(student => (
                                <tr key={student.id}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={() => handleSelectStudent(student.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{student.enrollment_number}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>
                                            {student.first_name} {student.last_name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            <Mail size={12} /> {student.email}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.875rem' }}>{student.course_name}</span>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
                                            Sem {student.current_semester || 1}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${student.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => setSelectedStudent(student)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: 'var(--text-color)' }}
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                className="btn btn-danger"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#ef4444', color: 'white' }}
                                                title="Delete student completely"
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

            {/* Promote Students Modal */}
            {showPromoteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', position: 'relative', padding: '2rem' }}>
                        <button onClick={() => { setShowPromoteModal(false); setSelectedStudents([]); setTargetSemester(''); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ArrowUp size={24} /> Promote Students
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                            Move selected students to the next semester
                        </p>

                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>{selectedStudents.length}</strong> student(s) selected
                            </div>
                            <div className="form-group">
                                <label className="form-label">Target Semester</label>
                                <select 
                                    className="form-input" 
                                    value={targetSemester} 
                                    onChange={(e) => setTargetSemester(e.target.value)}
                                    required
                                >
                                    <option value="">Select Semester</option>
                                    {[1, 2, 3, 4, 5, 6].map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                            <strong>Note:</strong> This will update the current semester for all selected students. Make sure to select students from the table first.
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => { setShowPromoteModal(false); setSelectedStudents([]); setTargetSemester(''); }}>
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handlePromote}
                                disabled={selectedStudents.length === 0 || !targetSemester}
                            >
                                <ArrowUp size={16} /> Promote
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}>

                        <button
                            onClick={() => setSelectedStudent(null)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {selectedStudent.first_name} {selectedStudent.last_name}
                            <span className={`badge ${selectedStudent.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}>
                                {selectedStudent.status}
                            </span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enrollment No: <strong>{selectedStudent.enrollment_number}</strong></p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            {/* Personal Details */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><User size={18} /> Personal Info</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {selectedStudent.email || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Mobile:</span> {selectedStudent.mobile_number || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Gender:</span> {selectedStudent.gender || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>DOB:</span> {new Date(selectedStudent.dob).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Academic Details */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><GraduationCap size={18} /> Academic</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Course:</span> {selectedStudent.course_name}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Joined:</span> {new Date(selectedStudent.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Guardian Details */}
                            <div style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}><User size={18} /> Guardian Info</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> {selectedStudent.guardian_name || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Mobile:</span> {selectedStudent.guardian_number || 'N/A'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Relation:</span> {selectedStudent.guardian_relation || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Address Details */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><MapPin size={18} /> Address</h3>
                                <div style={{ fontSize: '0.875rem' }}>
                                    {selectedStudent.address}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)}>Close</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(selectedStudent.id)} style={{ backgroundColor: '#ef4444' }}><Trash2 size={16} style={{ marginRight: '0.5rem' }} /> Delete Student</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudents;
