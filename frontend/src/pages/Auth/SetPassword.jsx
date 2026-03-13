import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const SetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const [status, setStatus] = useState({
        loading: false,
        error: null,
        success: false
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setStatus({ loading: false, error: 'Invalid or missing configuration link.', success: false });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setStatus({ loading: false, error: 'Passwords do not match', success: false });
            return;
        }

        if (formData.password.length < 6) {
            setStatus({ loading: false, error: 'Password must be at least 6 characters long', success: false });
            return;
        }

        try {
            setStatus({ loading: true, error: null, success: false });
            const res = await api.post('/auth/set-password', {
                token,
                newPassword: formData.password
            });

            setStatus({ loading: false, error: null, success: true });

            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            setStatus({
                loading: false,
                error: error.response?.data?.message || 'Something went wrong. The link might have expired.',
                success: false
            });
        }
    };

    if (status.success) {
        return (
            <div className="auth-container animate-fade-in" style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                padding: '2rem'
            }}>
                <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
                    <CheckCircle size={64} color="var(--success-color)" style={{ margin: '0 auto 1.5rem auto' }} />
                    <h2 style={{ marginBottom: '1rem', color: '#166534' }}>Password Set Successfully!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Your account is secure. You can now access the student portal.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                        Proceed to Login <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container animate-fade-in" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '2rem'
        }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--primary-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'white' }}>
                        <Lock size={24} />
                    </div>
                    <h2>Set Up Your Password</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Welcome! Please set a secure password for your account to continue.
                    </p>
                </div>

                {status.error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{status.error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {email && (
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Account Email</label>
                            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={16} /> {email}
                            </div>
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>New Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.875rem' }}
                        disabled={status.loading || !token}
                    >
                        {status.loading ? 'Saving...' : 'Set Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPassword;