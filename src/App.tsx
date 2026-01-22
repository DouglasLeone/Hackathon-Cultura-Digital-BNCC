import { lazy, Suspense } from 'react';
import { Toaster } from "@/view/components/ui/toaster";
import { Toaster as Sonner } from "@/view/components/ui/sonner";
import { TooltipProvider } from "@/view/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./view/components/ErrorBoundary";
import { LoadingScreen } from "./view/components/LoadingScreen";
import { OnboardingModal } from "./view/components/onboarding/OnboardingModal";

// Code Splitting: Lazy load all screens
const HomeScreen = lazy(() => import("./view/screens/HomeScreen"));
const DisciplinasListScreen = lazy(() => import("./view/screens/DisciplinasListScreen"));
const DisciplinaDetailScreen = lazy(() => import("./view/screens/DisciplinaDetailScreen"));
const UnidadesScreen = lazy(() => import("./view/screens/UnidadesScreen"));
const UnidadeDetailScreen = lazy(() => import("./view/screens/UnidadeDetailScreen"));
const HistoricoScreen = lazy(() => import("./view/screens/HistoricoScreen"));
const SettingsScreen = lazy(() => import("./view/screens/SettingsScreen"));
const EnsinoScreen = lazy(() => import("./view/screens/EnsinoScreen"));
const NotFoundScreen = lazy(() => import("./view/screens/NotFoundScreen"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OnboardingModal />
          <Suspense fallback={<LoadingScreen />}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
