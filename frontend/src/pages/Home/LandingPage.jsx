import { Link } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, Award, ArrowRight, LogIn, FileText, Calendar, TrendingUp, Shield } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-left">
                        <div className="hero-badge">
                            <GraduationCap size={24} />
                            <span>College ERP System</span>
                        </div>
                        <h1 className="hero-title">
                            Empowering Education Through Technology
                        </h1>
                        <p className="hero-description">
                            A comprehensive platform designed to streamline academic operations, enhance collaboration, and drive excellence across your institution.
                        </p>
                        
                        <div className="hero-actions">
                            <Link to="/apply" className="btn-hero btn-primary-hero">
                                <FileText size={20} />
                                Apply for Admission
                                <ArrowRight size={20} />
                            </Link>
                            <Link to="/login" className="btn-hero btn-secondary-hero">
                                <LogIn size={20} />
                                Portal Login
                            </Link>
                        </div>

                        <div className="hero-features">
                            <div className="hero-feature-item">
                                <div className="feature-check">✓</div>
                                <span>Real-time Attendance Tracking</span>
                            </div>
                            <div className="hero-feature-item">
                                <div className="feature-check">✓</div>
                                <span>Automated Fee Management</span>
                            </div>
                            <div className="hero-feature-item">
                                <div className="feature-check">✓</div>
                                <span>Digital Assignment Submission</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-right">
                        <div className="hero-card-stack">
                            <div className="floating-card card-1">
                                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                    <Users size={24} color="white" />
                                </div>
                                <div className="card-content">
                                    <div className="card-title">Student Management</div>
                                    <div className="card-subtitle">Complete academic records</div>
                                </div>
                            </div>
                            <div className="floating-card card-2">
                                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                                    <Calendar size={24} color="white" />
                                </div>
                                <div className="card-content">
                                    <div className="card-title">Exam Scheduling</div>
                                    <div className="card-subtitle">Automated timetables</div>
                                </div>
                            </div>
                            <div className="floating-card card-3">
                                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                                    <TrendingUp size={24} color="white" />
                                </div>
                                <div className="card-content">
                                    <div className="card-title">Performance Analytics</div>
                                    <div className="card-subtitle">Real-time insights</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Everything You Need in One Platform</h2>
                        <p className="section-subtitle">Powerful features designed for modern educational institutions</p>
                    </div>
                    
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <Users size={28} color="white" />
                            </div>
                            <h3>Student Management</h3>
                            <p>Comprehensive student records, attendance tracking, and performance monitoring all in one place.</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                <BookOpen size={28} color="white" />
                            </div>
                            <h3>Course Management</h3>
                            <p>Organize courses, subjects, and academic schedules efficiently with our intuitive system.</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                                <Award size={28} color="white" />
                            </div>
                            <h3>Examination System</h3>
                            <p>Streamlined exam scheduling, result management, and performance analytics for better insights.</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                                <GraduationCap size={28} color="white" />
                            </div>
                            <h3>Faculty Portal</h3>
                            <p>Empower educators with tools for attendance, assignments, and student evaluation.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                                <TrendingUp size={28} color="white" />
                            </div>
                            <h3>Analytics & Reports</h3>
                            <p>Generate detailed reports and gain insights into academic performance and trends.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
                                <Shield size={28} color="white" />
                            </div>
                            <h3>Secure & Reliable</h3>
                            <p>Enterprise-grade security with role-based access control and data protection.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-left">
                            <div className="footer-logo">
                                <GraduationCap size={32} />
                                <span>College ERP</span>
                            </div>
                            <p>Transforming education management with innovative technology solutions.</p>
                        </div>
                        <div className="footer-right">
                            <p>&copy; 2024 College ERP System. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
