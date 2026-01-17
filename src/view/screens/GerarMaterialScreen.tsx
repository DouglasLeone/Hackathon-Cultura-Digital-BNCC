
import { AppLayout } from '@/view/components/layout/AppLayout';
import { GeracaoForm } from '@/view/components/materiais/GeracaoForm';
import { useGerarMaterialViewModel } from '@/viewmodel/useGerarMaterialViewModel';

const GerarMaterialScreen = () => {
    const {
        disciplinas,
        unidades,
        loading,
        gerarPlanoAula,
        gerarAtividade,
        sugerirUnidade
    } = useGerarMaterialViewModel();

    return (
        <AppLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold edu-gradient-text">Gerador de Materiais</h1>
                    <p className="text-muted-foreground mt-2">
                        Utilize a Inteligência Artificial para criar planos de aula, atividades e slides em segundos.
                    </p>
                </div>

                <div className="grid gap-6">
                    <GeracaoForm
                        disciplinas={disciplinas}
                        unidades={unidades}
                        isLoading={loading}
                        onGerarPlanoAula={async (id, instr) => { await gerarPlanoAula(id, instr); }}
                        onGerarAtividade={async (id, instr) => { await gerarAtividade(id, instr); }}
                        onSugerirUnidade={async (id, instr) => { await sugerirUnidade(id, instr); }}
                    />
                </div>

                <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground border border-dashed">
                    <h3 className="font-semibold mb-2">Dicas para melhores resultados:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Seja específico nas instruções adicionais.</li>
                        <li>Verifique o plano de aula antes de gerar a atividade.</li>
                        <li>Utilize a sugestão de unidades caso esteja sem ideias de temas.</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
};

export default GerarMaterialScreen;
