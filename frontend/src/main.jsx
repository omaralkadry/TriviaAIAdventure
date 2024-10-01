import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import CustomNavbar from './components/CustomNavbar'
import HomePage from './features/home/HomePage'
import LoginForm from './features/login/LoginForm'
import RegistrationForm from "./features/login/RegistrationForm";
import JoinPage from "./features/room/JoinPage"
import Play from "./features/play/Play";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/register",
    element: <RegistrationForm />,
  },
  {
    path: "/join",
    element: <JoinPage />,
  },
  {
    path: "/play",
    element: <Play />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CustomNavbar />
    <RouterProvider router={router} />
  </React.StrictMode>
);