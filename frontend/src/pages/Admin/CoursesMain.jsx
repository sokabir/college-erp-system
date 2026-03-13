import { useState } from 'react';
import { BookOpen, Calendar, Bell, FileText } from 'lucide-react';
import CoursesTab from './CoursesTab';
import ExaminationsTab from './ExaminationsTab';
import EventsTab from './EventsTab';
import NoticesTab from './NoticesTab';

const CoursesMain = () => {
    const [activeTab, setActiveTab] = useState('courses');

    const tabs = [
        { id: 'courses', label: 'Courses', icon: <BookOpen size={18} /> },
        { id: 'examinations', label: 'Examinations', icon: <FileText size={18} /> },
        { id: 'events', label: 'Events', icon: <Calendar size={18} /> },
        { id: 'notices', label: 'Notices', icon: <Bell size={18} /> }
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2>Academic Management</h2>
                <p style={{ color: 'var(--text-muted)' }}>Manage courses, examinations, events, and notices</p>
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
                {activeTab === 'courses' && <CoursesTab />}
                {activeTab === 'examinations' && <ExaminationsTab />}
                {activeTab === 'events' && <EventsTab />}
                {activeTab === 'notices' && <NoticesTab />}
            </div>
        </div>
    );
};

export default CoursesMain;
