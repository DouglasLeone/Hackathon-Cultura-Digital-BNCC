import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, GraduationCap, Home, History, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Disciplinas', path: '/disciplinas' },
  { icon: GraduationCap, label: 'Unidades', path: '/unidades' },
  { icon: Sparkles, label: 'Gerar Material', path: '/gerar' },
  { icon: History, label: 'Histórico', path: '/historico' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl edu-gradient flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">Cultura Digital</h1>
            <p className="text-xs text-sidebar-foreground/60">Planejador BNCC</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/50 text-center">
          <p>Sistema de Planejamento</p>
          <p>Hackathon IFPI 2026</p>
        </div>
      </div>
    </aside>
  );
}
