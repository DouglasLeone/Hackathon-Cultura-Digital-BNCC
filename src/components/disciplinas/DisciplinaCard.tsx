import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Disciplina } from '@/types';
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
} from '@/components/ui/alert-dialog';

interface DisciplinaCardProps {
  disciplina: Disciplina;
  unidadesCount: number;
  onDelete: (id: string) => void;
}

export function DisciplinaCard({ disciplina, unidadesCount, onDelete }: DisciplinaCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="card-hover group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{disciplina.nome}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {disciplina.serie}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/disciplinas/${disciplina.id}/editar`)}
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
                  <AlertDialogTitle>Excluir disciplina?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todas as unidades e materiais relacionados serão excluídos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(disciplina.id)}
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
        {disciplina.descricao && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {disciplina.descricao}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {unidadesCount} {unidadesCount === 1 ? 'unidade' : 'unidades'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/disciplinas/${disciplina.id}`)}
            className="text-primary"
          >
            Ver detalhes
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
