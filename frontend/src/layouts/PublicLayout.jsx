import { Outlet, useLocation } from 'react-router-dom';

const PublicLayout = () => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    // Landing page has its own layout, other pages need centering
    if (isLandingPage) {
        return (
            <div style={{
                minHeight: '100vh',
                width: '100%',
                margin: 0,
                padding: 0
            }}>
                <Outlet />
            </div>
        );
    }

    // Login, Register, Apply pages - centered layout
    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            padding: '2rem'
        }}>
            <Outlet />
        </div>
    );
};

export default PublicLayout;
