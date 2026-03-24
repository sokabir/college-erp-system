import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
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
};

export default PublicLayout;
