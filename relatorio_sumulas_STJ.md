# Relatório de Validação das Súmulas STJ - Aplicação de Dosimetria Penal

**Data:** 22/05/2026
**Status:** Concluído (com ressalvas sobre fontes)
**Método:** Validação cruzada via juris.damasio.com.br (acesso ao site oficial do STJ bloqueado)

---

## 1. Súmulas Confirmadas (✅)

As seguintes súmulas estão presentes no código e foram confirmadas contra fontes jurídicas confiáveis:

| Súmula | Tema | Status | Observação |
|--------|------|--------|------------|
| 231/STJ | A atenuante e o mínimo legal | ✅ Confirmada | Texto confere com a fonte |
| 241/STJ | Reincidência: necessidade de sentenças transitadas em julgado | ✅ Confirmada | Texto confere com a fonte |
| 269/STJ | Regime semiaberto para reincidentes (pena até 4 anos) | ✅ Confirmada | Texto confere com a fonte. Nota: verificar se legislação posterior (Lei 13.964/2019 ou 14.188/2021) impactou esta súmula — não foi possível confirmar devido a bloqueio de fontes. |
| 440/STJ | Vedação de regime mais gravoso quando pena-base é o mínimo legal | ✅ Confirmada | Texto confere com a fonte |
| 444/STJ | Vedação de usar inquéritos/ações penais em curso para agravar pena-base | ✅ Confirmada | Texto confere com a fonte |
| 545/STJ | Confissão utilizada como atenuante (art. 65, III, d, CP) | ✅ Confirmada | Texto confere com a fonte |
| 630/STJ | Confissão no tráfico: reconhecimento da traficância é necessário | ✅ Confirmada | Texto confere com a fonte |
| 636/STJ | Folha de antecedentes comprova maus antecedentes/reincidência | ✅ Confirmada | Texto confere com a fonte |

**Resumo:** Nenhuma das 8 súmulas listadas no código é inexistente ou manifestamente revogada segundo as fontes consultadas.

---

## 2. Texto Incompleto (⚠️)

### Tema 585/STJ
- **Status no código:** Incompleto
- **Texto no código:** "Compensação entre a atenuante da confissão espontânea e a agravante da reincidência, ao abrigo do art. 29 do CP, na dosimetria da pena."
- **Texto completo (fonte: Damásio):** O enunciado do Tema 585 é mais extenso e inclui uma ressalva importante sobre multirreincidência e a preponderância da reincidência conforme art. 61, I, do Código Penal.
- **Ação necessária:** Atualizar o texto no código para refletir o enunciado completo do Tema 585, incluindo a ressalva sobre multirreincidência.

---

## 3. Súmulas Relevantes Ausentes (📌)

Durante a pesquisa, foram identificadas as seguintes súmulas que possuem relevância direta para dosimetria penal e execução, mas **não estão presentes** no array `SUMULAS` do código:

| Súmula | Tema | Relevância |
|--------|------|------------|
| 438/STJ | Prescrição: deve ser verificada de ofício a qualquer tempo | Alta — impacta análise processual |
| 439/STJ | Exame criminológico deve ser fundamentado | Alta — progressão de regime |
| 442/STJ | Furto qualificado × roubo: distinção | Média — tipificação e dosimetria |
| 443/STJ | Roubo circunstanciado: fundamentação concreta na terceira fase | Alta — dosimetria direta |
| 520/STJ | Saída temporária é ato jurisdicional | Média — execução penal |

**Recomendação:** Avaliar inclusão das súmulas 438, 439, 442, 443 e 520 no array, conforme o escopo pretendido da aplicação.

---

## 4. Limitações da Pesquisa

⚠️ **Aviso importante:** Não foi possível realizar validação direta contra o site oficial do STJ (`stj.jus.br`, `scon.stj.jus.br`) devido a bloqueio de acesso (HTTP 403/404). A validação foi realizada utilizando o site `juris.damasio.com.br`, que é uma fonte jurídica consolidada no Brasil, mas **não é uma fonte oficial primária**.

Além disso, os mecanismos de busca (Google, DuckDuckGo, Bing) ativaram proteções anti-bot (CAPTCHA/bloqueio), impedindo consultas adicionais.

---

## 5. Sugestões de Próximos Passos

1. **Atualizar Tema 585:** Completar o texto no código com o enunciado integral do Tema 585.
2. **Verificar Súmula 269:** Confirmar com um operador humano se a Súmula 269/STJ foi impactada pelas Leis 13.964/2019 ou 14.188/2021 (pacotes anticrime).
3. **Avaliar inclusão das súmulas ausentes:** Decidir se as súmulas 438, 439, 442, 443 e 520 devem ser adicionadas ao array `SUMULAS`.
4. **Conferir contra site oficial:** Quando possível, validar todos os textos diretamente em `portal.stj.jus.br` ou `scon.stj.jus.br`.

---

*Relatório gerado automaticamente. Recomenda-se revisão por profissional jurídico antes de aplicação em ambientes de produção.*
