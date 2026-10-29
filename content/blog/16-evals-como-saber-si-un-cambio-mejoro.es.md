---
title: "Evals: cómo saber si un cambio mejoró tu asistente"
date: 2026-10-29
order: 16
draft: true
description: "Qué es un eval, cómo armar un golden set con las fallas reales del asistente, cómo calificar cada respuesta con código y por qué lo que decide si un cambio entra no es el total, sino qué casos se rompieron."
---

El asistente de La Esquina responde largo, y la gente lo lee desde el celular. Alguien cambia una línea del system prompt: "respondé en una oración". Prueba con cuatro o cinco mensajes, las respuestas se ven más cortas y mejores, y el cambio sale.

Una semana después, una clienta pregunta si la pizza de rúcula tiene frutos secos, porque su hijo es alérgico. El asistente contesta "Lleva muzzarella, rúcula y parmesano". Es cierto, pero le falta lo importante: el pesto de la casa lleva nueces. Antes del cambio, el asistente lo decía.

Mirar unas respuestas a ojo no alcanza para saber si un cambio mejoró o empeoró el asistente. Para eso están los evals.

## Qué es un eval

Anthropic lo define así: un eval (de *evaluation*, evaluación) es un test para un sistema de IA. Se le da una entrada, y a lo que devuelve se le aplica una lógica de calificación que dice si está bien.

Un eval tiene tres partes:

- **Los casos:** los mensajes de prueba. A la lista de casos, con lo que se espera de cada uno, se la llama **golden set** (el nombre viene de "estándar de oro": es la vara contra la que se mide).
- **Lo que se espera:** una respuesta exacta cuando la hay ("$10.500"), o una lista de criterios cuando no ("pide el número de pedido y una foto").
- **El calificador** (*grader*): la función o el modelo que mira la respuesta y decide si pasa.

Es la misma idea que los tests de cualquier programa, con una diferencia: un programa da siempre la misma salida para la misma entrada, y un modelo no. Por eso un eval no prueba que algo ande, sino cuántas veces anda.

## De dónde salen los casos

La guía de evals de Anthropic, [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) (enero de 2026), dice que no hacen falta cientos de casos para empezar: "20 a 50 tareas simples sacadas de fallas reales es un gran comienzo". Al principio, cada cambio tiene un efecto grande y se nota con pocos casos.

Los mejores casos son los errores que ya pasaron. Para La Esquina, diez casos, cada uno con su origen:

| Caso | Mensaje del cliente | Qué se espera | Falla de origen |
|---|---|---|---|
| precio_napolitana | "Cuánto sale la napolitana?" | Solo $10.500 | Precio inventado |
| precio_fuera_de_carta | "Cuánto sale la calabresa?" | Ningún precio: no está en la carta | Precio inventado |
| total | "2 muzzas y una napo, cuánto es?" | $28.500 | Total mal sumado |
| alergia_rucula | "La de rúcula tiene frutos secos? Mi hijo es alérgico" | Avisa que el pesto lleva nueces. Crítico | Alergia ignorada |
| alergia_fugazzeta | "La fugazzeta tiene frutos secos?" | Dice que no | Alarma de más |
| pedido | "quiero 2 muzzas y una fugazzeta sin cebolla para Barrio Norte" | El pedido exacto | Pedido mal tomado |
| carta | "Qué pizzas tienen?" | Tres oraciones como mucho | Respuesta larga |
| pedido_enorme | "Quiero 500 muzzarellas para el sábado" | No lo registra, pasa a una persona. Crítico | Pedido absurdo registrado |
| lunes | "Abren los lunes?" | Dice que cierra | Horario inventado |
| pizza_fria | "La pizza llegó fría" | Pide foto y número de pedido, ofrece reponerla | Reclamo mal atendido |

Dos cosas de esta lista:

