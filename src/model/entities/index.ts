export interface Disciplina {
  id: string;
  nome: string;
  serie: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export interface Unidade {
  id: string;
  disciplina_id: string;
  tema: string;
  contexto_cultura_digital?: string;
  objetivos_aprendizagem?: string[];
  habilidades_bncc?: string[];
  created_at: string;
  updated_at: string;
  disciplina?: Disciplina;
  plano_aula?: PlanoAula;
  atividade_avaliativa?: AtividadeAvaliativa;
}

export interface PlanoAula {
  id: string;
  unidade_id: string;
  titulo: string;
  duracao: string;
  objetivos: string[];
  conteudo_programatico: string;
  metodologia: string;
  recursos_didaticos: string[];
  avaliacao: string;
  referencias?: string;
  created_at: string;
  updated_at: string;
}

export interface Questao {
  id: string;
  enunciado: string;
  tipo: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso';
  alternativas?: string[];
  resposta_correta?: string | number;
  pontuacao: number;
}

export interface AtividadeAvaliativa {
  id: string;
  unidade_id: string;
  titulo: string;
  tipo: string;
  instrucoes: string;
  questoes: Questao[];
  criterios_avaliacao?: string;
  pontuacao_total: number;
  created_at: string;
  updated_at: string;
}

export interface HistoricoGeracao {
  id: string;
  tipo: 'plano_aula' | 'atividade' | 'slides' | 'sugestao_unidade';
  titulo: string;
  descricao?: string;
  referencia_id?: string;
  disciplina_id?: string;
  unidade_id?: string;
  created_at: string;
  disciplina?: { nome: string };
  unidade?: { tema: string };
}

export const SERIES_OPTIONS = [
  '1º Ano - Ensino Fundamental',
  '2º Ano - Ensino Fundamental',
  '3º Ano - Ensino Fundamental',
  '4º Ano - Ensino Fundamental',
  '5º Ano - Ensino Fundamental',
  '6º Ano - Ensino Fundamental',
  '7º Ano - Ensino Fundamental',
  '8º Ano - Ensino Fundamental',
  '9º Ano - Ensino Fundamental',
  '1º Ano - Ensino Médio',
  '2º Ano - Ensino Médio',
  '3º Ano - Ensino Médio',
] as const;

export const DISCIPLINAS_SUGERIDAS = [
  'Matemática',
  'Língua Portuguesa',
  'Ciências',
  'História',
  'Geografia',
  'Arte',
  'Educação Física',
  'Língua Inglesa',
  'Filosofia',
  'Sociologia',
  'Física',
  'Química',
  'Biologia',
] as const;
