---
title: "Prompt caching: pagar una sola vez la parte que se repite"
date: 2026-10-29
order: 15
draft: true
description: "Cómo guardar la parte fija del prompt para no pagarla entera en cada mensaje: qué se guarda, por qué el principio tiene que coincidir, qué la rompe, cuándo conviene 5 minutos, 1 hora o nada, y cómo se mide en Claude, OpenAI y Gemini."
---

Volvamos al asistente de La Esquina. Cada vez que un cliente escribe, el pedido a la API lleva lo mismo adelante: las herramientas (`consultar_stock`, `registrar_pedido`), el system prompt con la carta, los horarios, las zonas de envío y las reglas, unos ejemplos de charlas y el esquema del pedido. Recién al final va lo nuevo: el mensaje del cliente.

Pongamos números de ejemplo, no medidos: 8.000 tokens fijos, 400 que cambian en cada mensaje y 300 mensajes por día. Con los precios de Claude Opus 5.5 (USD 4 por millón de tokens de entrada), cada mensaje cuesta USD 0,0336 solo en lo que se manda. Y casi todo eso son los 8.000 tokens que son iguales en los 300 mensajes del día.

El modelo procesa esa parte fija 300 veces, siempre igual. **Prompt caching**, o caché del prompt, es la forma de pagarla entera una sola vez.

## Qué se guarda y qué no

Una **caché** es una copia guardada de algo ya calculado, para no tener que calcularlo de nuevo.

Antes de escribir una sola palabra, el modelo lee todo el prompt y hace unos cálculos intermedios por cada token. Eso es lo que se guarda: el resultado de procesar la parte del principio. Si el pedido siguiente empieza exactamente igual, el proveedor usa esos cálculos y el modelo solo procesa lo nuevo.

Dos cosas que no es:

- **No guarda la respuesta.** El modelo responde de nuevo cada vez. Anthropic lo dice así: la caché "has no effect on output token generation", no cambia en nada la respuesta.
- **No es guardar la conversación.** Como se vio al hablar de cómo funciona un modelo, algunos proveedores pueden guardar el historial de su lado, pero igual se lo pasan entero al modelo y el modelo lo procesa entero. La caché es lo que evita ese segundo procesamiento.

Y una que ya se vio con la ventana de contexto: lo que viene de la caché sale más barato, pero sigue ocupando lugar en la ventana.

## El principio tiene que coincidir, token por token

La caché funciona con el **prefijo**: la parte del principio del prompt, desde el primer token hasta donde se marca que se guarde. Para que sirva, el prefijo del pedido nuevo tiene que ser idéntico al guardado. No parecido: idéntico. Anthropic pide "100 percent identical prompt segments".

Y el orden importa. En Claude, el pedido se arma siempre igual: primero las herramientas, después el system prompt, después los mensajes. Si algo cambia en un lugar, todo lo que viene después deja de coincidir y se procesa de nuevo, aunque el resto sea igual.

<figure>
<p class="fig-title">Lo que coincide y lo que no</p>
<div class="tok-row"><div class="tok-head"><span>20:14, el primero</span></div><div class="tok-text"><span class="tok c2">Herramientas</span><span class="tok c2">System: carta, reglas, ejemplos</span><span class="tok c2">Esquema del pedido</span><span class="tok c4">Son las 20:14. "quiero 2 muzzas"</span></div></div>
<div class="tok-row"><div class="tok-head"><span>20:15, otro cliente</span></div><div class="tok-text"><span class="tok c0">Herramientas</span><span class="tok c0">System: carta, reglas, ejemplos</span><span class="tok c0">Esquema del pedido</span><span class="tok c4">Son las 20:15. "tienen fainá?"</span></div></div>
<div class="tok-row"><div class="tok-head"><span>20:16, con la hora en el system</span></div><div class="tok-text"><span class="tok c0">Herramientas</span><span class="tok c3">System: son las 20:16, carta, reglas...</span><span class="tok c3">Esquema del pedido</span><span class="tok c4">"una napo"</span></div></div>
<figcaption><ul><li>Naranja: lo que se procesa y se guarda la primera vez.</li><li>Violeta: lo que se lee de la caché.</li><li>Celeste: lo nuevo de cada pedido, que se paga entero.</li><li>Rojo: desde el primer token distinto, nada se aprovecha, aunque la carta y el esquema sean los mismos.</li><li>La marca de hasta dónde guardar va al final de la parte fija, antes del mensaje.</li></ul></figcaption>
</figure>

