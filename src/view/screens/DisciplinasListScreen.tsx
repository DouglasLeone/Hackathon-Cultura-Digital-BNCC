
import { useState } from 'react';
import { useDisciplinasListViewModel } from '@/viewmodel/useDisciplinasListViewModel';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { DisciplinaCard } from '@/view/components/disciplinas/DisciplinaCard';
import { Button } from '@/view/components/ui/button';
import { Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/view/components/ui/dialog';
import { DisciplinaForm } from '@/view/components/disciplinas/DisciplinaForm';
import { useDisciplinaFormViewModel } from '@/viewmodel/useDisciplinaFormViewModel';
import { Disciplina } from '@/model/entities';

import { useSearchParams } from 'react-router-dom';

const DisciplinasListScreen = () => {
    const [searchParams] = useSearchParams();
    const areaFilter = searchParams.get('area') || undefined;

    const { disciplinas, loading, refresh, deleteDisciplina } = useDisciplinasListViewModel(areaFilter);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);

    const formViewModel = useDisciplinaFormViewModel(() => {
        setIsCreateOpen(false);
        setEditingDisciplina(null);
        refresh();
    });

    const handleEdit = (disciplina: Disciplina) => {
        setEditingDisciplina(disciplina);
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold edu-gradient-text">
                            {areaFilter ? `Disciplinas: ${areaFilter}` : 'Disciplinas'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {areaFilter
                                ? `Disciplinas da área de ${areaFilter}`
                                : 'Gerencie suas disciplinas e organize seu conteúdo didático'
                            }
                        </p>
                    </div>

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
                                onSubmit={(data) => {
                                    // Ensure mandatory fields are present before calling logic
                                    if (data.nome && data.serie) {
                                        formViewModel.createDisciplina({
                                            nome: data.nome,
                                            serie: data.serie,
                                            area: data.area,
                                            descricao: data.descricao
                                        })
                                    }
                                }}
                                isLoading={formViewModel.loading}
                            />
                        </DialogContent>
                    </Dialog>

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
