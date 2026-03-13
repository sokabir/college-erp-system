import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Edit2, Save, X, DollarSign } from 'lucide-react';

const FeeStructureTab = () => {
    const [courses, setCourses] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({
        tuition_fee: '',
        library_fee: '',
        lab_fee: '',
        exam_fee: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses');
            setCourses(res.data.filter(c => c.short_code));
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleEdit = (course) => {
        setEditingId(course.id);
        setEditValues({
            tuition_fee: course.tuition_fee || 0,
            library_fee: course.library_fee || 0,
            lab_fee: course.lab_fee || 0,
            exam_fee: course.exam_fee || 0
        });
    };

    const handleSave = async (courseId) => {
        try {
            const total = Object.values(editValues).reduce((sum, val) => sum + parseFloat(val || 0), 0);
            
            await api.put(`/admin/courses/${courseId}/fees`, {
                tuition_fee: parseFloat(editValues.tuition_fee),
                library_fee: parseFloat(editValues.library_fee),
                lab_fee: parseFloat(editValues.lab_fee),
                exam_fee: parseFloat(editValues.exam_fee),
                total_fees: total
            });
            
            alert('Fee structure updated successfully!');
            setEditingId(null);
            fetchCourses();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating fee structure');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValues({
            tuition_fee: '',
            library_fee: '',
            lab_fee: '',
            exam_fee: ''
        });
    };

    const handleInputChange = (field, value) => {
        setEditValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateTotal = () => {
        return Object.values(editValues).reduce((sum, val) => sum + parseFloat(val || 0), 0);
    };

    const getDepartmentColor = (shortCode) => {
        const colors = {
            'CM': { bg: '#dbeafe', border: '#3b82f6', light: '#eff6ff' },
            'CE': { bg: '#fed7aa', border: '#f97316', light: '#fff7ed' },
            'EE': { bg: '#fef08a', border: '#eab308', light: '#fefce8' },
            'ME': { bg: '#bbf7d0', border: '#10b981', light: '#f0fdf4' }
        };
        return colors[shortCode] || { bg: '#f3f4f6', border: '#6b7280', light: '#f9fafb' };
    };

    const feeComponents = [
        { key: 'tuition_fee', label: 'Tuition Fee', icon: '📚' },
        { key: 'library_fee', label: 'Library Fee', icon: '📖' },
        { key: 'lab_fee', label: 'Lab Fee', icon: '🔬' },
        { key: 'exam_fee', label: 'Exam Fee', icon: '📝' }
    ];

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Course Fee Structure</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Manage individual fee components for each course
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {courses.map((course) => {
                    const colors = getDepartmentColor(course.short_code);
                    const isEditing = editingId === course.id;
                    const courseTotalFee = parseFloat(course.tuition_fee || 0) + 
                                          parseFloat(course.library_fee || 0) + 
                                          parseFloat(course.lab_fee || 0) + 
                                          parseFloat(course.exam_fee || 0);

                    return (
                        <div
                            key={course.id}
                            className="glass-card"
                            style={{
                                padding: '1.5rem',
                                borderTop: `4px solid ${colors.border}`
                            }}
                        >
                            {/* Header */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: colors.border
                                    }}>
                                        {course.short_code}
                                    </span>
                                    {!isEditing && (
                                        <button
                                            onClick={() => handleEdit(course)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--primary-color)',
                                                padding: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Edit2 size={18} />
                                            Edit
                                        </button>
                                    )}
                                </div>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {course.name}
                                </h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {course.duration_years} Years Program
                                </p>
                            </div>

                            {/* Total Fee Display */}
                            <div style={{
                                backgroundColor: colors.bg,
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                    Total Course Fee
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: colors.border }}>
                                    ₹{(isEditing ? calculateTotal() : courseTotalFee).toLocaleString('en-IN')}
                                </div>
                            </div>

                            {/* Fee Components */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {feeComponents.map(component => {
                                    const value = isEditing 
                                        ? editValues[component.key] 
                                        : course[component.key] || 0;
                                    
                                    return (
                                        <div 
                                            key={component.key}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.75rem',
                                                backgroundColor: colors.light,
                                                borderRadius: '6px',
                                                border: `1px solid ${colors.bg}`
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1.25rem' }}>{component.icon}</span>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                                    {component.label}
                                                </span>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={editValues[component.key]}
                                                    onChange={(e) => handleInputChange(component.key, e.target.value)}
                                                    min="0"
                                                    step="100"
                                                    style={{ 
                                                        width: '120px', 
                                                        padding: '0.5rem',
                                                        fontSize: '0.875rem',
                                                        textAlign: 'right'
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ 
                                                    fontWeight: 600, 
                                                    color: colors.border,
                                                    fontSize: '1rem'
                                                }}>
                                                    ₹{parseFloat(value).toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Action Buttons */}
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => handleSave(course.id)}
                                        className="btn btn-primary"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Save size={16} />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="btn"
                                        style={{ 
                                            flex: 1, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '0.5rem',
                                            backgroundColor: '#e2e8f0',
                                            color: '#475569'
                                        }}
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div style={{ 
                                    fontSize: '0.875rem', 
                                    color: 'var(--text-muted)', 
                                    paddingTop: '1rem', 
                                    marginTop: '1rem',
                                    borderTop: '1px solid var(--border-color)' 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Enrolled Students:</span>
                                        <span style={{ fontWeight: 600 }}>{course.student_count || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FeeStructureTab;
