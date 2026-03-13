import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, BookOpen, Users, CheckCircle } from 'lucide-react';

const FacultyMarks = () => {
    const [scheduledExams, setScheduledExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [students, setStudents] = useState([]);
    const [marksRecords, setMarksRecords] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/faculty/scheduled-exams')
            .then(res => setScheduledExams(res.data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedExam) {
            setStudents([]);
            return;
        }
        
        const exam = scheduledExams.find(e => e.timetable_id === parseInt(selectedExam));
        if (!exam) return;

        setLoading(true);
        api.get(`/faculty/subject/${exam.subject_id}/students`)
            .then(res => {
                setStudents(res.data);
                const initialRecords = {};
                res.data.forEach(s => initialRecords[s.id] = '');
                setMarksRecords(initialRecords);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedExam, scheduledExams]);

    const handleMarksChange = (studentId, value) => {
        setMarksRecords({ ...marksRecords, [studentId]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const recordsArray = Object.keys(marksRecords)
            .filter(student_id => marksRecords[student_id] !== '')
            .map(student_id => ({
                student_id: parseInt(student_id),
                marks: parseFloat(marksRecords[student_id])
            }));

        if (recordsArray.length === 0) {
            alert('Please enter marks for at least one student.');
            setSubmitting(false);
            return;
        }

        const exam = scheduledExams.find(e => e.timetable_id === parseInt(selectedExam));
        if (!exam) {
            alert('Invalid exam selection');
            setSubmitting(false);
            return;
        }

        try {
            await api.post('/faculty/marks', {
                exam_timetable_id: exam.timetable_id,
                records: recordsArray
            });
            alert('Marks uploaded successfully');
            setMarksRecords({});
            setSelectedExam('');
            setStudents([]);
        } catch (error) {
            alert('Failed to upload marks');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const selectedExamDetails = scheduledExams.find(e => e.timetable_id === parseInt(selectedExam));

    return (
        <div className="animate-fade-in">
            <h2>Upload Marks</h2>
            <p style={{ marginBottom: '2rem' }}>Enter examination results for scheduled exams.</p>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary-color)', borderRadius: '12px', display: 'flex' }}>
                            <Calendar size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Scheduled Exams</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{scheduledExams.length}</div>
                        </div>
                    </div>
                </div>

                {selectedExamDetails && (
                    <>
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', background: '#10b981', borderRadius: '12px', display: 'flex' }}>
                                    <BookOpen size={24} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Subject</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedExamDetails.subject_code}</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', background: '#f59e0b', borderRadius: '12px', display: 'flex' }}>
                                    <Users size={24} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Students</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{students.length}</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Exam Selection */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Scheduled Exam</label>
                    <select 
                        className="form-input" 
                        value={selectedExam} 
                        onChange={e => setSelectedExam(e.target.value)}
                    >
                        <option value="">-- Choose Exam --</option>
                        {scheduledExams.map(exam => (
                            <option key={exam.timetable_id} value={exam.timetable_id}>
                                {exam.exam_name} - {exam.subject_name} ({exam.subject_code}) - Sem {exam.semester} - {formatDate(exam.exam_date)} ({formatTime(exam.exam_time_from)} - {formatTime(exam.exam_time_to)})
                            </option>
                        ))}
                    </select>
                    {scheduledExams.length === 0 && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            No exams have been scheduled by the admin yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Exam Details Banner */}
            {selectedExamDetails && (
                <div className="glass-card" style={{ 
                    marginBottom: '2rem', 
                    padding: '1rem 1.5rem',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle size={20} color="var(--primary-color)" />
                        <div>
                            <strong>{selectedExamDetails.exam_name}</strong> - {selectedExamDetails.subject_name} ({selectedExamDetails.subject_code})
                            <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
                                {selectedExamDetails.course_name} • Semester {selectedExamDetails.semester} • {formatDate(selectedExamDetails.exam_date)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading students...
                </div>
            )}

            {/* Marks Entry Form */}
            {!loading && selectedExam && students.length > 0 && (
                <form onSubmit={handleSubmit} className="animate-fade-in">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Enrollment #</th>
                                    <th>Student Name</th>
                                    <th>Course</th>
                                    <th>Marks Obtained (Max 100)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.enrollment_number}</td>
                                        <td>{student.first_name} {student.last_name}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                background: 'var(--primary-color)',
                                                color: 'white'
                                            }}>
                                                {student.course_name}
                                            </span>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-input"
                                                style={{ width: '150px' }}
                                                value={marksRecords[student.id]}
                                                onChange={e => handleMarksChange(student.id, e.target.value)}
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                placeholder="0.0"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={submitting} 
                        style={{ marginTop: '1.5rem', padding: '0.75rem 2rem' }}
                    >
                        {submitting ? 'Saving...' : 'Upload Marks'}
                    </button>
                </form>
            )}

            {/* No Students Message */}
            {!loading && selectedExam && students.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    No students enrolled in this subject.
                </div>
            )}
        </div>
    );
};

export default FacultyMarks;
