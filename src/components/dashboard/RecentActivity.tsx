import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ClipboardList, Presentation, Clock } from 'lucide-react';
import { HistoricoGeracao } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentActivityProps {
  historico: HistoricoGeracao[];
}

const typeIcons = {
  plano_aula: FileText,
  atividade: ClipboardList,
  slides: Presentation,
};

const typeLabels = {
  plano_aula: 'Plano de Aula',
  atividade: 'Atividade',
  slides: 'Slides',
};

const typeColors = {
  plano_aula: 'bg-primary/10 text-primary',
  atividade: 'bg-accent/10 text-accent',
  slides: 'bg-warning/10 text-warning',
};

export function RecentActivity({ historico }: RecentActivityProps) {
  if (historico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum material gerado ainda</p>
            <p className="text-sm">Comece criando uma disciplina e gerando materiais!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {historico.slice(0, 5).map((item) => {
          const Icon = typeIcons[item.tipo];
          return (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className={`p-2 rounded-lg ${typeColors[item.tipo]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.titulo}</p>
                <p className="text-sm text-muted-foreground">{typeLabels[item.tipo]}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
