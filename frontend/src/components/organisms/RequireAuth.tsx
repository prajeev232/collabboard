import type { JSX } from "react";
import { getAccessToken } from "../../api/http";
import { Navigate } from "react-router-dom";

export const RequireAuth = ({children} : { children: JSX.Element } ) => {
    const token = getAccessToken();
    if (!token) return <Navigate to='/login' replace />;
    return children;
}