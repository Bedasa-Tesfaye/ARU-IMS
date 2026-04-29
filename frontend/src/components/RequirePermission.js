import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequirePermission({ permission, children, fallbackPath = '/dashboard' }) {
  const location = useLocation();
  const { loading, hasPermission } = useAuth();

  if (loading) return null;

  if (!hasPermission(permission)) {
    return <Navigate to={fallbackPath} replace state={{ from: location }} />;
  }

  return children;
}

