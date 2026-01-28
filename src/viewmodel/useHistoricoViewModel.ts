
import { useState, useMemo } from 'react';
import { HistoricoGeracao } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDI } from '../di/useDI';

export const useHistoricoViewModel = () => {
    const {
        getHistoricoUseCase,
        getAllDisciplinasUseCase,
        getAllUnidadesUseCase,
        getUserContextUseCase,
        deleteHistoricoUseCase,
        updatePlanoAulaUseCase,
        updateAtividadeUseCase,
        getUnidadeByIdUseCase
    } = useDI();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Filters
    const [filterDisciplina, setFilterDisciplina] = useState<string>('all');
    const [filterTipo, setFilterTipo] = useState<string>('all');
    const [filterSearch, setFilterSearch] = useState<string>('');
    const [filterArquivado, setFilterArquivado] = useState<boolean>(false);

    // Fetch Data using React Query
    const { data: historico = [], isLoading: loadingHistorico } = useQuery({
        queryKey: ['historico'],
        queryFn: async () => {
            const [historicoData, disciplinasData, unidadesData] = await Promise.all([
                getHistoricoUseCase.execute(),
                getAllDisciplinasUseCase.execute(),
                getAllUnidadesUseCase.execute()
            ]);

            // Fetch User Context
            const userId = localStorage.getItem('user_id');
            let userNiveis: string[] = [];
            if (userId) {
                const ctx = await getUserContextUseCase.execute(userId);
                if (ctx) userNiveis = ctx.niveis_ensino;
            }

            // Client-side join and filtering
            return historicoData
                .map(h => {
                    const disciplina = disciplinasData.find(d => d.id === h.disciplina_id);
                    const unidade = unidadesData.find(u => u.id === h.unidade_id);
                    return {
                        ...h,
                        disciplina: disciplina ? { nome: disciplina.nome, nivel: disciplina.nivel } : undefined,
                        unidade: unidade ? { tema: unidade.tema } : undefined,
                        _disciplinaFull: disciplina // Keep reference for filtering
                    };
                })
                .filter(item => {
                    // 1. Strict Check: Discipline MUST exist
                    // If the discipline was deleted, its history is orphan and should be hidden/removed
                    if (!item._disciplinaFull) return false;

                    // 2. Strict Check: If linked to a Unit, the Unit MUST exist
                    if (item.unidade_id && !item.unidade) return false;

                    // 3. Context Filter: If user has levels set, only show items from those levels
                    if (userNiveis.length > 0) {
                        return userNiveis.includes(item._disciplinaFull.nivel);
                    }
                    return true;
                });
        }
    });

    const { data: disciplinas = [], isLoading: loadingDisciplinas } = useQuery({
        queryKey: ['disciplinas'],
        queryFn: () => getAllDisciplinasUseCase.execute()
    });

    const loading = loadingHistorico || loadingDisciplinas;

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteHistoricoUseCase.execute(id),
        onSuccess: (_, id) => {
            queryClient.setQueryData(['historico'], (old: { id: string }[]) => old.filter((item) => item.id !== id));
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

    // Archive Mutation
    const archiveMutation = useMutation({
        mutationFn: async (item: { id: string, tipo: string, arquivado?: boolean, referencia_id?: string }) => {
            const novoEstado = !item.arquivado;
            const targetId = item.referencia_id || item.id;

            if (item.tipo === 'plano_aula') {
                return updatePlanoAulaUseCase.execute(targetId, { arquivado: novoEstado });
            } else if (item.tipo === 'atividade') {
                return updateAtividadeUseCase.execute(targetId, { arquivado: novoEstado });
            }
            throw new Error("Tipo não suportado para arquivamento");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['historico'] });
            toast({ title: "Sucesso", description: "Status atualizado." });
        },
        onError: () => toast({ title: "Erro", description: "Falha ao atualizar status.", variant: "destructive" })
    });

    const toggleArchive = (item: HistoricoGeracao) => archiveMutation.mutate(item);

    const getFullUnidade = async (unidadeId: string) => {
        try {
            return await getUnidadeByIdUseCase.execute(unidadeId);
        } catch (error) {
            console.error("Error fetching unidade details", error);
            return null;
        }
    };

    const filteredHistorico = useMemo(() => {
        return historico.filter(item => {
            const matchDisciplina = filterDisciplina === 'all' || item.disciplina_id === filterDisciplina;
            const matchTipo = filterTipo === 'all' || item.tipo === filterTipo;
            const searchTerm = filterSearch.toLowerCase();
            const matchSearch = filterSearch === '' ||
                item.titulo.toLowerCase().includes(searchTerm) ||
                (item.descricao && item.descricao.toLowerCase().includes(searchTerm));

            const isArchived = !!item.arquivado;
            const matchArquivado = filterArquivado ? isArchived : !isArchived;

            return matchDisciplina && matchTipo && matchSearch && matchArquivado;
        });
    }, [historico, filterDisciplina, filterTipo, filterSearch, filterArquivado]);

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
            setSearch: setFilterSearch,
            arquivado: filterArquivado,
            setArquivado: setFilterArquivado
        },
        stats,
        deleteHistorico,
        toggleArchive,
        getFullUnidade,
        refresh: () => queryClient.invalidateQueries({ queryKey: ['historico'] })
    };
};
