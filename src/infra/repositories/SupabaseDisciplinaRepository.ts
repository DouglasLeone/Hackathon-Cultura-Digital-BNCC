
import { IDisciplinaRepository } from '../../model/repositories/IDisciplinaRepository';
import {
    getDisciplinas,
    getDisciplina,
    createDisciplina,
    updateDisciplina,
    deleteDisciplina
} from '../data/database';
import { Disciplina } from '../../model/entities';

export class SupabaseDisciplinaRepository implements IDisciplinaRepository {
    async getAll(): Promise<Disciplina[]> {
        return await getDisciplinas();
    }

    async getById(id: string): Promise<Disciplina | null> {
        return await getDisciplina(id);
    }

    async create(disciplina: Omit<Disciplina, 'id' | 'created_at' | 'updated_at'>): Promise<Disciplina> {
        return await createDisciplina(disciplina);
    }

    async update(id: string, disciplina: Partial<Disciplina>): Promise<Disciplina> {
        return await updateDisciplina(id, disciplina);
    }

    async delete(id: string): Promise<void> {
        return await deleteDisciplina(id);
    }
}
