
import { useParams } from 'react-router-dom';
import { useDisciplinaDetailViewModel } from '../../viewmodel/useDisciplinaDetailViewModel';
import { useUnidadesListViewModel } from '@/viewmodel/useUnidadesListViewModel';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { Badge } from '@/view/components/ui/badge';
import { Button } from '@/view/components/ui/button';
import { Unidade } from '@/model/entities';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/view/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/view/components/ui/dialog';
import { Plus, GraduationCap } from 'lucide-react';
import { UnidadeForm } from '@/view/components/unidades/UnidadeForm';
import { UnidadeCard } from '@/view/components/unidades/UnidadeCard';
import { UnidadeCardSkeleton } from '@/view/components/unidades/UnidadeCardSkeleton';
import { EmptyState } from '@/view/components/ui/empty-state';

const DisciplinaDetailScreen = () => {
    const { id } = useParams<{ id: string }>();
    const { disciplina, loading: loadingDisciplina } = useDisciplinaDetailViewModel(id || '');

    // Lifted ViewModel for Unidades
    const {
        unidades,
        loading: loadingUnidades,
        createUnidade,
        deleteUnidade,
        updateUnidade
    } = useUnidadesListViewModel(id || '');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // Initial loading state for the whole page if main entity is missing
    if (loadingDisciplina) {
        return (
            <AppLayout>
                <div className="space-y-6 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                    <div className="space-y-2">
                        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
                        <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!disciplina) {
        return (
            <AppLayout>
                <EmptyState
                    icon={GraduationCap}
                    title="Disciplina não encontrada"
                    description="Não foi possível encontrar a disciplina solicitada."
                    action={<Button variant="outline" onClick={() => window.history.back()}>Voltar</Button>}
                />
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-8 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <Breadcrumb className="mb-4">
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
                            <BreadcrumbLink href={`/disciplinas?area=${encodeURIComponent(disciplina.area)}`}>
                                {disciplina.area}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-semibold text-primary">{disciplina.nome}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="pb-6 border-b space-y-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {disciplina.nome}
                        </h1>
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
                                {disciplina.serie}
                            </Badge>
                            <Badge variant="outline" className="text-sm px-3 py-1 text-muted-foreground">
                                {disciplina.nivel}
                            </Badge>
                        </div>
                    </div>
                    {disciplina.descricao && (
                        <div className="space-y-2 max-w-2xl">
                            <p className={`text-lg text-muted-foreground leading-relaxed ${!isDescExpanded && disciplina.descricao.length > 200 ? 'line-clamp-3' : ''}`}>
                                {disciplina.descricao}
                            </p>
                            {disciplina.descricao.length > 200 && (
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

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground/90">Unidades de Ensino</h2>
                            <p className="text-sm text-muted-foreground mt-1">Gerencie as unidades e tópicos desta disciplina</p>
                        </div>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button data-tour="tour-new-unidade" size="default" className="shadow-md hover:shadow-lg transition-all">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nova Unidade
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Nova Unidade de Ensino</DialogTitle>
                                </DialogHeader>
                                <UnidadeForm
                                    onSubmit={async (data) => {
                                        if (data.tema) {
                                            await createUnidade({
                                                tema: data.tema,
                                                contexto_cultura_digital: data.contexto_cultura_digital,
                                                disciplina_id: disciplina.id
                                            });
                                            setIsCreateOpen(false);
                                        }
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Dialog open={!!editingUnidade} onOpenChange={(open) => !open && setEditingUnidade(null)}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Editar Unidade</DialogTitle>
                            </DialogHeader>
                            {editingUnidade && (
                                <UnidadeForm
                                    defaultValues={editingUnidade}
                                    onSubmit={async (data) => {
                                        await updateUnidade(editingUnidade.id, data);
                                        setEditingUnidade(null);
                                    }}
                                />
                            )}
                        </DialogContent>
                    </Dialog>

                    {loadingUnidades ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <UnidadeCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : unidades.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="Nenhuma unidade cadastrada"
                            description="Comece adicionando a primeira unidade de ensino para esta disciplina."
                            action={
                                <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Criar Primeira Unidade
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
                                {unidades.map((unidade, index) => (
                                    <motion.div
                                        key={unidade.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                    >
                                        <UnidadeCard
                                            unidade={unidade}
                                            onDelete={deleteUnidade}
                                            onEdit={setEditingUnidade}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default DisciplinaDetailScreen;

