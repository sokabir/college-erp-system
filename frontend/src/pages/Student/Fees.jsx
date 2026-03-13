import { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, CheckCircle, AlertCircle, CreditCard, Smartphone, Building2, Wallet, ArrowRight, ArrowLeft, Lock, Shield, Receipt } from 'lucide-react';

const StudentFees = () => {
    const [feeComponents, setFeeComponents] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Payment flow states
    const [showPaymentFlow, setShowPaymentFlow] = useState(false);
    const [paymentStep, setPaymentStep] = useState(1); // 1: Select Components, 2: Payment Method, 3: Payment Details, 4: Confirmation
    const [selectedComponents, setSelectedComponents] = useState({});
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        upiId: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        walletProvider: ''
    });
    const [processing, setProcessing] = useState(false);
    const [paymentReceipt, setPaymentReceipt] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [selectedHistoryReceipt, setSelectedHistoryReceipt] = useState(null);

    const fetchFeeComponents = async () => {
        try {
            const res = await api.get('/student/fee-components');
            setFeeComponents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentHistory = async () => {
        try {
            const res = await api.get('/student/payment-history');
            setPaymentHistory(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchFeeComponents();
        fetchPaymentHistory();
    }, []);

    const startPayment = () => {
        setShowPaymentFlow(true);
        setPaymentStep(1);
        setSelectedComponents({});
        setPaymentMethod('');
    };

    const closePaymentFlow = () => {
        setShowPaymentFlow(false);
        setPaymentStep(1);
        setSelectedComponents({});
        setPaymentMethod('');
        setPaymentDetails({
            cardNumber: '', cardName: '', expiryMonth: '', expiryYear: '', cvv: '',
            upiId: '', bankName: '', accountNumber: '', ifscCode: '', walletProvider: ''
        });
    };

    const handleComponentSelection = (componentType, amount) => {
        setSelectedComponents(prev => ({
            ...prev,
            [componentType]: prev[componentType] ? 0 : amount
        }));
    };

    const getTotalSelected = () => {
        return Object.values(selectedComponents).reduce((sum, val) => sum + val, 0);
    };

    const proceedToPaymentMethod = () => {
        if (getTotalSelected() > 0) {
            setPaymentStep(2);
        }
    };

    const proceedToPaymentDetails = () => {
        if (paymentMethod) {
            setPaymentStep(3);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        
        try {
            const res = await api.post('/student/process-component-payment', {
                components: selectedComponents,
                payment_method: paymentMethod,
                payment_details: paymentDetails
            });
            
            // Store receipt data
            setPaymentReceipt({
                transaction_id: res.data.transaction_id,
                amount: getTotalSelected(),
                components: selectedComponents,
                payment_method: paymentMethod,
                date: new Date(),
                status: res.data.status
            });
            
            setPaymentStep(4);
            setTimeout(() => {
                fetchFeeComponents();
            }, 500);
        } catch (error) {
            alert('Payment failed: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setProcessing(false);
        }
    };

    const componentIcons = {
        tuition: '📚',
        library: '📖',
        lab: '🔬',
        exam: '📝'
    };

    const componentLabels = {
        tuition: 'Tuition Fee',
        library: 'Library Fee',
        lab: 'Lab Fee',
        exam: 'Exam Fee'
    };

    const downloadReceipt = () => {
        if (!paymentReceipt) return;

        const receiptContent = `
═══════════════════════════════════════════════════════════
                    PAYMENT RECEIPT
═══════════════════════════════════════════════════════════

College ERP System
Fee Payment Receipt

───────────────────────────────────────────────────────────
TRANSACTION DETAILS
───────────────────────────────────────────────────────────

Transaction ID: ${paymentReceipt.transaction_id}
Date & Time: ${paymentReceipt.date.toLocaleString('en-IN')}
Payment Method: ${paymentReceipt.payment_method.toUpperCase().replace('_', ' ')}
Status: SUCCESS

───────────────────────────────────────────────────────────
FEE COMPONENTS PAID
───────────────────────────────────────────────────────────

${Object.entries(paymentReceipt.components).map(([type, amount]) => 
    `${componentLabels[type].padEnd(20)} ₹${amount.toLocaleString('en-IN').padStart(12)}`
).join('\n')}

───────────────────────────────────────────────────────────
TOTAL AMOUNT PAID: ₹${paymentReceipt.amount.toLocaleString('en-IN')}
───────────────────────────────────────────────────────────

This is a computer-generated receipt and does not require
a signature.

For any queries, please contact the accounts department.

═══════════════════════════════════════════════════════════
        `;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${paymentReceipt.transaction_id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const downloadHistoryReceipt = (payment) => {
        const receiptContent = `
═══════════════════════════════════════════════════════════
                    PAYMENT RECEIPT
═══════════════════════════════════════════════════════════

College ERP System
Fee Payment Receipt

───────────────────────────────────────────────────────────
TRANSACTION DETAILS
───────────────────────────────────────────────────────────

Transaction ID: ${payment.transaction_id}
Date & Time: ${new Date(payment.payment_date).toLocaleString('en-IN')}
Payment Method: ${payment.payment_method.toUpperCase().replace('_', ' ')}
Status: SUCCESS

───────────────────────────────────────────────────────────
FEE COMPONENT PAID
───────────────────────────────────────────────────────────

${componentLabels[payment.component_type].padEnd(20)} ₹${parseFloat(payment.amount_paid).toLocaleString('en-IN').padStart(12)}

───────────────────────────────────────────────────────────
TOTAL AMOUNT PAID: ₹${parseFloat(payment.amount_paid).toLocaleString('en-IN')}
───────────────────────────────────────────────────────────

Semester: ${payment.semester}
Academic Year: ${payment.academic_year}

This is a computer-generated receipt and does not require
a signature.

For any queries, please contact the accounts department.

═══════════════════════════════════════════════════════════
        `;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${payment.transaction_id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const viewHistoryReceipt = (payment) => {
        setSelectedHistoryReceipt(payment);
    };

    if (loading) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading fees...</div>
            </div>
        );
    }

    const currentFee = feeComponents[0];
    if (!currentFee) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <DollarSign size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No fee records found.</p>
            </div>
        );
    }

    const totalDue = (currentFee.tuition_fee - currentFee.tuition_paid) +
                     (currentFee.library_fee - currentFee.library_paid) +
                     (currentFee.lab_fee - currentFee.lab_paid) +
                     (currentFee.exam_fee - currentFee.exam_paid);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={28} /> Fee Payment
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Pay your semester fees online securely.</p>
            </div>

            {/* Fee Summary */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Semester {currentFee.semester} - {currentFee.academic_year}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Due Date: {new Date(currentFee.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Outstanding</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: totalDue > 0 ? 'var(--warning-color)' : 'var(--success-color)' }}>
                            ₹{totalDue.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>

                {/* Fee Components Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {['tuition', 'library', 'lab', 'exam'].map(type => {
                        const total = currentFee[`${type}_fee`];
                        const paid = currentFee[`${type}_paid`];
                        const due = total - paid;
                        const percentage = total > 0 ? (paid / total) * 100 : 0;

                        return (
                            <div key={type} style={{
                                padding: '1rem',
                                backgroundColor: due === 0 ? '#dcfce7' : '#fef3c7',
                                borderRadius: '8px',
                                border: `2px solid ${due === 0 ? '#16a34a' : '#ca8a04'}`
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{componentIcons[type]}</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    {componentLabels[type]}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                    ₹{due.toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Paid: ₹{paid.toLocaleString('en-IN')} / ₹{total.toLocaleString('en-IN')}
                                </div>
                                <div style={{ 
                                    marginTop: '0.5rem', 
                                    height: '4px', 
                                    backgroundColor: 'rgba(0,0,0,0.1)', 
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        height: '100%', 
                                        width: `${percentage}%`, 
                                        backgroundColor: due === 0 ? '#16a34a' : '#ca8a04',
                                        transition: 'width 0.3s'
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {totalDue > 0 && (
                    <button
                        onClick={startPayment}
                        className="btn btn-primary"
                        style={{ 
                            marginTop: '1.5rem', 
                            width: '100%', 
                            padding: '1rem',
                            fontSize: '1.125rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <CreditCard size={20} />
                        Pay Now
                    </button>
                )}
            </div>

            {/* Payment History Section */}
            {paymentHistory.length > 0 && (
                <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Receipt size={24} />
                        Payment History
                    </h3>
                    
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Transaction ID</th>
                                    <th>Component</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.map(payment => (
                                    <tr key={payment.id}>
                                        <td>{new Date(payment.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                {payment.transaction_id}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {componentIcons[payment.component_type]}
                                                {componentLabels[payment.component_type]}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--success-color)' }}>
                                            ₹{parseFloat(payment.amount_paid).toLocaleString('en-IN')}
                                        </td>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                {payment.payment_method.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => viewHistoryReceipt(payment)}
                                                    className="btn"
                                                    style={{ 
                                                        padding: '0.5rem 0.75rem',
                                                        fontSize: '0.875rem',
                                                        backgroundColor: '#3b82f6',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                >
                                                    <Receipt size={14} />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => downloadHistoryReceipt(payment)}
                                                    className="btn btn-primary"
                                                    style={{ 
                                                        padding: '0.5rem 0.75rem',
                                                        fontSize: '0.875rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                                    </svg>
                                                    Download
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* History Receipt Modal */}
            {selectedHistoryReceipt && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="glass-card" style={{
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        padding: '2rem',
                        position: 'relative'
                    }}>
                        <div style={{ 
                            backgroundColor: 'white',
                            color: '#000',
                            padding: '2rem',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem'
                        }}>
                            {/* Header */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>PAYMENT RECEIPT</h2>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>College ERP System</p>
                            </div>

                            {/* Transaction Details */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1rem' }}>TRANSACTION DETAILS</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                                    <div>Transaction ID:</div>
                                    <div style={{ fontWeight: 'bold' }}>{selectedHistoryReceipt.transaction_id}</div>
                                    <div>Date & Time:</div>
                                    <div>{new Date(selectedHistoryReceipt.payment_date).toLocaleString('en-IN')}</div>
                                    <div>Payment Method:</div>
                                    <div style={{ textTransform: 'uppercase' }}>{selectedHistoryReceipt.payment_method.replace('_', ' ')}</div>
                                    <div>Status:</div>
                                    <div style={{ color: '#16a34a', fontWeight: 'bold' }}>SUCCESS</div>
                                </div>
                            </div>

                            {/* Fee Component */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1rem' }}>FEE COMPONENT PAID</div>
                                <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '0.75rem 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>{componentIcons[selectedHistoryReceipt.component_type]} {componentLabels[selectedHistoryReceipt.component_type]}</div>
                                        <div style={{ fontWeight: 'bold' }}>₹{parseFloat(selectedHistoryReceipt.amount_paid).toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div style={{ 
                                backgroundColor: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '4px',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>TOTAL AMOUNT PAID:</div>
                                    <div style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{parseFloat(selectedHistoryReceipt.amount_paid).toLocaleString('en-IN')}</div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                <div style={{ marginBottom: '0.25rem' }}>Semester: {selectedHistoryReceipt.semester}</div>
                                <div>Academic Year: {selectedHistoryReceipt.academic_year}</div>
                            </div>

                            {/* Footer */}
                            <div style={{ 
                                fontSize: '0.75rem', 
                                color: '#64748b', 
                                textAlign: 'center',
                                borderTop: '1px solid #e2e8f0',
                                paddingTop: '1rem'
                            }}>
                                <p style={{ margin: '0 0 0.5rem 0' }}>This is a computer-generated receipt and does not require a signature.</p>
                                <p style={{ margin: 0 }}>For any queries, please contact the accounts department.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setSelectedHistoryReceipt(null)}
                                className="btn"
                                style={{ 
                                    flex: 1,
                                    backgroundColor: '#e2e8f0',
                                    color: '#475569'
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => downloadHistoryReceipt(selectedHistoryReceipt)}
                                className="btn btn-primary"
                                style={{ 
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                </svg>
                                Download Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Flow Modal */}
            {showPaymentFlow && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="glass-card" style={{
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        padding: '2rem',
                        position: 'relative'
                    }}>
                        {/* Progress Steps */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                {[1, 2, 3, 4].map(step => (
                                    <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: paymentStep >= step ? 'var(--primary-color)' : '#e2e8f0',
                                            color: paymentStep >= step ? 'white' : '#64748b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto',
                                            fontWeight: 'bold'
                                        }}>
                                            {step}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                            {step === 1 && 'Select'}
                                            {step === 2 && 'Method'}
                                            {step === 3 && 'Details'}
                                            {step === 4 && 'Done'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step 1: Select Components */}
                        {paymentStep === 1 && (
                            <div>
                                <h3 style={{ marginBottom: '1.5rem' }}>Select Fee Components to Pay</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {['tuition', 'library', 'lab', 'exam'].map(type => {
                                        const due = currentFee[`${type}_fee`] - currentFee[`${type}_paid`];
                                        if (due <= 0) return null;

                                        return (
                                            <label key={type} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '1rem',
                                                backgroundColor: selectedComponents[type] ? '#dbeafe' : '#f8fafc',
                                                border: `2px solid ${selectedComponents[type] ? '#3b82f6' : '#e2e8f0'}`,
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedComponents[type]}
                                                    onChange={() => handleComponentSelection(type, due)}
                                                    style={{ marginRight: '1rem', width: '20px', height: '20px', cursor: 'pointer' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                        {componentIcons[type]} {componentLabels[type]}
                                                    </div>
                                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                        Amount Due: ₹{due.toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>

                                <div style={{ 
                                    marginTop: '1.5rem', 
                                    padding: '1rem', 
                                    backgroundColor: '#f8fafc', 
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: 600 }}>Total Amount:</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                        ₹{getTotalSelected().toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        onClick={closePaymentFlow}
                                        className="btn"
                                        style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#475569' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={proceedToPaymentMethod}
                                        className="btn btn-primary"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        disabled={getTotalSelected() === 0}
                                    >
                                        Continue
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {paymentStep === 2 && (
                            <div>
                                <h3 style={{ marginBottom: '1.5rem' }}>Choose Payment Method</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={24} />, desc: 'Visa, Mastercard, RuPay' },
                                        { id: 'upi', label: 'UPI', icon: <Smartphone size={24} />, desc: 'Google Pay, PhonePe, Paytm' },
                                        { id: 'netbanking', label: 'Net Banking', icon: <Building2 size={24} />, desc: 'All major banks' },
                                        { id: 'wallet', label: 'Wallet', icon: <Wallet size={24} />, desc: 'Paytm, PhonePe, Amazon Pay' }
                                    ].map(method => (
                                        <label key={method.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1.25rem',
                                            backgroundColor: paymentMethod === method.id ? '#dbeafe' : '#f8fafc',
                                            border: `2px solid ${paymentMethod === method.id ? '#3b82f6' : '#e2e8f0'}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={paymentMethod === method.id}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                style={{ marginRight: '1rem', width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                            <div style={{ marginRight: '1rem', color: 'var(--primary-color)' }}>
                                                {method.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{method.label}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{method.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        onClick={() => setPaymentStep(1)}
                                        className="btn"
                                        style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <ArrowLeft size={18} />
                                        Back
                                    </button>
                                    <button
                                        onClick={proceedToPaymentDetails}
                                        className="btn btn-primary"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        disabled={!paymentMethod}
                                    >
                                        Continue
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment Details */}
                        {paymentStep === 3 && (
                            <div>
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Lock size={20} />
                                    Enter Payment Details
                                </h3>

                                {paymentMethod === 'card' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Card Number</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                                value={paymentDetails.cardNumber}
                                                onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Cardholder Name</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Name on card"
                                                value={paymentDetails.cardName}
                                                onChange={(e) => setPaymentDetails({...paymentDetails, cardName: e.target.value})}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group">
                                                <label className="form-label">Month</label>
                                                <select
                                                    className="form-input"
                                                    value={paymentDetails.expiryMonth}
                                                    onChange={(e) => setPaymentDetails({...paymentDetails, expiryMonth: e.target.value})}
                                                >
                                                    <option value="">MM</option>
                                                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                                        <option key={m} value={m.toString().padStart(2, '0')}>{m.toString().padStart(2, '0')}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Year</label>
                                                <select
                                                    className="form-input"
                                                    value={paymentDetails.expiryYear}
                                                    onChange={(e) => setPaymentDetails({...paymentDetails, expiryYear: e.target.value})}
                                                >
                                                    <option value="">YYYY</option>
                                                    {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(y => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">CVV</label>
                                                <input
                                                    type="password"
                                                    className="form-input"
                                                    placeholder="123"
                                                    maxLength="4"
                                                    value={paymentDetails.cvv}
                                                    onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'upi' && (
                                    <div className="form-group">
                                        <label className="form-label">UPI ID</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="yourname@upi"
                                            value={paymentDetails.upiId}
                                            onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
                                        />
                                    </div>
                                )}

                                {paymentMethod === 'netbanking' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Select Bank</label>
                                            <select
                                                className="form-input"
                                                value={paymentDetails.bankName}
                                                onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                                            >
                                                <option value="">Choose your bank</option>
                                                <option value="SBI">State Bank of India</option>
                                                <option value="HDFC">HDFC Bank</option>
                                                <option value="ICICI">ICICI Bank</option>
                                                <option value="AXIS">Axis Bank</option>
                                                <option value="PNB">Punjab National Bank</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'wallet' && (
                                    <div className="form-group">
                                        <label className="form-label">Select Wallet</label>
                                        <select
                                            className="form-input"
                                            value={paymentDetails.walletProvider}
                                            onChange={(e) => setPaymentDetails({...paymentDetails, walletProvider: e.target.value})}
                                        >
                                            <option value="">Choose wallet</option>
                                            <option value="paytm">Paytm</option>
                                            <option value="phonepe">PhonePe</option>
                                            <option value="amazonpay">Amazon Pay</option>
                                            <option value="mobikwik">Mobikwik</option>
                                        </select>
                                    </div>
                                )}

                                <div style={{ 
                                    marginTop: '1.5rem', 
                                    padding: '1rem', 
                                    backgroundColor: '#eff6ff', 
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    fontSize: '0.875rem',
                                    color: '#1e40af'
                                }}>
                                    <Shield size={20} />
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Secure Payment</div>
                                        <div>Your payment information is encrypted and secure</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        onClick={() => setPaymentStep(2)}
                                        className="btn"
                                        style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        disabled={processing}
                                    >
                                        <ArrowLeft size={18} />
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePayment}
                                        className="btn btn-primary"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        disabled={processing}
                                    >
                                        <Lock size={18} />
                                        {processing ? 'Processing...' : `Pay ₹${getTotalSelected().toLocaleString('en-IN')}`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Success */}
                        {paymentStep === 4 && !showReceipt && (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#dcfce7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem'
                                }}>
                                    <CheckCircle size={48} color="#16a34a" />
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>Payment Successful!</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Your payment of ₹{getTotalSelected().toLocaleString('en-IN')} has been processed successfully.
                                </p>
                                <div style={{ 
                                    padding: '1rem', 
                                    backgroundColor: '#f8fafc', 
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>Transaction ID:</strong> {paymentReceipt?.transaction_id}
                                    </div>
                                    <div>
                                        <strong>Date:</strong> {paymentReceipt?.date.toLocaleString('en-IN')}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setShowReceipt(true)}
                                        className="btn"
                                        style={{ 
                                            backgroundColor: '#3b82f6', 
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Receipt size={18} />
                                        View Receipt
                                    </button>
                                    <button
                                        onClick={downloadReceipt}
                                        className="btn btn-primary"
                                        style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                        </svg>
                                        Download Receipt
                                    </button>
                                </div>

                                <button
                                    onClick={closePaymentFlow}
                                    className="btn"
                                    style={{ 
                                        marginTop: '1rem',
                                        backgroundColor: '#e2e8f0',
                                        color: '#475569'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        )}

                        {/* Receipt View */}
                        {paymentStep === 4 && showReceipt && paymentReceipt && (
                            <div style={{ padding: '2rem' }}>
                                <div style={{ 
                                    backgroundColor: 'white',
                                    color: '#000',
                                    padding: '2rem',
                                    borderRadius: '8px',
                                    border: '2px solid #e2e8f0',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem'
                                }}>
                                    {/* Header */}
                                    <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>PAYMENT RECEIPT</h2>
                                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>College ERP System</p>
                                    </div>

                                    {/* Transaction Details */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1rem' }}>TRANSACTION DETAILS</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                                            <div>Transaction ID:</div>
                                            <div style={{ fontWeight: 'bold' }}>{paymentReceipt.transaction_id}</div>
                                            <div>Date & Time:</div>
                                            <div>{paymentReceipt.date.toLocaleString('en-IN')}</div>
                                            <div>Payment Method:</div>
                                            <div style={{ textTransform: 'uppercase' }}>{paymentReceipt.payment_method.replace('_', ' ')}</div>
                                            <div>Status:</div>
                                            <div style={{ color: '#16a34a', fontWeight: 'bold' }}>SUCCESS</div>
                                        </div>
                                    </div>

                                    {/* Fee Components */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1rem' }}>FEE COMPONENTS PAID</div>
                                        <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '0.75rem 0' }}>
                                            {Object.entries(paymentReceipt.components).map(([type, amount]) => (
                                                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <div>{componentIcons[type]} {componentLabels[type]}</div>
                                                    <div style={{ fontWeight: 'bold' }}>₹{amount.toLocaleString('en-IN')}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div style={{ 
                                        backgroundColor: '#f8fafc',
                                        padding: '1rem',
                                        borderRadius: '4px',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem' }}>
                                            <div style={{ fontWeight: 'bold' }}>TOTAL AMOUNT PAID:</div>
                                            <div style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{paymentReceipt.amount.toLocaleString('en-IN')}</div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#64748b', 
                                        textAlign: 'center',
                                        borderTop: '1px solid #e2e8f0',
                                        paddingTop: '1rem'
                                    }}>
                                        <p style={{ margin: '0 0 0.5rem 0' }}>This is a computer-generated receipt and does not require a signature.</p>
                                        <p style={{ margin: 0 }}>For any queries, please contact the accounts department.</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        onClick={() => setShowReceipt(false)}
                                        className="btn"
                                        style={{ 
                                            flex: 1,
                                            backgroundColor: '#e2e8f0',
                                            color: '#475569'
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={downloadReceipt}
                                        className="btn btn-primary"
                                        style={{ 
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                        </svg>
                                        Download Receipt
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentFees;
