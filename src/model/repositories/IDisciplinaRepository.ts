
import { Disciplina } from '../entities';

export interface IDisciplinaRepository {
    getAll(): Promise<Disciplina[]>;
    getById(id: string): Promise<Disciplina | null>;
    create(disciplina: Omit<Disciplina, 'id' | 'created_at' | 'updated_at'>): Promise<Disciplina>;
    update(id: string, disciplina: Partial<Disciplina>): Promise<Disciplina>;
    delete(id: string): Promise<void>;
}
