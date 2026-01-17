import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Badge } from '@/view/components/ui/badge';
import { BookOpen, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Disciplina } from '@/model/entities';
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

interface DisciplinaCardProps {
  disciplina: Disciplina;
  onEdit: (disciplina: Disciplina) => void;
  onDelete: (id: string) => void;
}

export function DisciplinaCard({ disciplina, onEdit, onDelete }: DisciplinaCardProps) {
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
              onClick={() => onEdit(disciplina)}
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
            {/* Counting units is a heavier operation, might be better to just leave empty or use a placeholder for now if I don't have the count available in the entity directly. 
                 The provided entity doesn't have a count. I'll mock it or omit it for now to avoid errors. 
              */}
            Ver unidades e materiais
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
