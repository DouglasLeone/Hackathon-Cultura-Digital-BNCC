
import { useParams } from 'react-router-dom';
import { useDisciplinaDetailViewModel } from '../../viewmodel/useDisciplinaDetailViewModel';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Badge } from '@/view/components/ui/badge';
import { Button } from '@/view/components/ui/button';
import { Unidade } from '@/model/entities';
import { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/view/components/ui/breadcrumb";

const DisciplinaDetailScreen = () => {
    const { id } = useParams<{ id: string }>();
    const { disciplina, loading } = useDisciplinaDetailViewModel(id || '');

    if (loading) {
        return <AppLayout><div>Loading...</div></AppLayout>;
    }

    if (!disciplina) {
        return <AppLayout><div>Disciplina não encontrada.</div></AppLayout>;
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
                            <BreadcrumbLink href={`/disciplinas?area=${encodeURIComponent(disciplina.area)}`}>
                                {disciplina.area}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{disciplina.nome}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div>
                    <h1 className="text-3xl font-bold edu-gradient-text">{disciplina.nome}</h1>
                    <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{disciplina.serie}</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* We will replace this placeholder with proper Unidades List */}
                    {/* This requires fetching units for the discipline */}
                </div>
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Unidades de Ensino</h2>
                    <UnidadesSection disciplinaId={disciplina.id} />
                </div>
            </div>
        </AppLayout>
    );
};

// Sub-component for Unidades Section to keep main screen clean
import { useUnidadesListViewModel } from '@/viewmodel/useUnidadesListViewModel';
import { UnidadeCard } from '@/view/components/unidades/UnidadeCard';
import { UnidadeForm } from '@/view/components/unidades/UnidadeForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/view/components/ui/dialog';
import { Plus } from 'lucide-react';

const UnidadesSection = ({ disciplinaId }: { disciplinaId: string }) => {
    // Note: I'm using a proxy here because I need to adapt the hook to return 'units' or rename it in the hook.
    // Let's assume I use the hook directly but I need to handle the state.
    // Actually, let's just use the hook I created.
    return (
        <UnidadesListWithLogic disciplinaId={disciplinaId} />
    );
}

const UnidadesListWithLogic = ({ disciplinaId }: { disciplinaId: string }) => {
    const { unidades, loading, createUnidade, deleteUnidade, updateUnidade } = useUnidadesListViewModel(disciplinaId);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Unidade
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nova Unidade</DialogTitle>
                        </DialogHeader>
                        <UnidadeForm onSubmit={async (data) => {
                            if (data.tema) {
                                await createUnidade({
                                    tema: data.tema,
                                    contexto_cultura_digital: data.contexto_cultura_digital,
                                    disciplina_id: disciplinaId
                                });
                                setIsCreateOpen(false);
                            }
                        }} />
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={!!editingUnidade} onOpenChange={(open) => !open && setEditingUnidade(null)}>
                <DialogContent>
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

            {loading ? (
                <div>Carregando unidades...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unidades.map(unidade => (
                        <UnidadeCard
                            key={unidade.id}
                            unidade={unidade}
                            onDelete={deleteUnidade}
                            onEdit={setEditingUnidade}
                        />
                    ))}
                    {unidades.length === 0 && (
                        <div className="col-span-full text-center text-muted-foreground py-8">
                            Nenhuma unidade cadastrada.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DisciplinaDetailScreen;
