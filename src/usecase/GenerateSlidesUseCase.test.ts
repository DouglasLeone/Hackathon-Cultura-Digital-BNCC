import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateSlidesUseCase } from './GenerateSlidesUseCase';
import { Unidade, HabilidadeBNCC } from '../model/entities';

// Mock dependencies
const mockRepository = {
    createMaterialSlides: vi.fn(),
};

const mockAIService = {
    generateSlides: vi.fn(),
};

const mockBNCCRepository = {
    findByContext: vi.fn(),
};

describe('GenerateSlidesUseCase', () => {
    let useCase: GenerateSlidesUseCase;

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

    // Correct mock: Array of slides (not object with title)
    const mockSlidesArray = [
        { titulo: 'Slide 1', conteudo: ['Intro'], anotacoes: 'Falar alto' },
        { titulo: 'Slide 2', conteudo: ['Fim'], anotacoes: 'Tchau' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useCase = new GenerateSlidesUseCase(
            mockAIService as any,
            mockBNCCRepository as any,
            mockRepository as any
        );

        // Setup default success returns
        mockBNCCRepository.findByContext.mockReturnValue([mockHabilidade]);
        mockAIService.generateSlides.mockResolvedValue(mockSlidesArray);
        mockRepository.createMaterialSlides.mockImplementation(async (slides) => ({
            ...slides,
            id: 'new-slides-id',
        }));
    });

    it('Happy Path: deve gerar e salvar slides com contexto BNCC', async () => {
        // Act
        const result = await useCase.execute(mockUnidade);

        // Assert
        // 1. Busca BNCC
        expect(mockBNCCRepository.findByContext).toHaveBeenCalledWith(mockUnidade.disciplina, mockUnidade);

        // 2. Chama AI service matches array
        expect(mockAIService.generateSlides).toHaveBeenCalledWith(mockUnidade, [mockHabilidade]);

        // 3. Salva no repo
        expect(mockRepository.createMaterialSlides).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: `Slides: ${mockUnidade.tema}`,
                conteudo: mockSlidesArray, // The array itself
                habilidades_possiveis: expect.arrayContaining([mockHabilidade]),
                unidade_id: mockUnidade.id
            })
        );

        // 4. Retorna resultado
        expect(result).toEqual(expect.objectContaining({ id: 'new-slides-id' }));
    });

    it('Scenario: deve funcionar sem disciplina (sem BNCC)', async () => {
        // Arrange
        const unidadeSemDisciplina = { ...mockUnidade, disciplina: undefined };

        // Act
        await useCase.execute(unidadeSemDisciplina as any);

        // Assert
        expect(mockBNCCRepository.findByContext).not.toHaveBeenCalled();
        expect(mockAIService.generateSlides).toHaveBeenCalledWith(
            expect.anything(),
            [] // Empty BNCC
        );
        expect(mockRepository.createMaterialSlides).toHaveBeenCalled();
    });

    it('Edge Case: deve usar defaults se a validação do schema falhar (array vazio)', async () => {
        // Arrange
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        // Mock returning empty array (violates min(1) in Schema)
        mockAIService.generateSlides.mockResolvedValue([]);

        // Act
        await useCase.execute(mockUnidade);

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('AI response validation failed'),
            expect.anything()
        );

        // Should save with defaults
        expect(mockRepository.createMaterialSlides).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: `Slides: ${mockUnidade.tema}`,
                conteudo: []
            })
        );

        consoleSpy.mockRestore();
    });
});
