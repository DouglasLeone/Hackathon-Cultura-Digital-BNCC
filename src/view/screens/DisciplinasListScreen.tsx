
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDisciplinasListViewModel } from '@/viewmodel/useDisciplinasListViewModel';
import { useDisciplinaFormViewModel } from '@/viewmodel/useDisciplinaFormViewModel';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { DisciplinaCard } from '@/view/components/disciplinas/DisciplinaCard';
import { DisciplinaForm } from '@/view/components/disciplinas/DisciplinaForm';
import { Button } from '@/view/components/ui/button';
import { Plus, Filter, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/view/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/view/components/ui/select"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/view/components/ui/breadcrumb";
import { SERIES_OPTIONS, Disciplina } from '@/model/entities';

// ... (existing imports)

const DisciplinasListScreen = () => {
    const [searchParams] = useSearchParams();
    const urlArea = searchParams.get('area') || undefined;
    const [selectedArea, setSelectedArea] = useState<string | undefined>(undefined);
    const [filteredAreas, setFilteredAreas] = useState<string[]>([]);

    // New Filters
    const [selectedNivel, setSelectedNivel] = useState<string>('all');
    const [selectedSerie, setSelectedSerie] = useState<string>('all');

    useEffect(() => {
        // ... (existing context effect)
    }, []);

    // If we have a URL area, it takes precedence. Otherwise use the local filter.
    const activeFilter = urlArea || selectedArea;

    const { disciplinas, loading, refresh, deleteDisciplina } = useDisciplinasListViewModel(activeFilter, selectedSerie, selectedNivel);
    const formViewModel = useDisciplinaFormViewModel({
        onSuccess: () => {
            setIsCreateOpen(false);
            setEditingDisciplina(null);
            refresh();
        }
    });

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);

    const handleEdit = (disciplina: Disciplina) => {
        setEditingDisciplina(disciplina);
    };

    // ... (rest of formViewModel and handler)

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        {activeFilter ? (
                            <>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/ensino">Ensino</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{activeFilter}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        ) : (
                            <BreadcrumbItem>
                                <BreadcrumbPage>Disciplinas</BreadcrumbPage>
                            </BreadcrumbItem>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold edu-gradient-text">
                            {activeFilter ? `Disciplinas: ${activeFilter}` : 'Disciplinas'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {activeFilter
                                ? `Disciplinas da área de ${activeFilter}`
                                : 'Gerencie suas disciplinas e organize seu conteúdo didático'
                            }
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        {/* Area Filter (Only if not in URL) */}
                        {!urlArea && (
                            <div className="flex items-center gap-2">
                                {selectedArea && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedArea(undefined)}
                                        title="Limpar filtro de Área"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                                <Select value={selectedArea} onValueChange={setSelectedArea}>
                                    <SelectTrigger className="w-[200px]">
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Filtrar por Área" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredAreas.map((area) => (
                                            <SelectItem key={area} value={area}>
                                                {area}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Nivel Filter */}
                        <Select value={selectedNivel} onValueChange={setSelectedNivel}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Nível de Ensino" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Níveis</SelectItem>
                                <SelectItem value="Ensino Fundamental">Ensino Fundamental</SelectItem>
                                <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Serie Filter */}
                        <Select value={selectedSerie} onValueChange={setSelectedSerie}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Série/Ano" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Séries</SelectItem>
                                {SERIES_OPTIONS.map((serie) => (
                                    <SelectItem key={serie} value={serie}>
                                        {serie}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>


                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nova Disciplina
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Nova Disciplina</DialogTitle>
                                </DialogHeader>
                                <DisciplinaForm
                                    defaultValues={{ area: activeFilter }}
                                    onSubmit={(data) => {
                                        // Ensure mandatory fields are present before calling logic
                                        // Fallback to activeFilter if area is missing in form (which acts as a hidden input)
                                        if (data.nome && data.serie) {
                                            formViewModel.createDisciplina({
                                                nome: data.nome,
                                                serie: data.serie,
                                                area: (activeFilter || data.area).trim(),
                                                descricao: data.descricao
                                            })
                                        }
                                    }}
                                    isLoading={formViewModel.loading}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Dialog open={!!editingDisciplina} onOpenChange={(open) => !open && setEditingDisciplina(null)}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Editar Disciplina</DialogTitle>
                            </DialogHeader>
                            {editingDisciplina && (
                                <DisciplinaForm
                                    defaultValues={editingDisciplina}
                                    onSubmit={(data) => formViewModel.updateDisciplina(editingDisciplina.id, data)}
                                    isLoading={formViewModel.loading}
                                />
                            )}
                        </DialogContent>
                    </Dialog>

                </div>

                {loading ? (
                    <div className="text-center py-10">Carregando...</div>
                ) : disciplinas.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/20">
                        <p className="text-muted-foreground text-lg">
                            {activeFilter
                                ? `Não há disciplinas cadastradas em "${activeFilter}".`
                                : "Não há disciplinas cadastradas no momento."
                            }
                        </p>
                        <p className="text-sm text-muted-foreground/60 mt-1">Clique em "Nova Disciplina" para começar.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {disciplinas.map((disciplina) => (
                            <DisciplinaCard
                                key={disciplina.id}
                                disciplina={disciplina}
                                onEdit={handleEdit}
                                onDelete={deleteDisciplina}
                            />
                        ))}
                    </div>
                )}

            </div>
        </AppLayout>
    );
};

export default DisciplinasListScreen;
