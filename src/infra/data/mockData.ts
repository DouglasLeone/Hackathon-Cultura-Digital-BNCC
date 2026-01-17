
import { Disciplina, Unidade, PlanoAula, AtividadeAvaliativa, HistoricoGeracao } from '../../model/entities';

export const mockDisciplinas: Disciplina[] = [
    {
        id: '1',
        nome: 'História',
        serie: '8º Ano',
        descricao: 'Ensino de História Geral e do Brasil',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        nome: 'Matemática',
        serie: '9º Ano',
        descricao: 'Álgebra e Geometria',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export const mockUnidades: Unidade[] = [
    {
        id: '101',
        disciplina_id: '1',
        tema: 'Revolução Industrial',
        contexto_cultura_digital: 'Impacto da tecnologia na sociedade',
        objetivos_aprendizagem: ['Compreender as mudanças sociais', 'Analisar o impacto tecnológico'],
        habilidades_bncc: ['EF08HI03'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export const mockPlanosAula: PlanoAula[] = [];
export const mockAtividades: AtividadeAvaliativa[] = [];
export const mockHistorico: HistoricoGeracao[] = [];
