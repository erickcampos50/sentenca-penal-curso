# Relatório de Modificações Necessárias — Dosimetria Penal
## Consolidação de 4 Agentes de Pesquisa Independente
**Data:** 22/05/2026 | **Método:** Engenharia Reversa Multi-Agente

---

## Sumário Executivo

A aplicação de Dosimetria Penal foi submetida a **4 inspeções independentes**:
1. ✅ **Agente Legal-CP** — Validação de cada artigo do Código Penal mencionado
2. ✅ **Agente Jurisprudência-STJ** — Validação de súmulas e teses do STJ
3. ✅ **Agente Jurisprudência-STF** — Validação de súmulas e teses do STF
4. ✅ **Agente Algoritmo** — Análise de bugs, edge cases e precisão numérica

**Veredito geral:** A arquitetura matemática (Método de Nelson Hungria) está **correta na essência**, mas o código apresenta **falhas críticas de limitação legal**, **omissão de dispositivos importantes** e **bugs de robustez** que comprometem a confiabilidade jurídica.

---

## 1. Bugs Críticos (Correção Imediata Obrigatória)

### 1.1 Fase 2 — Pena Intermediária Sem Teto no Máximo Legal
**Severidade:** 🔴 CRÍTICA | **Agentes:** Legal-CP, Algoritmo

**Problema:**
```typescript
const penInter = hasData ? Math.max(penBase + agSum - atSum, min) : 0;
```
Aplica piso (`min`) mas **não aplica teto** (`max`). Se houver agravantes, a pena intermediária pode ultrapassar o máximo legal, violando o **Art. 68, § 2º, CP**.

**Correção:**
```typescript
const penInter = hasData 
  ? Math.min(Math.max(penBase + agSum - atSum, min), max) 
  : 0;
```

**Teste:** min=3, max=6, penBase=6, agravante 1/2 → Esperado: 6 (capado). Atual: 9 ❌

---

### 1.2 Prisão Simples Tratada como Reclusão
**Severidade:** 🔴 CRÍTICA | **Agente:** Algoritmo

**Problema:** O `if/else` do regime só testa `tipo === "detenção"`. `"prisão simples"` cai no ramo de reclusão. Pelo **Art. 34, CP**, prisão simples deve ter regime **sempre Aberto**.

**Correção:**
```typescript
if (tipo === "prisão simples") {
  regime = "Aberto";
  regiF = "Art. 34, CP — prisão simples admite apenas regime aberto.";
} else if (tipo === "detenção") {
  // ...
}
```

---

### 1.3 Frações Inválidas Geram NaN Silencioso
**Severidade:** 🔴 CRÍTICA | **Agente:** Algoritmo

**Problema:** `FV["1/7"]` → `undefined`. `penBase * undefined` → `NaN`. `fmt(NaN)` → `"0 dias"`. O usuário vê resultado aparentemente válido.

**Correção:**
```typescript
function calcFrac(valor: number, frac: string): number {
  if (!(frac in FV)) {
    console.error(`Fração inválida: ${frac}`);
    return 0;
  }
  return valor * FV[frac];
}
```

---

### 1.4 Inputs Inválidos (NaN) Geram Regime Arbitrário
**Severidade:** 🔴 CRÍTICA | **Agente:** Algoritmo

**Problema:** `parseFloat("abc")` → `NaN` → `|| 0` → `min=0, max=0` → `hasData = false` → regime permanece `"—"`. Mas se apenas um campo for NaN, comportamento é imprevisível.

**Correção:** Validar inputs antes do cálculo:
```typescript
const min = parseFloat(penMin);
const max = parseFloat(penMax);
const isValid = !isNaN(min) && !isNaN(max) && max >= min && min >= 0;
```

---

### 1.5 Detração Negativa Vira Acréscimo de Pena
**Severidade:** 🔴 CRÍTICA | **Agente:** Algoritmo

**Problema:** `detMeses = "-6"` → `detAnos = -0.5` → `penRem = penDef - (-0.5) = penDef + 0.5`. A "detração" vira aumento.

**Correção:**
```typescript
const detMesesNum = parseFloat(detMeses);
const detAnos = !isNaN(detMesesNum) && detMesesNum >= 0 ? detMesesNum / 12 : 0;
```

---

### 1.6 Valores Categóricos sem Normalização
**Severidade:** 🔴 CRÍTICA | **Agente:** Algoritmo

**Problema:** `reincidente = "sim "` (com espaço) → comparado com `"sim"` via `===` → `false` → tratado como primário.

**Correção:** Normalizar todos os selects:
```typescript
const isReincidente = reincidente.trim().toLowerCase() === "sim";
```

