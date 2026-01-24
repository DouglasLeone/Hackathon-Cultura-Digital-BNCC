
import React from 'react';
import { useParams } from 'react-router-dom';
import { useUnidadeDetailViewModel } from '@/viewmodel/useUnidadeDetailViewModel';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Badge } from '@/view/components/ui/badge';
import { Button } from '@/view/components/ui/button';

import { Link } from 'react-router-dom';
import { ContentEditor } from '@/view/components/ContentEditor';
import { PDFService } from '@/infra/services/PDFService';
import { SlidesViewer as ViewComponentsSlidesViewer } from '@/view/components/SlidesViewer';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/view/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/view/components/ui/dropdown-menu";
import { FileText, ClipboardList, Presentation, Loader2, ArrowLeft, MoreVertical, Archive, BookOpen, Info } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/view/components/ui/breadcrumb";
import { Questao } from '@/model/entities';

const formatActivityContent = (questions: Questao[]): string => {
    if (!questions || !Array.isArray(questions)) return '';

    return questions.map((q, index) => {
        let text = `### Questão ${index + 1}\n\n`;
        text += `**${q.enunciado}**\n\n`;

        if (q.tipo === 'multipla_escolha' && q.alternativas) {
            q.alternativas.forEach((alt) => {
                text += `- ${alt}\n`;
            });
        }

        text += `\n_(Pontuação: ${q.pontuacao})_\n`;
        if (q.resposta_correta) {
            text += `\n> **Resposta:** ${q.resposta_correta}\n`;
        }
        return text;
    }).join('\n---\n\n');
};

const UnidadeDetailScreen = () => {
    const { unidadeId } = useParams<{ unidadeId: string }>();
    const {
        unidade,
        loading,
        generating,
        generatePlanoAula,
        generateAtividade,

        generateSlides,
        archivePlanoAula,
        archiveAtividade,
        archiveSlides,
        slides,
        updatePlanoAula,
        updateAtividade
    } = useUnidadeDetailViewModel(unidadeId || '');

    const [isDescExpanded, setIsDescExpanded] = React.useState(false);

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

                <div className="flex items-center justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold edu-gradient-text">{unidade.tema}</h1>
                        {unidade.contexto_cultura_digital && (
                            <div className="space-y-2 max-w-2xl mt-2">
                                <p className={`text-muted-foreground leading-relaxed ${!isDescExpanded && unidade.contexto_cultura_digital.length > 200 ? 'line-clamp-3' : ''}`}>
                                    {unidade.contexto_cultura_digital}
                                </p>
                                {unidade.contexto_cultura_digital.length > 200 && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                                    >
                                        {isDescExpanded ? 'Ver menos' : 'Ver mais'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {(unidade.plano_aula?.habilidades_possiveis || unidade.atividade_avaliativa?.habilidades_possiveis) && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Habilidades BNCC
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-bold">Habilidades BNCC da Unidade</DialogTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Competências trabalhadas nesta aula alinhadas à base curricular
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Consolidated BNCC Skills List */}
                                    {(() => {
                                        const habilidades = unidade.plano_aula?.habilidades_possiveis || unidade.atividade_avaliativa?.habilidades_possiveis;
                                        if (!habilidades || habilidades.length === 0) return null;

                                        return (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Badge variant="outline" className="text-primary border-primary/20">
                                                        {habilidades.length} habilidades identificadas
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {habilidades.map(hab => (
                                                        <div
                                                            key={`bncc-${hab.codigo}`}
                                                            className="flex flex-col p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge className="font-mono bg-primary/80">{hab.codigo}</Badge>
                                                            </div>
                                                            <p className="text-sm text-foreground leading-relaxed">
                                                                {hab.descricao}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Info footer */}
                                    <div className="pt-4 border-t">
                                        <p className="text-xs text-muted-foreground italic flex gap-2">
                                            <Info className="h-4 w-4 text-primary/60" />
                                            Estas habilidades servem como base para o Plano de Aula, Atividade e Slides,
                                            garantindo que todo o material pedagógico desta unidade esteja alinhado com a BNCC.
                                        </p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Plano de Aula */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Plano de Aula</CardTitle>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {unidade.plano_aula && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={archivePlanoAula} className="text-destructive focus:text-destructive">
                                                <Archive className="mr-2 h-4 w-4" />
                                                Arquivar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
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
                                        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-6 overflow-hidden">
                                            <div className="flex items-center justify-between mb-2">
                                                <DialogTitle className="text-xl font-bold">{unidade.plano_aula.titulo}</DialogTitle>
                                            </div>
                                            <ContentEditor
                                                title={unidade.plano_aula.titulo}
                                                initialContent={unidade.plano_aula.conteudo || ''}
                                                onSave={async (content) => {
                                                    await updatePlanoAula(content);
                                                }}
                                                onExport={() => unidade.plano_aula && PDFService.generateLessonPlanPDF(unidade.plano_aula, unidade.disciplina?.nome || 'Disciplina', unidade.tema)}
                                                exportLabel="Baixar PDF"
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
                            <div className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                {unidade.atividade_avaliativa && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={archiveAtividade} className="text-destructive focus:text-destructive">
                                                <Archive className="mr-2 h-4 w-4" />
                                                Arquivar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
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
                                        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-6 overflow-hidden">
                                            <div className="flex items-center justify-between mb-2">
                                                <DialogTitle className="text-xl font-bold">{unidade.atividade_avaliativa.titulo}</DialogTitle>
                                            </div>
                                            <ContentEditor
                                                title={unidade.atividade_avaliativa.titulo}
                                                initialContent={formatActivityContent(unidade.atividade_avaliativa.questoes)}
                                                onSave={async (content) => {
                                                    try {
                                                        await updateAtividade(content);
                                                    } catch (e) {
                                                        console.error("Invalid JSON or Save Error");
                                                        alert("Erro ao salvar ou JSON inválido");
                                                        throw e;
                                                    }
                                                }}
                                                onExport={() => unidade.atividade_avaliativa && PDFService.generateActivityPDF(unidade.atividade_avaliativa, unidade.disciplina?.nome || 'Disciplina', unidade.tema)}
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
                            <div className="flex items-center gap-2">
                                <Presentation className="h-4 w-4 text-muted-foreground" />
                                {unidade.material_slides && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={archiveSlides} className="text-destructive focus:text-destructive">
                                                <Archive className="mr-2 h-4 w-4" />
                                                Arquivar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {slides ? (
                                <div className="space-y-4 pt-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full mt-2">
                                                <Presentation className="w-4 h-4 mr-2" />
                                                Visualizar Slides
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl w-full">
                                            {/* DialogTitle is required for accessibility but hidden visually if needed, or we keep it generic */}
                                            <DialogTitle>Slides: {unidade.tema}</DialogTitle>
                                            <ViewComponentsSlidesViewer
                                                title={`Slides: ${unidade.tema}`}
                                                slides={slides}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    {unidade.material_slides && (
                                        <Badge variant="outline" className="mt-2 w-full justify-center">
                                            Gerado em: {new Date(unidade.material_slides.created_at).toLocaleDateString()}
                                        </Badge>
                                    )}
                                </div>
                            ) : (
                                <div className="pt-4">
                                    <p className="text-sm text-muted-foreground mb-4">Nenhum slide gerado.</p>
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
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AppLayout >
    );
};

export default UnidadeDetailScreen;