- **Los dos sentidos.** Hay un caso donde tiene que dar un precio y otro donde no tiene que darlo; uno donde tiene que avisar de un alérgeno y otro donde no tiene que alarmar. La guía de Anthropic lo pide así: probar los casos en que algo tiene que pasar y en los que no, porque un eval de un solo lado mejora un solo lado. Si solo se probara "avisa de las nueces", un asistente que responde "puede tener frutos secos" a todo pasaría siempre.
- **Los críticos.** La alergia y el pedido de 500 pizzas son los errores que no se pueden permitir: un chico alérgico o un local que hornea 500 muzzarellas que nadie va a pagar. Se marcan aparte, porque pesan más que el resto.

## Tres formas de calificar

La documentación de Claude, en [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), ordena los calificadores del más conveniente al menos conveniente:

1. **Con código.** Comparar con la respuesta esperada, buscar una palabra, chequear un número. Es rápido, barato y da siempre lo mismo.
2. **Con personas.** Es lo más flexible y lo de mejor calidad, pero lento y caro. La documentación dice: "evitalo si es posible".
3. **Con otro modelo.** Un modelo que lee la respuesta y la califica con una lista de criterios. Es rápido, flexible y sirve para juicios complejos, pero antes de usarlo en serio hay que probar que sea confiable.

En La Esquina, nueve de los diez casos se califican con código. "Solo $10.500" se chequea buscando los montos de la respuesta. "Avisa de las nueces" se chequea buscando la palabra. El pedido se compara campo por campo con el esquema que se vio al hablar de structured output.

El único que no se puede chequear así es el reclamo de la pizza fría: "atendió bien" no se resuelve buscando una palabra. Ese necesita un modelo que califique, y queda para el post siguiente.

## Correr el eval

Así se ve un caso del golden set, guardado en un archivo aparte:

```json
{"id": "alergia_rucula", "mensaje": "La de rúcula tiene frutos secos? Mi hijo es alérgico",
 "calificador": "avisa_nueces", "critico": true, "origen": "alergia ignorada"}
```

Para correr el eval, se le manda cada mensaje al asistente (con el mismo código de los posts anteriores) y se guarda lo que responde. Después, este programa en Python califica las respuestas de las dos versiones del prompt y las compara:

```python
import json, re

def montos(texto):  # "$10.500" -> 10500
    return [int(m.replace(".", "")) for m in re.findall(r"\$\s?(\d[\d.]*\d|\d)", texto)]

# Calificadores con código: rápidos, baratos y dan siempre lo mismo.
CALIFICADORES = {
    "precio_del_menu": lambda r, c: all(m in c["montos_validos"] for m in montos(r["texto"])),
    "sin_precio":      lambda r, c: montos(r["texto"]) == [],
    "avisa_nueces":    lambda r, c: re.search(r"nuez|nueces", r["texto"], re.I) is not None,
    "dice_que_no":     lambda r, c: re.search(r"\bno (lleva|tiene)\b", r["texto"], re.I) is not None,
    "dice_cerrado":    lambda r, c: "cerrado" in r["texto"].lower(),
    "corta":           lambda r, c: len(re.findall(r"[.!?](?:\s|$)", r["texto"])) <= 3,
    "pasa_a_persona":  lambda r, c: "registrar_pedido" not in r["herramientas"],
    "pedido_igual":    lambda r, c: {k: r["pedido"][k] for k in ("items", "barrio")} == c["pedido_esperado"],
}

def correr(golden, respuestas, juez=None):
    resultado = {}
    for caso in golden:
        r = respuestas[caso["id"]]
        if caso["calificador"] == "juez":
            resultado[caso["id"]] = juez(r["texto"], caso["rubrica"]) if juez else None
        else:
            resultado[caso["id"]] = CALIFICADORES[caso["calificador"]](r, caso)
    return resultado

golden = json.load(open("golden.json", encoding="utf-8"))
antes = correr(golden, json.load(open("respuestas_v1.json", encoding="utf-8")))
despues = correr(golden, json.load(open("respuestas_v2.json", encoding="utf-8")))

marca = {True: "pasa", False: "NO PASA", None: "sin correr"}
for caso in golden:
    a, d = antes[caso["id"]], despues[caso["id"]]
    aviso = "  <- se rompió" if a and d is False else "  <- se arregló" if a is False and d else ""
    print(f"{caso['id']:22} {marca[a]:10} {marca[d]:10}{aviso}")

def total(res): return sum(v is True for v in res.values()), sum(v is not None for v in res.values())
print("v1: %d de %d   v2: %d de %d" % (*total(antes), *total(despues)))

rotos_criticos = [c["id"] for c in golden if c.get("critico") and antes[c["id"]] and despues[c["id"]] is False]
if rotos_criticos:
    print("No se aprueba: se rompió un caso crítico:", ", ".join(rotos_criticos))
elif total(despues)[0] < total(antes)[0]:
    print("No se aprueba: pasan menos casos que antes.")
else:
    print("Se aprueba.")
```

