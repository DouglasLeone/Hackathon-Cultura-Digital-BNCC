
import { HistoricoGeracao } from '../entities';

export interface IGenIARepository {
    getStats(): Promise<{
        disciplinas: number;
        unidades: number;
        planos: number;
        atividades: number;
    }>;
    getHistorico(): Promise<HistoricoGeracao[]>;
    addHistorico(historico: Omit<HistoricoGeracao, 'id' | 'created_at'>): Promise<HistoricoGeracao>;
}
