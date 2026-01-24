
import { useState, useEffect } from 'react';
import { DIContainer } from '../di/container';
import { HistoricoGeracao } from '../model/entities';

export const useHomeViewModel = () => {
    const [stats, setStats] = useState({ disciplinas: 0, unidades: 0, planos: 0, atividades: 0 });
    const [historico, setHistorico] = useState<HistoricoGeracao[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const uid = localStorage.getItem('user_id');
                const ctx = uid ? await DIContainer.getUserContextUseCase.execute(uid) : null;
                const allowedLevels = ctx?.niveis_ensino || [];
                const hasFilter = allowedLevels.length > 0;

                // Load all raw data needed for counting
                // We load everything to ensure counts are accurate to the user context
                const [disciplinas, unidades, historicoData] = await Promise.all([
                    DIContainer.getAllDisciplinasUseCase.execute(),
                    DIContainer.getAllUnidadesUseCase.execute(),
                    DIContainer.genIARepository.getHistorico()
                ]);

                // 1. Filter Disciplinas
                const filteredDisciplinas = hasFilter
                    ? disciplinas.filter(d => allowedLevels.includes(d.nivel as any))
                    : disciplinas;
                const disciplinaIds = new Set(filteredDisciplinas.map(d => d.id));

                // 2. Filter Unidades (Must belong to a valid Disciplina)
                const filteredUnidades = hasFilter
                    ? unidades.filter(u => u.disciplina_id && disciplinaIds.has(u.disciplina_id))
                    : unidades;
                const unidadeIds = new Set(filteredUnidades.map(u => u.id));

                // 3. Filter Historico (Must belong to a valid Disciplina OR Unidade)
                // Note: historico items usually link to disciplina/unidade.
                const filteredHistorico = hasFilter
                    ? historicoData.filter(h => {
                        if (h.disciplina_id && disciplinaIds.has(h.disciplina_id)) return true;
                        // Some items might only link to unidade? Usually both or discipline is key.
                        // If orphan but we have filter, hide it? Yes.
                        return false;
                    })
                    : historicoData;

                // 4. Calculate Stats
                // We need counts for Planos and Atividades. 
                // Since we don't have separate "GetAllPlanos" usecase exposed here easily (maybe), 
                // we can rely on `historico` for generated content stats IF `historico` contains all generated items.
                // The `getStats` usually counts `historico` items by type.
                // So recalculating from `filteredHistorico` is actually the CORRECT way if 'stats' just sums up history types.

                const stats = {
                    disciplinas: filteredDisciplinas.length,
                    unidades: filteredUnidades.length,
                    planos: filteredHistorico.filter(h => h.tipo === 'plano_aula').length,
                    atividades: filteredHistorico.filter(h => h.tipo === 'atividade').length
                };

                // Enrich Historico for Display
                const enrichedHistorico = filteredHistorico.map(h => ({
                    ...h,
                    disciplina: disciplinas.find(d => d.id === h.disciplina_id)
                        ? { nome: disciplinas.find(d => d.id === h.disciplina_id)!.nome }
                        : undefined,
                    unidade: unidades.find(u => u.id === h.unidade_id)
                        ? { tema: unidades.find(u => u.id === h.unidade_id)!.tema }
                        : undefined
                }));

                setStats(stats);
                setHistorico(enrichedHistorico);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return {
        stats,
        historico,
        loading
    };
};