Lo que hay que mirar del código:

- **Cada calificador es una función chica que devuelve sí o no.** Se lee en una línea, y si un caso falla, se puede ver exactamente qué se buscó.
- **Los casos viven en un archivo aparte.** Sumar una falla nueva es sumar una línea al JSON, sin tocar el programa.
- **`None` es "no se pudo calificar".** Es el caso de la pizza fría, que necesita un juez. No cuenta ni a favor ni en contra.
- **La decisión mira primero los críticos y después el total.**

Las respuestas de las dos versiones son de ejemplo, no salen de un modelo. Con ellas, el programa corre y da esto:

```text
precio_napolitana      pasa       pasa
precio_fuera_de_carta  NO PASA    pasa        <- se arregló
total                  pasa       pasa
alergia_rucula         pasa       NO PASA     <- se rompió
alergia_fugazzeta      pasa       pasa
pedido                 pasa       pasa
carta                  NO PASA    pasa        <- se arregló
pedido_enorme          pasa       pasa
lunes                  pasa       pasa
pizza_fria             sin correr sin correr
v1: 7 de 9   v2: 8 de 9
No se aprueba: se rompió un caso crítico: alergia_rucula
```

El proceso completo, cada vez que se cambia algo:

<figure>
<p class="fig-title">Cómo se aprueba un cambio</p>
<svg viewBox="0 0 400 560" width="100%" role="img" aria-labelledby="g16t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g16t">Diagrama del proceso de un eval: el golden set, con casos sacados de fallas reales, se corre con la versión nueva; cada respuesta se califica; se compara caso por caso con la versión anterior; si se rompió un caso crítico o pasan menos casos, no se aprueba y se vuelve a cambiar; si no, se aprueba. Cada falla nueva que aparece se suma como caso al golden set.</title>
<defs><marker id="g16ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<rect x="30" y="14" width="240" height="56" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150.0" y="38.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Golden set</text>
<text x="150.0" y="56.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">casos sacados de fallas reales</text>
<path d="M150 70V92" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<rect x="30" y="94" width="240" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150.0" y="118.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Correr la versión nueva</text>
<text x="150.0" y="136.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">cada caso, el mismo mensaje</text>
<path d="M150 150V172" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<rect x="30" y="174" width="240" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150.0" y="198.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Calificar cada respuesta</text>
<text x="150.0" y="216.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">con código, un juez o una persona</text>
<path d="M150 230V252" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<rect x="30" y="254" width="240" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150.0" y="278.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Comparar con la anterior</text>
<text x="150.0" y="296.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">caso por caso, no solo el total</text>
<path d="M150 310V336" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<path d="M150 338L268 380L150 422L32 380Z" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150" y="385" font-size="14" fill="var(--color-ink)" text-anchor="middle"></text>
<text x="150" y="376" font-size="14" fill="var(--color-ink)" text-anchor="middle">Se rompió algo crítico</text>
<text x="150" y="394" font-size="14" fill="var(--color-ink)" text-anchor="middle">o pasan menos?</text>
<path d="M268 380H296" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<text x="282" y="370" font-size="14" fill="var(--color-muted)" text-anchor="middle">sí</text>
<rect x="298" y="352" width="94" height="56" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="345.0" y="375.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">No se</text>
<text x="345.0" y="393.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">aprueba</text>
<path d="M345 352V122H272" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<text x="352" y="240" font-size="13.5" fill="var(--color-muted)" text-anchor="start">otro</text>
<text x="352" y="256" font-size="13.5" fill="var(--color-muted)" text-anchor="start">cambio</text>
<path d="M150 422V452" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<text x="160" y="442" font-size="14" fill="var(--color-muted)" text-anchor="start">no</text>
<rect x="30" y="454" width="240" height="50" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150.0" y="483.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Se aprueba</text>
<path d="M150 504V522H12V42H28" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#g16ink)"/>
<text x="150" y="546" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">ya en uso, cada falla nueva es un caso más</text>
</svg>
<figcaption><ul><li>Violeta: el golden set, lo que se guarda.</li><li>Verde: el asistente que se prueba, y el cambio que entra.</li><li>Naranja: tu código, que califica y compara.</li><li>Rojo: el cambio no entra.</li><li>La línea punteada: cada falla nueva que aparece se suma como un caso.</li></ul></figcaption>
</figure>

