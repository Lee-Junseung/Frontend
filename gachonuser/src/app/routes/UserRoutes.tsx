import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import FindPassword from "../pages/FindPassword";
import Home from "../pages/Home";
import Chatbot from "../pages/Chatbot";
import Complaints from "../pages/Complaints";
import ComplaintSubmit from "../pages/ComplaintSubmit";
import Notices from "../pages/Notices";
import Profile from "../pages/Profile";

export const UserRoutes = [
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/auth/login",
    Component: Login,
  },
  {
    path: "/auth/signup",
    Component: SignUp,
  },
  {
    path: "/auth/password/identity",
    Component: FindPassword,
  },
  {
    path: "/chatbot",
    Component: Chatbot,
  },
  {
    path: "/complaints",
    Component: Complaints,
  },
  {
    path: "/complaints/submit",
    Component: ComplaintSubmit,
  },
  {
    path: "/notices",
    Component: Notices,
  },
  {
    path: "/users/me",
    Component: Profile,
  },
];