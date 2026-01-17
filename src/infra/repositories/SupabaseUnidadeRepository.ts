
import { IUnidadeRepository } from '../../model/repositories/IUnidadeRepository';
import {
    getUnidades,
    getUnidadesByDisciplina,
    getUnidade,
    createUnidade,
    updateUnidade,
    deleteUnidade,
    getPlanoAulaByUnidade,
    createPlanoAula,
    updatePlanoAula,
    getAtividadeByUnidade,
    createAtividade,
    updateAtividade
} from '../data/database';
import { Unidade, PlanoAula, AtividadeAvaliativa } from '../../model/entities';

export class SupabaseUnidadeRepository implements IUnidadeRepository {
    async getAll(): Promise<Unidade[]> {
        return await getUnidades();
    }

    async getByDisciplinaId(disciplinaId: string): Promise<Unidade[]> {
        return await getUnidadesByDisciplina(disciplinaId);
    }

    async getById(id: string): Promise<Unidade | null> {
        return await getUnidade(id);
    }

    async create(unidade: Omit<Unidade, 'id' | 'created_at' | 'updated_at' | 'disciplina'>): Promise<Unidade> {
        return await createUnidade(unidade);
    }

    async update(id: string, unidade: Partial<Unidade>): Promise<Unidade> {
        return await updateUnidade(id, unidade);
    }

    async delete(id: string): Promise<void> {
        return await deleteUnidade(id);
    }

    async getPlanoAula(unidadeId: string): Promise<PlanoAula | null> {
        return await getPlanoAulaByUnidade(unidadeId);
    }

    async createPlanoAula(plano: Omit<PlanoAula, 'id' | 'created_at' | 'updated_at'>): Promise<PlanoAula> {
        return await createPlanoAula(plano);
    }

    async getAtividade(unidadeId: string): Promise<AtividadeAvaliativa | null> {
        return await getAtividadeByUnidade(unidadeId);
    }

    async createAtividade(atividade: Omit<AtividadeAvaliativa, 'id' | 'created_at' | 'updated_at'>): Promise<AtividadeAvaliativa> {
        return await createAtividade(atividade);
    }

    async updatePlanoAula(id: string, plano: Partial<PlanoAula>): Promise<PlanoAula> {
        return await updatePlanoAula(id, plano);
    }

    async updateAtividade(id: string, atividade: Partial<AtividadeAvaliativa>): Promise<AtividadeAvaliativa> {
        return await updateAtividade(id, atividade);
    }
}
