
import { useState } from 'react';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/view/components/ui/card';
import { Badge } from '@/view/components/ui/badge';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Trash2, Search, FileText, ClipboardList, MonitorPlay, Calendar, Download, Eye } from 'lucide-react';
import { useHistoricoViewModel } from '@/viewmodel/useHistoricoViewModel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/view/components/ui/dialog';
import { HistoricoGeracao } from '@/model/entities';
import { PDFService } from '@/infra/services/PDFService';

const HistoricoScreen = () => {
    const {
        historico,
        disciplinas,
        loading,
        stats,
        filters,
        deleteHistorico
    } = useHistoricoViewModel();

    const [selectedItem, setSelectedItem] = useState<HistoricoGeracao | null>(null);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeIcon = (tipo: string) => {
        switch (tipo) {
            case 'plano_aula': return <FileText className="w-4 h-4" />;
            case 'atividade': return <ClipboardList className="w-4 h-4" />;
            case 'slides': return <MonitorPlay className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getTypeLabel = (tipo: string) => {
        switch (tipo) {
            case 'plano_aula': return 'Plano de Aula';
            case 'atividade': return 'Atividade';
            case 'slides': return 'Slides';
            case 'sugestao_unidade': return 'Sugestão';
            default: return tipo;
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold edu-gradient-text">Histórico de Gerações</h1>
                    <p className="text-muted-foreground mt-2">
                        Visualize e gerencie todos os materiais gerados pela inteligência artificial.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Gerado</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Planos de Aula</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.planos}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Atividades</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.atividades}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Slides</CardTitle>
                            <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.slides}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por título ou descrição..."
                            className="pl-8"
                            value={filters.search}
                            onChange={(e) => filters.setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={filters.disciplina} onValueChange={filters.setDisciplina}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Disciplina" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Disciplinas</SelectItem>
                            {disciplinas.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.tipo} onValueChange={filters.setTipo}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Tipo de Material" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Tipos</SelectItem>
                            <SelectItem value="plano_aula">Planos de Aula</SelectItem>
                            <SelectItem value="atividade">Atividades</SelectItem>
                            <SelectItem value="slides">Slides</SelectItem>
                            <SelectItem value="sugestao_unidade">Sugestões</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10">Carregando histórico...</div>
                    ) : historico.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                            No histórico encontrado com os filtros atuais.
                        </div>
                    ) : (
                        historico.map((item) => (
                            <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row items-center gap-4 p-4">
                                        <div className={`p-3 rounded-full bg-primary/10 text-primary`}>
                                            {getTypeIcon(item.tipo)}
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="font-semibold text-lg">{item.titulo}</h3>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1 text-sm text-muted-foreground">
                                                <span>{formatDate(item.created_at)}</span>
                                                <span>•</span>
                                                <Badge variant="outline">{getTypeLabel(item.tipo)}</Badge>
                                                {item.disciplina && (
                                                    <Badge variant="secondary">{item.disciplina.nome}</Badge>
                                                )}
                                                {item.unidade && (
                                                    <Badge variant="secondary" className="bg-muted">{item.unidade.tema}</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Visualizar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-9 w-9"
                                                onClick={() => {
                                                    if (confirm("Tem certeza que deseja excluir este item do histórico?")) {
                                                        deleteHistorico(item.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Details Modal */}
                <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedItem?.titulo}</DialogTitle>
                            <DialogDescription>
                                {selectedItem && `Gerado em ${formatDate(selectedItem.created_at)}`}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold block text-muted-foreground">Tipo</span>
                                    {selectedItem && getTypeLabel(selectedItem.tipo)}
                                </div>
                                {selectedItem?.disciplina && (
                                    <div>
                                        <span className="font-semibold block text-muted-foreground">Disciplina</span>
                                        {selectedItem.disciplina.nome}
                                    </div>
                                )}
                                {selectedItem?.unidade && (
                                    <div>
                                        <span className="font-semibold block text-muted-foreground">Unidade</span>
                                        {selectedItem.unidade.tema}
                                    </div>
                                )}
                            </div>

                            <div className="bg-muted p-4 rounded-md">
                                <h4 className="font-semibold mb-2">Descrição / Conteúdo</h4>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {selectedItem?.descricao || "Sem descrição disponível."}
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => selectedItem && PDFService.generatePDF(selectedItem)}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default HistoricoScreen;
