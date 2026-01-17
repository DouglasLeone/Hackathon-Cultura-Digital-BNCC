
import { useParams } from 'react-router-dom';
import { useUnidadeDetailViewModel } from '@/viewmodel/useUnidadeDetailViewModel';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Badge } from '@/view/components/ui/badge';
import { Button } from '@/view/components/ui/button';
import { FileText, ClipboardList, Presentation, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const UnidadeDetailScreen = () => {
    const { unidadeId } = useParams<{ unidadeId: string }>();
    const {
        unidade,
        loading,
        generating,
        generatePlanoAula,
        generateAtividade,
        generateSlides
    } = useUnidadeDetailViewModel(unidadeId || '');

    if (loading) {
        return <AppLayout><div>Carregando...</div></AppLayout>;
    }

    if (!unidade) {
        return <AppLayout><div>Unidade não encontrada.</div></AppLayout>;
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link to={`/disciplinas/${unidade.disciplina_id}`} className="text-muted-foreground hover:text-primary">
                                <ArrowLeft className="w-4 h-4" />
                                Voltar para Disciplina
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold edu-gradient-text">{unidade.tema}</h1>
                        <p className="text-muted-foreground mt-2">{unidade.contexto_cultura_digital}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Plano de Aula */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Plano de Aula</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {unidade.plano_aula ? (
                                <div className="space-y-4 pt-4">
                                    <h3 className="font-semibold">{unidade.plano_aula.titulo}</h3>
                                    <Badge variant="outline">Gerado em: {new Date(unidade.plano_aula.created_at).toLocaleDateString()}</Badge>
                                    <Button variant="outline" className="w-full">Visualizar</Button>
                                </div>
                            ) : (
                                <div className="pt-4">
                                    <p className="text-sm text-muted-foreground mb-4">Nenhum plano gerado.</p>
                                    <Button
                                        onClick={generatePlanoAula}
                                        disabled={generating === 'plano'}
                                        className="w-full"
                                    >
                                        {generating === 'plano' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Gerar Plano de Aula
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Atividade Avaliativa */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Atividade</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {unidade.atividade_avaliativa ? (
                                <div className="space-y-4 pt-4">
                                    <h3 className="font-semibold">{unidade.atividade_avaliativa.titulo}</h3>
                                    <Badge variant="outline">Pontuação: {unidade.atividade_avaliativa.pontuacao_total}</Badge>
                                    <Button variant="outline" className="w-full">Visualizar</Button>
                                </div>
                            ) : (
                                <div className="pt-4">
                                    <p className="text-sm text-muted-foreground mb-4">Nenhuma atividade gerada.</p>
                                    <Button
                                        onClick={generateAtividade}
                                        disabled={generating === 'atividade'}
                                        className="w-full"
                                    >
                                        {generating === 'atividade' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Gerar Atividade
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Slides */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Slides</CardTitle>
                            <Presentation className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="pt-4">
                                <p className="text-sm text-muted-foreground mb-4">Gerador de Slides (Beta)</p>
                                <Button
                                    onClick={generateSlides}
                                    disabled={generating === 'slides'}
                                    className="w-full"
                                    variant="secondary"
                                >
                                    {generating === 'slides' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Gerar Slides
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default UnidadeDetailScreen;
