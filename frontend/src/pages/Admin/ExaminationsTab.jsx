import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Calendar, Clock, Eye, Trash2, X, CheckCircle, Send } from 'lucide-react';

const ExaminationsTab = () => {
    const [examSchedules, setExamSchedules] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTimetableModal, setShowTimetableModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [courses, setCourses] = useState([]);
    
    const [newExam, setNewExam] = useState({ exam_name: '', semester: '' });
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [newSubject, setNewSubject] = useState({ subject_id: '', exam_date: '', exam_time_from: '', exam_time_to: '' });

    useEffect(() => {
        fetchExaminations();
        fetchCourses();
    }, []);

    const fetchExaminations = async () => {
        try {
            const res = await api.get('/admin/examinations');
            setExamSchedules(res.data);
        } catch (error) {
            console.error('Error fetching examinations:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses');
            setCourses(res.data.filter(c => c.short_code));
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchSubjects = async (courseIds) => {
        try {
            const allSubjects = [];
            for (const courseId of courseIds) {
                const subRes = await api.get(`/admin/courses/${courseId}/subjects`);
                const course = courses.find(c => c.id === courseId);
                allSubjects.push(...subRes.data.map(s => ({ 
                    ...s, 
                    course_name: course.name, 
                    course_short: course.short_code,
                    course_id: courseId
                })));
            }
            setSubjects(allSubjects);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchTimetable = async (examId) => {
        try {
            const res = await api.get(`/admin/examinations/${examId}/timetable`);
            setTimetable(res.data);
        } catch (error) {
            console.error('Error fetching timetable:', error);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/examinations', newExam);
            alert('Exam schedule created successfully!');
            setShowCreateModal(false);
            setNewExam({ exam_name: '', semester: '' });
            fetchExaminations();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating exam');
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/examinations/${selectedExam.id}/subjects`, newSubject);
            alert('Subject added to timetable!');
            setNewSubject({ subject_id: '', exam_date: '', exam_time_from: '', exam_time_to: '' });
            fetchTimetable(selectedExam.id);
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding subject');
        }
    };

    const handlePublish = async (examId, currentStatus) => {
        try {
            await api.put(`/admin/examinations/${examId}/publish`, { is_published: !currentStatus });
            alert(`Exam ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
            fetchExaminations();
            if (selectedExam && selectedExam.id === examId) {
                setSelectedExam({ ...selectedExam, is_published: !currentStatus });
            }
        } catch (error) {
            alert('Error updating exam status');
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm('Delete this exam schedule? All timetable entries will be removed.')) return;
        try {
            await api.delete(`/admin/examinations/${examId}`);
            alert('Exam deleted successfully');
            setShowTimetableModal(false);
            fetchExaminations();
        } catch (error) {
            alert('Error deleting exam');
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        if (!window.confirm('Remove this subject from timetable?')) return;
        try {
            await api.delete(`/admin/examinations/subjects/${subjectId}`);
            alert('Subject removed');
            fetchTimetable(selectedExam.id);
        } catch (error) {
            alert('Error removing subject');
        }
    };

    const openTimetable = (exam) => {
        setSelectedExam(exam);
        setSelectedCourses([]);
        setSubjects([]);
        fetchTimetable(exam.id);
        setShowTimetableModal(true);
    };

    const handleCourseSelection = (courseId) => {
        const newSelection = selectedCourses.includes(courseId)
            ? selectedCourses.filter(id => id !== courseId)
            : [...selectedCourses, courseId];
        
        setSelectedCourses(newSelection);
        if (newSelection.length > 0) {
            fetchSubjects(newSelection);
        } else {
            setSubjects([]);
        }
    };

    // Group timetable by course
    const groupedTimetable = timetable.reduce((acc, item) => {
        const key = item.short_code || 'Other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Examination Schedules</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Create and manage exam timetables by semester
                    </p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Create Exam
                </button>
            </div>

            {/* Exam Schedules List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {examSchedules.map(exam => (
                    <div key={exam.id} className="glass-card" style={{ padding: '1.5rem', borderTop: `4px solid ${exam.is_published ? '#10b981' : '#f59e0b'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{exam.exam_name}</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Semester {exam.semester}</p>
                            </div>
                            <span className="badge" style={{ 
                                backgroundColor: exam.is_published ? '#dcfce7' : '#fef3c7',
                                color: exam.is_published ? '#16a34a' : '#ca8a04'
                            }}>
                                {exam.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                        
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            {exam.subject_count} subject{exam.subject_count !== 1 ? 's' : ''} scheduled
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => openTimetable(exam)} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.875rem' }}>
                                <Eye size={14} /> View Timetable
                            </button>
                            <button 
                                onClick={() => handlePublish(exam.id, exam.is_published)}
                                className="btn"
                                style={{ 
                                    backgroundColor: exam.is_published ? '#fef3c7' : '#dcfce7',
                                    color: exam.is_published ? '#ca8a04' : '#16a34a',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {exam.is_published ? 'Unpublish' : <><Send size={14} /> Publish</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {examSchedules.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Calendar size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No exam schedules created yet</p>
                </div>
            )}

            {/* Create Exam Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Create Exam Schedule</h3>
                        <form onSubmit={handleCreateExam}>
                            <div className="form-group">
                                <label className="form-label">Exam Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Mid-Term Examination"
                                    value={newExam.exam_name}
                                    onChange={(e) => setNewExam({ ...newExam, exam_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Semester *</label>
                                <select
                                    className="form-input"
                                    value={newExam.semester}
                                    onChange={(e) => setNewExam({ ...newExam, semester: e.target.value })}
                                    required
                                >
                                    <option value="">Select Semester</option>
                                    {[1, 2, 3, 4, 5, 6].map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Timetable Modal */}
            {showTimetableModal && selectedExam && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
                        <button onClick={() => setShowTimetableModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{selectedExam.exam_name}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Semester {selectedExam.semester} • {selectedExam.is_published ? 'Published' : 'Draft'}</p>
                        </div>

                        {/* Course Selection */}
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', backgroundColor: '#f8fafc' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Select Courses</h4>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {courses.map(course => (
                                    <label key={course.id} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        border: `2px solid ${selectedCourses.includes(course.id) ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                        backgroundColor: selectedCourses.includes(course.id) ? '#dbeafe' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCourses.includes(course.id)}
                                            onChange={() => handleCourseSelection(course.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: 600 }}>{course.short_code}</span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>- {course.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Add Subject Form */}
                        {selectedCourses.length > 0 && (
                            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', backgroundColor: '#f0fdf4' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add Subject to Timetable</h4>
                                <form onSubmit={handleAddSubject} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Subject</label>
                                        <select
                                            className="form-input"
                                            value={newSubject.subject_id}
                                            onChange={(e) => setNewSubject({ ...newSubject, subject_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects
                                                .filter(s => s.semester === parseInt(selectedExam.semester))
                                                .map(subject => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.code} - {subject.name} ({subject.course_short})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={newSubject.exam_date}
                                            onChange={(e) => setNewSubject({ ...newSubject, exam_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">From Time</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            value={newSubject.exam_time_from}
                                            onChange={(e) => setNewSubject({ ...newSubject, exam_time_from: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">To Time</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            value={newSubject.exam_time_to}
                                            onChange={(e) => setNewSubject({ ...newSubject, exam_time_to: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                        <Plus size={16} /> Add
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Timetable Grouped by Course */}
                        <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Exam Timetable</h4>
                        {timetable.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {Object.keys(groupedTimetable).sort().map(courseShort => (
                                    <div key={courseShort} className="glass-card" style={{ padding: '1.5rem' }}>
                                        <h5 style={{ 
                                            fontSize: '1rem', 
                                            fontWeight: 600, 
                                            marginBottom: '1rem',
                                            color: 'var(--primary-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{ 
                                                padding: '0.25rem 0.75rem', 
                                                backgroundColor: '#dbeafe', 
                                                borderRadius: '6px',
                                                fontSize: '0.875rem'
                                            }}>
                                                {courseShort}
                                            </span>
                                            {groupedTimetable[courseShort][0]?.course_name}
                                        </h5>
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Time</th>
                                                        <th>Subject Code</th>
                                                        <th>Subject Name</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {groupedTimetable[courseShort]
                                                        .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
                                                        .map(item => (
                                                            <tr key={item.id}>
                                                                <td>
                                                                    <Calendar size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                                    {new Date(item.exam_date).toLocaleDateString()}
                                                                </td>
                                                                <td>
                                                                    <Clock size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                                    {item.exam_time_from} - {item.exam_time_to}
                                                                </td>
                                                                <td>
                                                                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                                        {item.subject_code}
                                                                    </span>
                                                                </td>
                                                                <td>{item.subject_name}</td>
                                                                <td>
                                                                    <button 
                                                                        onClick={() => handleDeleteSubject(item.id)} 
                                                                        className="btn btn-danger" 
                                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                {selectedCourses.length === 0 
                                    ? 'Select courses above to start adding subjects to the timetable'
                                    : 'No subjects added yet. Add subjects to create the timetable.'}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                            <button onClick={() => setShowTimetableModal(false)} className="btn btn-secondary">Close</button>
                            <button onClick={() => handleDeleteExam(selectedExam.id)} className="btn btn-danger" style={{ marginLeft: 'auto' }}>
                                <Trash2 size={16} /> Delete Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExaminationsTab;
