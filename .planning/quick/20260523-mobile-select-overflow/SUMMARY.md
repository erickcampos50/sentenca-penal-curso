---
status: complete
slug: mobile-select-overflow
date: 2026-05-23
---

# Summary

## Completed
- Corrigido overflow mobile em selects de moldura, vetores, agravantes, atenuantes, majorantes, minorantes, multa, prescrição, concurso e resultado.
- Inputs em grids de duas colunas agora usam uma coluna no mobile e duas a partir de `sm`.
- Linhas de selects longos agora empilham no mobile e mantêm layout horizontal em `sm`.

## Logic Check
- O terceiro checkbox da moldura penal é `perSaltum`.
- Ele afeta o cálculo de regime em `calcRegime`: para pena até 4 anos com reincidência, ativa o retorno `Fechado` antes das demais hipóteses de reincidência.
- O mesmo estado também é usado no cálculo de regime pós-detração em `PrescricaoDetracao`.

## Verification
- `npm run build` passou.
