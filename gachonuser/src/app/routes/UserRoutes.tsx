import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import FindPassword from "../pages/FindPassword";
import Home from "../pages/Home";
import Chatbot from "../pages/Chatbot";
import Complaints from "../pages/Complaints";
import ComplaintSubmit from "../pages/ComplaintSubmit";
import Notices from "../pages/Notices";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

export const UserRoutes = [
  {
    path: "/",
    Component: Layout,
    children: [
      // 인증 불필요 라우트
      { index: true, Component: Home },
      { path: "notices", Component: Notices },
      { path: "chatbot", Component: Chatbot },

      // 인증 라우트 그룹
      {
        path: "auth",
        children: [
          { path: "login", Component: Login },
          { path: "signup", Component: SignUp },
          { path: "password/identity", Component: FindPassword },
        ],
      },

      // 인증 필요 라우트
      {
        Component: ProtectedRoute,
        children: [
          { path: "complaints", Component: Complaints },
          { path: "complaints/submit", Component: ComplaintSubmit },
          { path: "users/me", Component: Profile },
        ],
      },

      // 404
      { path: "*", Component: NotFound },
    ],
  },
];