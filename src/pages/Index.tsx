import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { BookOpen, GraduationCap, FileText, ClipboardList } from 'lucide-react';
import { getStats, getHistorico } from '@/services/database';
import { HistoricoGeracao } from '@/types';

const Index = () => {
  const [stats, setStats] = useState({ disciplinas: 0, unidades: 0, planos: 0, atividades: 0 });
  const [historico, setHistorico] = useState<HistoricoGeracao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, historicoData] = await Promise.all([
          getStats(),
          getHistorico(),
        ]);
        setStats(statsData);
        setHistorico(historicoData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
