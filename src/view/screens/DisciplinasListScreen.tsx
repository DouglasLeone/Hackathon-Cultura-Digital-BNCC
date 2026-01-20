
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
import { EmptyState } from '@/view/components/ui/empty-state';
import { DisciplinaCardSkeleton } from '@/view/components/disciplinas/DisciplinaCardSkeleton';
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FolderOpen } from 'lucide-react';


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
            <div className="space-y-8 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumb - Keep existing logic but maybe add a wrapper for spacing if needed */}
                <Breadcrumb className="mb-4">
                    {/* ... existing breadcrumb code ... */}
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
                                    <BreadcrumbPage className="font-semibold text-primary">{activeFilter}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        ) : (
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold text-primary">Disciplinas</BreadcrumbPage>
                            </BreadcrumbItem>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {activeFilter ? `Disciplinas: ${activeFilter}` : 'Disciplinas'}
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            {activeFilter
                                ? `Disciplinas da área de ${activeFilter}`
                                : 'Gerencie suas disciplinas e organize seu conteúdo didático com inteligência.'
                            }
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto sm:flex-row sm:items-center">
                        {/* Area Filter (Only if not in URL) */}
                        {!urlArea && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                {selectedArea && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedArea(undefined)}
                                        title="Limpar filtro de Área"
                                        className="shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                                <Select value={selectedArea} onValueChange={setSelectedArea}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
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

                        <div className="flex gap-2 w-full sm:w-auto">
                            {/* Nivel Filter */}
                            <Select value={selectedNivel} onValueChange={setSelectedNivel}>
                                <SelectTrigger className="w-full sm:w-[160px]">
                                    <SelectValue placeholder="Nível" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Níveis</SelectItem>
                                    <SelectItem value="Ensino Fundamental">Fundamental</SelectItem>
                                    <SelectItem value="Ensino Médio">Médio</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Serie Filter */}
                            <Select value={selectedSerie} onValueChange={setSelectedSerie}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Série" />
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
                        </div>


                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nova Disciplina
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
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
                        <DialogContent className="sm:max-w-[500px]">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <DisciplinaCardSkeleton key={i} />
                        ))}
                    </div>
                ) : disciplinas.length === 0 ? (
                    <EmptyState
                        icon={activeFilter ? FolderOpen : BookOpen}
                        title={activeFilter ? `Nenhuma disciplina em "${activeFilter}"` : "Nenhuma disciplina encontrada"}
                        description={activeFilter
                            ? "Tente limpar os filtros ou adicione uma nova disciplina nesta área."
                            : "Você ainda não tem disciplinas cadastradas. Crie sua primeira disciplina para começar a gerar materiais didáticos com IA."}
                        action={
                            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Disciplina Agora
                            </Button>
                        }
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence mode='popLayout'>
                            {disciplinas.map((disciplina, index) => (
                                <motion.div
                                    key={disciplina.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                    <DisciplinaCard
                                        disciplina={disciplina}
                                        onEdit={handleEdit}
                                        onDelete={deleteDisciplina}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

            </div>
        </AppLayout>
    );
};


export default DisciplinasListScreen;