De ahí sale la regla que dan los tres grandes proveedores: lo fijo arriba, lo que cambia abajo.

## Escribir, leer y vencerse

La caché tiene tres momentos, y cada uno se cobra distinto:

- **Escribir.** El primer pedido procesa la parte fija y la guarda. En Claude, guardarla por 5 minutos cuesta 1,25 veces el precio normal de entrada.
- **Leer.** Los pedidos siguientes que empiezan igual la leen. En Opus 5.5, leer cuesta el 5% del precio de entrada (en la mayoría de los modelos de Anthropic, el 10%).
- **Vencerse.** Si pasan 5 minutos sin que nadie la use, se borra, y el próximo pedido la vuelve a escribir. Cada lectura renueva el plazo sin costo extra. Ese plazo se suele llamar **TTL** ("time to live", tiempo de vida), y corre desde que empieza el pedido, no desde que termina la respuesta.

<figure>
<p class="fig-title">Tres pedidos de La Esquina</p>
<svg viewBox="0 0 400 440" width="100%" role="img" aria-labelledby="g15t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g15t">Diagrama de secuencia entre tu código, la API y la caché: el primer pedido escribe la parte fija, el segundo, tres minutos después, la lee y renueva el plazo, y el tercero llega 36 minutos después, cuando ya se venció, y la vuelve a escribir.</title>
<defs><marker id="g15c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(55% 0.15 300)"/></marker><marker id="g15c2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(58% 0.13 70)"/></marker><marker id="g15c3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(55% 0.17 25)"/></marker></defs>
<path d="M60 58V430" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M200 58V430" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M340 58V430" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<rect x="4" y="14" width="112" height="44" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="60.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Tu código</text>
<rect x="144" y="14" width="112" height="44" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">API</text>
<rect x="284" y="14" width="112" height="44" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="340.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Caché</text>
<path d="M64 112H196" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g15c2)"/>
<text x="130.0" y="87" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">16:00: parte fija</text>
<text x="130.0" y="104" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">+ mensaje 1</text>
<path d="M204 172H336" fill="none" stroke="oklch(55% 0.15 300)" stroke-width="1.6" marker-end="url(#g15c0)"/>
<text x="270.0" y="147" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">escribe la parte fija</text>
<text x="270.0" y="164" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">1,25 veces, 5 min</text>
<path d="M64 232H196" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g15c2)"/>
<text x="130.0" y="207" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">16:03: parte fija</text>
<text x="130.0" y="224" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">+ mensaje 2</text>
<path d="M336 292H204" fill="none" stroke="oklch(55% 0.15 300)" stroke-width="1.6" marker-end="url(#g15c0)"/>
<text x="270.0" y="267" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">lee: 5% del precio</text>
<text x="270.0" y="284" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">y renueva los 5 min</text>
<path d="M64 352H196" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g15c2)"/>
<text x="130.0" y="344" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">16:39: 36 min después</text>
<path d="M204 412H336" fill="none" stroke="oklch(55% 0.17 25)" stroke-width="1.6" marker-end="url(#g15c3)"/>
<text x="270.0" y="387" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">ya se venció:</text>
<text x="270.0" y="404" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">escribe de nuevo</text>
</svg>
<figcaption><ul><li>Naranja: tu código, que manda la parte fija y el mensaje.</li><li>Verde: la API de Claude.</li><li>Violeta: la caché.</li><li>Rojo: el mensaje llegó cuando la caché ya se había vencido.</li><li>Con la caché de 1 hora, el último paso sería otra lectura.</li></ul></figcaption>
</figure>

Con los precios de Opus 5.5, un mensaje de La Esquina sale así:

- **Sin caché:** (8.000 + 400) tokens × USD 4 por millón = USD 0,0336.
- **El primero, que escribe:** 8.000 × USD 5 por millón + 400 × USD 4 por millón = USD 0,0416. Más caro que sin caché.
- **El siguiente, que lee:** 8.000 × USD 0,20 por millón + 400 × USD 4 por millón = USD 0,0032. Diez veces menos.

