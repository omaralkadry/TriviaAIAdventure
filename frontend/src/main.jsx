import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Layout from "./components/Layout";
import HomePage from "./features/home/HomePage";
import LoginForm from "./features/login/LoginForm";
import RegistrationForm from "./features/login/RegistrationForm";
import JoinPage from "./features/room/JoinPage";
import Play from "./features/play/Play";
import RoomPage from "./features/room/RoomPage";
import Chat from "./components/Chat";
import { SocketProvider } from "./services/SocketContext";
import { AuthProvider } from "./services/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import Leaderboard from "./features/leaderboard/Leaderboard";
import JeopardyBoard from "./features/play/Jeopardy/Jeopardy";

const router = createBrowserRouter([
  {
    element: <Layout><Outlet /></Layout>,
    children: [
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
            <Chat />
          </ProtectedRoute>
        ),
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />,
      },
      {
        path: "/jeopardy",
        element: <JeopardyBoard />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <AuthProvider>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
      </AuthProvider>
    </React.StrictMode>
);
