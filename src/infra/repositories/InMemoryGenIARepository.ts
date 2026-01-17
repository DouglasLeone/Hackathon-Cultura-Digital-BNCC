
import { IGenIARepository } from '../../model/repositories/IGenIARepository';
import { HistoricoGeracao } from '../../model/entities';
import { mockHistorico, mockDisciplinas, mockUnidades, mockPlanosAula, mockAtividades } from '../data/mockData';

export class InMemoryGenIARepository implements IGenIARepository {
    async getStats(): Promise<{ disciplinas: number; unidades: number; planos: number; atividades: number; }> {
        return {
            disciplinas: mockDisciplinas.length,
            unidades: mockUnidades.length,
            planos: mockPlanosAula.length,
            atividades: mockAtividades.length
        };
    }

    async getHistorico(): Promise<HistoricoGeracao[]> {
        // Return shallow copy reversed to simulate 'order by created_at desc'
        return [...mockHistorico].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    async addHistorico(historico: Omit<HistoricoGeracao, 'id' | 'created_at'>): Promise<HistoricoGeracao> {
        const newHistorico: HistoricoGeracao = {
            ...historico,
            id: Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString()
        };
        mockHistorico.push(newHistorico);
        return newHistorico;
    }

    async deleteHistorico(id: string): Promise<void> {
        const index = mockHistorico.findIndex(h => h.id === id);
        if (index !== -1) {
            mockHistorico.splice(index, 1);
        }
    }
}
