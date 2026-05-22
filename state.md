# Estado do Projeto: Calculadora de Dosimetria Penal

## Visão Geral
Aplicativo web educacional para cálculo de dosimetria penal brasileira (sistema trifásico do Código Penal). Desenvolvido com React + TypeScript + Tailwind CSS, utilizando Vite como bundler. O objetivo é auxiliar estudantes e profissionais do direito a compreenderem e aplicarem a dosimetria da pena de forma didática e estruturada.

## Stack Tecnológica
- **Framework**: React 18.3.1
- **Linguagem**: TypeScript 5.6.2 (strict mode, sem `any`)
- **Estilização**: Tailwind CSS 3.4.17
- **Bundler**: Vite 5.4.11
- **Build**: 39 módulos, ~230 KB JS (gzip ~69 KB)
- **Deploy**: Build estático em `dist/`

## Estrutura de Diretórios
```
src/
├── components/
│   ├── DosimetriaPenal.tsx          # Componente principal orquestrador (antigo monolito de 880 linhas, agora delega)
│   ├── dosimetria/
│   │   ├── types.ts                 # Interfaces e tipos (PenaDefinida, MultaConfig, etc.)
│   │   ├── utils.ts                 # Funções utilitárias (formatadores, cálculos, generateRelatorio)
│   │   ├── ResultadoFinal.tsx       # Exibe pena-base, intermediária, definitiva, regime, etc.
│   │   ├── ResultadoDetalhado.tsx   # Relatório detalhado com copy-to-clipboard
│   │   ├── ConcursoSection.tsx      # Concurso de crimes com seletor de crimes.csv
│   │   ├── MultaSection.tsx         # Configuração de multa (salário mínimo + fração)
│   │   ├── PrescricaoSection.tsx    # Cálculo de prescrição abstrata/concreta
│   │   ├── ProgressaoSection.tsx    # Estimativa de progressão de regime
│   │   ├── RegimeSection.tsx        # Seletor de regime inicial
│   │   ├── SubstituicaoSection.tsx  # Verificação de substituição/sursis
│   │   ├── ConcursoModal.tsx       # Modal para adicionar crimes ao concurso
│   │   ├── ConcursoResult.tsx       # Resultado do cálculo de concurso
│   │   ├── RelatorioCopiavel.tsx    # Componente para copiar relatório
│   │   ├── VectorItem.tsx           # Item de vetor (8 vetores do Art. 59)
│   │   ├── FactorRow.tsx            # Linha de fator (agravante/atenuante/majorante/minorante)
│   │   ├── FactorList.tsx           # Lista de fatores com botões +/-/limpar
│   │   ├── SomaFatores.tsx          # Soma e explicação de fatores
│   │   ├── CrimeSelector.tsx        # Seletor de crime do CSV
│   │   ├── InputWithValidation.tsx  # Input com validação
│   │   ├── NumberInput.tsx          # Input numérico com formatação
│   │   ├── InfoBox.tsx              # Caixa de informação contextual
│   │   └── ExplainerBox.tsx         # Explicação didática
├── App.tsx                          # Entry point
├── main.tsx                         # Renderização React
└── index.css                        # Tailwind directives

public/
└── crimes.csv                       # 96 crimes com penas mínimas/máximas e tipos
```

## Funcionalidades Implementadas

### Core (Sistema Trifásico)
1. **1ª Fase — Pena-Base (Art. 59, CP)**: 8 vetores classificáveis (favorável/neutro/desfavorável)
2. **2ª Fase — Agravantes/Atenuantes (Arts. 61-66)**: Lista dinâmica com frações (1/6 a 1/2)
3. **3ª Fase — Majorantes/Minorantes (Art. 68)**: Lista dinâmica, pode extrapolar mín/máx
4. **Tentativa (Art. 14, II)**: Checkbox com fração de redução (1/2 a 2/3)
5. **Detração (Art. 42)**: Campo para prisão provisória em anos
6. **Regime Inicial (Art. 33)**: Automático + manual, com detração recalcula regime
7. **Reincidência**: Checkbox que afeta regime e cálculos
8. **Hediondo**: Checkbox que bloqueia regime aberto
9. **Cálculo de Frações**: Soma vetorial com limite de 1/4 por fase (Súmula 231/STJ)

