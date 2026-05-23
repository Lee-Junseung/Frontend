import { Navigate } from "react-router";
import AdminLogin from "../pages/AdminLogin";
import AdminComplaints from "../pages/AdminComplaints";
import AdminStudents from "../pages/AdminStudents";
import AdminStatistics from "../pages/AdminStatistics";
import AdminRegulations from "../pages/AdminRegulations";
import AdminProtectedRoute from "../components/AdminProtectedRoute";

export const AdminRoutes = [
  {
    path: "/",
    element: <Navigate to="/admin/auth/login" replace />,
  },
  {
    path: "/admin/auth/login",
    Component: AdminLogin,
  },
  {
    Component: AdminProtectedRoute,
    children: [
      { path: "/admin/complaints", Component: AdminComplaints },
      { path: "/admin/users", Component: AdminStudents },
      { path: "/admin/users/:id", Component: AdminStudents },
      { path: "/admin/chatlogs/stats", Component: AdminStatistics },
      { path: "/regulations", Component: AdminRegulations },
    ],
  },
];