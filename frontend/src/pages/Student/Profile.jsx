import { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Mail, Phone, Calendar, MapPin, Users, GraduationCap, Hash } from 'lucide-react';

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/student/profile');
            setProfile(res.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="animate-fade-in">Loading profile...</div>;
    }

    if (!profile) {
        return (
            <div className="glass-card animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: '#999' }}>Profile not found</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0' }}>My Profile</h2>
                <p style={{ color: '#999', margin: 0 }}>
                    View your personal and academic information
                </p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Profile Picture Card */}
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid var(--primary-color)',
                        margin: '0 auto 1rem',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {profile.profile_pic ? (
                            <img 
                                src={`http://localhost:5000/${profile.profile_pic}`}
                                alt={`${profile.first_name} ${profile.last_name}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div style={{
                            display: profile.profile_pic ? 'none' : 'flex',
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            color: 'var(--primary-color)',
                            backgroundColor: '#e0f2fe'
                        }}>
                            {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                        </div>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
                        {profile.first_name} {profile.last_name}
                    </h3>
                    <p style={{ color: '#999', margin: 0 }}>
                        {profile.enrollment_number}
                    </p>
                </div>

                {/* Personal Information */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                        <User size={24} color="#3b82f6" />
                        Personal Information
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Full Name
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <User size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{profile.first_name} {profile.last_name}</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Email Address
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <Mail size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{profile.email || 'N/A'}</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Mobile Number
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <Phone size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{profile.mobile_number || 'N/A'}</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Date of Birth
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <Calendar size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Gender
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <User size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{profile.gender || 'N/A'}</span>
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Address
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <MapPin size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{profile.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                        <GraduationCap size={24} color="#8b5cf6" />
                        Academic Information
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Enrollment Number
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                <Hash size={18} color="#8b5cf6" />
                                <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{profile.enrollment_number}</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Course
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <GraduationCap size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{profile.course_name}</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Current Semester
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <Calendar size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>Semester {profile.current_semester || 1}</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Status
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <span className={`badge ${profile.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                                    {profile.status}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Enrolled On
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <Calendar size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{new Date(profile.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guardian Information */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                        <Users size={24} color="#10b981" />
                        Guardian Information
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Guardian Name
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <User size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{profile.guardian_name || 'N/A'}</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Guardian Mobile
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <Phone size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{profile.guardian_number || 'N/A'}</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>
                                Relation
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <Users size={18} color="#999" />
                                <span style={{ fontWeight: '500' }}>{profile.guardian_relation || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
