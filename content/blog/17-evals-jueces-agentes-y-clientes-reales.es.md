---
title: "Evals: jueces, agentes y pruebas con clientes reales"
date: 2026-10-29
order: 17
draft: true
description: "Cómo usar otro modelo como juez, qué sesgos tiene y cómo compararlo con una persona antes de confiar en él; cómo se mide un agente, con pass@k y pass^k; y cuándo hace falta probar con clientes reales."
---

En el post anterior, el eval de La Esquina dejó un caso sin calificar. Un cliente escribe "La pizza llegó fría", y lo que se espera del asistente es que pida una foto y el número de pedido, y ofrezca reponerla sin cargo.

Esa respuesta no se puede chequear buscando una palabra. "Mandame una foto" y "pasame una imagen" dicen lo mismo, y un asistente puede pedir la foto y a la vez discutir con el cliente. Para decidir si atendió bien hace falta leer y entender. Si no se quiere poner a una persona a leer cada respuesta, la opción es que lea otro modelo.

## Un modelo como juez

Usar un modelo para calificar las respuestas de otro se llama **LLM-as-judge** (un modelo de lenguaje como juez). El juez recibe la respuesta y una **rúbrica**: la lista de criterios con que se califica. Para la pizza fría:

> Pasa si pide el número de pedido y una foto, y ofrece reponerla sin cargo. No pasa si discute con el cliente o promete algo que no está en las reglas.

El juez de La Esquina, en Python, con la salida estructurada que ya se vio en la serie:

```python
from typing import Literal
import anthropic
from pydantic import BaseModel

class Veredicto(BaseModel):
    razon: str  # va primero: el juez explica antes de decidir
    resultado: Literal["pasa", "no pasa", "no sé"]

client = anthropic.Anthropic()

def juez(respuesta, rubrica):
    r = client.messages.parse(
        model="claude-opus-5-5",
        max_tokens=16000,
        system="Calificás respuestas del asistente de la pizzería La Esquina. "
               "Usá solo la rúbrica. Si no alcanza para decidir, respondé 'no sé'.",
        messages=[{"role": "user", "content":
                   f"<rubrica>{rubrica}</rubrica>\n<respuesta>{respuesta}</respuesta>"}],
        output_format=Veredicto,
    )
    v = r.parsed_output
    return None if v is None or v.resultado == "no sé" else v.resultado == "pasa"
```

Lo que hay que mirar:

- **La razón va antes del resultado.** El modelo escribe en orden, así que primero explica y después decide. Es la idea de razonar antes de responder, aplicada al juez.
- **El juez puede decir "no sé".** La guía de evals de Anthropic, [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), lo recomienda: darle al juez una salida cuando no tiene información suficiente, para que no invente un veredicto. En el código, "no sé" vuelve como `None`, que no cuenta ni a favor ni en contra, igual que un caso sin correr.
- **Un juez por cada cosa que se mide.** La misma guía aconseja una rúbrica clara para cada aspecto (el tono, si pidió los datos, si prometió algo de más), y un juez aparte para cada uno, en vez de uno solo que califique todo junto.

Este juez se enchufa en la función `correr` del post anterior: `correr(golden, respuestas, juez=juez)`.

Sin conectar con la API, se puede probar que el código arma bien el pedido y lee bien el veredicto, simulando las respuestas del juez. Con la respuesta de la versión anterior ("Perdón! Mandame una foto y el número de pedido y te la reponemos sin cargo") y un veredicto simulado de "pasa", la función devuelve `True`. Lo que el juez decide de verdad con esta rúbrica no está probado.

## Los sesgos del juez

Un juez es otro modelo, y se equivoca de formas conocidas. Un estudio de 2023 de un equipo de UC Berkeley y otras universidades, [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685), les puso nombre a tres sesgos, probando como jueces a GPT-4 y GPT-3.5, de OpenAI, y Claude-v1, de Anthropic:

