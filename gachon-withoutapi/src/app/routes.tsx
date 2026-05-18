import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import FindPassword from "./pages/FindPassword";
import Home from "./pages/Home";
import Chatbot from "./pages/Chatbot";
import Complaints from "./pages/Complaints";
import ComplaintSubmit from "./pages/ComplaintSubmit";
import Notices from "./pages/Notices";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminStatistics from "./pages/admin/AdminStatistics";
import AdminRegulations from "./pages/admin/AdminRegulations";

export const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/auth/login", Component: Login },
  { path: "/auth/signup", Component: SignUp },
  { path: "/auth/password/identity", Component: FindPassword },
  { path: "/chatbot", Component: Chatbot },
  { path: "/complaints", Component: Complaints },
  { path: "/complaints/submit", Component: ComplaintSubmit },
  { path: "/notices", Component: Notices },
  { path: "/users/me", Component: Profile },
  // Admin Routes
  { path: "/admin/auth/login", Component: AdminLogin },
  { path: "/admin/complaints", Component: AdminComplaints },
  { path: "/admin/users", Component: AdminStudents },
  { path: "/admin/chatlogs/stats", Component: AdminStatistics },
  { path: "/regulations", Component: AdminRegulations },
]);