La escritura se recupera con una sola lectura. Anthropic lo dice en su página de precios: la caché de 5 minutos conviene desde la primera lectura.

## Dónde va la marca

En Claude, la caché se pide con `cache_control`, que marca hasta dónde se guarda. Hay dos formas:

- **Automática:** `cache_control` arriba de todo en el pedido, y la marca va sola al último bloque. Sirve para una charla que crece: cada mensaje nuevo guarda todo lo anterior.
- **Explícita:** `cache_control` en un bloque concreto, hasta cuatro marcas por pedido.

Acá está la trampa más común. En La Esquina, el último bloque es el mensaje del cliente, que cambia siempre. Con la automática, la marca queda en ese mensaje: cada pedido guarda algo que el siguiente no va a repetir, y entre clientes distintos nunca acierta. Anthropic lo pone como error común en su documentación: se paga una escritura en cada pedido "and never get a read", y nunca se lee. OpenAI tiene la misma advertencia con otras palabras: "a shared prefix is not always a cached prefix", un principio compartido no siempre es un principio guardado.

La marca va al final de la parte fija:

```python
import anthropic

client = anthropic.Anthropic()

# La parte fija: carta, reglas, horarios, zonas de envío y ejemplos. Igual en cada pedido.
PARTE_FIJA = open("la_esquina.txt", encoding="utf-8").read()

# Siempre las mismas herramientas, en el mismo orden.
HERRAMIENTAS = [
    {"name": "consultar_stock", "description": "Dice si hay un producto hoy.",
     "input_schema": {"type": "object", "properties": {"producto": {"type": "string"}},
                      "required": ["producto"]}},
    {"name": "registrar_pedido", "description": "Registra un pedido confirmado.",
     "input_schema": {"type": "object", "properties": {"detalle": {"type": "string"}},
                      "required": ["detalle"]}},
]

def responder(mensaje, hora):
    r = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        tools=HERRAMIENTAS,
        system=[{
            "type": "text",
            "text": PARTE_FIJA,
            "cache_control": {"type": "ephemeral", "ttl": "1h"},  # se guarda hasta acá
        }],
        # Lo que cambia va después de la marca: la hora y el mensaje del cliente.
        messages=[{"role": "user", "content": f"Son las {hora}. Cliente: {mensaje}"}],
    )
    u = r.usage
    total = u.cache_read_input_tokens + u.cache_creation_input_tokens + u.input_tokens
    print(f"leído de caché: {u.cache_read_input_tokens} | escrito: {u.cache_creation_input_tokens} "
          f"| sin caché: {u.input_tokens} | aciertos: {u.cache_read_input_tokens / total:.0%}")
    return r
```

Lo que hay que mirar:

- **`cache_control` va en el último bloque de la parte fija.** Como las herramientas van antes que el system prompt, quedan adentro de lo que se guarda.
- **`"ttl": "1h"` guarda por una hora.** Sin `ttl`, son 5 minutos. Por qué una hora en La Esquina, más abajo.
- **La hora está en el mensaje, no en el system prompt.** Va después de la marca.
- **`usage` dice qué pasó.** `cache_creation_input_tokens` es lo que se escribió, `cache_read_input_tokens` lo que se leyó, e `input_tokens` lo que vino después de la marca, que se paga entero.

En dos pedidos seguidos, se vería algo así:

```text
leído de caché: 0 | escrito: 8000 | sin caché: 410 | aciertos: 0%
leído de caché: 8000 | escrito: 0 | sin caché: 395 | aciertos: 95%
```

Los números de esa salida son de ejemplo. El código se probó sin conectar con la API: lo que el SDK manda tiene la forma que pide la documentación, y la lectura de `usage` funciona con respuestas simuladas. La llamada real a Claude necesita clave y no está probada acá.

Un detalle más: si la parte fija no llega a un mínimo de tokens, no se guarda, y la API no avisa. En los modelos 5.x de Claude el mínimo es de 512 tokens. El system prompt corto que se vio al hablar de prompting, de unas pocas líneas, no llegaría. Si los dos campos de caché vienen en 0, es lo primero que hay que revisar.