- **El orden.** Si el juez compara dos respuestas, puede preferir la que aparece primero. En el estudio, al invertir el orden de las dos respuestas, GPT-4 mantuvo su veredicto solo en el 65% de los casos.
- **El largo.** El juez puede preferir la respuesta más larga, aunque no diga nada más. En una prueba del estudio, a 23 respuestas que tenían una lista les agregaron adelante la misma lista dicha con otras palabras: GPT-3.5 y Claude-v1 prefirieron la versión alargada el 91,3% de las veces, y GPT-4 el 8,7%.
- **Sus propias respuestas.** Un juez puede preferir lo que escribió un modelo como él. En el estudio, GPT-4 se favoreció con un 10% más de victorias, y Claude-v1 con un 25%.

Los números son de modelos de 2023, y los de hoy pueden comportarse distinto. Pero los sesgos siguen en las guías actuales: la de OpenAI nombra el del orden y el del largo, y pide controlar el largo de las respuestas porque los modelos tienden a preferir las largas.

Para el orden, el estudio propone una solución simple: llamar al juez dos veces, con las respuestas invertidas, y dar ganadora a una solo si gana en los dos órdenes. Para el sesgo propio, si el asistente y el juez son el mismo modelo, como en el código de arriba, conviene comparar con una persona con más cuidado, o usar otro modelo como juez.

El mismo estudio trae la buena noticia: un juez fuerte coincidió con las personas en más del 80% de los casos, lo mismo que coinciden dos personas entre sí. Un juez puede servir. Pero hay que comprobarlo antes de confiar en él.

## Comparar al juez con una persona

Los tres proveedores dicen lo mismo: antes de usar un juez en serio, hay que **calibrarlo**, es decir, comparar sus veredictos con los de una persona. Anthropic pide que esté "muy calibrado con expertos humanos". OpenAI, en su guía [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices), pide validar cuánto coincide con las etiquetas de personas antes de buscar un juez más barato o más rápido. Google, en su documentación, propone armar un set de respuestas con puntajes de personas como la verdad contra la que se mide al juez.

En La Esquina: una persona del local lee 50 respuestas a reclamos y marca cuáles pasan. Después el juez califica las mismas 50. Con números de ejemplo, no medidos:

| | La persona dice "pasa" (40) | La persona dice "no pasa" (10) |
|---|---|---|
| El juez dice "pasa" | 38 | 4 |
| El juez dice "no pasa" | 2 | 6 |

Coinciden en 44 de 50: el 88%. Suena bien, pero hay que compararlo con algo. Un juez que dijera "pasa" a todo, sin leer nada, coincidiría en 40 de 50, el 80%, porque la mayoría de las respuestas son buenas. El 88% casi no le gana a no leer.

Lo que importa está en la columna de la derecha: de las 10 respuestas malas, el juez dejó pasar 4. Si esas respuestas fueran sobre alergias, 4 de cada 10 errores se escaparían.

Es el mismo problema que se vio con los filtros de guardrails: un juez se equivoca en dos sentidos. Puede frenar una respuesta buena (un falso positivo, acá 2 de 40) o dejar pasar una mala (un falso negativo, acá 4 de 10). Calibrar un juez es medir esos dos errores por separado, no solo el total.

Google usa para esto la **exactitud balanceada**: el promedio entre cuántas buenas reconoce como buenas y cuántas malas reconoce como malas. Acá da (38/40 + 6/10) / 2 = 0,775, bastante menos que el 88%, porque castiga las malas que se escapan.

Si el juez no alcanza, se ajusta la rúbrica y se vuelve a medir. Supongamos que, con una rúbrica más precisa, el juez pasa a frenar 9 de las 10 malas: la exactitud balanceada sube a 0,91. Ahí ya se puede usar en el eval, con una persona que revise de vez en cuando. Y cuando se cambia el modelo del juez o la rúbrica, se calibra de nuevo.

## Cómo se mide un agente

Cuando el asistente usa herramientas y da varios pasos, como consultar el stock, calcular el total y registrar el pedido, hay más cosas para medir que la respuesta final: si completó la tarea, si llamó a la herramienta correcta con los datos correctos, qué pasos dio y cuánto costó.

**Primero el resultado.** La guía de Anthropic dice que muchas veces es mejor calificar lo que el agente produjo y no el camino que siguió, porque los agentes encuentran caminos válidos que nadie había previsto, y exigir los pasos exactos castiga eso. Si La Esquina registra bien el pedido, no importa si consultó el stock antes o después de calcular el total. La guía también pide dar puntaje parcial: un asistente que entendió el reclamo y verificó el pedido, pero no ofreció reponerlo, está mejor que uno que no entendió nada.

