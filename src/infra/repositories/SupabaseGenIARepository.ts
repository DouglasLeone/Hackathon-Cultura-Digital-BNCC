
import { IGenIARepository } from '../../model/repositories/IGenIARepository';
import { getStats, getHistorico, addHistorico, deleteHistorico } from '../data/database';
import { HistoricoGeracao } from '../../model/entities';

export class SupabaseGenIARepository implements IGenIARepository {
    async getStats() {
        return await getStats();
    }

    async getHistorico(): Promise<HistoricoGeracao[]> {
        return await getHistorico();
    }

    async addHistorico(historico: Omit<HistoricoGeracao, 'id' | 'created_at'>): Promise<HistoricoGeracao> {
        return await addHistorico(historico);
    }

    async deleteHistorico(id: string): Promise<void> {
        return await deleteHistorico(id);
    }
}