## Qué la rompe

La caché se pierde cada vez que algo cambia antes de la marca. Con La Esquina, los errores típicos son estos:

- **La hora en el system prompt.** "Son las 20:14" arriba de todo hace que cada pedido tenga un principio distinto. Cada pedido escribe y ninguno lee: con los números de arriba, sale 23,8% más caro que no usar caché. La hora va en el mensaje.
- **El stock del día dentro de la carta.** Escribir "hoy no hay fainá" adentro de la carta cambia la parte fija cada vez que se acaba algo. El stock va en el mensaje, o se consulta con `consultar_stock`. Cambiar los precios una vez por semana sí puede ir en la carta: es una escritura nueva y listo.
- **Herramientas que cambian.** Sacar `registrar_pedido` cuando el cliente solo pregunta, o armar la lista en otro orden: como las herramientas van primero, rompe todo. Mismas herramientas, mismo orden, siempre. Para limitar cuáles puede usar en un momento, hay opciones que no tocan la lista, como `tool_choice` en Claude o `allowed_tools` en OpenAI.
- **Cambiar de modelo a mitad de la charla.** La caché es de cada modelo. Pasar a uno más barato para una pregunta fácil obliga a escribir todo de nuevo en el otro.
- **Cambiar el esfuerzo de razonamiento o el formato de salida.** Los dos están entre lo que invalida la caché, en Claude y en OpenAI. Se eligen al principio y no se tocan.

A Anthropic le pasó con Claude Code, su asistente de programación que trabaja en la terminal. En un artículo de 2026, [Lessons from building Claude Code: Prompt caching is everything](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything), cuenta que rompieron su propia caché "putting an in-depth timestamp in the static system prompt" (poniendo la fecha y hora detallada en el system prompt fijo) y "shuffling tool order definitions non-deterministically" (cambiando el orden de las herramientas sin querer).

Para encontrar qué cambió, Claude tiene un diagnóstico: se le pasa el identificador de la respuesta anterior y dice qué cambió, por ejemplo `model_changed` o `system_changed`. Para `system_changed`, la documentación dice cuál es la causa típica: una fecha u hora metida en el system prompt.

## La tarde de La Esquina: 5 minutos, 1 hora o nada

Los 300 mensajes no llegan parejos. Al mediodía y a la noche, más de uno por minuto. A las 4 de la tarde, uno cada 36 minutos. Y la caché de 5 minutos se vence entre mensaje y mensaje.

Con los precios de Opus 5.5, la parte fija de esos 5 mensajes de la tarde cuesta:

- **Sin caché:** 5 × USD 0,032 = USD 0,16.
- **Caché de 5 minutos:** cada mensaje llega cuando ya se venció, así que los 5 escriben: 5 × USD 0,04 = USD 0,20. Un 25% más caro que no usar caché.
- **Caché de 1 hora:** escribir cuesta 2 veces la entrada, pero se escribe una vez y las otras 4 leen: USD 0,064 + 4 × USD 0,0016 = USD 0,07.

En el día entero, con un horario de ejemplo de 300 mensajes:

| | Escrituras | Lecturas | Aciertos | Entrada por día | Por mes, con la salida |
|---|---|---|---|---|---|
| Sin caché | | | | USD 10,08 | USD 329 |
| Caché de 5 minutos | 34 | 266 | 84% | USD 2,27 | USD 95 |
| Caché de 1 hora | 1 | 299 | 95% | USD 1,02 | USD 58 |
| La hora en el system prompt | 300 | 0 | 0% | USD 12,48 | |

La caché de 5 minutos baja lo que se manda un 77,5%, y la de 1 hora, casi un 90%. Con 1 hora, el día entero escribe una sola vez, porque ningún hueco pasa de 60 minutos. Las 34 escrituras de la de 5 minutos salen de las horas tranquilas. Lo que responde el modelo cuesta igual en los tres casos: la caché solo abarata lo que se manda.

La regla, que coincide con la que da Anthropic:

- **Si los mensajes llegan con menos de 5 minutos entre sí:** alcanza la de 5 minutos, que se renueva sola con cada uno.
- **Si hay huecos de entre 5 minutos y 1 hora:** la de 1 hora, siempre que en esa hora haya al menos 2 lecturas. Con una sola, no recupera lo que costó escribir.
- **Si la parte fija se usa menos de una vez por hora** (un local que recibe tres mensajes por día): no conviene. Cada mensaje paga la escritura y nadie la lee.

En Claude, además, lo que se lee de la caché no cuenta para el límite de tokens por minuto en la mayoría de los modelos. Con 80% de aciertos, entran cinco veces más tokens por minuto. En OpenAI, sí cuenta.

## Cómo se mide

La métrica es el **hit rate**, la tasa de aciertos: qué porcentaje de los tokens de entrada vino de la caché. Cada API lo devuelve en la respuesta, en `usage`, y la cuenta cambia un poco según el proveedor (ver la tabla de abajo). En Claude, `input_tokens` es solo lo que va después de la marca, así que el total se arma sumando los tres campos, como en el código.

Para Anthropic es una métrica de primera. En el mismo artículo sobre Claude Code dice que tienen alertas sobre el hit rate y que, si baja demasiado, lo tratan como una falla del servicio: "A few percentage points of cache miss rate can dramatically affect cost and latency", unos pocos puntos de fallos de caché pueden cambiar mucho el costo y la velocidad.

Porque también es velocidad: el modelo no vuelve a procesar la parte fija, y la respuesta empieza antes. Anthropic dice que con documentos largos "generally" mejora el tiempo hasta el primer token, sin dar un número para los modelos de hoy.

## Lo mismo en los tres

OpenAI es la empresa de ChatGPT; Google ofrece sus modelos Gemini. Los dos tienen caché, con diferencias:

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Cómo se activa | `cache_control`: arriba de todo (automática) o en un bloque (hasta 4 marcas) | Sola. Desde GPT-5.6 también se puede elegir dónde corta | Sola. En Gemini 4 Argon no hay otra opción |
| Leer | 10% de la entrada (5% en Opus 5.5 y Sonnet 5.5) | 10% (5% en GPT-6.1 Sol y Terra) | 5% en Argon |
| Escribir | 1,25 veces (5 minutos) o 2 veces (1 hora) | 1,25 veces (30 minutos) o 2,5 veces (12 horas) | Al precio normal de entrada |
| Cuánto dura | 5 minutos o 1 hora; cada uso lo renueva | 30 minutos o 12 horas como mínimo | No lo publica |
| Mínimo | 512 tokens en los modelos 5.x | 1.024 tokens | Unos 4.000 tokens (sus páginas dan 4.096 o 6.144) |
| Campos | `cache_read_input_tokens`, `cache_creation_input_tokens` | `cached_tokens`, `cache_write_tokens` | `cached_content_token_count` |
| Cuenta para el límite por minuto | No, en casi todos los modelos | Sí | Sí |

En OpenAI, los precios de escritura son para GPT-5.6 en adelante: los modelos anteriores no cobran extra por escribir. En Gemini, la caché automática no garantiza el ahorro, según su propia documentación: aprovecha lo que coincide cuando puede.

Los tres dan el mismo consejo: lo fijo arriba, lo que cambia abajo, y no tocar las herramientas.

## En resumen

- La caché guarda el procesamiento de la parte del principio del prompt que se repite. No guarda la respuesta.
- Solo sirve si el principio coincide exacto, token por token. Lo fijo va arriba y lo que cambia, abajo.
- Escribir la caché cuesta un poco más que la entrada normal; leerla, mucho menos (5% o 10%).
- La marca va al final de la parte fija, no en el mensaje del cliente. Si no, se escribe siempre y no se lee nunca.
- La hora o el stock en el system prompt, las herramientas que cambian, o cambiar de modelo a mitad de la charla, la rompen.
- Se vence si no se usa. Con pocos mensajes, la de 5 minutos puede salir más cara que no usar caché; la de 1 hora cubre los huecos.
- Se mide con el hit rate, que cada API devuelve en la respuesta.

Hasta acá, el asistente responde bien y sale más barato. Más adelante en la serie: cómo saber, con números, si responde bien.
