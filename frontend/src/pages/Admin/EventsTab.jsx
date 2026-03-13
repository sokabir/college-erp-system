import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, X, Calendar } from 'lucide-react';

const EventsTab = () => {
    const [events, setEvents] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        type: 'OTHER'
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/admin/events');
            setEvents(res.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/events', formData);
            alert('Event created successfully!');
            setShowAddModal(false);
            setFormData({ title: '', description: '', event_date: '', type: 'OTHER' });
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.delete(`/admin/events/${id}`);
            alert('Event deleted successfully!');
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting event');
        }
    };

    const getEventTypeColor = (type) => {
        const colors = {
            'EXAM': '#ef4444',
            'HOLIDAY': '#10b981',
            'MEETING': '#3b82f6',
            'OTHER': '#6b7280'
        };
        return colors[type] || colors.OTHER;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Events</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage college events and activities</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Add Event
                </button>
            </div>

            {events.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {events.map(event => (
                        <div key={event.id} className="glass-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <span className="badge" style={{ backgroundColor: getEventTypeColor(event.type), color: 'white' }}>
                                    {event.type}
                                </span>
                                <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{event.title}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{event.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <Calendar size={14} />
                                {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Calendar size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No events scheduled yet</p>
                </div>
            )}

            {/* Add Event Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', position: 'relative', padding: '2rem' }}>
                        <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '1.5rem' }}>Add New Event</h2>
                        
                        <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Annual Sports Day"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <textarea
                                    required
                                    className="form-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    placeholder="Brief description of the event"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Event Date *</label>
                                    <input
                                        type="date"
                                        required
                                        className="form-input"
                                        value={formData.event_date}
                                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Event Type *</label>
                                    <select
                                        required
                                        className="form-input"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="EXAM">Exam</option>
                                        <option value="HOLIDAY">Holiday</option>
                                        <option value="MEETING">Meeting</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventsTab;
