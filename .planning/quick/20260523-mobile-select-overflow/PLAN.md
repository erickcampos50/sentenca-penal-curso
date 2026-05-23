# Corrigir overflow mobile de seletores

## Objetivo
Corrigir seletores que extrapolam o card no mobile e verificar se o checkbox `perSaltum` altera a lógica do cálculo.

## Escopo
- Ajustar linhas responsivas de selects em `DosimetriaPenal.tsx` para impedir overflow horizontal.
- Conferir o uso do terceiro checkbox da moldura penal na função de regime.
- Validar com build.

## Resultado Esperado
- Selects longos quebram/encolhem dentro do encapsulamento no mobile.
- A relação do checkbox `perSaltum` com a lógica fica registrada no resumo.
