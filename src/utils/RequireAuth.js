import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '~/hooks/useAuth';

import PropTypes from 'prop-types';

function RequireAuth({ allowedRoles }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (isAuthenticated) {
        if (allowedRoles && allowedRoles.length > 0) {
            const hasRequiredRole = allowedRoles.some((role) => user.roleNames.includes(role));

            if (!hasRequiredRole) {
                return <Navigate to="/access-denied" />;
            }
        }
        return <Outlet />;
    } else {
        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
}

RequireAuth.propTypes = {
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default RequireAuth;
