import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { GeneratePlanoAulaUseCase } from '../../usecase/GeneratePlanoAulaUseCase';
import { FirestoreUnidadeRepository } from '../../infra/repositories/firestore/FirestoreUnidadeRepository';
import { Unidade } from '../../model/entities';
import { MockAIService } from '../mocks/MockAIService';
import { BNCCRepository } from '../../infra/repositories/BNCCRepository';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { EnrichThemeUseCase } from '../../usecase/EnrichThemeUseCase';
import { ValidatePedagogicalQualityUseCase } from '../../usecase/ValidatePedagogicalQualityUseCase';

// Setup Mock Firestore for Integration
// Warning: This assumes the Emulator is running. If not, we might need a fallback or skip.
// For now, we follow the plan to write the skeletal test.

const firebaseConfig = {
    apiKey: "demo-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig, 'integration-test-app');
const db = getFirestore(app);

// Connect to Emulator if not already connected (check internal field or just try/catch)
try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
} catch (e) {
    // Ignore if already connected
    console.log('Emulator connection check:', e);
}

describe('Integration: Geração de Plano de Aula', () => {
    let useCase: GeneratePlanoAulaUseCase;
    let repo: FirestoreUnidadeRepository;
    let createdUnidade: Unidade;

    beforeEach(async () => {
        // Clear updates (basic/naive approach for local test)
        // In a real pipeline, better to clear via HTTP request to Emulator API

        // Setup Components
        repo = new FirestoreUnidadeRepository(db); // Inject Test DB
        const aiService = new MockAIService();
        const bnccRepo = new BNCCRepository();

        const enrichTheme = new EnrichThemeUseCase();
        const validateQuality = new ValidatePedagogicalQualityUseCase();

        // Stub user repo for this specific test inside the usecase or pass a simple mock if the usecase accepts it.
        // The usecase constructor signature is: (repo, aiService, userRepo, bnccRepo, enrich, validate)
        // We'll mock the userRepo
        const mockUserRepo = {
            getUserContext: async () => ({ id: 'integ-user', niveis_ensino: [] }),
            saveUserContext: async () => { }
        };

        useCase = new GeneratePlanoAulaUseCase(
            repo,
            aiService,
            mockUserRepo as any,
            bnccRepo,
            enrichTheme,
            validateQuality
        );

        // Seed: Create a real Unidade in the emulator
        const unidadeData = {
            disciplina_id: 'disc-integ-1',
            tema: 'Revolução Industrial',
            contexto_cultura_digital: 'Uso de vídeos',
            objetivos_aprendizagem: ['Entender causas'],
            habilidades_bncc: ['EF08HI03'],
            disciplina: { // Mock disciplina embedded for simplicity (or we create a Disciplina doc too)
                id: 'disc-integ-1',
                nome: 'História',
                serie: '8º Ano',
                nivel: 'Ensino Fundamental',
                area: 'Ciências Humanas',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        };

        createdUnidade = await repo.create(unidadeData as any);
        // Manually patch disciplina because repository.create strips extra fields usually/or create logic needs to match entity
        // Integration tests often reveal these mismatches. getById might fail to join if disciplina doc doesn't exist.
        // Let's ensure a discipline exists if needed. But for getById, the repo checks disciplina doc.
        // Let's mock getById behavior if we don't want to seed Disciplina collection properly.
        // Ideally: seed Disciplina.
    });

    it('deve gerar um plano, persistir no Firestore e recuperar via getById da Unidade (JOIN)', async () => {
        // Arrange - Ensure user context is valid mock
        const userId = 'integ-user-1';

        // Act
        // Pass createdUnidade. Note: repo.create doesn't verify existence of disciplina in DB,
        // but UseCase passes the 'unidade' object to BNCC/AI.
        // We need to ensuring 'createdUnidade' has 'disciplina' property populated.
        // repo.create returns what was passed + id.

        // Let's make sure we have the full object structured as the UseCase expects (with .disciplina populated)
        const unidadeInput = {
            ...createdUnidade,
            disciplina: {
                id: 'disc-integ-1',
                nome: 'História',
                serie: '8º Ano',
                nivel: 'Ensino Fundamental',
                area: 'Ciências Humanas',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        };

        const resultPlano = await useCase.execute(unidadeInput as any, userId);

        // Assert 1: Immediate result checks
        expect(resultPlano.id).toBeDefined();
        expect(resultPlano.titulo).toContain('Plano de Aula: Revolução Industrial');
        expect(resultPlano.quality_score).toBeGreaterThan(0); // Validated by real Validator

        // Assert 2: Persistence & Join
        // Fetch fresh from DB via Repo
        const fetchedUnidade = await repo.getById(createdUnidade.id);

        expect(fetchedUnidade).not.toBeNull();
        expect(fetchedUnidade?.plano_aula).toBeDefined();

        // Assert Deep Equality on persisted fields
        expect(fetchedUnidade?.plano_aula?.id).toBe(resultPlano.id);
        expect(fetchedUnidade?.plano_aula?.titulo).toBe(resultPlano.titulo);
        expect(fetchedUnidade?.plano_aula?.duracao).toBe('50 minutos'); // Comes from MockAI

        // Check relationships
        expect(fetchedUnidade?.plano_aula?.unidade_id).toBe(createdUnidade.id);
    });
});
