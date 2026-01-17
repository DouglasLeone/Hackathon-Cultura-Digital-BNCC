import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { BookOpen, GraduationCap, Sparkles, Plus } from 'lucide-react';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: BookOpen,
      label: 'Nova Disciplina',
      description: 'Cadastrar uma nova disciplina',
      onClick: () => navigate('/disciplinas/nova'),
      variant: 'default' as const,
    },
    {
      icon: GraduationCap,
      label: 'Nova Unidade',
      description: 'Criar uma nova aula/unidade',
      onClick: () => navigate('/unidades/nova'),
      variant: 'outline' as const,
    },
    {
      icon: Sparkles,
      label: 'Gerar Material',
      description: 'Gerar plano de aula ou atividade',
      onClick: () => navigate('/gerar'),
      variant: 'outline' as const,
    },
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="h-auto py-4 justify-start"
            onClick={action.onClick}
          >
            <action.icon className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">{action.label}</p>
              <p className="text-xs opacity-70">{action.description}</p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
