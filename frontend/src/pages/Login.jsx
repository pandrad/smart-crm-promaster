import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../icons.jsx";

// Mock credentials — replaced by real auth in Step 5
const MOCK_USERS = [
  { email: "admin@promaster.co",   password: "admin123",  role: "admin",   name: "Admin" },
  { email: "adelina@promaster.co", password: "pass123",   role: "cotacao", name: "Adelina Rodrigues" },
];

export function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem("crm_user", JSON.stringify({ email: user.email, role: user.role, name: user.name }));
        navigate("/");
      } else {
        setError("Email ou palavra-passe incorretos.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 380 }}>
        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, background: "#2563eb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="bar" size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>Processo Comercial</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Promaster · Angola</div>
          </div>
        </div>

        {/* card */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h1 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Entrar</h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="utilizador@promaster.co"
                required
                style={{
                  width: "100%", padding: "9px 12px", fontSize: 13,
                  border: "1px solid #e2e8f0", borderRadius: 8, outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                Palavra-passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%", padding: "9px 12px", fontSize: 13,
                  border: "1px solid #e2e8f0", borderRadius: 8, outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#b91c1c" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", background: loading ? "#93c5fd" : "#2563eb", color: "white",
                border: "none", borderRadius: 8, padding: "10px", fontSize: 14,
                fontWeight: 600, cursor: loading ? "default" : "pointer", marginTop: 4,
              }}
            >
              {loading ? "A entrar…" : "Entrar"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 20, marginBottom: 0 }}>
            Acesso restrito a colaboradores Promaster
          </p>
        </div>

        {/* mock hint */}
        <div style={{ marginTop: 16, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", fontSize: 11, color: "#15803d" }}>
          <strong>Demo:</strong> admin@promaster.co / admin123 &nbsp;|&nbsp; adelina@promaster.co / pass123
        </div>
      </div>
    </div>
  );
}
