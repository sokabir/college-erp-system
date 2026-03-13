import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Users, CheckCircle, XCircle, Save, History, Eye } from 'lucide-react';

const FacultyAttendance = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [existingAttendance, setExistingAttendance] = useState(null);
    const [activeTab, setActiveTab] = useState('mark'); // 'mark' or 'history'
    const [historySubject, setHistorySubject] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        api.get('/faculty/dashboard').then(res => setSubjects(res.data.subjects)).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedSubject) {
            setStudents([]);
            return;
        }
        setLoading(true);
        
        const subject = subjects.find(s => s.id === parseInt(selectedSubject));
        if (!subject) return;
        
        api.get('/faculty/students')
            .then(res => {
                const filteredStudents = res.data.filter(s => 
                    s.semester === subject.semester && 
                    s.course_name === subject.course_name
                );
                setStudents(filteredStudents);
                
                const initialRecords = {};
                filteredStudents.forEach(s => initialRecords[s.id] = 'PRESENT');
                setAttendanceRecords(initialRecords);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedSubject, subjects]);

    useEffect(() => {
        if (!selectedSubject || !date) return;
        
        api.get(`/faculty/attendance/${selectedSubject}/${date}`)
            .then(res => {
                if (res.data.length > 0) {
                    setExistingAttendance(res.data);
                    const records = {};
                    res.data.forEach(record => {
                        records[record.student_id] = record.status;
                    });
                    setAttendanceRecords(prev => ({ ...prev, ...records }));
                } else {
                    setExistingAttendance(null);
                }
            })
            .catch(err => {
                console.error('Error loading attendance:', err);
                setExistingAttendance(null);
            });
    }, [selectedSubject, date]);

    const loadAttendanceHistory = async () => {
        if (!historySubject) return;
        
        setLoadingHistory(true);
        try {
            // Get attendance records for the last 30 days
            const res = await api.get(`/faculty/attendance-history/${historySubject}`);
            setHistoryData(res.data);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history' && historySubject) {
            loadAttendanceHistory();
        }
    }, [historySubject, activeTab]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceRecords({ ...attendanceRecords, [studentId]: status });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const recordsArray = Object.keys(attendanceRecords).map(student_id => ({
            student_id: parseInt(student_id),
            status: attendanceRecords[student_id]
        }));

        try {
            await api.post('/faculty/attendance', {
                subject_id: selectedSubject,
                date,
                records: recordsArray
            });
            alert('Attendance marked successfully');
        } catch (error) {
            alert('Failed to mark attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const presentCount = Object.values(attendanceRecords).filter(s => s === 'PRESENT').length;
    const absentCount = Object.values(attendanceRecords).filter(s => s === 'ABSENT').length;

    // Group history by date
    const groupedHistory = historyData.reduce((acc, record) => {
        if (!acc[record.date]) {
            acc[record.date] = [];
        }
        acc[record.date].push(record);
        return acc;
    }, {});

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={28} /> Attendance Management
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Mark and view student attendance records.</p>
            </div>

            {/* Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginBottom: '2rem',
                borderBottom: '2px solid rgba(255,255,255,0.1)'
            }}>
                <button
                    onClick={() => setActiveTab('mark')}
                    style={{
                        padding: '1rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'mark' ? '3px solid var(--primary-color)' : '3px solid transparent',
                        color: activeTab === 'mark' ? 'var(--primary-color)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'mark' ? '600' : '400',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <CheckCircle size={20} />
                    Mark Attendance
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '1rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'history' ? '3px solid var(--primary-color)' : '3px solid transparent',
                        color: activeTab === 'history' ? 'var(--primary-color)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'history' ? '600' : '400',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <History size={20} />
                    View History
                </button>
            </div>

            {/* Mark Attendance Tab */}
            {activeTab === 'mark' && (
                <>
                    <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Select Subject</label>
                                <select className="form-input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                                    <option value="">-- Choose Subject --</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.code} - {s.name} (Sem {s.semester})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Date</label>
                                <input 
                                    type="date" 
                                    className="form-input" 
                                    value={date} 
                                    onChange={e => setDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                        {existingAttendance && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#dbeafe', borderRadius: '6px', fontSize: '0.875rem', color: '#1e40af' }}>
                                ℹ️ Attendance already recorded for this date. You can view or update it below.
                            </div>
                        )}
                    </div>

                    {selectedSubject && students.length > 0 && (
                        <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Students</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{students.length}</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.25rem' }}>Present</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{presentCount}</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.25rem' }}>Absent</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{absentCount}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ color: 'var(--text-muted)' }}>Loading students...</div>
                        </div>
                    ) : selectedSubject && students.length > 0 ? (
                        <form onSubmit={handleSubmit} className="animate-fade-in">
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Enrollment #</th>
                                            <th>Student Name</th>
                                            <th>Course</th>
                                            <th style={{ textAlign: 'center' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(student => (
                                            <tr key={student.id}>
                                                <td>
                                                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                        {student.enrollment_number}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 500 }}>
                                                    {student.first_name} {student.last_name}
                                                </td>
                                                <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    {student.course_name}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                                        <label style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '0.5rem', 
                                                            cursor: 'pointer',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '6px',
                                                            backgroundColor: attendanceRecords[student.id] === 'PRESENT' ? '#dcfce7' : '#f8fafc',
                                                            border: `2px solid ${attendanceRecords[student.id] === 'PRESENT' ? '#16a34a' : '#e2e8f0'}`,
                                                            transition: 'all 0.2s'
                                                        }}>
                                                            <input 
                                                                type="radio" 
                                                                name={`status-${student.id}`} 
                                                                checked={attendanceRecords[student.id] === 'PRESENT'} 
                                                                onChange={() => handleStatusChange(student.id, 'PRESENT')}
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                            <CheckCircle size={16} color="#16a34a" /> Present
                                                        </label>
                                                        <label style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '0.5rem', 
                                                            cursor: 'pointer',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '6px',
                                                            backgroundColor: attendanceRecords[student.id] === 'ABSENT' ? '#fee2e2' : '#f8fafc',
                                                            border: `2px solid ${attendanceRecords[student.id] === 'ABSENT' ? '#dc2626' : '#e2e8f0'}`,
                                                            transition: 'all 0.2s'
                                                        }}>
                                                            <input 
                                                                type="radio" 
                                                                name={`status-${student.id}`} 
                                                                checked={attendanceRecords[student.id] === 'ABSENT'} 
                                                                onChange={() => handleStatusChange(student.id, 'ABSENT')}
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                            <XCircle size={16} color="#dc2626" /> Absent
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={submitting} 
                                    style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Save size={18} />
                                    {submitting ? 'Saving...' : existingAttendance ? 'Update Attendance' : 'Submit Attendance'}
                                </button>
                            </div>
                        </form>
                    ) : selectedSubject && !loading ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                            <div style={{ color: 'var(--text-muted)' }}>No students found for this subject.</div>
                        </div>
                    ) : null}
                </>
            )}

            {/* View History Tab */}
            {activeTab === 'history' && (
                <>
                    <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Select Subject</label>
                            <select className="form-input" value={historySubject} onChange={e => setHistorySubject(e.target.value)}>
                                <option value="">-- Choose Subject --</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.code} - {s.name} (Sem {s.semester})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loadingHistory ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ color: 'var(--text-muted)' }}>Loading attendance history...</div>
                        </div>
                    ) : historySubject && Object.keys(groupedHistory).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {Object.keys(groupedHistory).sort((a, b) => new Date(b) - new Date(a)).map(date => {
                                const records = groupedHistory[date];
                                const presentCount = records.filter(r => r.status === 'PRESENT').length;
                                const absentCount = records.filter(r => r.status === 'ABSENT').length;
                                const totalCount = records.length;
                                const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

                                return (
                                    <div key={date} className="glass-card" style={{ padding: '1.5rem' }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            marginBottom: '1rem',
                                            paddingBottom: '1rem',
                                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Calendar size={20} color="#3b82f6" />
                                                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>
                                                    {new Date(date).toLocaleDateString('en-US', { 
                                                        weekday: 'long', 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </h3>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <span style={{ 
                                                    padding: '0.375rem 0.75rem',
                                                    backgroundColor: percentage >= 75 ? '#dcfce7' : '#fee2e2',
                                                    color: percentage >= 75 ? '#16a34a' : '#dc2626',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {percentage}% Present
                                                </span>
                                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    {presentCount}/{totalCount} students
                                                </span>
                                            </div>
                                        </div>

                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Enrollment #</th>
                                                        <th>Student Name</th>
                                                        <th style={{ textAlign: 'center' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {records.map(record => (
                                                        <tr key={record.id}>
                                                            <td>
                                                                <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                                    {record.enrollment_number}
                                                                </span>
                                                            </td>
                                                            <td style={{ fontWeight: 500 }}>
                                                                {record.first_name} {record.last_name}
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <span style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.375rem',
                                                                    padding: '0.375rem 0.75rem',
                                                                    borderRadius: '9999px',
                                                                    backgroundColor: record.status === 'PRESENT' ? '#dcfce7' : '#fee2e2',
                                                                    color: record.status === 'PRESENT' ? '#16a34a' : '#dc2626',
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {record.status === 'PRESENT' ? (
                                                                        <><CheckCircle size={14} /> Present</>
                                                                    ) : (
                                                                        <><XCircle size={14} /> Absent</>
                                                                    )}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : historySubject ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <History size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                            <div style={{ color: 'var(--text-muted)' }}>No attendance records found for this subject.</div>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default FacultyAttendance;
