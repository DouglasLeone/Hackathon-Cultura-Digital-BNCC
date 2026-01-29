import { describe, it, expect, beforeEach } from 'vitest';
import { GenerateSlidesUseCase } from '../../usecase/GenerateSlidesUseCase';
import { FirestoreUnidadeRepository } from '../../infra/repositories/firestore/FirestoreUnidadeRepository';
import { Unidade } from '../../model/entities';
import { MockAIService } from '../mocks/MockAIService';
import { BNCCRepository } from '../../infra/repositories/BNCCRepository';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Reuse Emulator connection logic (ideally move to setup file)
const firebaseConfig = {
    apiKey: "demo-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig, 'integration-test-app-slides');
const db = getFirestore(app);

try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
} catch (e) { }

describe('Integration: Persistência de Slides', () => {
    let useCase: GenerateSlidesUseCase;
    let repo: FirestoreUnidadeRepository;
    let createdUnidade: Unidade;
    let mockAIService: MockAIService;

    beforeEach(async () => {
        repo = new FirestoreUnidadeRepository(db);
        mockAIService = new MockAIService();
        const bnccRepo = new BNCCRepository();

        useCase = new GenerateSlidesUseCase(
            mockAIService,
            bnccRepo,
            repo
        );

        // Seed Unidade
        createdUnidade = await repo.create({
            tema: 'Slides Integration',
            disciplina_id: 'disc-slides-1',
            contexto_cultura_digital: 'none'
        } as any);

        // Manual hydration for UseCase
        (createdUnidade as any).disciplina = {
            id: 'disc-slides-1',
            nome: 'Geografia',
            serie: '9º Ano',
            nivel: 'Ensino Fundamental',
            area: 'Ciências Humanas'
        };
    });

    it('deve persistir e recuperar estrutura complexa de slides (arrays aninhados)', async () => {
        // Arrange - Force safe schema return via Mock (already default in MockAIService)
        // MockAIService returns 3 slides with string arrays.

        // Act
        const result = await useCase.execute(createdUnidade);

        // Assert 1: Validated object returned
        expect(result.id).toBeDefined();
        expect(result.conteudo).toHaveLength(3); // From MockAIService

        // Assert 2: Direct Repository Fetch (verify Raw Data)
        // This bypasses the UseCase return and checks DB state
        const storedSlides = await repo.getMaterialSlides(createdUnidade.id);

        expect(storedSlides).toBeDefined();
        expect(storedSlides?.unidade_id).toBe(createdUnidade.id);
        expect(storedSlides?.titulo).toBeDefined();

        // Critical: Verify Array structure
        // Firestore creates Maps/Arrays. Ensure we got arrays back.
        const slide1 = storedSlides?.conteudo[0];
        expect(slide1?.titulo).toBe(`Título: ${createdUnidade.tema}`);
        expect(Array.isArray(slide1?.conteudo)).toBe(true);
        expect(slide1?.conteudo[0]).toBe('Introdução ao tema');
    });

    it('deve atualizar slides existentes se gerado novamente', async () => {
        // Act 1: Generate first time
        const firstGen = await useCase.execute(createdUnidade);

        // Act 2: Generate again (simulating user "Regenerate")
        // Note: FirestoreUnidadeRepository.createMaterialSlides currently does addDoc (always new doc).
        // It does not replace. Let's verify behavior.
        const secondGen = await useCase.execute(createdUnidade);

        // Assert
        expect(firstGen.id).not.toBe(secondGen.id); // Validating implementation behavior

        // Check if getMaterialSlides returns the LATEST
        const latestSlides = await repo.getMaterialSlides(createdUnidade.id);
        expect(latestSlides?.id).toBe(secondGen.id);
    });
});
