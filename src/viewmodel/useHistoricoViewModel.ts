
import { useState, useEffect, useMemo } from 'react';
import { DIContainer } from '../di/container';
import { HistoricoGeracao, Disciplina } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';

export const useHistoricoViewModel = () => {
    const [historico, setHistorico] = useState<HistoricoGeracao[]>([]);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Filters
    const [filterDisciplina, setFilterDisciplina] = useState<string>('all');
    const [filterTipo, setFilterTipo] = useState<string>('all');
    const [filterSearch, setFilterSearch] = useState<string>('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [historicoData, disciplinasData, unidadesData] = await Promise.all([
                DIContainer.genIARepository.getHistorico(),
                DIContainer.getAllDisciplinasUseCase.execute(),
                DIContainer.getAllUnidadesUseCase.execute()
            ]);

            // Client-side join to fix missing relation
            const enrichedHistorico = historicoData.map(h => ({
                ...h,
                disciplina: disciplinasData.find(d => d.id === h.disciplina_id)
                    ? { nome: disciplinasData.find(d => d.id === h.disciplina_id)!.nome }
                    : undefined,
                unidade: unidadesData.find(u => u.id === h.unidade_id)
                    ? { tema: unidadesData.find(u => u.id === h.unidade_id)!.tema }
                    : undefined
            }));

            setHistorico(enrichedHistorico);
            setDisciplinas(disciplinasData);
        } catch (error) {
            console.error('Error fetching historico:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar o histórico.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const deleteHistorico = async (id: string) => {
        try {
            await DIContainer.deleteHistoricoUseCase.execute(id);
            setHistorico(prev => prev.filter(item => item.id !== id));
            toast({
                title: "Sucesso",
                description: "Item removido do histórico.",
            });
        } catch (error) {
            console.error('Error deleting historico:', error);
            toast({
                title: "Erro",
                description: "Falha ao remover item.",
                variant: "destructive"
            });
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
        refresh: loadData
    };
};
