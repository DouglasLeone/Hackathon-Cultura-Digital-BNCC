import { describe, it, expect, beforeEach } from 'vitest';
import { EnrichThemeUseCase } from './EnrichThemeUseCase';
import { Disciplina, HabilidadeBNCC } from '../model/entities';

describe('EnrichThemeUseCase', () => {
    let useCase: EnrichThemeUseCase;

    const mockDisciplina: Disciplina = {
        id: 'disc-1',
        nome: 'História',
        serie: '6º Ano',
        nivel: 'Ensino Fundamental',
        area: 'Ciências Humanas',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const mockHabilidades: HabilidadeBNCC[] = [
        {
            codigo: 'EF06HI01',
            descricao: 'Identificar diferentes formas de compreensão da noção de tempo e de periodização dos processos históricos (continuidades e rupturas).',
            nivel: 'Ensino Fundamental',
            area: 'História',
            componente: 'História',
            serie: ['6º Ano']
        },
        {
            codigo: 'EF06HI02',
            descricao: 'Identificar a gênese da produção do saber histórico e analisar o significado das fontes que originaram determinadas formas de registro em sociedades e épocas distintas.',
            nivel: 'Ensino Fundamental',
            area: 'História',
            componente: 'História',
            serie: ['6º Ano']
        },
        {
            codigo: 'EF06HI05',
            descricao: 'Descrever e analisar a história dos povos indígenas.', // Irrelevante para o tema "Tempo"
            nivel: 'Ensino Fundamental',
            area: 'História',
            componente: 'História',
            serie: ['6º Ano']
        }
    ];

    beforeEach(() => {
        useCase = new EnrichThemeUseCase();
    });

    it('Happy Path: deve formatar o prompt incluindo habilidades relevantes baseadas em palavras-chave', async () => {
        // Arrange
        const tema = 'Compreensão do Tempo e Periodização';

        // Act
        const result = await useCase.execute(tema, mockDisciplina, mockHabilidades);

        // Assert
        expect(result).toContain('TEMA: Compreensão do Tempo e Periodização');
        expect(result).toContain('DISCIPLINA: História - 6º Ano (Ensino Fundamental)');

        // Deve incluir a habilidade EF06HI01 (tem "tempo" e "periodização")
        expect(result).toContain('[EF06HI01]');
        expect(result).toContain('Identificar diferentes formas de compreensão da noção de tempo');

        // Não deve incluir EF06HI05 (índigenas) pois não tem keywords relevantes
        expect(result).not.toContain('[EF06HI05]');
    });

    it('Scenario: deve exibir mensagem de fallback se nenhuma habilidade for relevante', async () => {
        // Arrange
        const tema = 'Astronomia Egípcia'; // Nenhuma habilidade de história mocked fala de astronomia

        // Act
        const result = await useCase.execute(tema, mockDisciplina, mockHabilidades);

        // Assert
        expect(result).toContain('Utilize o tema como base para identificar as competências BNCC mais adequadas');
        expect(result).not.toContain('[EF06'); // Nenhuma habilidade listada
    });

    it('Scenario: deve tratar palavras-chave ignorando stop words', async () => {
        // Arrange
        // Tema cheio de stop words: "A noção de tempo na história"
        // Keywords esperadas: "noção", "tempo", "história"
        const tema = 'A noção de tempo na história';

        // Act
        const result = await useCase.execute(tema, mockDisciplina, mockHabilidades);

        // Assert
        // Deve matchar EF06HI01 por causa de "tempo" e "história" (nosso mock tem processos históricos)
        expect(result).toContain('[EF06HI01]');
    });

    it('Edge Case: deve funcionar com lista de habilidades vazia', async () => {
        // Act
        const result = await useCase.execute('Qualquer tema', mockDisciplina, []);

        // Assert
        expect(result).toContain('Utilize o tema como base para identificar as competências BNCC mais adequadas');
    });

    it('Edge Case: deve limitar a no máximo 3 habilidades relevantes', async () => {
        // Arrange - Criar 5 habilidades idênticas que matcham "tempo"
        const muitasHabilidades = Array(5).fill(null).map((_, i) => ({
            ...mockHabilidades[0],
            codigo: `TEST0${i}`,
            descricao: `Texto repetido sobre tempo ${i}`
        }));

        // Act
        const result = await useCase.execute('tempo', mockDisciplina, muitasHabilidades);

        // Assert
        // Deve conter apenas 3 entradas de habilidades
        const matches = (result.match(/\[TEST0\d\]/g) || []).length;
        expect(matches).toBe(3);
    });
});