No todos piensan igual. En el ADK, el kit de Google para armar agentes, si no se configura otra cosa, el eval exige que el agente use las herramientas en el mismo orden exacto que se esperaba.

**Una vez o siempre.** Un modelo no responde siempre igual, así que en un agente se corre cada caso varias veces. Y ahí hay dos preguntas distintas:

- **pass@k:** de k intentos, acertó en alguno? La medida se hizo conocida con [el paper de Codex de OpenAI](https://arxiv.org/abs/2107.03374), de 2021, para modelos que escriben código: si de 10 intentos uno anda, alcanza, porque se puede probar cuál anda.
- **pass^k:** de k intentos, acertó en todos? La propuso Sierra, una empresa que hace agentes de atención al cliente, en su estudio de 2024 [τ-bench](https://arxiv.org/abs/2406.12045), justamente porque a un cliente no le sirve que el asistente acierte alguna vez.

Si el asistente de La Esquina toma bien un pedido el 90% de las veces, y cada intento es independiente del anterior:

| Intentos (k) | pass@k: alguno bien | pass^k: todos bien |
|---|---|---|
| 1 | 90% | 90% |
| 3 | 99,9% | 72,9% |
| 5 | 99,999% | 59% |
| 10 | casi 100% | 34,9% |

Con el mismo asistente, una medida dice "casi perfecto" y la otra "falla seguido". Un cliente que pide tres noches seguidas tiene un 72,9% de probabilidad de que los tres pedidos salgan bien. La guía de Anthropic lo resume así: pass@k para herramientas donde basta un acierto, pass^k para agentes donde importa ser consistente. Para un asistente que atiende clientes, la que importa es pass^k. En el estudio de Sierra, los mejores agentes de 2024 acertaban todas las veces, en 8 intentos, menos del 25% de las tareas de atención de una tienda.

## Un modelo que hace de cliente

En una charla real, el asistente pregunta cosas y el cliente contesta. Un golden set con un solo mensaje por caso no prueba eso. La solución de τ-bench, que también trae el ADK de Google, es que otro modelo haga de cliente: recibe un plan ("pedí 2 muzzarellas para Barrio Norte; si te preguntan algo, contestá") y conversa con el asistente hasta terminar.

<figure>
<p class="fig-title">Una prueba con un cliente simulado</p>
<svg viewBox="0 0 400 420" width="100%" role="img" aria-labelledby="g17t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g17t">Diagrama de secuencia de una prueba con un cliente simulado: otro modelo hace de cliente con un plan (pedir 2 muzzarellas para Barrio Norte), el asistente le pregunta el barrio, el cliente contesta, el asistente registra el pedido, y tu código compara el pedido registrado con el esperado.</title>
<defs><marker id="g17c1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(52% 0.13 150)"/></marker><marker id="g17ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<path d="M72 58V410" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M200 58V410" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M328 58V410" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<rect x="12" y="14" width="120" height="44" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="72.0" y="40.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">Cliente simulado</text>
<rect x="140" y="14" width="120" height="44" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="40.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">Asistente</text>
<rect x="268" y="14" width="120" height="44" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="328.0" y="40.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">Tu código</text>
<path d="M76 122H196" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g17ink)"/>
<text x="136.0" y="114" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">quiero 2 muzzas</text>
<path d="M196 182H76" fill="none" stroke="oklch(52% 0.13 150)" stroke-width="1.6" marker-end="url(#g17c1)"/>
<text x="136.0" y="174" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">para qué barrio?</text>
<path d="M76 242H196" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g17ink)"/>
<text x="136.0" y="234" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">Barrio Norte</text>
<path d="M204 312H324" fill="none" stroke="oklch(52% 0.13 150)" stroke-width="1.6" marker-end="url(#g17c1)"/>
<text x="264.0" y="304" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">registra el pedido</text>
<text x="72" y="84" font-size="13" fill="var(--color-muted)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">plan: 2 muzzarellas,</text>
<text x="72" y="99" font-size="13" fill="var(--color-muted)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">Barrio Norte</text>
<rect x="270" y="342" width="116" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="328.0" y="366.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">compara con el</text>
<text x="328.0" y="383.2" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">pedido esperado</text>
</svg>
<figcaption><ul><li>Celeste: el cliente simulado, otro modelo que sigue un plan.</li><li>Verde: el asistente que se prueba.</li><li>Naranja: tu código, que califica el resultado: el pedido registrado, no las palabras exactas de la charla.</li><li>Como el cliente simulado no dice siempre lo mismo, cada prueba se corre varias veces.</li></ul></figcaption>
</figure>

