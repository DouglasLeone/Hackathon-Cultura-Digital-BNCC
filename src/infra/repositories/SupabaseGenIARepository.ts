
import { IGenIARepository } from '../../model/repositories/IGenIARepository';
import { getStats, getHistorico } from '../data/database';
import { HistoricoGeracao } from '../../model/entities';

export class SupabaseGenIARepository implements IGenIARepository {
    async getStats() {
        return await getStats();
    }

    async getHistorico(): Promise<HistoricoGeracao[]> {
        return await getHistorico();
    }
}
