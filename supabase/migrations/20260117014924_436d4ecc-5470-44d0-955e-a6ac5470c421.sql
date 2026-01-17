-- Tabela de disciplinas
CREATE TABLE public.disciplinas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  serie TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de unidades (aulas)
CREATE TABLE public.unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
  tema TEXT NOT NULL,
  contexto_cultura_digital TEXT,
  objetivos_aprendizagem TEXT[],
  habilidades_bncc TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de planos de aula
CREATE TABLE public.planos_aula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  duracao TEXT NOT NULL DEFAULT '50 minutos',
  objetivos TEXT[] NOT NULL DEFAULT '{}',
  conteudo_programatico TEXT NOT NULL,
  metodologia TEXT NOT NULL,
  recursos_didaticos TEXT[] NOT NULL DEFAULT '{}',
  avaliacao TEXT NOT NULL,
  referencias TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de atividades avaliativas
CREATE TABLE public.atividades_avaliativas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'exercicio',
  instrucoes TEXT NOT NULL,
  questoes JSONB NOT NULL DEFAULT '[]',
  criterios_avaliacao TEXT,
  pontuacao_total INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico de gerações
CREATE TABLE public.historico_geracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  referencia_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_disciplinas_updated_at
  BEFORE UPDATE ON public.disciplinas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_unidades_updated_at
  BEFORE UPDATE ON public.unidades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planos_aula_updated_at
  BEFORE UPDATE ON public.planos_aula
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_atividades_avaliativas_updated_at
  BEFORE UPDATE ON public.atividades_avaliativas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Como é single-user sem autenticação, permitimos acesso público às tabelas
-- Isso está de acordo com o requisito: "sem necessidade de autenticação ou controle de múltiplos usuários"

-- RLS habilitado mas com políticas públicas para single-user
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_aula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades_avaliativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_geracoes ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (single-user sem autenticação conforme requisito)
CREATE POLICY "Acesso público disciplinas" ON public.disciplinas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público unidades" ON public.unidades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público planos_aula" ON public.planos_aula FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público atividades_avaliativas" ON public.atividades_avaliativas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público historico_geracoes" ON public.historico_geracoes FOR ALL USING (true) WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_unidades_disciplina ON public.unidades(disciplina_id);
CREATE INDEX idx_planos_aula_unidade ON public.planos_aula(unidade_id);
CREATE INDEX idx_atividades_avaliativas_unidade ON public.atividades_avaliativas(unidade_id);
CREATE INDEX idx_historico_geracoes_created ON public.historico_geracoes(created_at DESC);