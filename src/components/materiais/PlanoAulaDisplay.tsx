import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanoAula } from '@/types';
import { FileText, Clock, Target, BookOpen, Wrench, CheckSquare, Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlanoAulaDisplayProps {
  plano: PlanoAula;
}

export function PlanoAulaDisplay({ plano }: PlanoAulaDisplayProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="edu-gradient text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6" />
          <div>
            <CardTitle className="text-xl">{plano.titulo}</CardTitle>
            <p className="text-white/80 flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              {plano.duracao}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Objetivos */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <Target className="w-5 h-5 text-primary" />
            Objetivos de Aprendizagem
          </h3>
          <ul className="space-y-2">
            {plano.objetivos.map((objetivo, i) => (
              <li key={i} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 min-w-[24px] justify-center">
                  {i + 1}
                </Badge>
                <span className="text-muted-foreground">{objetivo}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Conteúdo Programático */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            Conteúdo Programático
          </h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="whitespace-pre-wrap">{plano.conteudo_programatico}</p>
          </div>
        </div>

        {/* Metodologia */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <Wrench className="w-5 h-5 text-primary" />
            Metodologia
          </h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="whitespace-pre-wrap">{plano.metodologia}</p>
          </div>
        </div>

        {/* Recursos Didáticos */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <Link className="w-5 h-5 text-primary" />
            Recursos Didáticos
          </h3>
          <div className="flex flex-wrap gap-2">
            {plano.recursos_didaticos.map((recurso, i) => (
              <Badge key={i} variant="secondary">
                {recurso}
              </Badge>
            ))}
          </div>
        </div>

        {/* Avaliação */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <CheckSquare className="w-5 h-5 text-primary" />
            Avaliação
          </h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="whitespace-pre-wrap">{plano.avaliacao}</p>
          </div>
        </div>

        {/* Referências */}
        {plano.referencias && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Referências</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plano.referencias}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
