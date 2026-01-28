import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeneratePlanoAulaUseCase } from './GeneratePlanoAulaUseCase';
import { Unidade, HabilidadeBNCC } from '../model/entities';

// Mock dependencies
const mockRepository = {
    createPlanoAula: vi.fn(),
};

const mockAIService = {
    generatePlanoAula: vi.fn(),
};

const mockUserRepository = {
    getUserContext: vi.fn(),
};

const mockBNCCRepository = {
    findByContext: vi.fn(),
};

const mockEnrichThemeUseCase = {
    execute: vi.fn(),
};

const mockValidateQualityUseCase = {
    execute: vi.fn(),
};

describe('GeneratePlanoAulaUseCase', () => {
    let useCase: GeneratePlanoAulaUseCase;

    // Default mock data
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
        descricao: 'Comparar características de diferentes materiais present...',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Instantiate useCase with mocks
        useCase = new GeneratePlanoAulaUseCase(
            mockRepository as any,
            mockAIService as any,
            mockUserRepository as any,
            mockBNCCRepository as any,
            mockEnrichThemeUseCase as any,
            mockValidateQualityUseCase as any
        );

        // Setup default success returns
        mockBNCCRepository.findByContext.mockReturnValue([mockHabilidade]);
        mockUserRepository.getUserContext.mockResolvedValue({ id: 'user-123', niveis_ensino: [] }); // Fix: Return defined context
        mockEnrichThemeUseCase.execute.mockResolvedValue('Contexto enriquecido');
        mockAIService.generatePlanoAula.mockResolvedValue({
            titulo: 'Aula Incrível sobre Dinossauros',
            duracao: '50 minutos',
            objetivos: ['Identificar dinossauros'],
            conteudo_programatico: 'Introdução aos dinossauros, tipos de dinossauros, extinção.',
            metodologia: 'Aula expositiva dialogada com uso de slides e vídeos.',
            recursos_didaticos: ['Projetor', 'Computador', 'Vídeo do YouTube'],
            avaliacao: 'Participação oral e desenho dos dinossauros favoritos.',
            conteudo: 'Texto completo da aula...',
        });
        mockValidateQualityUseCase.execute.mockResolvedValue({
            score: 100,
            issues: [],
            suggestions: [],
            approved: true
        });
        mockRepository.createPlanoAula.mockImplementation(async (plano) => ({
            ...plano,
            id: 'new-plano-id',
        }));
    });

    it('Happy Path: deve orquestrar todo o fluxo corretamente e salvar o plano', async () => {
        // Act
        const result = await useCase.execute(mockUnidade, 'user-123');

        // Assert
        // 1. Busca contexto do usuário
        expect(mockUserRepository.getUserContext).toHaveBeenCalledWith('user-123');

        // 2. Busca BNCC
        expect(mockBNCCRepository.findByContext).toHaveBeenCalledWith(mockUnidade.disciplina, mockUnidade);

        // 3. Enriquece tema
        expect(mockEnrichThemeUseCase.execute).toHaveBeenCalledWith(
            mockUnidade.tema,
            mockUnidade.disciplina!,
            [mockHabilidade]
        );

        // 4. Gera plano com IA
        expect(mockAIService.generatePlanoAula).toHaveBeenCalledWith(
            mockUnidade,
            [mockHabilidade],
            expect.objectContaining({ id: 'user-123' }), // Fix: Expect actual object
            'Contexto enriquecido'
        );

        // 5. Valida qualidade
        expect(mockValidateQualityUseCase.execute).toHaveBeenCalled();

        // 6. Salva no repositório
        expect(mockRepository.createPlanoAula).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: 'Aula Incrível sobre Dinossauros',
                quality_score: 100,
                unidade_id: mockUnidade.id,
                habilidades_possiveis: expect.arrayContaining([mockHabilidade]),
            })
        );

        // 7. Retorna o plano salvo
        expect(result).toEqual(expect.objectContaining({
            id: 'new-plano-id',
            titulo: 'Aula Incrível sobre Dinossauros'
        }));
    });

    it('Scenario: deve funcionar sem userId (usuário anônimo ou sem contexto)', async () => {
        // Act
        await useCase.execute(mockUnidade); // Sem segundo argumento

        // Assert
        expect(mockUserRepository.getUserContext).not.toHaveBeenCalled();
        expect(mockAIService.generatePlanoAula).toHaveBeenCalledWith(
            mockUnidade,
            [mockHabilidade],
            undefined, // Fix: Expect undefined for no user
            'Contexto enriquecido'
        );
    });

    it('Scenario: deve prosseguir mesmo sem habilidades BNCC encontradas', async () => {
        // Arrange
        mockBNCCRepository.findByContext.mockReturnValue([]);

        // Act
        await useCase.execute(mockUnidade, 'user-123');

        // Assert
        expect(mockAIService.generatePlanoAula).toHaveBeenCalledWith(
            mockUnidade,
            [], // Habilidades vazias
            expect.objectContaining({ id: 'user-123' }),
            'Contexto enriquecido'
        );
        // Deve salvar mesmo assim
        expect(mockRepository.createPlanoAula).toHaveBeenCalled();
    });

    it('Scenario: deve lançar erro se a unidade não tiver disciplina associada', async () => {
        // Arrange
        const unidadeSemDisciplina = { ...mockUnidade, disciplina: undefined };

        // Act & Assert
        await expect(useCase.execute(unidadeSemDisciplina as any, 'user-123'))
            .rejects.toThrow('Unidade deve ter uma disciplina associada');
    });

    it('Scenario: deve salvar plano mesmo com score de qualidade baixo (mas persistindo issues)', async () => {
        // Arrange
        const qualityResult = {
            score: 40,
            issues: [{ category: 'alignment', message: 'Falta BNCC', severity: 'critical' }], // Fix: Tipagem correta
            suggestions: ['Melhore isso'], // Fix: Tipagem correta
            approved: false
        };
        mockValidateQualityUseCase.execute.mockResolvedValue(qualityResult);

        // Act
        await useCase.execute(mockUnidade, 'user-123');

        // Assert
        expect(mockRepository.createPlanoAula).toHaveBeenCalledWith(
            expect.objectContaining({
                quality_score: 40,
                quality_issues: expect.arrayContaining([
                    expect.objectContaining({ category: 'alignment' })
                ])
            })
        );
    });

    it('Edge Case: deve logar warning e usar defaults quando a validação do schema falha', async () => {
        // Arrange
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        mockAIService.generatePlanoAula.mockResolvedValue({
            titulo: 123, // Tipo errado (deveria ser string) - força falha do Zod
            objetivos: 'não é array' // Tipo errado
        });

        // Act
        await useCase.execute(mockUnidade, 'user-123');

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('AI response validation failed'),
            expect.anything()
        );
        // Deve salvar com defaults em vez de crashar
        expect(mockRepository.createPlanoAula).toHaveBeenCalledWith(
            expect.objectContaining({
                objetivos: [], // Fallback default
                duracao: '50 minutos' // Fallback default
            })
        );

        consoleSpy.mockRestore();
    });

    it('Edge Case: deve injetar habilidades BNCC se o repositório retornar plano sem elas', async () => {
        // Arrange
        // Repo retorna objeto sem o campo habilidades_possiveis populated
        mockRepository.createPlanoAula.mockResolvedValue({
            id: 'saved-id',
            titulo: 'Plano Salvo',
            // habilidades_possiveis: undefined
        });

        // Act
        const result = await useCase.execute(mockUnidade, 'user-123');

        // Assert
        // O usecase deve ter preenchido manualmente antes de retornar
        expect(result.habilidades_possiveis).toEqual(expect.arrayContaining([mockHabilidade]));
    });

    it('Edge Case: deve usar defaults se a IA retornar objeto parcial/incompleto', async () => {
        // Arrange
        mockAIService.generatePlanoAula.mockResolvedValue({}); // Objeto vazio

        // Act
        await useCase.execute(mockUnidade, 'user-123');

        // Assert
        expect(mockRepository.createPlanoAula).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: `Plano de Aula: ${mockUnidade.tema}`,
                duracao: '50 minutos',
                objetivos: [],
                conteudo: ''
            })
        );
    });
});
