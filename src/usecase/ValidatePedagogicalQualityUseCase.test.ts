import { describe, it, expect } from "vitest";
import { ValidatePedagogicalQualityUseCase } from "./ValidatePedagogicalQualityUseCase";
import { HabilidadeBNCC, PlanoAula } from "../model/entities";

// Helper for generating long content
const generateLongText = (text: string) => `${text} `.repeat(100);

describe("ValidatePedagogicalQualityUseCase", () => {
    const useCase = new ValidatePedagogicalQualityUseCase();

    const createMockHabilidade = (codigo: string): HabilidadeBNCC =>
    ({
        codigo,
        nivel: "Ensino Médio",
        area: "Linguagens",
        componente: "Língua Portuguesa",
        serie: ["3º Ano"],
        descricao: "Mock Description",
    } as HabilidadeBNCC);

    const mockHabilidade = createMockHabilidade("EM13LGG101");

    it("Happy Path: deve aprovar plano excelente (Score 100)", async () => {
        // Arrange
        const planoIdeal: Partial<PlanoAula> = {
            conteudo: generateLongText(
                "Atividade prática e hands-on com foco na habilidade EM13LGG101."
            ),
            objetivos: ["Analisar texto", "Criar redação", "Aplicar gramática"],
            duracao: "50 minutos",
        };

        // Act
        const result = await useCase.execute(planoIdeal, [mockHabilidade]);

        // Assert
        expect(result.score).toBe(100);
        expect(result.approved).toBe(true);
        expect(result.issues).toHaveLength(0);
        expect(result.suggestions).toEqual([]);
    });

    it("Edge Case: deve penalizar se não mencionar código BNCC (Critical Issue)", async () => {
        // Arrange
        const planoSemBNCC: Partial<PlanoAula> = {
            // longo o suficiente, mas sem o código
            conteudo: generateLongText("Texto bem longo sem citar o código, mas com prática."),
            objetivos: ["Analisar texto", "Criar redação", "Aplicar gramática"], // evita penalidade Bloom
            duracao: "50 minutos",
        };

        // Act
        const result = await useCase.execute(planoSemBNCC, [mockHabilidade]);

        // Assert
        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    category: "alignment",
                    severity: "critical",
                }),
            ])
        );

        // Aqui dá para afirmar exatamente:
        // só BNCC falhou => -30, o resto passou => 100 - 30 = 70
        expect(result.score).toBe(70);
        expect(result.approved).toBe(true); // pela regra: score >= 70 aprova

        expect(result.suggestions).toEqual(
            expect.arrayContaining([
                expect.stringContaining("códigos das habilidades BNCC"),
            ])
        );
    });

    it("Edge Case: deve gerar warning para conteúdo curto (depth)", async () => {
        // Arrange
        const planoCurto: Partial<PlanoAula> = {
            conteudo: "Texto curto demais EM13LGG101 prática.", // inclui BNCC e prática pra isolar a regra de depth
            objetivos: ["Analisar texto", "Criar redação", "Aplicar gramática"],
            duracao: "50 minutos",
        };

        // Act
        const result = await useCase.execute(planoCurto, [mockHabilidade]);

        // Assert
        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    category: "depth",
                    severity: "warning",
                }),
            ])
        );

        // depth curto => -15, todo o resto ok => 85
        expect(result.score).toBe(85);
        expect(result.approved).toBe(true);
    });

    it('Edge Case: deve penalizar se objetivos não usarem verbos de Bloom', async () => {
        // Arrange
        const planoSemBloom: Partial<PlanoAula> = {
            // Fix: usar "prática" para passar na validação de atividade prática
            conteudo: generateLongText('Conteúdo com prática e hands-on com código EM13LGG101.'),
            // Verbos fracos/não listados
            objetivos: ['Saber sobre o assunto', 'Entender o conceito', 'Ver o conteúdo'],
            duracao: '50 minutos'
        };

        // Act
        const result = await useCase.execute(planoSemBloom, [mockHabilidade]);

        // Assert
        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    category: 'structure',
                    severity: 'info',
                    message: expect.stringContaining('verbos da Taxonomia de Bloom')
                })
            ])
        );
        // -5 pontos
        expect(result.score).toBe(95);
    });

    it('Edge Case: deve penalizar duração irrealista', async () => {
        // Arrange
        const planoIrrealista: Partial<PlanoAula> = {
            // Fix: usar "prática"
            conteudo: generateLongText('Conteúdo com prática e hands-on com código EM13LGG101.'),
            objetivos: ['Analisar texto', 'Criar redação', 'Aplicar gramática'],
            duracao: '10 minutos' // < 30 min
        };

        // Act
        const result = await useCase.execute(planoIrrealista, [mockHabilidade]);

        // Assert
        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    category: 'structure',
                    severity: 'warning',
                    message: expect.stringContaining('duração definida parece irrealista')
                })
            ])
        );
        // -10 pontos
        expect(result.score).toBe(90);
    });

    it('Edge Case: deve penalizar conteúdo muito genérico', async () => {
        // Arrange
        // Fix: garantir > 500 caracteres para não falhar no length check
        // Repete a frase 10 vezes (aprox 750 chars)
        const fraseGenerica = 'É importante que o professor deve garantir que os alunos devem aprender o objetivo desta aula. ';
        const textoGenerico = fraseGenerica.repeat(10) + ' EM13LGG101 prática.';

        const planoGenerico: Partial<PlanoAula> = {
            conteudo: textoGenerico,
            objetivos: ['Analisar texto', 'Criar redação', 'Aplicar gramática'],
            duracao: '50 minutos'
        };

        // Act
        const result = await useCase.execute(planoGenerico, [mockHabilidade]);

        // Assert
        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    category: 'clarity',
                    severity: 'info',
                    message: expect.stringContaining('contém muitas frases genéricas')
                })
            ])
        );
        // -5 pontos
        expect(result.score).toBe(95);
    });

    it('Edge Case: deve penalizar falta de atividade prática', async () => {
        // Arrange
        const planoTeorico: Partial<PlanoAula> = {
            conteudo: generateLongText('Apenas teoria expositiva sobre o código EM13LGG101.'), // Sem "prática" ou "hands-on"
            objetivos: ['Analisar texto', 'Criar redação', 'Aplicar gramática'],
            duracao: '50 minutos'
        };

        // Act
        const result = await useCase.execute(planoTeorico, [mockHabilidade]);

        // Assert
        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    category: 'structure',
                    severity: 'warning',
                    message: expect.stringContaining('atividade prática')
                })
            ])
        );
        // -10 pontos
        expect(result.score).toBe(90);
    });

    it('Edge Case: deve penalizar se houver menos de 3 objetivos', async () => {
        // Arrange
        const planoPoucosObjetivos: Partial<PlanoAula> = {
            conteudo: generateLongText('Conteúdo com prática e hands-on com código EM13LGG101.'),
            objetivos: ['Analisar o conteúdo'], // < 3, mas com verbo Bloom (Analisar)
            duracao: '50 minutos'
        };

        // Act
        const result = await useCase.execute(planoPoucosObjetivos, [mockHabilidade]);

        // Assert
        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    category: 'structure',
                    severity: 'warning',
                    message: expect.stringContaining('pelo menos 3 objetivos')
                })
            ])
        );
        // -10 pontos
        expect(result.score).toBe(90);
    });
});
