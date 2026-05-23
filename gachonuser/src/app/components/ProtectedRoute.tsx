import { Outlet, Navigate } from "react-router";

export default function ProtectedRoute() {
  const isAuthenticated =
    sessionStorage.getItem("isLoggedIn") === "true" ||
    document.cookie.split(";").some(c => c.trim().startsWith("JSESSIONID="));

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}