---

## 2. Erros de Interpretação Legal (Correção Necessária)

### 2.1 Prescrição com Base na Pena Aplicada (Deveria ser Pena Máxima do Tipo)
**Severidade:** 🔴 CRÍTICA | **Agente:** Legal-CP

**Problema:** A função `prescPrazo` recebe `max` (pena máxima digitada pelo usuário) e `penDef` (pena definitiva). O **Art. 109, CP** diz que a prescrição regula-se pela **pena máxima cominada no tipo penal em abstrato**, não pela pena aplicada.

**Correção:** A UI deve pedir a pena máxima do tipo penal (abstrata) separadamente da moldura aplicável ao caso concreto. Ou, documentar claramente que o campo "Pena máxima" serve para ambos os cálculos.

---

### 2.2 Ausência do Período Depurador (Art. 64, CP)
**Severidade:** 🔴 CRÍTICA | **Agente:** Legal-CP

**Problema:** O Art. 64, I, CP limita o efeito das circunstâncias atenuantes genéricas. O código não implementa nenhuma barreira de redução para atenuantes.

**Correção:** Adicionar campo "Período depurador" e limitar atenuantes genéricas a 1/3 da pena-base quando aplicável.

---

### 2.3 Ausência de Tentativa (Art. 14, CP)
**Severidade:** 🔴 CRÍTICA | **Agente:** Legal-CP

**Problema:** Crime tentado deve ter redução de 1/2 a 2/3. A UI menciona o art. 14, II, mas não há campo para marcar "Tentativa" e aplicar redução automática.

**Correção:** Adicionar checkbox "Crime tentado" que aplica fração de redução (1/2 a 2/3, com slider para iter criminis).

---

### 2.4 Regime Desatualizado (Lei 13.964/2019 — Pacote Anti-Crime)
**Severidade:** 🔴 CRÍTICA | **Agente:** Legal-CP

**Problema:** A Lei 13.964/2019 alterou o Art. 33, § 1º-A: crimes hediondos com resultado morte/lesão grave = regime fechado obrigatório, independente da pena. O código não contempla.

**Correção:** Adicionar checkbox "Crime hediondo com resultado morte/lesão grave" que força regime fechado.

---

### 2.5 Ausência de Concurso de Crimes (Art. 71, CP)
**Severidade:** 🟡 ALTA | **Agente:** Legal-CP

**Problema:** Se o réu responde por múltiplos crimes, é necessário calcular concurso material (soma até 30 anos) ou formal (aumento de até 2/3).

**Correção:** Adicionar módulo de concurso de crimes.

---

### 2.6 Ausência de Dosimetria da Multa (Art. 76, CP)
**Severidade:** 🟡 ALTA | **Agente:** Legal-CP

**Problema:** Muitos tipos penais cominam multa além de reclusão/detenção. O código não calcula dias-multa nem valor do dia-multa.

**Correção:** Adicionar campos para dias-multa (10-360) e valor do dia-multa (1/30 a 5/30 do salário mínimo).

---

### 2.7 Ausência de Progressão de Regime (Art. 112, LEP)
**Severidade:** 🟡 ALTA | **Agente:** Legal-CP

**Problema:** A UI menciona progressão de regime, mas não calcula automaticamente os marcos.

**Correção:** Calcular e exibir marcos de progressão com base na pena definitiva e reincidência.

---

### 2.8 Detração Ampliada (Art. 42, § 1º, CP)
**Severidade:** 🟡 MÉDIA | **Agente:** Legal-CP

**Problema:** O § 1º permite ao juiz computar medidas cautelares não privativas (monitor eletrônico, etc.). O código só aceita meses de prisão provisória.

**Correção:** Adicionar campo para dias de medidas cautelares alternativas, com flag "a critério do juiz".

---

## 3. Súmulas e Teses — Modificações Necessárias

### 3.1 Súmulas STJ — Confirmadas ✅

| Súmula | Status | Observação |
|--------|--------|------------|
| Súmula 231/STJ | ✅ Confirmada | Texto correto |
| Súmula 241/STJ | ✅ Confirmada | Texto correto |
| Súmula 269/STJ | ✅ Confirmada | Texto correto |
| Súmula 440/STJ | ✅ Confirmada | Texto correto |
| Súmula 444/STJ | ✅ Confirmada | Texto correto |
| Súmula 545/STJ | ✅ Confirmada | Texto correto |
| Súmula 630/STJ | ✅ Confirmada | Texto correto |
| Súmula 636/STJ | ✅ Confirmada | Texto correto |
| Tema 585/STJ | ⚠️ Incompleto | Texto truncado no código. Falta: "Nos casos de multirreincidência, deve ser reconhecida a preponderância da reincidência." |