### Funcionalidades Avançadas
10. **Concurso de Crimes**: Seletor de crimes via CSV, cálculo de pena total (Art. 70, CP)
11. **Multa**: Configuração por salário mínimo + fração (1/30 a 5/30), dias-multa (10-360)
12. **Prescrição**: Abstrata (baseada na pena máxima do tipo) e concreta (baseada na pena aplicada)
13. **Progressão de Regime**: Estimativa de tempo para progressão (Art. 112, LEP)
14. **Substituição**: Verificação automática de cabimento (Art. 44, CP)
15. **Sursis**: Verificação de sursis simples e etário/humanitário (Art. 77, CP)
16. **Relatório Didático**: Texto explicativo passo a passo, copiável para clipboard

### UI/UX
17. **Auto-preenchimento de crimes**: Carrega `crimes.csv` via fetch + parse
18. **Validação de inputs**: Campos numéricos com limites, feedback visual
19. **Responsividade**: Layout adaptativo com Tailwind
20. **Tooltips/Explainers**: Explicações jurídicas inline

### Base de Crimes
21. **Legislação especial no CSV**: Inclui crimes da Lei de Drogas, Estatuto do Desarmamento, Lei de Crimes Ambientais, ECA e CTB com molduras privativas de liberdade claras.
22. **Correção de tipos incompatíveis**: Porte de drogas para uso próprio foi removido da base de molduras privativas e tráfico privilegiado foi tratado como causa de diminuição na 3ª fase.

## Decisões Arquiteturais Críticas

### 1. Componentização vs Monolito
- **Decisão**: O componente original `DosimetriaPenal.tsx` tinha 880 linhas. Foi refatorado em 8 módulos menores (ResultadoFinal, ResultadoDetalhado, ConcursoSection, MultaSection, PrescricaoSection, ProgressaoSection, RegimeSection, SubstituicaoSection) + componentes atômicos.
- **Motivo**: Manter legibilidade e permitir manutenção independente.
- **Estado atual**: `DosimetriaPenal.tsx` ainda gerencia o state global, delegando renderização aos subcomponentes.

### 2. Método de Dosimetria
- **Adotado**: Quantitativo de 8 frações (metodologia Hungria/Taipina).
- **Não adotado**: Valoração qualitativa (peso diferenciado por intensidade de cada vetor).
- **Justificativa**: A valoração qualitativa é discricionária do juiz e não pode ser automatizada. O app documenta isso claramente na UI e no relatório.

### 3. Cálculo de Frações
- **Implementação**: Soma vetorial pura (aditiva) com teto de 1/4 por fase.
- **Limitação**: Não implementa a redução proporcional quando a soma excede 1/4 (Súmula 231/STJ). O app simplesmente aplica o teto.
- **Referência**: Súmula 231, STJ — "A soma das circunstâncias judiciais não pode ultrapassar a fração correspondente a um quarto da pena."

### 4. Prescrição
- **Decisão**: Usar o campo "Pena máxima" inserido pelo usuário para prescrição abstrata.
- **Alerta na UI**: A prescrição abstrata usa a pena máxima do TIPO, não a moldura aplicável ao caso concreto. Isso é uma simplificação educacional.

### 5. Regime por Saltum
- **Decisão**: Implementado como opção desativada por padrão com texto explicativo sobre a controvérsia doutrinária.
- **Motivo**: Evitar erros por usuários que não conhecem o debate (Taipina admite; Hungria rejeita).

### 6. TypeScript Strict
- **Regra**: Nenhum `any` permitido.
- **Consequência**: Todos os estados, props e retornos de funções são tipados. Mudanças em interfaces exigem atualização em todos os consumidores.

## Bugs Conhecidos e Limitações

### Limitações Jurídicas (Não são bugs, mas simplificações)
1. **Valoração qualitativa**: O app não permite atribuir pesos diferentes aos vetores (ex: "muito desfavorável" vs "pouco desfavorável"). Cada vetor vale exatamente 1/8 do intervalo.
2. **Prescrição abstrata**: Usa pena máxima do tipo, não a moldura aplicável (que pode ser menor por causa de causas de diminuição).
3. **Sursis etário/humanitário**: Verifica idade e doença, mas a decisão final requer análise judicial.
4. **Concurso de crimes**: Cálculo de pena múltipla por soma (Art. 70, § 1º), mas não implementa o Art. 70, § 2º (aumento de 1/6 a 2/3 quando há continuidade delitiva).

