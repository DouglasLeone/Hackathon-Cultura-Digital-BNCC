
import { HistoricoGeracao } from '../entities';

export interface IGenIARepository {
    getStats(): Promise<{
        disciplinas: number;
        unidades: number;
        planos: number;
        atividades: number;
    }>;
    getHistorico(): Promise<HistoricoGeracao[]>;
}
