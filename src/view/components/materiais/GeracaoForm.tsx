import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Textarea } from '@/view/components/ui/textarea';
import { Label } from '@/view/components/ui/label';
import { Loader2, Sparkles, Wand2, FileText, ClipboardList, Lightbulb } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/view/components/ui/select';
import { Unidade, Disciplina } from '@/model/entities';
import { Badge } from '@/view/components/ui/badge';

interface GeracaoFormProps {
  disciplinas: Disciplina[];
  unidades: Unidade[];
  onGerarPlanoAula: (unidadeId: string, instrucoes?: string) => Promise<void>;
  onGerarAtividade: (unidadeId: string, instrucoes?: string) => Promise<void>;
  onSugerirUnidade: (disciplinaId: string, instrucoes?: string) => Promise<void>;
  isLoading: boolean;
}

export function GeracaoForm({
  disciplinas,
  unidades,
  onGerarPlanoAula,
  onGerarAtividade,
  onSugerirUnidade,
  isLoading,
}: GeracaoFormProps) {
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>('');
  const [selectedUnidade, setSelectedUnidade] = useState<string>('');
  const [instrucoes, setInstrucoes] = useState('');
  const [tipoGeracao, setTipoGeracao] = useState<'plano' | 'atividade' | 'sugestao'>('plano');

  const filteredUnidades = unidades.filter(u => 
    !selectedDisciplina || u.disciplina_id === selectedDisciplina
  );

  const handleGerar = async () => {
    if (tipoGeracao === 'sugestao') {
      if (selectedDisciplina) {
        await onSugerirUnidade(selectedDisciplina, instrucoes || undefined);
      }
    } else if (selectedUnidade) {
      if (tipoGeracao === 'plano') {
        await onGerarPlanoAula(selectedUnidade, instrucoes || undefined);
      } else {
        await onGerarAtividade(selectedUnidade, instrucoes || undefined);
      }
    }
  };

  const canGenerate = tipoGeracao === 'sugestao' 
    ? !!selectedDisciplina 
    : !!selectedUnidade;

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Gerar Material com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Geração */}
        <div className="space-y-3">
          <Label>O que deseja gerar?</Label>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={tipoGeracao === 'plano' ? 'default' : 'outline'}
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setTipoGeracao('plano')}
            >
              <FileText className="w-5 h-5" />
              <span>Plano de Aula</span>
            </Button>
            <Button
              variant={tipoGeracao === 'atividade' ? 'default' : 'outline'}
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setTipoGeracao('atividade')}
            >
              <ClipboardList className="w-5 h-5" />
              <span>Atividade</span>
            </Button>
            <Button
              variant={tipoGeracao === 'sugestao' ? 'default' : 'outline'}
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setTipoGeracao('sugestao')}
            >
              <Lightbulb className="w-5 h-5" />
              <span>Sugerir Unidade</span>
            </Button>
          </div>
        </div>

        {/* Seleção de Disciplina */}
        <div className="space-y-2">
          <Label>Disciplina</Label>
          <Select value={selectedDisciplina} onValueChange={(v) => {
            setSelectedDisciplina(v);
            setSelectedUnidade('');
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a disciplina" />
            </SelectTrigger>
            <SelectContent>
              {disciplinas.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nome} - {d.serie}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Seleção de Unidade (para plano e atividade) */}
        {tipoGeracao !== 'sugestao' && (
          <div className="space-y-2">
            <Label>Unidade/Aula</Label>
            <Select value={selectedUnidade} onValueChange={setSelectedUnidade}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {filteredUnidades.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {selectedDisciplina 
                      ? 'Nenhuma unidade encontrada para esta disciplina'
                      : 'Selecione uma disciplina primeiro'}
                  </div>
                ) : (
                  filteredUnidades.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <span>{u.tema}</span>
                        {u.disciplina && (
                          <Badge variant="outline" className="text-xs">
                            {u.disciplina.nome}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Instruções Adicionais */}
        <div className="space-y-2">
          <Label>Instruções Adicionais (opcional)</Label>
          <Textarea
            placeholder={
              tipoGeracao === 'sugestao'
                ? 'Ex: Sugira temas focados em pensamento computacional e programação básica...'
                : 'Ex: Foque em atividades práticas, inclua exemplos do cotidiano...'
            }
            value={instrucoes}
            onChange={(e) => setInstrucoes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Botão Gerar */}
        <Button 
          onClick={handleGerar} 
          disabled={!canGenerate || isLoading}
          className="w-full edu-gradient"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Gerando com IA...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              {tipoGeracao === 'sugestao' ? 'Sugerir Unidades' : 'Gerar Material'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
