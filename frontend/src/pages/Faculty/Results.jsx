import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, Filter, Search } from 'lucide-react';

const FacultyResults = () => {
    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const res = await api.get('/faculty/results');
            setResults(res.data);
            setFilteredResults(res.data);
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = results;

        if (searchTerm) {
            filtered = filtered.filter(r => 
                r.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.last_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedExam) {
            filtered = filtered.filter(r => r.exam_name === selectedExam);
        }

        if (selectedSubject) {
            filtered = filtered.filter(r => r.subject_code === selectedSubject);
        }

        setFilteredResults(filtered);
    }, [searchTerm, selectedExam, selectedSubject, results]);

    const uniqueExams = [...new Set(results.map(r => r.exam_name))];
    const uniqueSubjects = [...new Set(results.map(r => `${r.subject_code} - ${r.subject_name}`))];

    // Group results by exam and subject
    const groupedResults = filteredResults.reduce((acc, result) => {
        const key = `${result.exam_name} - ${result.subject_name} (${result.subject_code})`;
        if (!acc[key]) {
            acc[key] = {
                exam_name: result.exam_name,
                subject_name: result.subject_name,
                subject_code: result.subject_code,
                semester: result.semester,
                exam_date: result.exam_date,
                course_name: result.course_name,
                results: []
            };
        }
        acc[key].results.push(result);
        return acc;
    }, {});

    // Calculate statistics
    const calculateStats = (results) => {
        if (results.length === 0) return { average: 0, highest: 0, lowest: 0, passCount: 0 };
        
        const marks = results.map(r => parseFloat(r.marks_obtained));
        const average = (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2);
        const highest = Math.max(...marks);
        const lowest = Math.min(...marks);
        const passCount = marks.filter(m => m >= 40).length;
        
        return { average, highest, lowest, passCount };
    };

    if (loading) {
        return <div>Loading results...</div>;
    }

    return (
        <div className="animate-fade-in">
            <h2>Exam Results</h2>
            <p style={{ marginBottom: '2rem' }}>View and analyze examination results for your subjects.</p>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary-color)', borderRadius: '12px', display: 'flex' }}>
                            <Award size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Results</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{results.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Filter size={18} color="var(--primary-color)" />
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Filters</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                            <Search size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Search Student
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enrollment or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Exam</label>
                        <select className="form-input" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                            <option value="">All Exams</option>
                            {uniqueExams.map(exam => (
                                <option key={exam} value={exam}>{exam}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Subject</label>
                        <select className="form-input" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                            <option value="">All Subjects</option>
                            {uniqueSubjects.map(subject => (
                                <option key={subject} value={subject.split(' - ')[0]}>{subject}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results by Exam and Subject */}
            {Object.keys(groupedResults).length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Award size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No results found</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {Object.keys(groupedResults).map(key => {
                        const group = groupedResults[key];
                        const stats = calculateStats(group.results);
                        
                        return (
                            <div key={key} className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
                                        {group.exam_name} - {group.subject_name} ({group.subject_code})
                                    </h3>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {group.course_name} • Semester {group.semester} • {new Date(group.exam_date).toLocaleDateString('en-IN')}
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Average</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary-color)' }}>{stats.average}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Highest</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#10b981' }}>{stats.highest}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Lowest</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ef4444' }}>{stats.lowest}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Pass Rate</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                                            {stats.passCount}/{group.results.length} ({((stats.passCount / group.results.length) * 100).toFixed(0)}%)
                                        </div>
                                    </div>
                                </div>

                                {/* Results Table */}
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Enrollment #</th>
                                                <th>Student Name</th>
                                                <th>Marks Obtained</th>
                                                <th>Grade</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.results.map(result => {
                                                const marks = parseFloat(result.marks_obtained);
                                                const grade = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : marks >= 60 ? 'B' : marks >= 50 ? 'C' : marks >= 40 ? 'D' : 'F';
                                                const status = marks >= 40 ? 'PASS' : 'FAIL';
                                                
                                                return (
                                                    <tr key={result.id}>
                                                        <td>
                                                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                                {result.enrollment_number}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontWeight: 500 }}>
                                                            {result.first_name} {result.last_name}
                                                        </td>
                                                        <td style={{ fontSize: '1rem', fontWeight: '600' }}>
                                                            {result.marks_obtained} / 100
                                                        </td>
                                                        <td>
                                                            <span className="badge" style={{ 
                                                                backgroundColor: grade.startsWith('A') ? '#dcfce7' : grade.startsWith('B') ? '#dbeafe' : grade.startsWith('C') ? '#fef3c7' : '#fee2e2',
                                                                color: grade.startsWith('A') ? '#16a34a' : grade.startsWith('B') ? '#2563eb' : grade.startsWith('C') ? '#ca8a04' : '#dc2626'
                                                            }}>
                                                                {grade}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="badge" style={{ 
                                                                backgroundColor: status === 'PASS' ? '#dcfce7' : '#fee2e2',
                                                                color: status === 'PASS' ? '#16a34a' : '#dc2626'
                                                            }}>
                                                                {status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FacultyResults;
