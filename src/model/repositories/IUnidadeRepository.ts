
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
    updatePlanoAula(id: string, data: Partial<PlanoAula>): Promise<void>;

    // Atividade Methods
    createAtividade(data: Omit<AtividadeAvaliativa, 'id' | 'created_at' | 'updated_at'>): Promise<AtividadeAvaliativa>;
    getAtividade(unidadeId: string): Promise<AtividadeAvaliativa | null>;
    updateAtividade(id: string, data: Partial<AtividadeAvaliativa>): Promise<void>;

    // Slides Methods
    createMaterialSlides(data: Omit<MaterialSlides, 'id' | 'created_at' | 'updated_at'>): Promise<MaterialSlides>;
    getMaterialSlides(unidadeId: string): Promise<MaterialSlides | null>;
    updateMaterialSlides(id: string, data: Partial<MaterialSlides>): Promise<void>;
}
