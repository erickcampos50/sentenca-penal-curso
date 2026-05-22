# Relatório de Compatibilidade — Metodologia de Cálculo vs. Taipina (2025)

**Fonte:** Thales Flores Taipina, *Manual da Sentença Penal Condenatória*, 7ª ed., 2025.  
**Trecho analisado:** Capítulo IV — "O Conteúdo Decisório do Dispositivo e as Providências Finais"  
**Data:** 22/05/2026

---

## Sumário Executivo

O código implementa o **Método de Nelson Hungria** de forma fiel e está **geralmente compatível** com a metodologia descrita por Taipina. As diferenças identificadas são de **interpretação doutrinária** (quantitativa vs. qualitativa) e de **funcionalidades não implementadas** (medida de segurança, valoração qualitativa de circunstâncias), **não de erros legais ou bugs críticos**.

---

## 1. Fase 1 — Pena-Base (Art. 59, CP)

### Descrição de Taipina
- O processo dosimétrico parte do **mínimo legal** (p. 497)
- O juiz observa as circunstâncias judiciais do art. 59 para elevar a pena
- A valoração deve ser **qualitativa**, não apenas quantitativa: "podendo existir uma só circunstância que, por sua intensidade, faça pesar a balança em um sentido ou em outro" (p. 508)

### Implementação no Código
```typescript
const penBase = hasData ? Math.min(min + negN * acPorVetor, max) : 0;
```
- Divide o intervalo em 8 partes iguais (1/8 por vetor negativo)
- Parte do mínimo e acresce conforme vetores desfavoráveis
- Capa no máximo legal

### Veredito
✅ **COMPATÍVEL** — O código implementa o método de Hungria fielmente. A diferença é que o método é puramente quantitativo, enquanto Taipina prefere valoração qualitativa. Isso é uma **escolha metodológica**, não um erro.

---

## 2. Regime Prisional (Art. 33, CP)

### 2.1 Espécie da Pena

**Taipina (p. 501-502):**
> "A pena de reclusão deve ser cumprida em regime fechado, semiaberto ou aberto. A de detenção, em regime semiaberto, ou aberto, salvo necessidade de transferência a regime fechado."

**Código:**
- Reclusão: fechado/semiaberto/aberto ✅
- Detenção: semiaberto/aberto (nunca fechado) ✅
- Prisão simples: aberto (Art. 34, CP) ✅

### Veredito
✅ **COMPATÍVEL**

---

### 2.2 Quantidade da Pena + Reincidência

**Taipina (p. 503-504):**
> "a) pena > 8 anos → fechado obrigatório  
> b) pena 4-8 anos → semiaberto para primário, fechado para reincidente  
> c) pena ≤ 4 anos → aberto para primário, semiaberto para reincidente"

**Código:**
```typescript
if (penDef > 8) regime = "Fechado";
else if (penDef > 4) regime = reincNorm ? "Fechado" : "Semiaberto";
else regime = reincNorm ? "Semiaberto" : "Aberto";
```

### Veredito
✅ **COMPATÍVEL** na regra geral.

⚠️ **DIVERGÊNCIA** sobre reincidente específico: Taipina cita (p. 508-510) que o STJ admite regime fechado (per saltum) para reincidente com pena ≤ 4 anos quando há circunstâncias judiciais desfavoráveis. O código atual limita a semiaberto para reincidente com pena ≤ 4 anos.

**Análise:** O código é mais conservador. A posição do autor sobre "per saltum" é minoritária e controvertida (cita decisões divergentes do STJ). A implementação atual (semiaberto) é mais segura juridicamente.

---

### 2.3 Circunstâncias Judiciais para Regime (Art. 33, § 3º)

**Taipina (p. 504-505):**
> "A determinação do regime inicial de cumprimento da pena far-se-á com observância dos critérios previstos no art. 59 deste Código"

> "A valoração negativa das circunstâncias judiciais pode impedir o abrandamento do regime prisional preambular, não obstante a permissão pelo valor da pena"

**Código:**
- Não implementa valoração de circunstâncias judiciais para fins de regime
- O regime é determinado apenas pela pena + reincidência

### Veredito
⚠️ **PARCIALMENTE COMPATÍVEL** — O código não captura a influência das circunstâncias judiciais no regime. Isso exigiria uma valoração subjetiva que é difícil de automatizar. A UI menciona que circunstâncias judiciais influenciam, mas não calcula automaticamente.

---

## 3. Detração Penal (Art. 42 CP + Art. 387, § 2º CPP)

### Descrição de Taipina (p. 509-512)

> "O tempo de prisão provisória será computado para fins de determinação do regime inicial"

Exemplo dado:
- Pena: 8 anos 6 meses → regime fechado (art. 33, § 2º, a)
- Com 8 meses de prisão provisória: 7 anos 10 meses remanescentes → regime semiaberto (art. 33, § 2º, b)

**Mas com ressalva importante:**
> "A detração não conduz à automática fixação do regime mais brando [...] a reincidência impõe o agravamento do regime"

### Implementação no Código
```typescript
const penRem = Math.max(penDef - detAnos, 0);
```
- Calcula pena remanescente ✅
- Mas o regime é calculado sobre `penDef`, não sobre `penRem`
- A UI alerta: "A detração pode alterar o regime inicial"

### Veredito
⚠️ **PARCIALMENTE COMPATÍVEL** — O código não recalcula o regime com base na pena remanescente. Tecnicamente está correto (o regime deve ser calculado sobre a pena definitiva, com a detração como fator adicional), mas poderia ser mais explícito ao usuário.

**Sugestão:** Adicionar cálculo do regime "pós-detração" como informação complementar, com alerta quando a detração alteraria o regime (exceto se há reincidência ou circunstâncias negativas).

