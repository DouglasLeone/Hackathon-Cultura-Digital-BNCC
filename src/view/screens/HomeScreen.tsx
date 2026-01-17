import { AppLayout } from '@/view/components/layout/AppLayout';
import { StatsCard } from '@/view/components/dashboard/StatsCard';
import { RecentActivity } from '@/view/components/dashboard/RecentActivity';
import { QuickActions } from '@/view/components/dashboard/QuickActions';
import { BookOpen, GraduationCap, FileText, ClipboardList } from 'lucide-react';
import { useHomeViewModel } from '@/viewmodel/useHomeViewModel';

const Index = () => {
  const { stats, historico, loading } = useHomeViewModel();

  if (loading) {
    // Optional: Add loading state if desired, or keep original behavior (which just rendered anyway)
    // Original code didn't return early, but logic implies it waited. 
    // We'll keep it simple and just return the view, referencing the data which starts empty/default.
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold edu-gradient-text">
            Bem-vindo, Professor!
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas disciplinas e gere materiais didáticos com IA alinhados à BNCC
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Disciplinas"
            value={stats.disciplinas}
            icon={<BookOpen className="w-5 h-5" />}
            variant="primary"
          />
          <StatsCard
            title="Unidades"
            value={stats.unidades}
            icon={<GraduationCap className="w-5 h-5" />}
            variant="accent"
          />
          <StatsCard
            title="Planos de Aula"
            value={stats.planos}
            icon={<FileText className="w-5 h-5" />}
            variant="success"
          />
          <StatsCard
            title="Atividades"
            value={stats.atividades}
            icon={<ClipboardList className="w-5 h-5" />}
            variant="default"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity historico={historico} />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
