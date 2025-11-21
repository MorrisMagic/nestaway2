import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import Home from "./pages/Home";
import CreateProperty from "./pages/CreateProperty";
import axios from "axios";


axios.defaults.withCredentials = true;

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/create-property" element={
          <ProtectedRoute>
            <CreateProperty />
          </ProtectedRoute>
        } />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
