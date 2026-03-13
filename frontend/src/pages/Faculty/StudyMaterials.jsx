import { useState, useEffect } from 'react';
import api, { getFileUrl } from '../../services/api';
import { Plus, BookOpen, Trash2, X, Upload, FileText, Download, Calendar } from 'lucide-react';

const FacultyStudyMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        subject_id: '',
        title: '',
        description: '',
        topic: ''
    });

    useEffect(() => {
        fetchMaterials();
        fetchSubjects();
    }, []);

    const fetchMaterials = async () => {
        try {
            const res = await api.get('/faculty/study-materials');
            setMaterials(res.data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/faculty/dashboard');
            setSubjects(res.data.subjects);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            alert('Please select a file to upload');
            return;
        }
        
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('subject_id', formData.subject_id);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('topic', formData.topic);
            formDataToSend.append('file', selectedFile);
            
            await api.post('/faculty/study-materials', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert('Study material uploaded successfully');
            setShowModal(false);
            setSelectedFile(null);
            setFormData({ subject_id: '', title: '', description: '', topic: '' });
            fetchMaterials();
        } catch (error) {
            alert('Error uploading study material');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;
        
        try {
            await api.delete(`/faculty/study-materials/${id}`);
            alert('Study material deleted successfully');
            fetchMaterials();
        } catch (error) {
            alert('Error deleting study material');
            console.error(error);
        }
    };

    const openUploadModal = () => {
        setSelectedFile(null);
        setFormData({ subject_id: '', title: '', description: '', topic: '' });
        setShowModal(true);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Study Materials</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Upload and manage study materials for your subjects
                    </p>
                </div>
                <button onClick={openUploadModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Upload Material
                </button>
            </div>

            {/* Summary Card */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--primary-color)', borderRadius: '12px', display: 'flex' }}>
                        <BookOpen size={24} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Materials</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{materials.length}</div>
                    </div>
                </div>
            </div>

            {/* Materials by Subject */}
            {Object.keys(materialsBySubject).length > 0 ? (
                Object.entries(materialsBySubject).map(([subjectName, subjectMaterials]) => (
                    <div key={subjectName} style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                            {subjectName} • Semester {subjectMaterials[0].semester}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {subjectMaterials.map(material => (
                                <div key={material.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                                {getFileIcon(material.file_type)}
                                            </div>
                                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                {material.title}
                                            </h4>
                                            {material.topic && (
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                    Topic: {material.topic}
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(material.id)} 
                                            className="btn btn-danger" 
                                            style={{ padding: '0.5rem', minWidth: 'auto' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
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
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem', 
                                            fontSize: '0.875rem', 
                                            color: 'var(--primary-color)', 
                                            textDecoration: 'none',
                                            marginBottom: '1rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#dbeafe',
                                            borderRadius: '6px'
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
                    <p style={{ color: 'var(--text-muted)' }}>No study materials uploaded yet</p>
                    <button onClick={openUploadModal} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Upload Your First Material
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>

                        <h3 style={{ marginBottom: '1.5rem' }}>Upload Study Material</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Subject *</label>
                                <select
                                    className="form-input"
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name} ({subject.code}) - Sem {subject.semester}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Chapter 1 - Introduction to Data Structures"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Topic (Optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Arrays, Linked Lists"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description (Optional)</label>
                                <textarea
                                    className="form-input"
                                    placeholder="Brief description of the material..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Upload size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Upload File (PDF, Images, PPT, Word) *
                                </label>
                                <input
                                    type="file"
                                    className="form-input"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    style={{ padding: '0.5rem' }}
                                    required
                                />
                                {selectedFile && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Upload Material
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyStudyMaterials;
