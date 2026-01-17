
export interface DisciplinaDTO {
    id: string;
    nome: string;
    serie: string;
    descricao?: string;
    created_at: string;
    updated_at: string;
}

export interface UnidadeDTO {
    id: string;
    disciplina_id: string;
    tema: string;
    contexto_cultura_digital?: string;
    objetivos_aprendizagem?: string[];
    habilidades_bncc?: string[];
    created_at: string;
    updated_at: string;
}

// Join result expected from Supabase when fetching Unidades with Disciplina
export interface UnidadeWithDisciplinaDTO extends UnidadeDTO {
    disciplina: DisciplinaDTO;
}

export interface HistoricoGeracaoDTO {
    id: string;
    tipo: 'plano_aula' | 'atividade' | 'slides' | 'sugestao_unidade';
    titulo: string;
    descricao?: string;
    referencia_id?: string;
    disciplina_id?: string;
    unidade_id?: string;
    created_at: string;
}
