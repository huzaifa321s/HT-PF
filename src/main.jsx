// src/index.jsx
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import ProposalPage from './pages/ProposalPage.jsx';
import NotFound from './pages/NotFound.jsx';
import Home from './pages/Home.jsx'; 
import EditProposal from './pages/EditProposal.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx'; 
import AgentDashboard from './pages/AgentDashboard.jsx'; 
import { Provider } from 'react-redux';
import { store } from './utils/store.js';
import Layout from './Layout.jsx';
import { LoadingProvider } from './context/LoadingContext.jsx';
import AdminProposalsPage from './pages/AdminProposalPage.jsx';
import BDMRegisterPage from './pages/BDMRegisterPage.jsx';
import FullPageLoader from './FullPageLoader.jsx';

// Protected Route
const ProtectedRoute = ({ allowedRoles, children }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState({ token: null, user: null });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user") || "null");

    setAuth({ token, user });
    setLoading(false);
  }, []);

  if (loading) {
    return <FullPageLoader />; 
  }

  if (!auth.token || !auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <NotFound />;
  }

  return children;
};

// Home Loader - Role based dashboard
const HomeRouter = () => {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  if (user?.role === "admin") return <Home />;
  if (user?.role === "agent") return <AgentDashboard />;

  return <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin-login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <HomeRouter />,
      },
      {
        path: "/create-proposal",
        element: (
          <ProtectedRoute allowedRoles={["agent", "admin"]}>
            <App />
          </ProtectedRoute>
        ),
      },
      {
        path: "/your-proposals",
        element: (
          <ProtectedRoute allowedRoles={["agent", "admin"]}>
            <ProposalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/edit-proposal/:id",
        element: (
          <ProtectedRoute allowedRoles={["agent", "admin"]}>
            <EditProposal />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute allowedRoles={["agent", "admin"]}>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/proposals",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProposalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/bdms",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <BDMRegisterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <LoadingProvider>
        <RouterProvider router={router} />
      </LoadingProvider>
    </Provider>
  </StrictMode>
);
