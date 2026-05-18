import { createBrowserRouter } from "react-router";
import { UserRoutes } from "./UserRoutes"

export const router = createBrowserRouter([
  ...UserRoutes,
]);