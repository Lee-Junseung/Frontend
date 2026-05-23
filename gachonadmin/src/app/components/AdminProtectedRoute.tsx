import { Navigate, Outlet } from "react-router";

export default function AdminProtectedRoute() {
    const isAdminLoggedIn =
        sessionStorage.getItem("isLoggedIn") === "true" ||
        document.cookie.split(";").some(c => c.trim().startsWith("JSESSIONID="));

    if (!isAdminLoggedIn) {
        return <Navigate to="/admin/auth/login" replace />;
    }

    return <Outlet />;
}