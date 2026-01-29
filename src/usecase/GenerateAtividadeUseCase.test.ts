import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateAtividadeUseCase } from './GenerateAtividadeUseCase';
import { Unidade, HabilidadeBNCC } from '../model/entities';

// Mock dependencies
const mockRepository = {
    createAtividade: vi.fn(),
};

const mockAIService = {
    generateAtividade: vi.fn(),
};

const mockUserRepository = {
    getUserContext: vi.fn(),
};

const mockBNCCRepository = {
    findByContext: vi.fn(),
};

describe('GenerateAtividadeUseCase', () => {
    let useCase: GenerateAtividadeUseCase;

    const mockUnidade: Unidade = {
        id: 'unidade-1',
        disciplina_id: 'disc-1',
        tema: 'Dinossauros',
        disciplina: {
            id: 'disc-1',
            nome: 'Ciências',
            serie: '1º Ano',
            nivel: 'Ensino Fundamental',
            area: 'Ciências da Natureza',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const mockHabilidade: HabilidadeBNCC = {
        codigo: 'EF01CI01',
        nivel: 'Ensino Fundamental',
        area: 'Ciências',
        componente: 'Ciências',
        serie: ['1º Ano'],
        descricao: 'Comparar características...',
    };

    // Valid mock response matching AtividadeSchema
    const mockAIResponse = {
        titulo: 'Atividade de Dinossauros',
        tipo: 'Exercício',
        instrucoes: 'Responda as questões com atenção.',
        questoes: [
            {
                id: 'q1',
                enunciado: 'Qual o maior dinossauro?',
                tipo: 'multipla_escolha',
                alternativas: ['T-Rex', 'Brontossauro'],
                resposta_correta: 'Brontossauro',
                pontuacao: 5
            },
            {
                id: 'q2',
                enunciado: 'Descreva um dinossauro.',
                tipo: 'dissertativa',
                pontuacao: 5
            }
        ],
        pontuacao_total: 10,
        criterios_avaliacao: 'Clareza e correção.'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useCase = new GenerateAtividadeUseCase(
            mockRepository as any,
            mockAIService as any,
            mockUserRepository as any,
            mockBNCCRepository as any
        );

        // Setup default success returns
        mockBNCCRepository.findByContext.mockReturnValue([mockHabilidade]);
        mockUserRepository.getUserContext.mockResolvedValue({ id: 'user-123' });
        mockAIService.generateAtividade.mockResolvedValue(mockAIResponse);
        mockRepository.createAtividade.mockImplementation(async (atividade) => ({
            ...atividade,
            id: 'new-atividade-id',
        }));
    });

    it('Happy Path: deve orquestrar fluxo e respeitar opções fornecidas', async () => {
        // Arrange
        const options = {
            objectiveCount: 5,
            subjectiveCount: 5,
            difficulty: 'Difícil' as const
        };

        // Act
        const result = await useCase.execute(mockUnidade, 'user-123', options);

        // Assert
        expect(mockUserRepository.getUserContext).toHaveBeenCalledWith('user-123');
        expect(mockBNCCRepository.findByContext).toHaveBeenCalledWith(mockUnidade.disciplina, mockUnidade);

        // Verifica se options foram passadas corretamente para a IA
        expect(mockAIService.generateAtividade).toHaveBeenCalledWith(
            mockUnidade,
            [mockHabilidade],
            options,
            expect.objectContaining({ id: 'user-123' })
        );

        // Verifica salvamento
        expect(mockRepository.createAtividade).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: 'Atividade de Dinossauros',
                habilidades_possiveis: expect.arrayContaining([mockHabilidade]),
                unidade_id: mockUnidade.id
            })
        );

        expect(result).toEqual(expect.objectContaining({ id: 'new-atividade-id' }));
    });

    it('Scenario: deve funcionar sem userId (usuário anônimo/sem contexto)', async () => {
        // Act
        await useCase.execute(mockUnidade); // userId undefined

        // Assert
        expect(mockUserRepository.getUserContext).not.toHaveBeenCalled();
        expect(mockAIService.generateAtividade).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            undefined // Context undefined
        );
    });

    it('Scenario: deve usar opções padrão se não fornecidas', async () => {
        // Act
        await useCase.execute(mockUnidade, 'user-123');

        // Assert
        expect(mockAIService.generateAtividade).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                objectiveCount: 3,
                subjectiveCount: 2,
                difficulty: 'Médio'
            }),
            expect.anything()
        );
    });

    it('Scenario: deve funcionar sem disciplina (sem BNCC)', async () => {
        // Arrange
        const unidadeSemDisciplina = { ...mockUnidade, disciplina: undefined };

        // Act
        await useCase.execute(unidadeSemDisciplina as any, 'user-123');

        // Assert
        // Não deve chamar repositorio BNCC
        expect(mockBNCCRepository.findByContext).not.toHaveBeenCalled();
        // IA deve receber lista vazia de habilidades
        expect(mockAIService.generateAtividade).toHaveBeenCalledWith(
            expect.anything(),
            [], // Empty BNCC
            expect.anything(),
            expect.anything()
        );
    });

    it('Edge Case: deve usar defaults se a validação do schema falhar (IA retorna lixo)', async () => {
        // Arrange
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        mockAIService.generateAtividade.mockResolvedValue({
            titulo: 'Título válido',
            // Faltam campos obrigatórios (questoes, etc)
        });

        try {
            // Act
            await useCase.execute(mockUnidade, 'user-123');

            // Assert
            expect(consoleSpy).toHaveBeenCalled();
            // Verifica se a mensagem de erro esperada contém o texto chave, de forma flexível
            const firstCallArgs = consoleSpy.mock.calls[0];
            const message = firstCallArgs ? firstCallArgs[0] : '';
            expect(message).toContain('AI response validation failed');

            // Verifica se completou com defaults do código
            expect(mockRepository.createAtividade).toHaveBeenCalledWith(
                expect.objectContaining({
                    titulo: 'Título válido', // Preserva o que veio
                    instrucoes: 'Responda as questões abaixo.', // Default
                    questoes: [], // Default
                    pontuacao_total: 10 // Default
                })
            );
        } finally {
            consoleSpy.mockRestore();
        }
    });

    it('Edge Case: deve injetar habilidades BNCC se o repositório retornar sem elas', async () => {
        // Arrange
        mockRepository.createAtividade.mockResolvedValue({
            id: 'saved-id',
            titulo: 'Atividade',
            // habilidades_possiveis: undefined
        });

        // Act
        const result = await useCase.execute(mockUnidade, 'user-123');

        // Assert
        expect(result.habilidades_possiveis).toEqual(expect.arrayContaining([mockHabilidade]));
    });
});
