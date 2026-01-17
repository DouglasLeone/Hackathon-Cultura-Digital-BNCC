import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Badge } from '@/view/components/ui/badge';
import {
  GraduationCap,
  ChevronRight,
  Edit,
  Trash2,
  FileText,
  ClipboardList,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Unidade } from '@/model/entities';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/view/components/ui/alert-dialog';

interface UnidadeCardProps {
  unidade: Unidade;
  onEdit: (unidade: Unidade) => void;
  onDelete: (id: string) => void;
}

export function UnidadeCard({ unidade, onEdit, onDelete }: UnidadeCardProps) {
  const navigate = useNavigate();

  // In a real app we would check if these exist in the entity or passed as props
  // For now mocking the checks based on entity properties if they were joined
  const hasPlanoAula = !!unidade.plano_aula;
  const hasAtividade = !!unidade.atividade_avaliativa;

  return (
    <Card className="card-hover group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{unidade.tema}</CardTitle>
              {unidade.disciplina && (
                <Badge variant="outline" className="mt-1">
                  {unidade.disciplina.nome}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(unidade)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir unidade?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O plano de aula e atividades relacionados serão excluídos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(unidade.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {unidade.contexto_cultura_digital && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {unidade.contexto_cultura_digital}
          </p>
        )}

        <div className="flex gap-2 mb-4">
          <Badge
            variant={hasPlanoAula ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {hasPlanoAula ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            <FileText className="w-3 h-3" />
            Plano
          </Badge>
          <Badge
            variant={hasAtividade ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {hasAtividade ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            <ClipboardList className="w-3 h-3" />
            Atividade
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/disciplinas/${unidade.disciplina_id}/unidades/${unidade.id}`)}
          className="text-primary w-full justify-center"
        >
          Ver detalhes
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
