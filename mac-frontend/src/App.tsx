import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/login/Login";
import Cadastro from "./pages/cadastro/Cadastro";
import Dashboard from "./pages/dashboard/Dashboard";
import VerFigurinhas from "./pages/ver-figurinhas/VerFigurinhas";
import AdicionarFigurinha from "./pages/adicionar-figurinha/AdicionarFigurinha";
import Trocas from "./pages/trocas/Trocas";
import "./index.css";
import { useEffect } from "react";
import { onAuthStateChange } from "./services/authService";

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
      <AuthRedirect />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ver-figurinhas/:tipo" element={<VerFigurinhas />} />
        <Route path="/adicionar-figurinha" element={<AdicionarFigurinha />} />
        <Route path="/trocas" element={<Trocas />} />
      </Routes>
    </Router>
  );
}

export default App;