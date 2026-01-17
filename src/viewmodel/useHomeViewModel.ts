
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
                const data = await DIContainer.getHomeDataUseCase.execute();
                setStats(data.stats);
                setHistorico(data.historico);
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
