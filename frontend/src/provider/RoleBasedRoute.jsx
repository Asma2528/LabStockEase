import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { UserSlicePath } from '../provider/slice/user.slice';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const { roles } = useSelector(UserSlicePath);

    if (!roles || !roles.some(role => allowedRoles.includes(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

RoleBasedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default RoleBasedRoute;
