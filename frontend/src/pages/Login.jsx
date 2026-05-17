import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../icons.jsx";
import { THEME } from "../theme.js";
import { MOCK_CREDENTIALS } from "../mock/data.js";

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
      const user = MOCK_CREDENTIALS.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem("crm_user", JSON.stringify({ email: user.email, role: user.role, name: user.name }));
        navigate("/processos");
      } else {
        setError("Email ou palavra-passe incorretos.");
        setLoading(false);
      }
    }, 400);
  }

  const INPUT = { width: "100%", padding: "9px 12px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8, outline: "none", boxSizing: "border-box", background: THEME.sidebar, color: THEME.text };

  return (
    <div style={{ minHeight: "100vh", background: THEME.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 380 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, background: THEME.accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="bar" size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: THEME.text }}>Smart CRM</div>
            <div style={{ fontSize: 12, color: THEME.textDim }}>Promaster · Angola</div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: THEME.card, borderRadius: 16, border: `1px solid ${THEME.border}`, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
          <h1 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700, color: THEME.text }}>Entrar</h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: THEME.textMuted, display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="utilizador@promaster.co" required style={INPUT} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: THEME.textMuted, display: "block", marginBottom: 6 }}>Palavra-passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={INPUT} />
            </div>

            {error && (
              <div style={{ background: THEME.dangerBg, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: THEME.danger }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#1d4ed8" : THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer", marginTop: 4, opacity: loading ? 0.8 : 1 }}>
              {loading ? "A entrar…" : "Entrar"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 11, color: THEME.textDim, marginTop: 20, marginBottom: 0 }}>
            Acesso restrito a colaboradores Promaster
          </p>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop: 16, background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 11, color: THEME.textMuted }}>
          <strong style={{ color: THEME.text }}>Demo:</strong>
          <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            <span>admin@promaster.co / admin123 <span style={{ color: THEME.textDim }}>(Admin)</span></span>
            <span>supervisor@promaster.co / super123 <span style={{ color: THEME.textDim }}>(Supervisor)</span></span>
            <span>adelina@promaster.co / pass123 <span style={{ color: THEME.textDim }}>(Standard)</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
