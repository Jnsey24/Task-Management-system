import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/home";
import Tassk from "./pages/tassk";
import Shop from "./pages/shop";
import Profile from "./pages/profile";
import Login from "./auth/login";
import Register from "./auth/register";
import ProtectedRoutes from "./auth/ProtectedRoutes";
import Logout from "./auth/logout";
import Dashboard from './pages/dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/task" element={<Tassk />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
