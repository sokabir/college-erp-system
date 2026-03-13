import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
        }}>
            <Outlet />
        </div>
    );
};

export default PublicLayout;
