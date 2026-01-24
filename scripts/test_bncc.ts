
import { BNCCRepository } from '../src/infra/repositories/BNCCRepository';
import { Disciplina, Unidade, NivelEnsino } from '../src/model/entities';

// Mock minimal entities
const mockDisciplina = (nome: string, nivel: NivelEnsino, serie: string, area: string): Disciplina => ({
    id: '1',
    nome,
    nivel,
    serie,
    area,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
});

const mockUnidade = (tema: string): Unidade => ({
    id: 'u1',
    tema,
    disciplina_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
});

async function testBNCC() {
    const repository = new BNCCRepository();

    console.log('--- Testing BNCC Repository ---');

    // Test 1: Ensino Fundamental - História
    console.log('\n[Test 1] Ensino Fundamental (6º Ano) - História');
    const discFund = mockDisciplina('História', 'Ensino Fundamental', '6º Ano', 'Ciências Humanas');
    const resultFund = repository.findByContext(discFund, mockUnidade('Grécia Antiga'));

    console.log(`Found ${resultFund.length} items`);
    if (resultFund.length > 0) {
        console.log('Sample:', resultFund[0].codigo, resultFund[0].serie, resultFund[0].descricao.substring(0, 50) + '...');
    } else {
        console.error('❌ Failed to find items for Ensino Fundamental');
    }

    // Test 2: Ensino Médio - Ciências Humanas
    console.log('\n[Test 2] Ensino Médio (1º Ano) - Ciências Humanas');
    const discMedio = mockDisciplina('História', 'Ensino Médio', '1º Ano - Ensino Médio', 'Ciências Humanas e Sociais Aplicadas');
    const resultMedio = repository.findByContext(discMedio, mockUnidade('Revolução Industrial'));

    console.log(`Found ${resultMedio.length} items`);
    if (resultMedio.length > 0) {
        console.log('Sample:', resultMedio[0].codigo, resultMedio[0].serie, resultMedio[0].descricao.substring(0, 50) + '...');
    } else {
        console.error('❌ Failed to find items for Ensino Médio');
    }
}

testBNCC().catch(console.error);