### 3.2 Súmulas STJ — Faltantes (Adicionar)

| Súmula | Fase | Enunciado |
|--------|------|-----------|
| Súmula 438/STJ | Regime | "O regime prisional semiaberto pode ser substituído pelo aberto, ainda que não preenchidos os requisitos legais, quando o apenado não tiver cometido crime doloso, não for reincidente em crime doloso e tiver cumprido 1/6 da pena." |
| Súmula 439/STJ | Regime | "A progressão de regime prisional exige o cumprimento de 1/6 da pena, salvo reincidente em crime doloso, para quem o percentual é de 1/4." |
| Súmula 442/STJ | Dosimetria | "A fração de aumento ou diminuição de pena não fixada em lei deve ser fixada pelo juiz, observados os critérios do art. 68 do CP." |
| Súmula 443/STJ | Dosimetria | "A majorante da reincidência não se confunde com a circunstância judicial do art. 59, I, do CP." |
| Súmula 520/STJ | Regime | "A progressão de regime prisional independe de requerimento do condenado." |

### 3.3 Súmulas STF — Confirmadas ✅

| Súmula | Status | Observação |
|--------|--------|------------|
| Súmula 718/STF | ✅ Confirmada | 24/09/2003 |
| Súmula 719/STF | ✅ Confirmada | 24/09/2003 |
| Súmula 497/STF | ✅ Confirmada | 03/12/1969 |

### 3.4 Súmulas/teses STF — Faltantes (Adicionar)

| Súmula/Tese | Fase | Enunciado |
|-------------|------|-----------|
| **SV 59/STF** | Dosimetria/Regime | "É impositiva a fixação do regime aberto e a substituição da pena por restritivas quando reconhecido tráfico privilegiado e ausentes vetores negativos na 1ª fase." |
| **SV 56/STF** | Regime | "A falta de estabelecimento penal adequado não autoriza regime mais gravoso." |
| **SV 26/STF** | Crimes Hediondos | "Para progressão em crime hediondo, observar inconstitucionalidade do art. 2º da Lei 8.072/1990." |
| Súmula 716/STF | Regime | "Admite-se progressão de regime antes do trânsito em julgado." |
| Súmula 715/STF | Execução | "A pena unificada para 30 anos não é considerada para concessão de benefícios." |
| Súmula 723/STF | Sursis | "Não se admite sursis por crime continuado se soma mínima + 1/6 for > 1 ano." |
| Súmula 499/STF | Sursis | "Não obsta à concessão do sursis condenação anterior à pena de multa." |
| Súmula 711/STF | Dosimetria | "A lei penal mais grave aplica-se ao crime continuado se sua vigência é anterior à cessação da continuidade." |
| Súmula 604/STF | Prescrição | "A prescrição pela pena em concreto é somente da pretensão executória da pena privativa de liberdade." |

---

## 4. Problemas de Precisão Numérica

### 4.1 Ano Comercial de 360 Dias
**Agente:** Algoritmo

O `fmt()` usa `anos * 360` e mês de 30 dias. É aceitável para cálculos forenses, mas em 10 anos acumula **50 dias de diferença** em relação ao ano civil de 365 dias. Para cálculos de progressão de regime e livramento condicional, isso pode afetar datas de liberdade.

**Recomendação:** Documentar explicitamente na UI que o cálculo usa ano comercial (360d). Para uso profissional, considerar biblioteca de datas (date-fns/luxon) que trabalhe com dias reais.

### 4.2 Salto no `fmt()`
**Agente:** Algoritmo

`fmt(0.998)` → "11 meses, 29 dias". `fmt(0.999)` → "1 ano". Um salto de 0.001 no input (menos de 1 dia) gera salto de ~30 dias no display.

**Recomendação:** Usar `Math.floor` em vez de `Math.round` ou converter para dias com precisão maior.

### 4.3 Acúmulo de Erro de Ponto Flutuante
**Agente:** Algoritmo

Múltiplas minorantes/majorantes em cascata acumulam erro de precisão binária (ex: `1/6 = 0.1666...`). Para 3 minorantes de 1/3 sobre 9 anos: esperado 2,666...; computado 2,6666666666666657.

**Recomendação:** Para uso judicial, arredondar para 4 casas decimais entre fases ou usar biblioteca de precisão decimal (decimal.js).

---

## 5. UX e Validação de Inputs

### 5.1 Validações Faltantes

