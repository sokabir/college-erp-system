import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Receipt, Search, Calendar } from 'lucide-react';

const PaymentHistoryTab = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMethod, setFilterMethod] = useState('ALL');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await api.get('/admin/payment-history');
            setPayments(res.data);
        } catch (error) {
            console.error('Error fetching payment history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterMethod === 'ALL' || payment.payment_method === filterMethod;
        return matchesSearch && matchesFilter;
    });

    const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

    if (loading) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading payment history...</div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Payment History</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    View all student payment transactions
                </p>
            </div>

            {/* Summary Card */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Transactions</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            {payments.length}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Collected</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                            ₹{totalCollected.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by student name, enrollment, or transaction ID..."
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '3rem' }}
                    />
                </div>
                <select
                    className="form-input"
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    style={{ minWidth: '180px' }}
                >
                    <option value="ALL">All Payment Methods</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="WALLET">Wallet</option>
                    <option value="CASH">Cash</option>
                </select>
            </div>

            {/* Payment List */}
            {filteredPayments.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Component</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map(payment => (
                                <tr key={payment.id}>
                                    <td>
                                        <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontFamily: 'monospace' }}>
                                            {payment.transaction_id}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={14} color="var(--text-muted)" />
                                            {new Date(payment.payment_date).toLocaleDateString('en-IN', { 
                                                day: 'numeric', 
                                                month: 'short', 
                                                year: 'numeric' 
                                            })}
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{payment.student_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {payment.enrollment_number}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ 
                                            backgroundColor: '#e0f2fe', 
                                            color: '#0369a1',
                                            textTransform: 'capitalize'
                                        }}>
                                            {payment.component_type === 'tuition' && '📚 Tuition'}
                                            {payment.component_type === 'library' && '📖 Library'}
                                            {payment.component_type === 'lab' && '🔬 Lab'}
                                            {payment.component_type === 'exam' && '📝 Exam'}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--success-color)', fontSize: '1.125rem' }}>
                                        ₹{parseFloat(payment.amount_paid).toLocaleString('en-IN')}
                                    </td>
                                    <td>
                                        <span className="badge" style={{ 
                                            backgroundColor: '#dbeafe', 
                                            color: '#1e40af',
                                            textTransform: 'uppercase',
                                            fontSize: '0.75rem'
                                        }}>
                                            {payment.payment_method.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Receipt size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>
                        {searchTerm || filterMethod !== 'ALL' ? 'No payments found matching your filters' : 'No payment records available'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PaymentHistoryTab;
