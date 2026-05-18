import { createBrowserRouter } from "react-router";
import { AdminRoutes } from "./AdminRoutes";

export const router = createBrowserRouter([
  ...AdminRoutes,
]);