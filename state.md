# Estado do Projeto: Calculadora de Dosimetria Penal

## Visão Geral
Aplicativo web educacional para cálculo de dosimetria penal brasileira pelo sistema trifásico do Código Penal. Desenvolvido com React + TypeScript + Tailwind CSS e Vite. O objetivo é auxiliar estudantes e profissionais do direito a compreenderem a cadeia lógica da dosimetria, separando claramente moldura penal, três fases da pena privativa de liberdade e efeitos pós-dosimetria.

## Última Atualização Relevante
- Corrigida a numeração lógica: a moldura penal agora é etapa preliminar, não uma fase da dosimetria.
- Corrigida a tentativa: é tratada como causa de diminuição da 3ª fase e aplicada antes das majorantes.
- Relatórios e auditoria passaram a distinguir fases da pena de efeitos pós-dosimetria, como detração, regime, substituição, sursis, prescrição, multa e concurso.
- Build validado com `npm run build`.
- Commit enviado: `aa30ac3 fix: corrige ordem logica da dosimetria`.

## Stack Tecnológica
- **Framework**: React 18.3.1
- **Linguagem**: TypeScript 5.6.2 (strict mode)
- **Estilização**: Tailwind CSS 3.4.17
- **Bundler**: Vite 5.4.21
- **Build atual**: 39 módulos, `dist/assets/index-C3cAPTrT.js` ~244 KB (gzip ~72 KB)
- **Deploy**: Build estático em `dist/`

## Estrutura Atual
```text
src/
├── App.tsx
├── main.tsx
├── index.css
└── components/
    ├── DosimetriaPenal.tsx          # Orquestrador de estado e abas
    └── dosimetria/
        ├── ConcursoSection.tsx      # Concurso material, formal e continuado
        ├── InfoPill.tsx             # Componentes visuais auxiliares
        ├── MultaSection.tsx         # Configuração da pena de multa
        ├── PrescricaoDetracao.tsx   # Detração, prescrição e medida de segurança
        ├── ResultadoFinal.tsx       # Resumo visual e relatório copiável
        ├── data.ts                  # Listas legais, súmulas, frações e referências
        ├── types.ts                 # Tipos compartilhados
        └── utils.ts                 # Cálculos, parser CSV, regime, concurso e relatório

public/
└── crimes.csv                       # 96 crimes com molduras e observações

referencias/
└── *.md                             # Capturas oficiais do Planalto usadas como referência
```

## Cadeia Lógica Implementada

### Etapa Preliminar — Moldura Penal
- Seleção do crime via `public/crimes.csv` com autocomplete por `datalist`.
- Preenchimento automático de pena mínima, pena máxima, tipo de pena e indicador de violência/grave ameaça.
- Qualificadoras devem ser refletidas diretamente na moldura escolhida; não entram como majorantes.

### 1ª Fase — Pena-Base
- Usa os 8 vetores do art. 59 do CP.
- Método quantitativo: intervalo entre mínimo e máximo dividido por 8.
- Cada vetor desfavorável aumenta a pena-base em `intervalo / 8`.
- Vetores favoráveis são registrados como informação didática, mas não reduzem abaixo do mínimo.

### 2ª Fase — Agravantes e Atenuantes
- Agravantes e atenuantes são informadas dinamicamente com frações selecionáveis.
- A base de cálculo é a pena-base.
- O resultado é limitado à moldura legal, aplicando a lógica da Súmula 231/STJ para impedir redução abaixo do mínimo.
- O app exibe alertas de bis in idem e súmulas relevantes.

### 3ª Fase — Causas de Aumento e Diminuição
- Minorantes são aplicadas primeiro.
- Tentativa (art. 14, parágrafo único, CP) é minorante automática da 3ª fase, com redução de 1/3 a 2/3.
- Majorantes são aplicadas depois das minorantes.
- A pena definitiva pode ultrapassar o máximo ou ficar abaixo do mínimo legal.
- O relatório copiável e o log de auditoria mostram a ordem exata dos multiplicadores.

### Efeitos Pós-Dosimetria
- **Detração**: calcula pena remanescente sem alterar a pena definitiva.
- **Regime inicial**: usa pena definitiva ou pena remanescente quando houver detração, com fundamento textual.
- **Substituição**: verifica art. 44 do CP com distinção entre cabimento direto e hipótese condicionada do § 3º.
- **Sursis**: verifica sursis simples e alerta para sursis etário/humanitário.
- **Prescrição**: calcula abstrata pela pena máxima informada e concreta pela pena definitiva.
- **Progressão**: exibida como estimativa didática de execução penal, com alerta para conferir a LEP vigente.
- **Multa**: calcula dias-multa e valor do dia-multa.
- **Concurso de crimes**: usa penas definitivas individuais importadas da calculadora ou preenchidas manualmente.

