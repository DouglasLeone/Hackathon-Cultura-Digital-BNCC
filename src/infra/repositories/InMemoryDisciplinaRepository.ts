
import { IDisciplinaRepository } from '../../model/repositories/IDisciplinaRepository';
import { Disciplina } from '../../model/entities';
import { mockDisciplinas } from '../data/mockData';

export class InMemoryDisciplinaRepository implements IDisciplinaRepository {
    async getAll(): Promise<Disciplina[]> {
        return [...mockDisciplinas];
    }

    async getById(id: string): Promise<Disciplina | null> {
        const found = mockDisciplinas.find(d => d.id === id);
        return found || null;
    }

    async create(disciplina: Omit<Disciplina, 'id' | 'created_at' | 'updated_at'>): Promise<Disciplina> {
        const newDisciplina: Disciplina = {
            ...disciplina,
            id: Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockDisciplinas.push(newDisciplina);
        return newDisciplina;
    }

    async update(id: string, disciplina: Partial<Disciplina>): Promise<Disciplina> {
        const index = mockDisciplinas.findIndex(d => d.id === id);
        if (index === -1) {
            throw new Error('Disciplina not found');
        }

        const updated = {
            ...mockDisciplinas[index],
            ...disciplina,
            updated_at: new Date().toISOString()
        };
        mockDisciplinas[index] = updated;
        return updated;
    }

    async delete(id: string): Promise<void> {
        const index = mockDisciplinas.findIndex(d => d.id === id);
        if (index !== -1) {
            mockDisciplinas.splice(index, 1);
        }
    }
}
