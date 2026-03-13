import { useState, useEffect } from 'react';
import api, { getFileUrl } from '../../services/api';
import { BookOpen, Download, Calendar, User } from 'lucide-react';

const StudentStudyMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const res = await api.get('/student/study-materials');
            setMaterials(res.data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return '📄';
        if (fileType?.includes('image')) return '🖼️';
        if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
        if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return '📊';
        return '📎';
    };

    // Group materials by subject
    const materialsBySubject = materials.reduce((acc, material) => {
        const key = `${material.subject_name} (${material.subject_code})`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(material);
        return acc;
    }, {});

    if (loading) {
        return <div>Loading study materials...</div>;
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2>Study Materials</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Access study materials uploaded by your faculty
                </p>
            </div>

            {/* Summary Card */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--primary-color)', borderRadius: '12px', display: 'flex' }}>
                        <BookOpen size={24} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Available Materials</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{materials.length}</div>
                    </div>
                </div>
            </div>

            {/* Materials by Subject */}
            {Object.keys(materialsBySubject).length > 0 ? (
                Object.entries(materialsBySubject).map(([subjectName, subjectMaterials]) => (
                    <div key={subjectName} style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                            {subjectName}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {subjectMaterials.map(material => (
                                <div key={material.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '1.5rem' }}>
                                            {getFileIcon(material.file_type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                {material.title}
                                            </h4>
                                            {material.topic && (
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                    Topic: {material.topic}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <User size={12} />
                                                {material.faculty_name}
                                            </div>
                                        </div>
                                    </div>

                                    {material.description && (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                                            {material.description}
                                        </p>
                                    )}

                                    <a 
                                        href={getFileUrl(material.file_path)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem', 
                                            fontSize: '0.875rem',
                                            width: '100%',
                                            justifyContent: 'center',
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        <Download size={16} />
                                        Download ({formatFileSize(material.file_size)})
                                    </a>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <Calendar size={14} />
                                        Uploaded {new Date(material.created_at).toLocaleDateString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No study materials available yet</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Your faculty will upload materials soon
                    </p>
                </div>
            )}
        </div>
    );
};

export default StudentStudyMaterials;
