import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AtividadeAvaliativa, Questao } from '@/types';
import { ClipboardList, Award, CheckCircle, Circle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AtividadeDisplayProps {
  atividade: AtividadeAvaliativa;
}

const tipoLabels: Record<string, string> = {
  exercicio: 'Exercício',
  prova: 'Prova',
  trabalho: 'Trabalho',
  quiz: 'Quiz',
};

function QuestaoItem({ questao, index }: { questao: Questao; index: number }) {
  return (
    <div className="p-4 rounded-lg bg-muted/50 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Badge className="mt-0.5">{index + 1}</Badge>
          <p className="font-medium">{questao.enunciado}</p>
        </div>
        <Badge variant="outline">{questao.pontuacao} pts</Badge>
      </div>

      {questao.tipo === 'multipla_escolha' && questao.alternativas && (
        <div className="ml-8 space-y-2">
          {questao.alternativas.map((alt, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {questao.resposta_correta === i ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={questao.resposta_correta === i ? 'font-medium text-success' : 'text-muted-foreground'}>
                {String.fromCharCode(65 + i)}) {alt}
              </span>
            </div>
          ))}
        </div>
      )}

      {questao.tipo === 'verdadeiro_falso' && (
        <div className="ml-8 flex gap-4 text-sm">
          <span className={questao.resposta_correta === 'V' ? 'font-medium text-success' : 'text-muted-foreground'}>
            ( {questao.resposta_correta === 'V' ? 'X' : ' '} ) Verdadeiro
          </span>
          <span className={questao.resposta_correta === 'F' ? 'font-medium text-success' : 'text-muted-foreground'}>
            ( {questao.resposta_correta === 'F' ? 'X' : ' '} ) Falso
          </span>
        </div>
      )}

      {questao.tipo === 'dissertativa' && (
        <div className="ml-8 p-3 border-2 border-dashed rounded-lg text-sm text-muted-foreground">
          <HelpCircle className="w-4 h-4 inline mr-2" />
          Resposta dissertativa esperada
        </div>
      )}
    </div>
  );
}

export function AtividadeDisplay({ atividade }: AtividadeDisplayProps) {
  return (
    <Card className="border-accent/20">
      <CardHeader className="bg-accent text-accent-foreground rounded-t-lg">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6" />
          <div>
            <CardTitle className="text-xl">{atividade.titulo}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {tipoLabels[atividade.tipo] || atividade.tipo}
              </Badge>
              <span className="text-white/80 flex items-center gap-1">
                <Award className="w-4 h-4" />
                {atividade.pontuacao_total} pontos
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Instruções */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Instruções</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{atividade.instrucoes}</p>
        </div>

        {/* Questões */}
        <div>
          <h3 className="font-semibold text-lg mb-4">
            Questões ({atividade.questoes.length})
          </h3>
          <div className="space-y-4">
            {atividade.questoes.map((questao, i) => (
              <QuestaoItem key={questao.id || i} questao={questao} index={i} />
            ))}
          </div>
        </div>

        {/* Critérios de Avaliação */}
        {atividade.criterios_avaliacao && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Critérios de Avaliação</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {atividade.criterios_avaliacao}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
