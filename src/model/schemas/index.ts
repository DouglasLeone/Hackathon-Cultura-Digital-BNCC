import { z } from 'zod';

/**
 * Zod Validation Schemas
 * 
 * Type-safe runtime validation para entities principais.
 */

// Níveis e Séries como enums para validação
const NivelEnsinoEnum = z.enum(['Ensino Fundamental', 'Ensino Médio']);

export const DisciplinaSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
    serie: z.string().min(1, 'Série é obrigatória'),
    nivel: NivelEnsinoEnum,
    area: z.string().min(1, 'Área é obrigatória'),
    descricao: z.string().optional()
});

export const UnidadeSchema = z.object({
    tema: z.string().min(3, 'Tema deve ter no mínimo 3 caracteres').max(200),
    disciplina_id: z.string().min(1, 'ID de disciplina é obrigatório'),
    contexto_cultura_digital: z.string().optional(),
    objetivos_aprendizagem: z.array(z.string()).optional(),
    habilidades_bncc: z.array(z.string()).optional()
});

export const PlanoAulaSchema = z.object({
    titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
    duracao: z.string().min(1, 'Duração é obrigatória'),
    objetivos: z.array(z.string()).min(1, 'Pelo menos um objetivo é necessário'),
    conteudo_programatico: z.string().min(10, 'Conteúdo programático muito curto'),
    metodologia: z.string().min(10, 'Metodologia deve ser descrita'),
    recursos_didaticos: z.array(z.string()),
    avaliacao: z.string().min(10, 'Método de avaliação deve ser descrito'),
    conteudo: z.string().optional(),
    habilidades_bncc_usadas: z.array(z.string()).optional()
});

export const QuestaoSchema = z.object({
    id: z.string(),
    enunciado: z.string().min(10, 'Enunciado muito curto'),
    tipo: z.enum(['multipla_escolha', 'dissertativa', 'verdadeiro_falso']),
    alternativas: z.array(z.string()).optional(),
    resposta_correta: z.union([z.string(), z.number()]).optional(),
    pontuacao: z.number().min(0).max(100)
});

export const AtividadeSchema = z.object({
    titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
    tipo: z.string().min(1, 'Tipo é obrigatório'),
    instrucoes: z.string().min(10, 'Instruções devem ser descritivas'),
    questoes: z.array(QuestaoSchema).min(1, 'Pelo menos uma questão é necessária'),
    criterios_avaliacao: z.string().optional(),
    pontuacao_total: z.number().min(0)
});

export const SlideContentSchema = z.object({
    titulo: z.string().min(1, 'Título do slide é obrigatório'),
    conteudo: z.array(z.string()).min(1, 'Slide deve ter conteúdo'),
    anotacoes: z.string().optional()
});

export const SlidesSchema = z.object({
    titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
    conteudo: z.array(SlideContentSchema).min(1, 'Apresentação deve ter pelo menos um slide')
});

// Type exports para uso em TypeScript
export type DisciplinaInput = z.infer<typeof DisciplinaSchema>;
export type UnidadeInput = z.infer<typeof UnidadeSchema>;
export type PlanoAulaInput = z.infer<typeof PlanoAulaSchema>;
export type AtividadeInput = z.infer<typeof AtividadeSchema>;
export type SlidesInput = z.infer<typeof SlidesSchema>;
