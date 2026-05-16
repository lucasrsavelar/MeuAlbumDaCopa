import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/login/Login";
import Cadastro from "./pages/cadastro/Cadastro";
import Dashboard from "./pages/dashboard/Dashboard";
import VerFigurinhas from "./pages/ver-figurinhas/VerFigurinhas";
import AdicionarFigurinha from "./pages/adicionar-figurinha/AdicionarFigurinha";
import RemoverFigurinha from "./pages/remover-figurinha/RemoverFigurinha";
import Trocas from "./pages/trocas/Trocas";
import ProporTroca from "./pages/propor-troca/ProporTroca";
import VerPropostas from "./pages/ver-propostas/VerPropostas";
import VerGrupo from "./pages/ver-grupo/VerGrupo";
import "./index.css";
import { useEffect } from "react";
import { onAuthStateChange } from "./services/authService";
import { AuthProvider } from "./context/AuthContext";

/** Rotas públicas que não exigem sessão */
const PUBLIC_ROUTES = ["/", "/cadastro"];

/** Componente interno que gerencia redirecionamento com base na sessão */
function AuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data } = onAuthStateChange((session) => {
      const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

      if (session && isPublicRoute) {
        // Logado + em rota pública → vai para dashboard
        navigate("/dashboard", { replace: true });
      } else if (!session && !isPublicRoute) {
        // Sem sessão + em rota protegida → vai para login
        navigate("/", { replace: true });
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthRedirect />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ver-figurinhas/:tipo" element={<VerFigurinhas />} />
          <Route path="/adicionar-figurinha" element={<AdicionarFigurinha />} />
          <Route path="/remover-figurinha" element={<RemoverFigurinha />} />
          <Route path="/trocas" element={<Trocas />} />
          <Route path="/propor-troca/:username" element={<ProporTroca />} />
          <Route path="/ver-propostas" element={<VerPropostas />} />
          <Route path="/ver-grupo/:nomeGrupo" element={<VerGrupo />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;