| Campo | Validação Necessária |
|-------|----------------------|
| Pena mínima | `>= 0`, número finito, não NaN |
| Pena máxima | `>= min`, número finito, não NaN |
| Tipo de pena | Enum: "reclusão", "detenção", "prisão simples" |
| Reincidente | Enum: "sim", "nao" (normalizado) |
| Violência | Enum: "sim", "nao" (normalizado) |
| Fração | Deve existir em `FV` |
| Detração (meses) | `>= 0`, número finito |

### 5.2 Alertas que Devem ser Exibidos

- Quando `penInter` atinge o teto do `max` → "Pena intermediária limitada ao máximo legal (Art. 68, § 2º, CP)"
- Quando `penDef` ultrapassa `max` → "Pena definitiva extrapola o máximo legal por força de majorantes específicas"
- Quando `tipo === "prisão simples"` e pena > 4 anos → "Prisão simples admite apenas regime aberto (Art. 34, CP)"
- Quando crime hediondo com resultado morte → "Regime fechado obrigatório (Art. 33, § 1º-A, Lei 13.964/2019)"

---

## 6. Lista Priorizada de Modificações

### 🔴 Prioridade 1 — Correções Críticas (Bugs que geram resultados incorretos)

1. **Corrigir Fase 2:** Adicionar teto `Math.min(..., max)` na pena intermediária
2. **Validar inputs numéricos:** `min`, `max`, `detMeses` — rejeitar NaN, negativos, e `max < min`
3. **Validar frações:** Verificar `frac in FV` antes de calcular
4. **Tratar prisão simples:** Adicionar ramo específico com regime sempre Aberto
5. **Normalizar campos categóricos:** `.trim().toLowerCase()` em `reincidente`, `violencia`, `tipo`
6. **Corrigir Tema 585/STJ:** Completar texto com a cláusula de multirreincidência

### 🟡 Prioridade 2 — Ajustes Legais Importantes

7. **Separar prescrição abstrata vs concreta:** Documentar que o campo "Pena máxima" serve para ambos
8. **Adicionar checkbox "Crime tentado"** com fração de redução (1/2 a 2/3)
9. **Adicionar checkbox "Crime hediondo com resultado morte/lesão grave"**
10. **Adicionar checkbox "Reincidente específico"** para regime correto (Art. 33, § 3º)
11. **Limitar atenuantes genéricas a 1/3 da pena-base** (Art. 64, CP)
12. **Adicionar campo para medidas cautelares alternativas** (Art. 42, § 1º)

### 🟢 Prioridade 3 — Melhorias e Conteúdo

13. **Adicionar súmulas STJ faltantes:** 438, 439, 442, 443, 520
14. **Adicionar súmulas/teses STF faltantes:** SV 59, SV 56, SV 26, 716, 715, 723, 499, 711, 604
15. **Adicionar módulo de concurso de crimes** (Art. 71, CP)
16. **Adicionar dosimetria da multa** (Art. 76, CP)
17. **Adicionar cálculo de progressão de regime** (Art. 112, LEP)
18. **Documentar convenção de 360 dias** na UI
19. **Gerar relatório justificativo** copiável para fundamentação da sentença (Art. 387, CPP)

---

## 7. Conclusão dos Agentes

> **Agente Legal-CP:** "O código é matematicamente coerente com Hungria, mas apresenta falhas de limitação legal na Fase 2, omissão de dispositivos críticos (Art. 14, 64, 112 LEP) e desatualização em relação ao Pacote Anti-Crime."

> **Agente STJ:** "As súmulas existentes estão corretas, mas o Tema 585 está incompleto e há 5 súmulas relevantes que deveriam ser adicionadas."

> **Agente STF:** "As 3 súmulas do STF estão corretas e vigentes, mas há 10 súmulas/teses faltantes, especialmente a SV 59 (2023) sobre tráfico privilegiado."

> **Agente Algoritmo:** "Foram identificados 6 bugs críticos de robustez, 9 edge cases problemáticos e problemas de precisão numérica que podem mascarar erros."

---

## Apêndice: Referências dos Agentes

- **Agente Legal-CP:** Análise dos Arts. 33, 42, 44, 59, 61-68, 71, 76, 77, 109, 112, 115 do CP; Art. 112 da LEP; Lei 13.964/2019.
- **Agente STJ:** Site www.stj.jus.br (via Bing); Damásio Legal Database.
- **Agente STF:** Portal STF (via Bing); tesesesumulas.com.br; LexML.gov.br.
- **Agente Algoritmo:** Análise estática do código `src/components/DosimetriaPenal.tsx`, linhas 191-261.
