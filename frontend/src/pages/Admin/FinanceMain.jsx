import { useState } from 'react';
import { DollarSign, FileText, Receipt } from 'lucide-react';
import FeeStructureTab from './FeeStructureTab';
import StudentFeesTab from './StudentFeesTab';
import PaymentHistoryTab from './PaymentHistoryTab';

const FinanceMain = () => {
    const [activeTab, setActiveTab] = useState('structure');

    const tabs = [
        { id: 'structure', label: 'Fee Structure', icon: <DollarSign size={18} /> },
        { id: 'students', label: 'Student Fees', icon: <FileText size={18} /> },
        { id: 'payments', label: 'Payment History', icon: <Receipt size={18} /> }
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2>Finance Management</h2>
                <p style={{ color: 'var(--text-muted)' }}>Manage fee structure and student payments</p>
            </div>

            {/* Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '2rem',
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '0'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                            color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            transition: 'all 0.2s',
                            fontSize: '0.9rem'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'structure' && <FeeStructureTab />}
                {activeTab === 'students' && <StudentFeesTab />}
                {activeTab === 'payments' && <PaymentHistoryTab />}
            </div>
        </div>
    );
};

export default FinanceMain;
