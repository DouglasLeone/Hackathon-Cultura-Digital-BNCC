import { Toaster } from "@/view/components/ui/toaster";
import { Toaster as Sonner } from "@/view/components/ui/sonner";
import { TooltipProvider } from "@/view/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from "./view/screens/HomeScreen";
import NotFoundScreen from "./view/screens/NotFoundScreen";
import DisciplinasListScreen from "./view/screens/DisciplinasListScreen";
import DisciplinaDetailScreen from "./view/screens/DisciplinaDetailScreen";
import UnidadeDetailScreen from "./view/screens/UnidadeDetailScreen";
import UnidadesScreen from "./view/screens/UnidadesScreen";

import HistoricoScreen from "./view/screens/HistoricoScreen";
import SettingsScreen from "./view/screens/SettingsScreen";
import EnsinoScreen from "./view/screens/EnsinoScreen";
import { OnboardingModal } from "./view/components/onboarding/OnboardingModal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OnboardingModal />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/ensino" element={<EnsinoScreen />} />
          <Route path="/disciplinas" element={<DisciplinasListScreen />} />
          <Route path="/disciplinas/:id" element={<DisciplinaDetailScreen />} />
          <Route path="/disciplinas/:disciplinaId/unidades/:unidadeId" element={<UnidadeDetailScreen />} />
          <Route path="/unidades" element={<UnidadesScreen />} />

          <Route path="/historico" element={<HistoricoScreen />} />
          <Route path="/configuracoes" element={<SettingsScreen />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