### Limitações Técnicas
5. **CSV de crimes**: Fixo em `public/crimes.csv`. Não há interface para editar/adicionar crimes.
6. **Persistência**: Nenhum localStorage/sessionStorage. Dados são perdidos ao recarregar.
7. **Acessibilidade**: Tooltips não são acessíveis via teclado (falta `aria-describedby` dinâmico).
8. **Internacionalização**: Textos hardcoded em português. Não há i18n.

### Potenciais Problemas
9. **Encoding do CSV**: `crimes.csv` está em UTF-8. Se o servidor não servir com encoding correto, caracteres acentuados podem quebrar.
10. **Build em Windows vs Linux**: O `crimes.csv` é carregado via `fetch('/crimes.csv')`. Em dev (Vite), funciona. Em produção, depende da config do servidor.

## Próximos Passos Pendentes (Backlog)

### Prioridade Alta
- [ ] Adicionar testes unitários para `utils.ts` (especialmente cálculos de frações, regime, progressão)
- [ ] Implementar persistência local (localStorage) para não perder dados
- [ ] Melhorar acessibilidade (ARIA labels, navegação por teclado)

### Prioridade Média
- [ ] Expandir cobertura do CSV com novas leis especiais e revisão periódica das molduras
- [ ] Implementar Art. 70, § 2º (continuidade delitiva no concurso)
- [ ] Adicionar exportação para PDF do relatório
- [ ] Criar modo "tema escuro"

### Prioridade Baixa
- [ ] Internacionalização (i18n) para espanhol/inglês
- [ ] PWA (Progressive Web App) para uso offline
- [ ] Histórico de cálculos salvos

## Como Buildar e Rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Type check (sem emit)
npx tsc --noEmit
```

## Configurações Importantes

### tsconfig.json
- `strict: true`
- `noImplicitAny: true`
- `skipLibCheck: true`
- `moduleResolution: "bundler"`

### tailwind.config.js
- Content: `index.html`, `src/**/*.{js,ts,jsx,tsx}`
- Plugins: `forms`, `typography`
- Custom colors: `penal` (azul escuro), `accent` (vermelho/alerta)

### vite.config.ts
- Plugin: `@vitejs/plugin-react`
- Base: `"/"` (ajustar se deploy não for na raiz)

## Dados de Referência (Valores Hardcoded)

### Salário Mínimo
- Valor atual: **R$ 1.412,00** (atualizar conforme decreto federal)
- Fonte: Portaria MTP nº 11.216/2024

### Frações de Multa
- 1/30 do salário mínimo: R$ 47,07
- 5/30 do salário mínimo: R$ 235,33
- Dias-multa: 10 a 360 (Art. 49, CP)

### Regras de Regime
- **Primário, pena ≤ 4 anos, sem violência → Aberto** (Art. 33, § 2º)
- **Reincidente específico ou hediondo → Fechado** (Art. 33, § 3º)
- **Pena > 8 anos → Inicialmente fechado** (Art. 33, caput)

### Progressão
- **Regime fechado → semiaberto**: 1/6 da pena (reincidente) ou 1/5 (primário)
- **Semiaberto → aberto**: 1/3 da pena (reincidente) ou 2/5 (primário)
- **Regime aberto → livramento condicional**: 2/3 da pena (reincidente) ou 3/5 (primário)

## Referências Doutrinárias
- **Thales Taipina**: "Dosimetria da Pena e Execução Penal" (2025) — metodologia adotada
- **Nota**: Outras referências (Sergio D’Antonio, Fernando Capez, etc.) foram removidas a pedido do usuário para manter consistência com Taipina.

## Comando para atualizar estado
Este arquivo deve ser atualizado sempre que:
1. Novas funcionalidades forem implementadas
2. Bugs críticos forem descobertos ou corrigidos
3. Decisões arquiteturais forem alteradas
4. Novas dependências forem adicionadas
5. Valores hardcoded (salário mínimo) forem atualizados

## Nota para Próxima Agent
- Nunca apague/modifique arquivos pré-existentes do projeto legado (regra do Reversa).
- Sempre execute `npm run build` antes de considerar uma tarefa concluída.
- Mantenha commits atômicos com mensagens descritivas em português.
- Se precisar de contexto jurídico, consulte Taipina (2025) como referência primária.
- Teste manualmente a dosimetria com casos conhecidos (ex: furto simples, primário, sem agravantes → regime aberto, pena-base = mínimo + 1 vetor).
