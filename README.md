# Aula Criativa AI 🎓

O **Aula Criativa AI** é um assistente pedagógico inteligente desenvolvido para o **Hackathon do IFPI Campus Piripiri (Janeiro/2026)**. O projeto visa transformar temas complexos em materiais didáticos de **Cultura Digital** práticos, inclusivos e 100% alinhados à **BNCC (Base Nacional Comum Curricular)**.

A aplicação foi concebida para apoiar o planejamento docente de professores do Ensino Fundamental e Médio, automatizando a criação de conteúdos pedagogicamente consistentes através do uso ético e responsável de Inteligência Artificial.

---

## 🚀 Requisitos e Funcionalidades

O sistema atende a todos os requisitos funcionais solicitados pelo edital do Hackathon, incluindo a funcionalidade opcional de slides:

- **🏠 Dashboard de Gestão (RF01)**: Interface centralizada para gerenciamento completo de disciplinas (Matemática, Ciências, História, etc.) e anos escolares.
- **� Unidades de Ensino (RF02)**: Criação manual de unidades/aulas onde cada unidade representa uma aula específica com tema definido.
- **✨ Sugestão Inteligente (RF03)**: Geração automática de sugestões de temas de aula baseada na disciplina, série e diretrizes da BNCC.
- **📑 Planos de Aula Automáticos (RF04)**: Geração de planos detalhados contendo identificação, objetivos de aprendizagem, preparação e desenvolvimento passo a passo.
- **✍️ Atividades Avaliativas (RF05)**: Criação de tarefas e listas de exercícios (objetivas e dissertativas) coerentes com o conteúdo de cada aula.
- **🖼️ Slides de Apoio (RF06 - Opcional)**: Funcionalidade extra que gera estrutura e roteiro para apresentações de slides prontas para uso em sala de aula.
- **✅ Validação Pedagógica**: Sistema integrado que avalia o alinhamento curricular dos conteúdos gerados.
- **📤 Exportação Premium**: Suporte para download dos materiais em formatos PDF e PPTX.

---

## 🏗️ Arquitetura e Tecnologias

O projeto foi construído seguindo padrões de **Clean Architecture** e **MVVM**, garantindo alta escalabilidade e testabilidade.

### Stack Tecnológico
- **Frontend**: [React 18](https://react.dev/) + [Vite 7](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Gerenciamento de Estado**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Backend & Banco de Dados**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
- **IA Generativa**: [Google Gemini AI](https://deepmind.google/technologies/gemini/)
- **Validação**: [Zod](https://zod.dev/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)

### 📂 Estrutura de Pastas

A estrutura do projeto segue uma organização lógica para facilitar a manutenção e escalabilidade:

```text
src/
├── app/          # Configurações globais e inicialização
├── di/           # Container de Injeção de Dependências
├── hooks/        # React Hooks personalizados
├── infra/        # Implementações de serviços externos (Firebase, etc.)
├── lib/          # Utilitários e bibliotecas compartilhadas
├── model/        # Entidades e interfaces de Domínio
├── usecase/      # Casos de uso e regras de negócio
├── view/         # Interface do Usuário (UI)
│   ├── components/ # Componentes reutilizáveis (Botões, Inputs, etc.)
│   └── screens/    # Telas e páginas da aplicação
├── viewmodel/    # Lógica de apresentação e estado das views
└── test/         # Configurações e utilitários de teste
```

---

## 🛠️ Configuração Local

### Requisitos
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [NPM](https://www.npmjs.com/) ou [Bun](https://bun.sh/)

### Passo a Passo

1. **Clonar o Repositório**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd ia-generativa
   ```

2. **Instalar Dependências**
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto e preencha com suas chaves:
   ```env
   VITE_GOOGLE_API_KEY=sua_chave_gemini
   VITE_FIREBASE_API_KEY=sua_chave_firebase
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

4. **Executar em Desenvolvimento**
   ```bash
   npm run dev
   ```

---

## 🧪 Testes

A suíte de testes do projeto foi desenvolvida utilizando **[Vitest](https://vitest.dev/)**, abrangendo testes unitários e de integração.

- **Testes Unitários**: `npm run test`
- **Testes de Integração (Com Emulador Firestore)**:
  ```bash
  npm run test:emulator
  ```

---

## 🏆 Qualidade de Engenharia

O projeto destaca-se por:
- **Resiliência**: Tratamento de erros robusto com `ErrorBoundary` e feedback via Toasts.
- **Performance**: Uso intensivo de `Code Splitting` (React Lazy/Suspense).
- **Semântica**: Código limpo, componentizado e com tipagem estrita em TypeScript.

---

## 🤖 O Papel da IA no Desenvolvimento

Conforme exigido pelo edital do Hackathon (Seção 12), este projeto é um exemplo de **Desenvolvimento Aumentado por IA (AI-Augmented Development)**. A utilização de agentes inteligentes e ferramentas de IA Generativa foi fundamental para:

1.  **Velocidade de Execução**: Redução drástica do ciclo de vida do desenvolvimento, permitindo sair de um edital complexo para um MVP funcional e polido em tempo recorde.
2.  **Arquitetura de Elite**: Garantia de uma estrutura sólida (Clean Architecture/MVVM) desde o primeiro commit, com boas práticas de engenharia aplicadas de forma assistida para escalabilidade.
3.  **Qualidade Pedagógica**: A IA atuou como o motor principal para converter as diretrizes complexas da BNCC em planos de aula e atividades coerentes, garantindo integridade e precisão.
4.  **Resiliência Baseada em Dados**: Implementação ágil de fluxos de tratamento de erros e suítes de testes que garantem a estabilidade da aplicação frente a conexões instáveis com serviços externos.

A equipe mantém **domínio total** sobre a solução, utilizando a IA não apenas como geradora de código, mas como um colaborador estratégico na gestão da complexidade técnica.

---

## 👥 Autores e Responsabilidades

O **Aula Criativa AI** foi desenvolvido de forma colaborativa, com divisão clara de responsabilidades técnicas:

### 🎨 Frontend
- **Douglas Leone**  
  Responsável pelo desenvolvimento do **Frontend**, incluindo:
  - Arquitetura da interface em **React + TypeScript**
  - Experiência do usuário (UX/UI)
  - Integração com IA Generativa no lado do cliente
  - Estilização com **Tailwind CSS** e **Shadcn UI**
  - Animações e interações com **Framer Motion**

  🔗 GitHub: https://github.com/DouglasLeone

---

### ⚙️ Backend
- **Héber Bringel**  
  Responsável pelo desenvolvimento do **Backend**, incluindo:
  - Arquitetura de serviços e regras de negócio
  - Integração com **Firebase (Auth & Firestore)**
  - Camada de comunicação com a **IA Generativa**
  - Validações, segurança e persistência de dados
  - Suporte à escalabilidade e desempenho da aplicação

  🔗 GitHub: https://github.com/Heber-Bringel