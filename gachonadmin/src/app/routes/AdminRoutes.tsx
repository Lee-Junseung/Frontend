import { Navigate } from "react-router";
import AdminLogin from "../pages/AdminLogin";
import AdminComplaints from "../pages/AdminComplaints";
// import AdminNotices from "./pages/AdminNotices";
import AdminStudents from "../pages/AdminStudents";
import AdminStatistics from "../pages/AdminStatistics";
import AdminRegulations from "../pages/AdminRegulations";

export const AdminRoutes = [
  // 루트 경로("/") 접속 시 로그인 페이지로 리다이렉트
  {
    path: "/",
    element: <Navigate to="/admin/auth/login" replace />,
  },
  { 
    path: "/admin/auth/login", 
    Component: AdminLogin, 
  },
  {
    path: "/admin/complaints",
    Component: AdminComplaints,
  },
  // {
  //   path: "/admin/notices",
  //   Component: AdminNotices,
  // },
  {
    path: "/admin/users",
    Component: AdminStudents,
  },
  {
    path: "/admin/users/:id",
    Component: AdminStudents,
  },
  {
    path: "/admin/chatlogs/stats",
    Component: AdminStatistics,
  },
  {
    path: "/regulations",
    Component: AdminRegulations,
  },
];