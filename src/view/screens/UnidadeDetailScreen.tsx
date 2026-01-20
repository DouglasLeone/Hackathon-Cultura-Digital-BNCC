
import React from 'react';
import { useParams } from 'react-router-dom';
import { useUnidadeDetailViewModel } from '@/viewmodel/useUnidadeDetailViewModel';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Badge } from '@/view/components/ui/badge';
import { Button } from '@/view/components/ui/button';
import { FileText, ClipboardList, Presentation, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContentEditor } from '@/view/components/ContentEditor';
import { PPTXService } from '@/infra/services/PPTXService';
import { PDFService } from '@/infra/services/PDFService';
import { DIContainer } from '@/di/container';
import { SlidesViewer as ViewComponentsSlidesViewer } from '@/view/components/SlidesViewer';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/view/components/ui/dialog';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/view/components/ui/breadcrumb";

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
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/ensino">Ensino</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/disciplinas/${unidade.disciplina_id}`}>
                                {unidade.disciplina?.nome || 'Disciplina'}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{unidade.tema}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center justify-between">
                    <div>
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
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Ver conteúdo
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <DialogTitle className="text-xl font-bold">{unidade.plano_aula.titulo}</DialogTitle>
                                            </div>
                                            <ContentEditor
                                                title={unidade.plano_aula.titulo}
                                                initialContent={unidade.plano_aula.conteudo || ''}
                                                onSave={async (content) => {
                                                    if (!unidade.plano_aula) return;
                                                    await DIContainer.updatePlanoAulaUseCase.execute(unidade.plano_aula.id, { conteudo: content });
                                                }}
                                                onExport={() => unidade.plano_aula && PPTXService.generateLessonPlanPPTX(unidade.plano_aula.titulo, unidade.plano_aula.conteudo || '')}
                                                exportLabel="Baixar PPTX"
                                                variant="minimal"
                                                hideTitle
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    <Badge variant="outline" className="mt-2 w-full justify-center">Gerado em: {new Date(unidade.plano_aula.created_at).toLocaleDateString()}</Badge>
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
                    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Atividade</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {unidade.atividade_avaliativa ? (
                                <div className="space-y-4 pt-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <ClipboardList className="w-4 h-4 mr-2" />
                                                Ver conteúdo
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <DialogTitle className="text-xl font-bold">{unidade.atividade_avaliativa.titulo}</DialogTitle>
                                            </div>
                                            <ContentEditor
                                                title={unidade.atividade_avaliativa.titulo}
                                                initialContent={JSON.stringify(unidade.atividade_avaliativa.questoes, null, 2)}
                                                onSave={async (content) => {
                                                    if (!unidade.atividade_avaliativa) return;
                                                    try {
                                                        const parsed = JSON.parse(content);
                                                        await DIContainer.updateAtividadeUseCase.execute(unidade.atividade_avaliativa.id, { questoes: parsed });
                                                    } catch (e) {
                                                        console.error("Invalid JSON");
                                                        alert("JSON inválido");
                                                        throw e;
                                                    }
                                                }}
                                                onExport={() => unidade.atividade_avaliativa && PDFService.generateActivityPDF(unidade.atividade_avaliativa.titulo, JSON.stringify(unidade.atividade_avaliativa.questoes, null, 2))}
                                                exportLabel="Baixar PDF"
                                                variant="minimal"
                                                hideTitle
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    <div className="flex gap-2 items-center mt-2 justify-center">
                                        <Badge variant="outline">Pontuação: {unidade.atividade_avaliativa.pontuacao_total}</Badge>
                                    </div>
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
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full mt-2">Visualizar Slides</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-full">
                                    <DialogTitle>Slides: {unidade.tema}</DialogTitle>
                                    <ViewComponentsSlidesViewer title={`Slides: ${unidade.tema}`} />
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default UnidadeDetailScreen;
