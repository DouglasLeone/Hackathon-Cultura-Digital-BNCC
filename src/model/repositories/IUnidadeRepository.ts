
import { Unidade, PlanoAula, AtividadeAvaliativa } from '../entities';

export interface IUnidadeRepository {
    getAll(): Promise<Unidade[]>;
    getByDisciplinaId(disciplinaId: string): Promise<Unidade[]>;
    getById(id: string): Promise<Unidade | null>;
    create(unidade: Omit<Unidade, 'id' | 'created_at' | 'updated_at' | 'disciplina'>): Promise<Unidade>;
    update(id: string, unidade: Partial<Unidade>): Promise<Unidade>;
    delete(id: string): Promise<void>;

    // Linked materials
    getPlanoAula(unidadeId: string): Promise<PlanoAula | null>;
    createPlanoAula(plano: Omit<PlanoAula, 'id' | 'created_at' | 'updated_at'>): Promise<PlanoAula>;
    updatePlanoAula(id: string, plano: Partial<PlanoAula>): Promise<PlanoAula>;
    getAtividade(unidadeId: string): Promise<AtividadeAvaliativa | null>;
    createAtividade(atividade: Omit<AtividadeAvaliativa, 'id' | 'created_at' | 'updated_at'>): Promise<AtividadeAvaliativa>;
    updateAtividade(id: string, atividade: Partial<AtividadeAvaliativa>): Promise<AtividadeAvaliativa>;
}
