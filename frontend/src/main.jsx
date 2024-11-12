import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import CustomNavbar from './components/CustomNavbar'
import HomePage from './features/home/HomePage'
import LoginForm from './features/login/LoginForm'
import RegistrationForm from "./features/login/RegistrationForm";
import Play from "./features/play/Play";
import RoomPage from "./features/room/RoomPage";
import Chat from "./components/Chat";
import { SocketProvider } from "./services/SocketContext";
import { AuthProvider } from "./services/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import Leaderboard from "./features/leaderboard/Leaderboard";
import JeopardyBoard from "./features/play/Jeopardy/Jeopardy";
import App from './App';

const AppWrapper = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,
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
        element: (
          <Leaderboard />
        ),
      },
      {
        path: "/jeopardy",
        element: (
          <JeopardyBoard />
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
