import { describe, it, expect, beforeEach } from 'vitest';
import { FirestoreUnidadeRepository } from '../../infra/repositories/firestore/FirestoreUnidadeRepository';
import { GeneratePlanoAulaUseCase } from '../../usecase/GeneratePlanoAulaUseCase';
import { GenerateAtividadeUseCase } from '../../usecase/GenerateAtividadeUseCase';
import { MockAIService } from '../mocks/MockAIService';
import { BNCCRepository } from '../../infra/repositories/BNCCRepository';
import { EnrichThemeUseCase } from '../../usecase/EnrichThemeUseCase';
import { ValidatePedagogicalQualityUseCase } from '../../usecase/ValidatePedagogicalQualityUseCase';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "demo-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig, 'integration-test-app-full');
const db = getFirestore(app);

try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
} catch (e) { }

describe('Integration: Fluxo Completo da Unidade', () => {
    let repo: FirestoreUnidadeRepository;
    let planoUseCase: GeneratePlanoAulaUseCase;
    let atividadeUseCase: GenerateAtividadeUseCase;
    let createdUnidade: any; // Using any for seeded object with joins

    beforeEach(async () => {
        repo = new FirestoreUnidadeRepository(db);
        const aiService = new MockAIService();
        const bnccRepo = new BNCCRepository();

        // Mock User Repo for both
        const mockUserRepo = {
            getUserContext: async () => ({ id: 'integ-user-full', niveis_ensino: [] }),
            saveUserContext: async () => { }
        };

        planoUseCase = new GeneratePlanoAulaUseCase(
            repo,
            aiService,
            mockUserRepo as any,
            bnccRepo,
            new EnrichThemeUseCase(),
            new ValidatePedagogicalQualityUseCase()
        );

        atividadeUseCase = new GenerateAtividadeUseCase(
            repo,
            aiService,
            mockUserRepo as any,
            bnccRepo
        );

        // Seed
        createdUnidade = await repo.create({
            tema: 'Ciclo da Água',
            disciplina_id: 'disc-full-1',
        } as any);

        createdUnidade.disciplina = {
            id: 'disc-full-1',
            nome: 'Ciências',
            serie: '4º Ano',
            nivel: 'Ensino Fundamental',
            area: 'Ciências da Natureza'
        };
    });

    it('deve manter a integridade ao buscar unidade com múltiplos materiais (Plano + Atividade)', async () => {
        // 1. Gera Plano
        await planoUseCase.execute(createdUnidade, 'user-full');

        // 2. Gera Atividade
        const options = { objectiveCount: 2, subjectiveCount: 1, difficulty: 'Médio' as const };
        await atividadeUseCase.execute(createdUnidade, 'user-full', options);

        // 3. Busca Unidade Completa via Repo (JOIN Logic)
        const fullUnidade = await repo.getById(createdUnidade.id);

        // Assert: Unidade existe
        expect(fullUnidade).not.toBeNull();
        if (!fullUnidade) return;

        // Assert: Todos os materiais devem estar presentes
        expect(fullUnidade.plano_aula).toBeDefined();
        expect(fullUnidade.atividade_avaliativa).toBeDefined();

        // Assert: IDs batem (Integridade Referencial)
        expect(fullUnidade.plano_aula?.unidade_id).toBe(createdUnidade.id);
        expect(fullUnidade.atividade_avaliativa?.unidade_id).toBe(createdUnidade.id);

        // Assert: Dados específicos de cada tipo
        expect(fullUnidade.atividade_avaliativa?.questoes).toHaveLength(3); // 2 obj + 1 subj
        expect(fullUnidade.plano_aula?.titulo).toContain('Ciclo da Água');
    });
});
