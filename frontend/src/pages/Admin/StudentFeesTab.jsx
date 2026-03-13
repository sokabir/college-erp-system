import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const StudentFeesTab = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchStudentFees();
    }, []);

    const fetchStudentFees = async () => {
        try {
            const res = await api.get('/admin/student-fees');
            setStudents(res.data);
        } catch (error) {
            console.error('Error fetching student fees:', error);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'PAID': { bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle size={14} /> },
            'PENDING': { bg: '#fef3c7', color: '#ca8a04', icon: <Clock size={14} /> },
            'PARTIAL': { bg: '#fed7aa', color: '#ea580c', icon: <AlertCircle size={14} /> }
        };
        return styles[status] || styles.PENDING;
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || student.fee_status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const calculateTotalPaid = (student) => {
        return student.total_paid || 0;
    };

    const calculateBalance = (student) => {
        return (student.total_due || 0) - (student.total_paid || 0);
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Student Fee Records</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    View and manage student fee payments
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or enrollment number..."
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '3rem' }}
                    />
                </div>
                <select
                    className="form-input"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ minWidth: '150px' }}
                >
                    <option value="ALL">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="PENDING">Pending</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>Total Students</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {students.length}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>Total Expected</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)', wordBreak: 'break-all' }}>
                        ₹{students.reduce((sum, s) => sum + (parseFloat(s.total_due) || 0), 0).toLocaleString('en-IN')}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>Total Collected</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)', wordBreak: 'break-all' }}>
                        ₹{students.reduce((sum, s) => sum + (parseFloat(s.total_paid) || 0), 0).toLocaleString('en-IN')}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>Pending Amount</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning-color)', wordBreak: 'break-all' }}>
                        ₹{students.reduce((sum, s) => sum + ((parseFloat(s.total_due) || 0) - (parseFloat(s.total_paid) || 0)), 0).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>

            {/* Student List */}
            {filteredStudents.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Enrollment No.</th>
                                <th>Student Name</th>
                                <th>Course</th>
                                <th>Total Due</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => {
                                const statusStyle = getStatusBadge(student.fee_status);
                                const balance = calculateBalance(student);
                                
                                return (
                                    <tr key={student.id}>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                {student.enrollment_number}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>
                                            {student.first_name} {student.last_name}
                                        </td>
                                        <td>{student.course_name}</td>
                                        <td>₹{parseFloat(student.total_due || 0).toLocaleString('en-IN')}</td>
                                        <td style={{ color: 'var(--success-color)', fontWeight: 600 }}>
                                            ₹{parseFloat(student.total_paid || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ 
                                            color: balance > 0 ? 'var(--warning-color)' : 'var(--success-color)', 
                                            fontWeight: 600 
                                        }}>
                                            ₹{balance.toLocaleString('en-IN')}
                                        </td>
                                        <td>
                                            <span 
                                                className="badge" 
                                                style={{ 
                                                    backgroundColor: statusStyle.bg, 
                                                    color: statusStyle.color,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                {statusStyle.icon}
                                                {student.fee_status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <DollarSign size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>
                        {searchTerm || filterStatus !== 'ALL' ? 'No students found matching your filters' : 'No fee records available'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default StudentFeesTab;
