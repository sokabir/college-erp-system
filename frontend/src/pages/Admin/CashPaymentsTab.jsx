import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, DollarSign, Plus, Receipt, CheckCircle } from 'lucide-react';

const CashPaymentsTab = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentData, setPaymentData] = useState({
        tuition_fee: false,
        library_fee: false,
        lab_fee: false,
        exam_fee: false,
        payment_date: new Date().toISOString().split('T')[0],
        receipt_number: '',
        notes: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/admin/student-fees');
            setStudents(res.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleRecordPayment = (student) => {
        setSelectedStudent(student);
        setPaymentData({
            tuition_fee: false,
            library_fee: false,
            lab_fee: false,
            exam_fee: false,
            payment_date: new Date().toISOString().split('T')[0],
            receipt_number: `CASH-${Date.now()}`,
            notes: ''
        });
        setShowPaymentModal(true);
    };

    const calculateTotalPayment = () => {
        if (!selectedStudent) return 0;
        
        let total = 0;
        if (paymentData.tuition_fee) total += parseFloat(selectedStudent.tuition_fee || 0) - parseFloat(selectedStudent.tuition_paid || 0);
        if (paymentData.library_fee) total += parseFloat(selectedStudent.library_fee || 0) - parseFloat(selectedStudent.library_paid || 0);
        if (paymentData.lab_fee) total += parseFloat(selectedStudent.lab_fee || 0) - parseFloat(selectedStudent.lab_paid || 0);
        if (paymentData.exam_fee) total += parseFloat(selectedStudent.exam_fee || 0) - parseFloat(selectedStudent.exam_paid || 0);
        
        return total;
    };

    const getComponentBalance = (component) => {
        if (!selectedStudent) return 0;
        const due = parseFloat(selectedStudent[`${component}_fee`] || 0);
        const paid = parseFloat(selectedStudent[`${component}_paid`] || 0);
        return due - paid;
    };

    const submitPayment = async (e) => {
        e.preventDefault();
        
        const totalAmount = calculateTotalPayment();
        if (totalAmount <= 0) {
            alert('Please select at least one fee component to pay');
            return;
        }

        // Calculate actual amounts for each selected component
        const amounts = {
            tuition_fee: paymentData.tuition_fee ? getComponentBalance('tuition') : 0,
            library_fee: paymentData.library_fee ? getComponentBalance('library') : 0,
            lab_fee: paymentData.lab_fee ? getComponentBalance('lab') : 0,
            exam_fee: paymentData.exam_fee ? getComponentBalance('exam') : 0
        };

        try {
            await api.post('/admin/record-cash-payment', {
                student_id: selectedStudent.id,
                ...amounts,
                payment_date: paymentData.payment_date,
                receipt_number: paymentData.receipt_number,
                notes: paymentData.notes,
                total_amount: totalAmount
            });
            
            alert('Cash payment recorded successfully! Receipt is now available in student account.');
            setShowPaymentModal(false);
            fetchStudents();
        } catch (error) {
            console.error('Error recording payment:', error);
            alert(error.response?.data?.message || 'Failed to record cash payment');
        }
    };

    const calculateBalance = (student) => {
        return (student.total_due || 0) - (student.total_paid || 0);
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cash Payment Recording</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Record cash payments received from students for various fee components
                </p>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ position: 'relative', maxWidth: '500px' }}>
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
                                <th>Total Paid</th>
                                <th>Balance</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => {
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
                                            <button
                                                onClick={() => handleRecordPayment(student)}
                                                className="btn btn-primary"
                                                style={{ 
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                                disabled={balance <= 0}
                                            >
                                                <Plus size={16} />
                                                Record Payment
                                            </button>
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
                        {searchTerm ? 'No students found matching your search' : 'No students available'}
                    </p>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedStudent && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Receipt size={24} color="var(--primary-color)" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                                Record Cash Payment
                            </h3>
                        </div>

                        {/* Student Info */}
                        <div style={{ 
                            padding: '1.25rem', 
                            backgroundColor: '#f8fafc', 
                            borderRadius: '12px', 
                            marginBottom: '1.5rem',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Student Name</div>
                                    <div style={{ fontWeight: 600 }}>{selectedStudent.first_name} {selectedStudent.last_name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Enrollment No.</div>
                                    <div style={{ fontWeight: 600 }}>{selectedStudent.enrollment_number}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Course</div>
                                    <div style={{ fontWeight: 600 }}>{selectedStudent.course_name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Balance Due</div>
                                    <div style={{ fontWeight: 600, color: 'var(--warning-color)' }}>
                                        ₹{calculateBalance(selectedStudent).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submitPayment}>
                            {/* Fee Components */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                    Select Fee Components to Pay
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Tuition Fee */}
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        padding: '1rem', 
                                        border: '2px solid ' + (paymentData.tuition_fee ? 'var(--primary-color)' : '#e2e8f0'),
                                        borderRadius: '8px',
                                        cursor: getComponentBalance('tuition') > 0 ? 'pointer' : 'not-allowed',
                                        backgroundColor: getComponentBalance('tuition') > 0 ? (paymentData.tuition_fee ? '#f0fdf4' : 'white') : '#f8fafc',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={paymentData.tuition_fee}
                                            onChange={(e) => setPaymentData({...paymentData, tuition_fee: e.target.checked})}
                                            disabled={getComponentBalance('tuition') <= 0}
                                            style={{ marginRight: '1rem', width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Tuition Fee</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                Balance: ₹{getComponentBalance('tuition').toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        {getComponentBalance('tuition') > 0 && (
                                            <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1.125rem' }}>
                                                ₹{getComponentBalance('tuition').toLocaleString('en-IN')}
                                            </div>
                                        )}
                                    </label>

                                    {/* Library Fee */}
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        padding: '1rem', 
                                        border: '2px solid ' + (paymentData.library_fee ? 'var(--primary-color)' : '#e2e8f0'),
                                        borderRadius: '8px',
                                        cursor: getComponentBalance('library') > 0 ? 'pointer' : 'not-allowed',
                                        backgroundColor: getComponentBalance('library') > 0 ? (paymentData.library_fee ? '#f0fdf4' : 'white') : '#f8fafc',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={paymentData.library_fee}
                                            onChange={(e) => setPaymentData({...paymentData, library_fee: e.target.checked})}
                                            disabled={getComponentBalance('library') <= 0}
                                            style={{ marginRight: '1rem', width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Library Fee</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                Balance: ₹{getComponentBalance('library').toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        {getComponentBalance('library') > 0 && (
                                            <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1.125rem' }}>
                                                ₹{getComponentBalance('library').toLocaleString('en-IN')}
                                            </div>
                                        )}
                                    </label>

                                    {/* Lab Fee */}
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        padding: '1rem', 
                                        border: '2px solid ' + (paymentData.lab_fee ? 'var(--primary-color)' : '#e2e8f0'),
                                        borderRadius: '8px',
                                        cursor: getComponentBalance('lab') > 0 ? 'pointer' : 'not-allowed',
                                        backgroundColor: getComponentBalance('lab') > 0 ? (paymentData.lab_fee ? '#f0fdf4' : 'white') : '#f8fafc',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={paymentData.lab_fee}
                                            onChange={(e) => setPaymentData({...paymentData, lab_fee: e.target.checked})}
                                            disabled={getComponentBalance('lab') <= 0}
                                            style={{ marginRight: '1rem', width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Lab Fee</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                Balance: ₹{getComponentBalance('lab').toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        {getComponentBalance('lab') > 0 && (
                                            <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1.125rem' }}>
                                                ₹{getComponentBalance('lab').toLocaleString('en-IN')}
                                            </div>
                                        )}
                                    </label>

                                    {/* Exam Fee */}
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        padding: '1rem', 
                                        border: '2px solid ' + (paymentData.exam_fee ? 'var(--primary-color)' : '#e2e8f0'),
                                        borderRadius: '8px',
                                        cursor: getComponentBalance('exam') > 0 ? 'pointer' : 'not-allowed',
                                        backgroundColor: getComponentBalance('exam') > 0 ? (paymentData.exam_fee ? '#f0fdf4' : 'white') : '#f8fafc',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={paymentData.exam_fee}
                                            onChange={(e) => setPaymentData({...paymentData, exam_fee: e.target.checked})}
                                            disabled={getComponentBalance('exam') <= 0}
                                            style={{ marginRight: '1rem', width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Exam Fee</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                Balance: ₹{getComponentBalance('exam').toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        {getComponentBalance('exam') > 0 && (
                                            <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1.125rem' }}>
                                                ₹{getComponentBalance('exam').toLocaleString('en-IN')}
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Total Amount */}
                            <div style={{ 
                                padding: '1rem', 
                                backgroundColor: '#ecfdf5', 
                                borderRadius: '8px', 
                                marginBottom: '1.5rem',
                                border: '1px solid #a7f3d0'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>Total Payment Amount:</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-color)' }}>
                                        ₹{calculateTotalPayment().toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label>Payment Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={paymentData.payment_date}
                                        onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Receipt Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={paymentData.receipt_number}
                                        onChange={(e) => setPaymentData({...paymentData, receipt_number: e.target.value})}
                                        placeholder="Auto-generated"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Notes (Optional)</label>
                                <textarea
                                    className="form-input"
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                                    rows="2"
                                    placeholder="Additional notes about this payment"
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="btn-secondary"
                                    style={{ padding: '0.75rem 1.5rem' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <CheckCircle size={18} />
                                    Record Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashPaymentsTab;
