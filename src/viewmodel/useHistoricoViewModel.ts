import { useState, useMemo } from 'react';
import { DIContainer } from '../di/container';
import { useToast } from '../view/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useHistoricoViewModel = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Filters
    const [filterDisciplina, setFilterDisciplina] = useState<string>('all');
    const [filterTipo, setFilterTipo] = useState<string>('all');
    const [filterSearch, setFilterSearch] = useState<string>('');

    // Fetch Data using React Query
    const { data: historico = [], isLoading: loadingHistorico } = useQuery({
        queryKey: ['historico'],
        queryFn: async () => {
            const [historicoData, disciplinasData, unidadesData] = await Promise.all([
                DIContainer.genIARepository.getHistorico(),
                DIContainer.getAllDisciplinasUseCase.execute(),
                DIContainer.getAllUnidadesUseCase.execute()
            ]);

            // Client-side join
            return historicoData.map(h => ({
                ...h,
                disciplina: disciplinasData.find(d => d.id === h.disciplina_id)
                    ? { nome: disciplinasData.find(d => d.id === h.disciplina_id)!.nome }
                    : undefined,
                unidade: unidadesData.find(u => u.id === h.unidade_id)
                    ? { tema: unidadesData.find(u => u.id === h.unidade_id)!.tema }
                    : undefined
            }));
        }
    });

    const { data: disciplinas = [], isLoading: loadingDisciplinas } = useQuery({
        queryKey: ['disciplinas'],
        queryFn: () => DIContainer.getAllDisciplinasUseCase.execute()
    });

    const loading = loadingHistorico || loadingDisciplinas;

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => DIContainer.deleteHistoricoUseCase.execute(id),
        onSuccess: (_, id) => {
            queryClient.setQueryData(['historico'], (old: any[]) => old.filter((item: any) => item.id !== id));
            toast({
                title: "Sucesso",
                description: "Item removido do histórico.",
            });
        },
        onError: (error) => {
            console.error('Error deleting historico:', error);
            toast({
                title: "Erro",
                description: "Falha ao remover item.",
                variant: "destructive"
            });
        }
    });

    const deleteHistorico = (id: string) => deleteMutation.mutate(id);

    const filteredHistorico = useMemo(() => {
        return historico.filter(item => {
            const matchDisciplina = filterDisciplina === 'all' || item.disciplina_id === filterDisciplina;
            const matchTipo = filterTipo === 'all' || item.tipo === filterTipo;
            const searchTerm = filterSearch.toLowerCase();
            const matchSearch = filterSearch === '' ||
                item.titulo.toLowerCase().includes(searchTerm) ||
                (item.descricao && item.descricao.toLowerCase().includes(searchTerm));

            return matchDisciplina && matchTipo && matchSearch;
        });
    }, [historico, filterDisciplina, filterTipo, filterSearch]);

    const stats = useMemo(() => {
        return {
            total: historico.length,
            planos: historico.filter(h => h.tipo === 'plano_aula').length,
            atividades: historico.filter(h => h.tipo === 'atividade').length,
            slides: historico.filter(h => h.tipo === 'slides').length,
        };
    }, [historico]);

    return {
        historico: filteredHistorico,
        disciplinas,
        loading,
        filters: {
            disciplina: filterDisciplina,
            setDisciplina: setFilterDisciplina,
            tipo: filterTipo,
            setTipo: setFilterTipo,
            search: filterSearch,
            setSearch: setFilterSearch
        },
        stats,
        deleteHistorico,
        refresh: () => queryClient.invalidateQueries({ queryKey: ['historico'] })
    };
};
