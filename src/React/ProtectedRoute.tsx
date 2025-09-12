import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import MainSetup from './MainSetupReact';

type ProtectedRouteProps = {
    allowedRoles: string[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const currentUser = MainSetup.currentUser;

    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    const isAuthorized = allowedRoles.includes(currentUser.systemRoleName);

    if (!isAuthorized) {
        console.warn(`Access denied for user ${currentUser.userName}. Required roles: ${allowedRoles.join(', ')}`);
        return <Navigate to="/" replace />;
    }
    
    return <Outlet />;
};

export default ProtectedRoute;