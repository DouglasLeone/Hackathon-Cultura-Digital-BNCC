
import { IUnidadeRepository } from '../../model/repositories/IUnidadeRepository';
import { Unidade, PlanoAula, AtividadeAvaliativa } from '../../model/entities';
import { mockUnidades, mockPlanosAula, mockAtividades, mockDisciplinas } from '../data/mockData';

export class InMemoryUnidadeRepository implements IUnidadeRepository {
    async getAll(): Promise<Unidade[]> {
        return [...mockUnidades];
    }

    async getByDisciplinaId(disciplinaId: string): Promise<Unidade[]> {
        // Enforce returning empty array if mocked data is empty, but filtering correctly
        return mockUnidades.filter(u => u.disciplina_id === disciplinaId);
    }

    async getById(id: string): Promise<Unidade | null> {
        const found = mockUnidades.find(u => u.id === id);
        return found || null;
    }

    async create(unidade: Omit<Unidade, 'id' | 'created_at' | 'updated_at' | 'disciplina'>): Promise<Unidade> {
        const newUnidade: Unidade = {
            ...unidade,
            id: Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockUnidades.push(newUnidade);
        return newUnidade;
    }

    async update(id: string, unidade: Partial<Unidade>): Promise<Unidade> {
        const index = mockUnidades.findIndex(u => u.id === id);
        if (index === -1) {
            throw new Error('Unidade not found');
        }

        const updated = {
            ...mockUnidades[index],
            ...unidade,
            updated_at: new Date().toISOString()
        };
        mockUnidades[index] = updated;
        return updated;
    }

    async delete(id: string): Promise<void> {
        const index = mockUnidades.findIndex(u => u.id === id);
        if (index !== -1) {
            mockUnidades.splice(index, 1);
        }
    }

    // Linked Materials - Plano de Aula
    async getPlanoAula(unidadeId: string): Promise<PlanoAula | null> {
        const found = mockPlanosAula.find(p => p.unidade_id === unidadeId);
        return found || null;
    }

    async createPlanoAula(plano: Omit<PlanoAula, 'id' | 'created_at' | 'updated_at'>): Promise<PlanoAula> {
        const newPlano: PlanoAula = {
            ...plano,
            id: Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockPlanosAula.push(newPlano);
        return newPlano;
    }

    async updatePlanoAula(id: string, plano: Partial<PlanoAula>): Promise<PlanoAula> {
        const index = mockPlanosAula.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Plano de Aula not found');
        }

        const updated = {
            ...mockPlanosAula[index],
            ...plano,
            updated_at: new Date().toISOString()
        };
        mockPlanosAula[index] = updated;
        return updated;
    }

    // Linked Materials - Atividade Avaliativa
    async getAtividade(unidadeId: string): Promise<AtividadeAvaliativa | null> {
        const found = mockAtividades.find(a => a.unidade_id === unidadeId);
        return found || null;
    }

    async createAtividade(atividade: Omit<AtividadeAvaliativa, 'id' | 'created_at' | 'updated_at'>): Promise<AtividadeAvaliativa> {
        const newAtividade: AtividadeAvaliativa = {
            ...atividade,
            id: Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockAtividades.push(newAtividade);
        return newAtividade;
    }

    async updateAtividade(id: string, atividade: Partial<AtividadeAvaliativa>): Promise<AtividadeAvaliativa> {
        const index = mockAtividades.findIndex(a => a.id === id);
        if (index === -1) {
            throw new Error('Atividade not found');
        }

        const updated = {
            ...mockAtividades[index],
            ...atividade,
            updated_at: new Date().toISOString()
        };
        mockAtividades[index] = updated;
        return updated;
    }
}
