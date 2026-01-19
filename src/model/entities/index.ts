export interface Disciplina {
  id: string;
  nome: string;
  serie: string;
  area: string; // New field
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export const AREAS_CONHECIMENTO_MEDIO = [
  'Linguagens e suas Tecnologias',
  'Matemática e suas Tecnologias',
  'Ciências da Natureza e suas Tecnologias',
  'Ciências Humanas e Sociais Aplicadas'
] as const;

export const AREAS_CONHECIMENTO_FUNDAMENTAL = [
  'Linguagens',
  'Matemática',
  'Ciências da Natureza',
  'Ciências Humanas',
  'Ensino Religioso'
] as const;

export const SERIES_FUNDAMENTAL = [
  '1º Ano - Ensino Fundamental',
  '2º Ano - Ensino Fundamental',
  '3º Ano - Ensino Fundamental',
  '4º Ano - Ensino Fundamental',
  '5º Ano - Ensino Fundamental',
  '6º Ano - Ensino Fundamental',
  '7º Ano - Ensino Fundamental',
  '8º Ano - Ensino Fundamental',
  '9º Ano - Ensino Fundamental',
] as const;

export const SERIES_MEDIO = [
  '1º Ano - Ensino Médio',
  '2º Ano - Ensino Médio',
  '3º Ano - Ensino Médio',
] as const;

export const SERIES_OPTIONS = [
  ...SERIES_FUNDAMENTAL,
  ...SERIES_MEDIO
] as const;

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
  conteudo?: string; // For the full markdown content
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
  disciplina?: { nome: string }; // Joined
  unidade?: { tema: string }; // Joined
}

export type NivelEnsino = 'Ensino Fundamental' | 'Ensino Médio';

export interface UserContext {
  id: string; // user_id (local or auth)
  niveis_ensino: NivelEnsino[];
  created_at: string;
  updated_at: string;
}



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
