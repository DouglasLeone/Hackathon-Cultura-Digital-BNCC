
import { useState } from 'react';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { UnidadeCard } from '@/view/components/unidades/UnidadeCard';
import { UnidadeForm } from '@/view/components/unidades/UnidadeForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/view/components/ui/dialog';
import { useUnidadesListViewModel } from '@/viewmodel/useUnidadesListViewModel';
import { Unidade } from '@/model/entities';

const UnidadesScreen = () => {
    const { unidades, loading, deleteUnidade, updateUnidade } = useUnidadesListViewModel();
    const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold edu-gradient-text">Unidades de Ensino</h1>
                        <p className="text-muted-foreground mt-2">
                            Gerencie todas as unidades de ensino cadastradas.
                        </p>
                    </div>
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
                            <div className="col-span-full text-center text-muted-foreground py-12 bg-accent/5 rounded-lg border border-dashed">
                                <p>Nenhuma unidade cadastrada no sistema.</p>
                                <p className="text-sm mt-2">Crie unidades dentro da página de cada disciplina.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default UnidadesScreen;
