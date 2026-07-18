import React from 'react';
import { Navigate } from 'react-router-dom';

/** Legacy route — student home is now /dashboard. */
const Account: React.FC = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Account;
