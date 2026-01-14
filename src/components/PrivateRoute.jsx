import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole = null }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  
  if (!usuario) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole && usuario.tipo !== requiredRole) {
    return <Navigate to="/productos" replace />;
  }
  
  return children;
};

export default PrivateRoute; 