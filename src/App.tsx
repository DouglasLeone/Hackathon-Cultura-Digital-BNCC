import { Toaster } from "@/view/components/ui/toaster";
import { Toaster as Sonner } from "@/view/components/ui/sonner";
import { TooltipProvider } from "@/view/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from "./view/screens/HomeScreen";
import NotFoundScreen from "./view/screens/NotFoundScreen";
import DisciplinasListScreen from "./view/screens/DisciplinasListScreen";
import DisciplinaDetailScreen from "./view/screens/DisciplinaDetailScreen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/disciplinas" element={<DisciplinasListScreen />} />
          <Route path="/disciplinas/:id" element={<DisciplinaDetailScreen />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