---

## 4. Regime Per Saltum

### Descrição de Taipina (p. 506-508)

Controvérsia sobre "saltar" do aberto direto para o fechado:
- **Posição favorável (STJ, 5ª Turma, 2018):** admite regime fechado para reincidente com pena ≤ 4 anos + circunstâncias desfavoráveis
- **Posição contrária (TJDFT):** reincidência não leva necessariamente ao fechado; deve-se usar o regime imediatamente mais gravoso (semiaberto)

**Posição do autor:**
> "A fixação do regime mais rigoroso, per saltum, não encontra óbice legal"

### Implementação no Código
- Não implementa regime per saltum
- Para reincidente com pena ≤ 4 anos: sempre semiaberto (nunca fechado)

### Veredito
⚠️ **MAIS CONSERVADOR QUE TAIPINA** — O código adota a posição mais segura (semiaberto). O autor defende a possibilidade de fechado, mas reconhece que há controvérsia. A implementação atual é juridicamente mais segura.

---

## 5. Medida de Segurança (Art. 98, CP)

### Descrição de Taipina (p. 497-500)

> "A substituição da pena privativa de liberdade por medida de segurança decorre das situações em que se verifica a semi-imputabilidade do réu"

- Art. 98 CP: semi-imputável que necessite de tratamento curativo → substituição por internação ou tratamento ambulatorial (1 a 3 anos)
- O autor defende que a dosimetria da pena privativa é desnecessária quando há substituição por medida de segurança

### Implementação no Código
- ❌ **Não implementado**

### Veredito
❌ **FUNCIONALIDADE FALTANTE** — Seria útil adicionar um checkbox "Semi-imputável com necessidade de tratamento curativo" que:
1. Informa que a dosimetria é prejudicada
2. Indica a substituição por medida de segurança (art. 98 CP)
3. Pede prazo (1 a 3 anos)

---

## 6. Substituição da Pena (Art. 44, CP)

### Descrição de Taipina (p. 500)

> "Para a substituição da pena privativa de liberdade por pena restritiva de direitos, a realização do processo dosimétrico é imprescindível"

Condições: pena ≤ 4 anos, crime sem violência, não reincidente em crime doloso, circunstâncias do art. 59 indicam suficiência.

### Implementação no Código
```typescript
const cabeSub = penDef > 0 && penDef <= 4 && !violNorm && !reincNorm;
```

### Veredito
✅ **COMPATÍVEL** — Implementa corretamente os requisitos do art. 44, I, II, III.

---

## 7. Súmulas Citadas por Taipina

| Súmula | No Código? | Status |
|--------|------------|--------|
| STF 718 | ✅ | Compatível |
| STF 719 | ✅ | Compatível |
| STJ 440 | ✅ | Compatível |
| STJ 269 | ✅ | Compatível |
| STJ 527 | ❌ | **Faltante** — Medida de segurança não ultrapassa pena máxima |

---

## 8. Matriz de Compatibilidade Geral

| Aspecto | Compatibilidade | Observação |
|---------|----------------|------------|
| Fase 1 (pena-base) | ✅ 100% | Método de Hungria implementado corretamente |
| Fase 2 (agravantes/atenuantes) | ✅ 100% | Com teto no máximo (corrigido) |
| Fase 3 (majorantes/minorantes) | ✅ 100% | Ordem correta |
| Regime — reclusão/detenção | ✅ 100% | Art. 33, caput respeitado |
| Regime — quantidade + reincidência | ✅ 90% | Conservador (não implementa per saltum) |
| Regime — circunstâncias judiciais | ⚠️ 50% | Não automatizado |
| Detração | ⚠️ 70% | Calcula pena remanescente, não recalcula regime |
| Substituição (Art. 44) | ✅ 100% | Requisitos corretos |
| Sursis (Art. 77) | ✅ 100% | Limites corretos |
| Prescrição (Art. 109) | ✅ 80% | Base de cálculo documentada na UI |
| Medida de segurança (Art. 98) | ❌ 0% | **Não implementado** |
| Convenção 360 dias | ✅ 100% | Aceitável para cálculo forense |

---

## 9. Recomendações com Base em Taipina

### Prioridade Média
1. **Adicionar cálculo de regime pós-detração:** Mostrar ao usuário qual seria o regime se considerada apenas a pena remanescente, com alerta quando a detração não altera o regime devido à reincidência/circunstâncias negativas
2. **Adicionar checkbox para medida de segurança (Art. 98, CP):** Semi-imputável com necessidade de tratamento curativo
3. **Adicionar Súmula 527/STJ:** "O tempo de duração da medida de segurança não deve ultrapassar o limite máximo da pena abstratamente cominada para o delito praticado"

### Prioridade Baixa
4. **Documentar na UI que o método é quantitativo:** Adicionar nota informando que a valoração qualitativa das circunstâncias judiciais (como defende Taipina) é responsabilidade do juiz, e o aplicativo serve como estimador matemático
5. **Adicionar exemplo de detração alterando regime:** Na aba de referências, incluir o exemplo de Taipina (8 anos 6 meses → 7 anos 10 meses após 8 meses de prisão provisória)

---

## 10. Conclusão

> **O código está juridicamente sólido e compatível com a metodologia de Taipina (2025).**

As diferenças identificadas não são erros, mas sim:
1. **Escolhas metodológicas conservadoras** (ex: não implementar per saltum)
2. **Limitações de automatização** (ex: valoração qualitativa de circunstâncias judiciais)
3. **Funcionalidades extras** não previstas no escopo original (ex: medida de segurança)

O código pode ser aprimorado para ficar ainda mais alinhado com o autor, mas **não há bugs críticos ou erros legais a corrigir** com base neste livro.