## Funcionalidades Implementadas
- Base de 96 crimes com legislação especial: Lei de Drogas, Estatuto do Desarmamento, Crimes Ambientais, ECA e CTB.
- Observações do CSV aparecem na seleção principal e nos itens do concurso.
- Aba Concurso preserva estado ao trocar abas.
- Botão `Adicionar pena definitiva ao concurso` envia a pena calculada para a aba Concurso.
- Concurso de crimes contempla:
  - Concurso material.
  - Concurso formal próprio.
  - Concurso formal impróprio.
  - Crime continuado com fração de 1/6 a 2/3.
  - Perguntas fáticas e sugestão didática de modalidade.
  - Relatório copiável próprio.
- Relatório final claro, com resumo executivo, explicação didática e seções pós-dosimetria.
- `.gitignore` ignora `*:Zone.Identifier`.

## Decisões Arquiteturais Críticas

### 1. Estado Centralizado
- `DosimetriaPenal.tsx` mantém o estado global da calculadora e repassa props aos subcomponentes.
- Essa abordagem evita perda de dados ao trocar abas, especialmente no concurso de crimes.

### 2. Parser CSV Simples
- `parseCrimeCSV` usa `line.split(",")` e aceita apenas linhas com 6 ou 8 campos.
- Por isso, `public/crimes.csv` não deve conter vírgulas internas não tratadas em nomes ou observações.
- Essa restrição foi mantida para evitar refatoração maior do parser nesta etapa.

### 3. Método Quantitativo
- O app adota método quantitativo para fins didáticos.
- Não implementa ponderação qualitativa por intensidade de cada vetor.
- A fundamentação concreta continua sendo responsabilidade do usuário/julgador.

### 4. Separação Entre Pena Definitiva e Pena Remanescente
- Detração não altera a pena definitiva.
- Pena remanescente é exibida separadamente para efeitos de regime e execução.

### 5. Fontes e Referências
- Preferência por referências oficiais do Planalto para CP e CPP.
- LEP/progressão é tratada com cautela e aviso de conferência da legislação vigente.

## Limitações Conhecidas
- Não há testes unitários automatizados para `utils.ts`.
- Não há persistência em `localStorage`; recarregar a página perde os dados.
- O parser CSV é frágil para campos com vírgulas.
- Progressão de regime é estimativa didática e não substitui análise completa da LEP vigente.
- Sursis etário/humanitário é indicado como alerta, não como decisão final.
- Acessibilidade ainda pode melhorar com ARIA e navegação por teclado.
- Não há exportação PDF nem histórico de cálculos.

## Backlog

### Prioridade Alta
- [ ] Adicionar testes unitários para `utils.ts`, especialmente `prescPrazo`, `calcRegime`, `calcConcurso` e ordem da 3ª fase.
- [ ] Criar teste de regressão para tentativa aplicada antes das majorantes.
- [ ] Implementar persistência local para cálculos em andamento.
- [ ] Melhorar acessibilidade dos controles e explicações.

### Prioridade Média
- [ ] Substituir parser CSV simples por parser robusto com suporte a aspas e vírgulas internas.
- [ ] Revisar progressão de regime contra a LEP vigente e fontes oficiais.
- [ ] Expandir e auditar periodicamente `public/crimes.csv`.
- [ ] Adicionar exportação PDF do relatório.

### Prioridade Baixa
- [ ] Tema escuro.
- [ ] PWA/offline.
- [ ] Histórico de cálculos salvos.
- [ ] Internacionalização.

## Como Buildar e Rodar
```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Type check sem emit
npx tsc --noEmit
```

## Configurações Importantes
- `tsconfig.json`: `strict: true`, `noImplicitAny: true`, `skipLibCheck: true`, `moduleResolution: "bundler"`.
- `tailwind.config.js`: content em `index.html` e `src/**/*.{js,ts,jsx,tsx}`.
- `vite.config.ts`: plugin React e base `"/"`.

## Dados de Referência
- Dias-multa: 10 a 360, conforme art. 49 do CP.
- Valor do dia-multa: mínimo de 1/30 do salário mínimo e máximo de 5 vezes o salário mínimo.
- Convenção temporal do app: 1 ano = 360 dias; 1 mês = 30 dias.
- Prescrição abstrata: art. 109 do CP sobre pena máxima informada.
- Prescrição concreta/retroativa: art. 109 e art. 110, § 1º, do CP sobre pena definitiva.

## Comando para Atualizar Estado
Este arquivo deve ser atualizado sempre que:
- Novas funcionalidades forem implementadas.
- Bugs jurídicos ou técnicos relevantes forem corrigidos.
- Decisões arquiteturais forem alteradas.
- A base `public/crimes.csv` for expandida ou corrigida.
- Valores hardcoded ou referências legais forem atualizados.

## Nota para Próxima Agent
- Sempre execute `npm run build` antes de concluir alterações.
- Antes de commit, conferir `git status`, `git diff` e `git log --oneline -10`.
- Mantenha commits pequenos e descritivos em português.
- Não reverta alterações de terceiros no worktree.
- Ao alterar `public/crimes.csv`, lembre que o parser ainda não suporta vírgulas internas.
