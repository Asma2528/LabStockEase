import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { UserSlicePath } from '../provider/slice/user.slice';

const AuthorizedRoute = ({ element, allowedRoles }) => {
  const user = useSelector(UserSlicePath); // Get user state
  const roles = user?.roles || []; // Ensure roles is always an array

  if (!roles.length || !roles.some(role => allowedRoles.includes(role))) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

AuthorizedRoute.propTypes = {
  element: PropTypes.element.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AuthorizedRoute;
