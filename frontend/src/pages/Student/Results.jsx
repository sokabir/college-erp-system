import { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await api.get('/student/results');
                setResults(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    if (loading) return <div>Loading results...</div>;

    return (
        <div>
            <h2>Examination Results</h2>
            <p style={{ marginBottom: '2rem' }}>View your academic performance and grades.</p>

            <div className="table-container animate-fade-in">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Subject Name</th>
                            <th>Subject Code</th>
                            <th>Exam Date</th>
                            <th>Marks Obtained</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No results published yet.</td></tr>
                        ) : (
                            results.map((r, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: 600 }}>{r.subject_name}</td>
                                    <td>{r.code}</td>
                                    <td>{new Date(r.exam_date).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 600 }}>{r.marks_obtained} / {r.max_marks}</td>
                                    <td>
                                        <span className={`badge ${(parseFloat(r.marks_obtained) / parseFloat(r.max_marks)) >= 0.4 ? 'badge-success' : 'badge-danger'}`}>
                                            {((parseFloat(r.marks_obtained) / parseFloat(r.max_marks)) * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default StudentResults;
