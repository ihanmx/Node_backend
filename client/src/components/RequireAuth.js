import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();
  //some method checks if the user has at least one of the allowed roles
  const hasRequiredRole = auth?.roles?.some((role) =>
    allowedRoles?.includes(role),
  ); // check if user has any of the allowed roles

  if (hasRequiredRole) {
    return <Outlet />;
  }

  if (auth?.user) {
    // logged in but wrong role
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return (
    // not logged in
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
