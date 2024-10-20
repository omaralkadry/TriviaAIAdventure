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
import RoomPage from "./features/room/RoomPage";
import Chat from "./components/Chat";
import { SocketProvider } from "./services/SocketContext";
import { AuthProvider } from "./services/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";

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
    element: (
      <ProtectedRoute>
        <JoinPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/play",
    element: (
      <ProtectedRoute>
        <Play />
      </ProtectedRoute>
    ),
  },
  {
    path: "/room",
    element: (
      <ProtectedRoute>
        <RoomPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <SocketProvider>
          <Chat />
        </SocketProvider>
      </ProtectedRoute>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CustomNavbar />
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);