Al final no se califica la charla palabra por palabra, que cambia cada vez, sino el resultado: el pedido que quedó registrado, comparado con el esperado. Y como el cliente simulado tampoco dice siempre lo mismo, cada prueba se corre varias veces, con pass^k.

## Con clientes reales

Todo lo anterior prueba el asistente con casos guardados, antes de cambiar nada. La prueba más fiel es con clientes de verdad: un **A/B**, que manda a la mitad de los clientes la versión vieja y a la otra mitad la nueva, y compara cuál anda mejor.

La contra es el tiempo. La guía de Anthropic dice que un A/B tarda días o semanas en dar un resultado confiable, necesita suficiente tráfico, y solo prueba cambios que ya salieron. Con los 300 mensajes por día de La Esquina, y suponiendo que cada mensaje se puede calificar:

| Mejora que se quiere ver | Mensajes en total | Días |
|---|---|---|
| De 80% a 90% | unos 400 | poco más de 1 |
| De 80% a 85% | unos 1.800 | 6 |
| De 90% a 92% | unos 6.400 | 21 |

Una mejora chica tarda tres semanas en verse. Por eso el golden set va primero, para no mandar a los clientes algo que rompe una alergia, y el A/B queda para cambios grandes con tráfico suficiente.

Mirar qué pasa con los clientes reales todos los días, y no solo durante un A/B, ya es otro tema: observabilidad, que se ve más adelante en la serie.

## Lo mismo en los tres

| | Anthropic | OpenAI | Google |
|---|---|---|---|
| Qué ofrece | Guías: Demystifying evals for AI agents y la documentación para definir criterios y armar evals | Cerró su plataforma de evals (solo lectura desde el 31-10-2026, apagada desde el 30-11-2026) y recomienda Promptfoo, una herramienta open source de evals que pasó a ser parte de OpenAI | Gen AI evaluation service, en su plataforma de Google Cloud para modelos y agentes, y evals con cliente simulado en el ADK |
| Orden de los calificadores | Código donde se pueda, modelo donde haga falta, personas con cuidado | Automatizar cuando se pueda, personas para calibrar | Rúbricas que arma un modelo para cada pregunta, más métricas con código |
| Sobre el juez | Calibrarlo con expertos y darle la salida "no sé" | Validar cuánto coincide con personas; sesgos del orden y del largo | Medirlo contra puntajes de personas, con exactitud balanceada |
| Agentes | Calificar sobre todo el resultado; pass@k y pass^k | No lo cubre su guía de evals | Métricas de respuesta final y de uso de herramientas; el ADK exige el orden exacto por defecto |

En lo que coinciden los tres: un juez no se usa sin antes compararlo con una persona.

## En resumen

- Cuando el código no alcanza para calificar, otro modelo puede hacerlo con una rúbrica. Conviene que razone antes del veredicto, que pueda decir "no sé" y que haya un juez por cada aspecto.
- Un juez tiene sesgos conocidos: el orden de las respuestas, el largo y la preferencia por lo que escribió un modelo como él.
- Antes de confiar en un juez, se compara con una persona. Un acuerdo alto puede no alcanzar: hay que mirar cuántas respuestas malas deja pasar.
- En un agente se califica sobre todo el resultado. pass@k mide si acierta alguna vez; pass^k, si acierta siempre, que es lo que necesita un cliente.
- Otro modelo puede hacer de cliente para probar charlas completas.
- Un A/B con clientes reales es la prueba más fiel, pero tarda días o semanas: queda para cambios grandes.
