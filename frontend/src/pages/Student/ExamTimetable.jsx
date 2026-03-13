import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, BookOpen, FileText, AlertCircle } from 'lucide-react';

const ExamTimetable = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExamTimetable();
    }, []);

    const fetchExamTimetable = async () => {
        try {
            const res = await api.get('/student/exam-timetable');
            setExams(res.data);
        } catch (error) {
            console.error('Error fetching exam timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="animate-fade-in">Loading exam timetable...</div>;
    }

    // Group exams by exam schedule
    const groupedExams = exams.reduce((acc, exam) => {
        const key = `${exam.exam_schedule_id}-${exam.exam_name}`;
        if (!acc[key]) {
            acc[key] = {
                exam_schedule_id: exam.exam_schedule_id,
                exam_name: exam.exam_name,
                exam_semester: exam.exam_semester,
                exams: []
            };
        }
        acc[key].exams.push(exam);
        return acc;
    }, {});

    const examSchedules = Object.values(groupedExams);

    // Sort exams within each schedule by date
    examSchedules.forEach(schedule => {
        schedule.exams.sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
    });

    const getDaysUntilExam = (examDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exam = new Date(examDate);
        exam.setHours(0, 0, 0, 0);
        const diffTime = exam - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 0) return 'Past';
        return `${diffDays} days`;
    };

    const getUrgencyColor = (examDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exam = new Date(examDate);
        exam.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3) return '#ef4444'; // Red
        if (diffDays <= 7) return '#f59e0b'; // Orange
        return '#10b981'; // Green
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0' }}>Exam Timetable</h2>
                <p style={{ color: '#999', margin: 0 }}>
                    View your upcoming examination schedule
                </p>
            </div>

            {examSchedules.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {examSchedules.map((schedule, index) => (
                        <div key={index} className="glass-card" style={{ padding: '2rem' }}>
                            {/* Exam Schedule Header */}
                            <div style={{ 
                                marginBottom: '2rem',
                                paddingBottom: '1rem',
                                borderBottom: '2px solid rgba(255,255,255,0.1)'
                            }}>
                                <h3 style={{ 
                                    margin: '0 0 0.5rem 0', 
                                    fontSize: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <FileText size={28} color="#3b82f6" />
                                    {schedule.exam_name}
                                </h3>
                                <span style={{ 
                                    fontSize: '0.875rem',
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    color: '#8b5cf6',
                                    borderRadius: '0.25rem'
                                }}>
                                    Semester {schedule.exam_semester}
                                </span>
                            </div>

                            {/* Exam Timetable Table */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ 
                                    width: '100%', 
                                    borderCollapse: 'separate',
                                    borderSpacing: '0 0.5rem'
                                }}>
                                    <thead>
                                        <tr style={{ 
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            textAlign: 'left'
                                        }}>
                                            <th style={{ 
                                                padding: '1rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#999',
                                                textTransform: 'uppercase',
                                                borderTopLeftRadius: '0.5rem',
                                                borderBottomLeftRadius: '0.5rem'
                                            }}>
                                                Date
                                            </th>
                                            <th style={{ 
                                                padding: '1rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#999',
                                                textTransform: 'uppercase'
                                            }}>
                                                Day
                                            </th>
                                            <th style={{ 
                                                padding: '1rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#999',
                                                textTransform: 'uppercase'
                                            }}>
                                                Time
                                            </th>
                                            <th style={{ 
                                                padding: '1rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#999',
                                                textTransform: 'uppercase'
                                            }}>
                                                Subject
                                            </th>
                                            <th style={{ 
                                                padding: '1rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#999',
                                                textTransform: 'uppercase',
                                                borderTopRightRadius: '0.5rem',
                                                borderBottomRightRadius: '0.5rem'
                                            }}>
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedule.exams.map((exam) => {
                                            const examDate = new Date(exam.exam_date);
                                            const daysUntil = getDaysUntilExam(exam.exam_date);
                                            const urgencyColor = getUrgencyColor(exam.exam_date);
                                            
                                            return (
                                                <tr key={exam.timetable_id} style={{ 
                                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    <td style={{ 
                                                        padding: '1.25rem 1rem',
                                                        borderLeft: `4px solid ${urgencyColor}`,
                                                        borderTopLeftRadius: '0.5rem',
                                                        borderBottomLeftRadius: '0.5rem'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Calendar size={18} color={urgencyColor} />
                                                            <div>
                                                                <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                                                                    {examDate.getDate()} {examDate.toLocaleDateString('en-US', { month: 'short' })}
                                                                </div>
                                                                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                                                    {examDate.getFullYear()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1rem' }}>
                                                        <span style={{ fontWeight: '500' }}>
                                                            {examDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Clock size={16} color="#999" />
                                                            <span style={{ fontWeight: '500' }}>
                                                                {exam.exam_time_from} - {exam.exam_time_to}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <BookOpen size={16} color="#8b5cf6" />
                                                            <div>
                                                                <div style={{ fontWeight: '600' }}>
                                                                    {exam.subject_name}
                                                                </div>
                                                                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                                                    {exam.subject_code}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ 
                                                        padding: '1.25rem 1rem',
                                                        borderTopRightRadius: '0.5rem',
                                                        borderBottomRightRadius: '0.5rem'
                                                    }}>
                                                        <span style={{ 
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            padding: '0.375rem 0.75rem',
                                                            borderRadius: '9999px',
                                                            backgroundColor: `${urgencyColor}20`,
                                                            color: urgencyColor,
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            {daysUntil === 'Today' && <AlertCircle size={14} />}
                                                            {daysUntil}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div style={{ 
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                color: '#3b82f6'
                            }}>
                                <AlertCircle size={16} />
                                <span>
                                    Total {schedule.exams.length} exam{schedule.exams.length !== 1 ? 's' : ''} scheduled
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Calendar size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>No Upcoming Exams</h3>
                    <p style={{ color: '#999', fontSize: '1rem' }}>
                        There are no published exam schedules at the moment
                    </p>
                </div>
            )}
        </div>
    );
};

export default ExamTimetable;
