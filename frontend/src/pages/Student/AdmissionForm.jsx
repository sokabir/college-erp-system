import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FileText, Upload, CheckCircle } from 'lucide-react';

const AdmissionForm = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);

    // Using a flat state object for the form just like what backend expects
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile_number: '',
        dob: '',
        gender: '',
        nationality: '',
        category: '',
        address: '',
        city: '',
        district: '',
        state: '',
        pin_code: '',
        guardian_name: '',
        guardian_number: '',
        guardian_relation: '',
        qualification_level: '',
        board_university: '',
        school_college_name: '',
        year_of_passing: '',
        percentage_cgpa: '',
        course_applied: ''
    });

    const [files, setFiles] = useState({
        document_photo: null,
        document_marksheet: null,
        document_leaving_cert: null
    });

    const [submitStatus, setSubmitStatus] = useState({ loading: false, error: '', success: false });

    useEffect(() => {
        api.get('/student/courses').then(res => setCourses(res.data)).catch(console.error);
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ loading: true, error: '', success: false });

        try {
            const data = new FormData();

            // Append all text fields
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Append file fields
            if (files.document_photo) data.append('document_photo', files.document_photo);
            if (files.document_marksheet) data.append('document_marksheet', files.document_marksheet);
            if (files.document_leaving_cert) data.append('document_leaving_cert', files.document_leaving_cert);

            // Important: do not set Content-Type header manually when using FormData and Axios
            await api.post('/auth/apply', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSubmitStatus({ loading: false, error: '', success: true });
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setSubmitStatus({
                loading: false,
                error: error.response?.data?.message || 'Error submitting application',
                success: false
            });
        }
    };

    if (submitStatus.success) {
        return (
            <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: 600, margin: '0 auto' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
                    <CheckCircle size={40} color="var(--success-color)" />
                </div>
                <h2>Application Submitted Successfully!</h2>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Your account has been created and your admission application has been received. Our administration team will review it shortly.</p>
                <p style={{ marginTop: '2rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-color)' }}>Redirecting to login page...</p>
            </div>
        );
    }

    // A helper for file input UI easily
    const renderFileInput = (label, name, accept = ".pdf,image/*") => (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: files[name] ? '#f0fdf4' : 'transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                position: 'relative'
            }}>
                <input
                    type="file"
                    name={name}
                    accept={accept}
                    onChange={handleFileChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    required={name === 'document_photo'} // Photo usually required, others might depend. Making photo required for example.
                />
                {files[name] ? (
                    <div style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} /> <span style={{ fontWeight: 500, wordBreak: 'break-all' }}>{files[name].name}</span>
                    </div>
                ) : (
                    <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={24} /> <span>Click to upload or drag and drop</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="glass-card animate-fade-in" style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <FileText color="var(--primary-color)" /> Admission Application Form
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Complete all sections carefully to apply for your desired course. Ensure all uploaded documents are clear and legible.</p>
            </div>

            {submitStatus.error && <div className="badge badge-danger" style={{ display: 'block', padding: '1rem', marginBottom: '2rem' }}>{submitStatus.error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Section 1: Detailed Course Selection */}
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>1. Course Selection</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Select Course *</label>
                        <select name="course_applied" className="form-input" required value={formData.course_applied} onChange={handleChange}>
                            <option value="">-- Choose Course --</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Section 2: Personal Information */}
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>2. Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">First Name *</label>
                        <input type="text" name="first_name" className="form-input" required value={formData.first_name} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Last Name *</label>
                        <input type="text" name="last_name" className="form-input" required value={formData.last_name} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Email Address *</label>
                        <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Mobile Number *</label>
                        <input type="tel" name="mobile_number" className="form-input" required value={formData.mobile_number} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Date of Birth *</label>
                        <input type="date" name="dob" className="form-input" required value={formData.dob} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Gender *</label>
                        <select name="gender" className="form-input" required value={formData.gender} onChange={handleChange}>
                            <option value="">-- Select --</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Nationality *</label>
                        <input type="text" name="nationality" className="form-input" required value={formData.nationality} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Category *</label>
                        <select name="category" className="form-input" required value={formData.category} onChange={handleChange}>
                            <option value="">-- Select --</option>
                            <option value="OPEN">Open</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="OBC">OBC</option>
                            <option value="NT">NT</option>
                            <option value="SBC">SBC</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>

                {/* Section 3: Address Information */}
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>3. Address Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                        <label className="form-label">Address Line *</label>
                        <input type="text" name="address" className="form-input" required value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">City *</label>
                        <input type="text" name="city" className="form-input" required value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">District *</label>
                        <input type="text" name="district" className="form-input" required value={formData.district} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">State *</label>
                        <input type="text" name="state" className="form-input" required value={formData.state} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">PIN Code *</label>
                        <input type="text" name="pin_code" className="form-input" required value={formData.pin_code} onChange={handleChange} />
                    </div>
                </div>

                {/* Section 4: Guardian Information */}
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>4. Guardian Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Guardian Name *</label>
                        <input type="text" name="guardian_name" className="form-input" required value={formData.guardian_name} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Guardian Mobile Number *</label>
                        <input type="tel" name="guardian_number" className="form-input" required value={formData.guardian_number} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Relation *</label>
                        <input type="text" name="guardian_relation" className="form-input" placeholder="e.g. Father, Mother" required value={formData.guardian_relation} onChange={handleChange} />
                    </div>
                </div>

                {/* Section 5: Academic Qualifications */}
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>5. Academic Qualifications</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Last Qualification Level *</label>
                        <select name="qualification_level" className="form-input" required value={formData.qualification_level} onChange={handleChange}>
                            <option value="">-- Select --</option>
                            <option value="10TH">10th</option>
                            <option value="12TH">12th</option>
                            <option value="DIPLOMA">Diploma</option>
                            <option value="OTHER">Other Degree</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Board / University *</label>
                        <input type="text" name="board_university" className="form-input" required value={formData.board_university} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                        <label className="form-label">School / College Name *</label>
                        <input type="text" name="school_college_name" className="form-input" required value={formData.school_college_name} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Year of Passing *</label>
                        <input type="number" min="1990" max="2030" name="year_of_passing" className="form-input" required value={formData.year_of_passing} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Percentage / CGPA *</label>
                        <input type="number" step="0.01" name="percentage_cgpa" className="form-input" placeholder="e.g. 85.50" required value={formData.percentage_cgpa} onChange={handleChange} />
                    </div>
                </div>

                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>6. Document Uploads</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please upload clear images or PDF files (max 5MB each).</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {renderFileInput('Passport Size Photo *', 'document_photo', 'image/*')}
                    {renderFileInput('Marksheet *', 'document_marksheet')}
                    {renderFileInput('Leaving Certificate', 'document_leaving_cert')}
                </div>

                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/student/dashboard')} disabled={submitStatus.loading}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitStatus.loading} style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
                        {submitStatus.loading ? 'Submitting Application...' : 'Submit Final Application'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdmissionForm;
