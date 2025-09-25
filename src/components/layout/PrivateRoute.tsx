import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '@/Context/AuthContext';

const PrivateRoute = ({ element }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // ممكن تعمل هنا سبينر أو رسالة
    return <div className="text-center p-10"> </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default PrivateRoute;