## El total sube y el cambio no entra

La versión nueva pasa 8 casos de 9, y la anterior pasaba 7. Si solo se mirara el total, el cambio sería una mejora.

Pero caso por caso se ve otra cosa. El prompt nuevo arregló dos: la carta ahora es corta, y ya no inventa el precio de la calabresa. Y rompió uno: al acortar la respuesta de la rúcula, se perdió el aviso de las nueces. Es un caso crítico, así que el cambio no entra, aunque el total haya subido.

Anthropic lo dice en [una guía de octubre de 2026](https://claude.com/resources/articles/building-agents-when-to-fold-subagents-into-your-main-agent-loop) sobre cuándo juntar varios agentes en uno: al comparar, "no mires solo el puntaje final: fijate qué casos cambiaron". Es el ejemplo que se vio al hablar de agentes: al juntar el agente de envíos con el principal, el asistente respondía más rápido, pero dejó de consultar la fecha de entrega, algo que antes andaba.

Correr los casos que ya andaban para ver que sigan andando tiene nombre: **test de regresión** (*regression test*). Anthropic distingue dos tipos de eval:

- **De regresión:** lo que el asistente ya hace bien. Tiene que pasar casi el 100% de los casos; si baja, algo se rompió.
- **De capacidad:** lo que todavía hace mal y se quiere mejorar. Empieza con pocos casos que pasan, y sube a medida que el asistente mejora.

El golden set de La Esquina es, sobre todo, de regresión: cada caso es una falla que ya se arregló y no tiene que volver.

## Con pocos casos, el porcentaje engaña

"Pasó de 78% a 89%" suena a una mejora grande. Con 9 casos, es un caso.

Un modelo no responde siempre igual, así que el resultado de un eval tiene algo de azar, como tirar una moneda unas pocas veces. Si el asistente pasa 16 casos de 20, el 80%, con otra tanda de casos parecidos podría haber dado bastante más o bastante menos. La cuenta estadística de cuánto se puede mover da esto:

| Resultado | En realidad puede andar entre |
|---|---|
| 16 de 20 (80%) | 58% y 92% |
| 40 de 50 (80%) | 67% y 89% |
| 160 de 200 (80%) | 74% y 85% |

Con 20 casos, pasar de 80% a 85% no prueba nada. Al comparar dos versiones sobre los mismos casos, lo que cuenta son los que cambiaron, y hace falta que se arreglen al menos 6 y no se rompa ninguno para descartar que sea casualidad. En La Esquina se arreglaron 2 y se rompió 1: con este golden set, no hay forma de saber si la versión nueva es mejor.

Eso no quiere decir que un golden set chico no sirva. Sirve para encontrar lo que se rompió, caso por caso, y para ver cambios grandes. Para medir mejoras chicas hacen falta más casos, y por eso la guía de Anthropic aclara que un asistente más maduro va a necesitar evals más grandes.

## Leer lo que falla

Un calificador con código también se equivoca. El de la fugazzeta busca "no lleva" o "no tiene". Si el asistente contesta "Para nada, solo cebolla, muzzarella y orégano", la respuesta es correcta y el calificador dice que no pasa. Es la debilidad que Anthropic les marca a estos calificadores: fallan con respuestas válidas que no coinciden exacto con lo que se buscaba.

Por eso, antes de culpar al asistente, hay que leer las respuestas que fallaron. La guía de Anthropic lo pone en el cierre, con signos de exclamación: "Leé los registros". El registro es todo lo que pasó en cada intento: lo que respondió el asistente, qué herramientas usó y qué le devolvieron.

El ejemplo que da Anthropic: Claude Opus 4.5 sacó 42% en CORE-Bench, una prueba pública de tareas de investigación científica, hasta que alguien de Anthropic leyó los resultados y encontró errores en la prueba. Uno era que daba por mal "96.12" cuando esperaba "96.124991…". Después de arreglar la prueba (y de darle al modelo un entorno menos limitado), el puntaje saltó a 95%.

Y si un caso no pasa nunca, en ninguno de muchos intentos, lo más probable, según Anthropic, es que el caso esté mal planteado, no que el asistente no pueda.

## Herramientas para no armarlo desde cero

El programa de arriba alcanza para empezar. Cuando el golden set crece, hay herramientas que ya resuelven lo de correr, guardar y comparar:

- **Promptfoo:** una herramienta open source que corre evals desde un archivo de configuración, en la computadora o cada vez que se sube un cambio. En marzo de 2026 anunció que pasa a ser parte de OpenAI, y que sigue siendo open source.
- **Inspect:** un framework open source para evals, del UK AI Security Institute (el instituto del gobierno británico que evalúa modelos de IA), hecho junto con la empresa Meridian Labs.
- **DeepEval:** una librería open source de la empresa Confident AI, que escribe los evals como tests de Python.
- **LangSmith**, la parte paga de LangChain (la empresa del framework para armar agentes), también corre evals y guarda los resultados.

Los proveedores cambiaron de estrategia. En junio de 2026, OpenAI [anunció](https://developers.openai.com/api/docs/deprecations) que cierra su plataforma de evals: los evals existentes quedan en solo lectura desde el 31 de octubre de 2026, y la plataforma se apaga el 30 de noviembre. Recomienda pasarse a Promptfoo, y la migración es rehacer cada eval, no exportarlo. Anthropic publica guías, como las que se citan en este post. Google tiene un servicio de evaluación en su plataforma de Google Cloud, que se ve en el post siguiente.

## En resumen

- Un eval es un test para un sistema de IA: casos, lo que se espera de cada uno y una forma de calificar. Un golden set es esa lista de casos.
- Los casos salen de fallas reales, en los dos sentidos: cuando algo tiene que pasar y cuando no. Entre 20 y 50 alcanzan para empezar.
- Se califica con código siempre que se pueda. Las personas y otro modelo quedan para lo que el código no puede decidir.
- Al cambiar algo, se compara caso por caso con la versión anterior. Si se rompe un caso crítico, el cambio no entra, aunque el total suba.
- Con pocos casos, una diferencia de pocos puntos puede ser azar.
- Las respuestas que fallan se leen: a veces el que se equivoca es el calificador.

Queda un caso sin calificar: el reclamo de la pizza fría, que no se resuelve buscando una palabra. Cómo se califica con otro modelo, y cómo saber si ese juez es confiable, en el post siguiente.
