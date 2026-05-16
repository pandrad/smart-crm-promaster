import { HashRouter as BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login.jsx";
import { Main } from "./pages/Main.jsx";

function RequireAuth({ children }) {
  const user = localStorage.getItem("crm_user");
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/"      element={<RequireAuth><Main /></RequireAuth>} />
        <Route path="*"      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
