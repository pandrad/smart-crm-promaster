import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login.jsx";
import { Main } from "./pages/Main.jsx";

function RequireAuth({ children }) {
  const user = localStorage.getItem("crm_user");
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Main shell handles all sub-routes (/processos, /tarefas, /inbox, /arquivo) */}
        <Route path="/*" element={<RequireAuth><Main /></RequireAuth>} />
      </Routes>
    </HashRouter>
  );
}
