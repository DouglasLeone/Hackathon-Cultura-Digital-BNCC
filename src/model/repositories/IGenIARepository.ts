
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
    updateHistorico(id: string, data: Partial<HistoricoGeracao>): Promise<void>;
    getHistoricoByReferenceId(referenciaId: string): Promise<HistoricoGeracao | null>;
    deleteHistorico(id: string): Promise<void>;
}
