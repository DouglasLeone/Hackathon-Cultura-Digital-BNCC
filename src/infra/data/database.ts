import { supabase } from '@/integrations/supabase/client';
import { Disciplina, Unidade, PlanoAula, AtividadeAvaliativa, HistoricoGeracao, Questao } from '@/model/entities';

// Disciplinas
export async function getDisciplinas(): Promise<Disciplina[]> {
  const { data, error } = await supabase
    .from('disciplinas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDisciplina(id: string): Promise<Disciplina | null> {
  const { data, error } = await supabase
    .from('disciplinas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDisciplina(disciplina: Omit<Disciplina, 'id' | 'created_at' | 'updated_at'>): Promise<Disciplina> {
  const { data, error } = await supabase
    .from('disciplinas')
    .insert(disciplina)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDisciplina(id: string, disciplina: Partial<Disciplina>): Promise<Disciplina> {
  const { data, error } = await supabase
    .from('disciplinas')
    .update(disciplina)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDisciplina(id: string): Promise<void> {
  const { error } = await supabase
    .from('disciplinas')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Unidades
export async function getUnidades(): Promise<Unidade[]> {
  const { data, error } = await supabase
    .from('unidades')
    .select(`
      *,
      disciplina:disciplinas(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUnidadesByDisciplina(disciplinaId: string): Promise<Unidade[]> {
  const { data, error } = await supabase
    .from('unidades')
    .select(`
      *,
      disciplina:disciplinas(*)
    `)
    .eq('disciplina_id', disciplinaId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUnidade(id: string): Promise<Unidade | null> {
  const { data, error } = await supabase
    .from('unidades')
    .select(`
      *,
      disciplina:disciplinas(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createUnidade(unidade: Omit<Unidade, 'id' | 'created_at' | 'updated_at' | 'disciplina'>): Promise<Unidade> {
  const { data, error } = await supabase
    .from('unidades')
    .insert(unidade)
    .select(`
      *,
      disciplina:disciplinas(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUnidade(id: string, unidade: Partial<Unidade>): Promise<Unidade> {
  const { data, error } = await supabase
    .from('unidades')
    .update(unidade)
    .eq('id', id)
    .select(`
      *,
      disciplina:disciplinas(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUnidade(id: string): Promise<void> {
  const { error } = await supabase
    .from('unidades')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Planos de Aula
export async function getPlanoAulaByUnidade(unidadeId: string): Promise<PlanoAula | null> {
  const { data, error } = await supabase
    .from('planos_aula')
    .select('*')
    .eq('unidade_id', unidadeId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createPlanoAula(plano: Omit<PlanoAula, 'id' | 'created_at' | 'updated_at'>): Promise<PlanoAula> {
  const { data, error } = await supabase
    .from('planos_aula')
    .insert(plano)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePlanoAula(id: string, plano: Partial<PlanoAula>): Promise<PlanoAula> {
  const { data, error } = await supabase
    .from('planos_aula')
    .update(plano)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Atividades Avaliativas
export async function getAtividadeByUnidade(unidadeId: string): Promise<AtividadeAvaliativa | null> {
  const { data, error } = await supabase
    .from('atividades_avaliativas')
    .select('*')
    .eq('unidade_id', unidadeId)
    .maybeSingle();

  if (error) throw error;
  
  if (data) {
    return {
      ...data,
      questoes: (data.questoes as unknown as Questao[]) || [],
    };
  }
  return null;
}

export async function createAtividade(atividade: Omit<AtividadeAvaliativa, 'id' | 'created_at' | 'updated_at'>): Promise<AtividadeAvaliativa> {
  const { data, error } = await supabase
    .from('atividades_avaliativas')
    .insert({
      unidade_id: atividade.unidade_id,
      titulo: atividade.titulo,
      tipo: atividade.tipo,
      instrucoes: atividade.instrucoes,
      questoes: JSON.parse(JSON.stringify(atividade.questoes)),
      criterios_avaliacao: atividade.criterios_avaliacao,
      pontuacao_total: atividade.pontuacao_total,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    questoes: (data.questoes as unknown as Questao[]) || [],
  };
}

export async function updateAtividade(id: string, atividade: Partial<AtividadeAvaliativa>): Promise<AtividadeAvaliativa> {
  const updateData: Record<string, unknown> = {};
  if (atividade.titulo) updateData.titulo = atividade.titulo;
  if (atividade.tipo) updateData.tipo = atividade.tipo;
  if (atividade.instrucoes) updateData.instrucoes = atividade.instrucoes;
  if (atividade.questoes) updateData.questoes = JSON.parse(JSON.stringify(atividade.questoes));
  if (atividade.criterios_avaliacao) updateData.criterios_avaliacao = atividade.criterios_avaliacao;
  if (atividade.pontuacao_total) updateData.pontuacao_total = atividade.pontuacao_total;

  const { data, error } = await supabase
    .from('atividades_avaliativas')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    questoes: (data.questoes as unknown as Questao[]) || [],
  };
}

// Histórico
export async function getHistorico(): Promise<HistoricoGeracao[]> {
  const { data, error } = await supabase
    .from('historico_geracoes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as HistoricoGeracao[];
}

export async function addHistorico(historico: Omit<HistoricoGeracao, 'id' | 'created_at'>): Promise<HistoricoGeracao> {
  const { data, error } = await supabase
    .from('historico_geracoes')
    .insert(historico)
    .select()
    .single();

  if (error) throw error;
  return data as HistoricoGeracao;
}

// Estatísticas
export async function getStats() {
  const [disciplinas, unidades, planos, atividades] = await Promise.all([
    supabase.from('disciplinas').select('id', { count: 'exact' }),
    supabase.from('unidades').select('id', { count: 'exact' }),
    supabase.from('planos_aula').select('id', { count: 'exact' }),
    supabase.from('atividades_avaliativas').select('id', { count: 'exact' }),
  ]);

  return {
    disciplinas: disciplinas.count || 0,
    unidades: unidades.count || 0,
    planos: planos.count || 0,
    atividades: atividades.count || 0,
  };
}
