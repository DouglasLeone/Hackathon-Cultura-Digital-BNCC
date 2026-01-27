import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Button } from '@/view/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}


export function AppLayout({ children }: AppLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Mobile Sidebar Toggle - Hidden on Desktop */}
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 rounded-l-none rounded-r-xl shadow-md border-y border-r h-12 w-8 bg-card"
        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isMobileOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on Mobile, Static on Desktop */}
      <Sidebar
        onClose={() => setIsMobileOpen(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:translate-x-0 md:static md:z-0",
          !isMobileOpen && "-translate-x-full"
        )}
      />

      <main className="flex-1 overflow-auto w-full">
        <div className="container py-8 px-4 sm:px-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

