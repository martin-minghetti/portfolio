---
title: "Observabilidad: qué le pasa a tu asistente con clientes reales"
date: 2026-11-01
order: 18
draft: true
description: "Qué registrar de cada mensaje, qué es una traza, por qué lo que tarda se mira con percentiles y lo que cuesta por pedido y no por llamada, los errores que no se ven, y cómo lo resuelven Claude, GPT y Gemini con OpenTelemetry."
---

El asistente de La Esquina pasó los evals y ya atiende clientes. Un viernes a la noche, el dueño escucha a dos clientes decir lo mismo: "el bot tarda". Abre lo que tiene y no hay nada que mirar. No sabe qué mensajes tardaron, ni cuánto, ni por qué. Puede ser el modelo, el sistema de stock o la conexión del local.

Los evals prueban el asistente con casos guardados, antes de cambiar algo. Lo que pasa con los clientes de verdad, todos los días, es otra cosa, y para eso está la observabilidad.

## Qué es observabilidad

**Observabilidad** es poder responder, sin adivinar, qué le pasó a un mensaje: qué entró, qué respondió el modelo, qué herramientas usó y qué devolvieron, cuánto tardó cada paso, cuánto costó y si hubo un error.

Para eso hace falta un **registro** (en inglés, log): lo que se anota de cada mensaje mientras el asistente atiende. Para La Esquina, una línea por cada mensaje del cliente con la charla a la que pertenece, la hora, cada llamada al modelo (cómo terminó y cuántos tokens usó), las herramientas que pidió, el error si hubo, y cuántos segundos esperó el cliente.

La palabra importante es "mensaje". Cuando un cliente escribe "Hay napolitana? Mandame dos", el asistente no hace una sola llamada al modelo. Como se vio con los agentes, hace una para pedir la herramienta, tu código consulta el stock, y hace otra para responder. Si se registra solo cada llamada, lo que espera el cliente y lo que cuesta atenderlo no aparecen en ningún lado.

## La traza: un mensaje, varios pasos

El registro completo de un mensaje, con todos sus pasos, se llama **traza** (en inglés, trace). Cada paso dentro de la traza, sea una llamada al modelo o una herramienta, es un **paso** (en inglés, span). Anthropic lo define así en su documentación: "A trace is the full record of one request through your system. A span is one step in a trace, such as a model request or a tool use."

Así se ve la traza del mensaje que tardó:

<figure>
<p class="fig-title">Una traza: dónde se fueron los 9 segundos</p>
<svg viewBox="0 0 400 330" width="100%" role="img" aria-labelledby="g18t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g18t">Diagrama de una traza: el mensaje del cliente 'Hay napolitana? Mandame dos' tardó 9 segundos en total. La primera llamada al modelo duró 2,3 segundos y pidió consultar el stock; la consulta al sistema de stock tardó 5,1 segundos; la segunda llamada al modelo duró 1,6 segundos y respondió. Casi todo el tiempo se fue en la herramienta, no en el modelo.</title>
<defs></defs>
<text x="104" y="30" font-size="14" fill="var(--color-ink)" text-anchor="start">Hay napolitana? Mandame dos</text>
<path d="M112 44V292" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<text x="112" y="312" font-size="13" fill="var(--color-muted)" text-anchor="middle">0 s</text>
<path d="M202 44V292" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<text x="202" y="312" font-size="13" fill="var(--color-muted)" text-anchor="middle">3 s</text>
<path d="M292 44V292" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<text x="292" y="312" font-size="13" fill="var(--color-muted)" text-anchor="middle">6 s</text>
<path d="M382 44V292" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<text x="382" y="312" font-size="13" fill="var(--color-muted)" text-anchor="middle">9 s</text>
<text x="104" y="77" font-size="14" fill="var(--color-ink)" text-anchor="end">Mensaje</text>
<rect x="112" y="52" width="270.0" height="40" rx="6" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="247.0" y="76.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">9,0 s en total</text>
<text x="104" y="137" font-size="14" fill="var(--color-ink)" text-anchor="end">Modelo</text>
<rect x="112" y="112" width="69.0" height="40" rx="6" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="146.5" y="136.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">2,3 s</text>
<text x="104" y="197" font-size="14" fill="var(--color-ink)" text-anchor="end">Stock</text>
<rect x="181.0" y="172" width="153.00000000000003" height="40" rx="6" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="257.5" y="196.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">5,1 s</text>
<text x="104" y="257" font-size="14" fill="var(--color-ink)" text-anchor="end">Modelo</text>
<rect x="334.0" y="232" width="47.999999999999986" height="40" rx="6" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="358.0" y="256.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">1,6 s</text>
</svg>
<figcaption><ul><li>Celeste: el mensaje del cliente, de punta a punta: lo que espera.</li><li>Verde: cada llamada al modelo. La primera pide la herramienta; la segunda responde.</li><li>Naranja: la herramienta que corre tu código. El sistema de stock tardó 5,1 de los 9 segundos.</li><li>Sin la traza, el registro solo diría 9 segundos, y la culpa iba al modelo.</li></ul></figcaption>
</figure>

El cliente esperó 9 segundos, y el modelo usó menos de 4. El resto fue el sistema de stock. Sin la traza, el registro diría "9 segundos" y la culpa iba al modelo. Con la traza, se ve que lo que hay que arreglar es la consulta al stock.

Google lo explica bien en la documentación de su kit para armar agentes: las métricas dicen cuánto tardó algo, los registros dicen qué pasó, y las trazas "connect these events, showing you exactly *where* the time was spent" (conectan esos eventos y muestran dónde se fue el tiempo).

## Lo que tarda: el promedio engaña

Lo que tarda el asistente en responder se llama **latencia**. La primera tentación es mirar el promedio. Con estos 20 mensajes de ejemplo, en segundos:

```text
2,1  2,3  2,4  2,5  2,6  2,6  2,7  2,8  2,9  3,0
3,0  3,1  3,2  3,3  3,5  3,6  3,8  9,0  9,4  41,0
```

El promedio da 5,4 segundos. Pero 17 de los 20 clientes esperaron menos de 4, y uno esperó 41. Ese solo mensaje sube el promedio de 3,6 a 5,4. El promedio no describe a nadie: ni a los 17 que esperaron poco, ni al que esperó 41.

Por eso se usan **percentiles**: el valor que deja abajo a cierto porcentaje de los mensajes.

- **La mediana, o p50:** la mitad de los mensajes tarda menos que eso. Acá, 3 segundos. El mensaje de 41 no la mueve.
- **El p95:** el 95% de los mensajes tarda menos que eso. Acá, 9,4 segundos. El 5% más lento tarda eso o más.
- **El p99, o el máximo:** para ver al cliente de 41 segundos. Con 20 mensajes el p99 es el máximo; con miles, son cosas distintas.

No es una idea nueva. Google la cuenta en su libro sobre cómo opera sus servicios (el libro de SRE, por ingeniería de confiabilidad, en inglés), en el capítulo sobre monitoreo: "If you run a web service with an average latency of 100 ms at 1,000 requests per second, 1% of requests might easily take 5 seconds."

### En un agente, lo raro se vuelve común

El mismo capítulo tiene otra frase que pega justo con los agentes: "the 99th percentile of one backend can easily become the median response of your frontend". En La Esquina quiere decir esto: si cada llamada al modelo tiene un 5% de probabilidad de ser lenta, un mensaje que hace varias llamadas tiene más chances de que alguna lo sea.

| Llamadas en el mensaje | Al menos una entre el 5% más lento | Al menos una entre el 1% más lento |
|---|---|---|
| 1 | 5,0% | 1,0% |
| 2 | 9,8% | 2,0% |
| 3 | 14,3% | 3,0% |
| 6 | 26,5% | 5,9% |

La cuenta supone que cada llamada es lenta o no por su cuenta. Un pedido completo en La Esquina son seis llamadas: con eso, uno de cada cuatro pedidos tiene al menos una llamada en el 5% más lento. Por eso lo que tarda se mide por mensaje del cliente, no por llamada.

Un dato más, si el asistente responde de a pedazos a medida que el modelo escribe (en inglés, streaming): ahí importa también el **tiempo hasta la primera palabra**, lo que el cliente espera antes de ver algo. OpenAI explica por qué: "Prompt tokens add little latency to completion calls. Time to generate completion tokens is much longer, as tokens are generated one at a time." Lo que lee el modelo pesa poco; lo que escribe, mucho.

## Lo que cuesta: por pedido, no por llamada

Con el costo pasa lo mismo que con el tiempo: depende de qué se cuente. Un día de ejemplo de La Esquina, con los mismos números que se usaron al hablar del caching: 100 charlas, 300 mensajes, 8.000 tokens fijos que se leen de la caché, y Claude Opus 5.5 (USD 4 por millón de tokens de entrada, USD 0,20 por millón leídos de la caché y USD 20 por millón de salida). De las 100 charlas, 60 terminan en pedido. Un pedido completo son seis llamadas, porque el historial crece en cada vuelta; una charla que no compra, tres.

| Qué se mide | Costo |
|---|---|
| Cada llamada al modelo | USD 0,0063 |
| Cada mensaje del cliente | USD 0,0100 |
| Cada charla | USD 0,0301 |
| Cada pedido registrado | USD 0,0502 |

El día cuesta USD 3,01, unos USD 90 por mes. La misma cuenta da 0,006 o 0,05 dólares según qué se divida. Al dueño le importa la última: cuánto cuesta cada pedido, contando también las charlas que no compran. Es ocho veces más que una llamada.

OpenAI lo dice en su guía de agentes: "Compare the cost of completing the same task at the quality and latency your application needs." Que la caché acierte mucho no dice cuánto cuesta terminar la tarea. Cómo bajar ese número es otro tema, más adelante en la serie.

## Los errores que no se ven

La librería de Anthropic para Python (el SDK) reintenta sola cuando la API falla por algo pasajero. Anthropic lo dice en su documentación: "The official SDK automatically retries transient failures (such as connection errors, rate limits, and 5xx server errors) with exponential backoff, twice by default."

Es una ayuda, pero tiene una contracara. En una prueba sin conectar con la API, con respuestas simuladas, la API devolvió primero un error 529 (sobrecarga) y después una respuesta buena. El SDK reintentó solo y tu código recibió la respuesta buena, como si nada hubiera pasado. El único rastro quedó en la traza: un campo que dice que el pedido se mandó dos veces. Sin trazas, el reintento no existe: el registro muestra un mensaje más lento y nada más.

Por eso conviene registrar dos cosas más:

- **El número de cada pedido.** La API le pone uno a cada respuesta, en el encabezado `request-id` ("Every API response includes a unique `request-id` header"), y el SDK lo da como `_request_id`. Si algo falla, es lo que se le pasa al soporte del proveedor. Cuando hay un error, también viene en el error.
- **Lo que tardan los errores, aparte.** Un mensaje que falla rápido y uno que falla después de 30 segundos no son lo mismo. El libro de SRE lo resume así: "a slow error is even worse than a fast error!" Si se mezclan con los que salen bien, los errores rápidos hacen parecer que el asistente anda más rápido de lo que anda.

## Cómo se ve en código

Con la API de Claude, en Python, el loop del agente que ya se vio en la serie, con una línea de registro por cada mensaje del cliente:

```python
import json, time
import anthropic

client = anthropic.Anthropic()

def atender(conversacion, mensajes, ejecutar_herramientas, **pedido):
    """Corre el loop del agente para un mensaje del cliente y deja una línea en el registro."""
    fila = {"conversacion": conversacion, "hora": time.strftime("%H:%M:%S"),
            "llamadas": [], "herramientas": [], "error": None}
    inicio = time.monotonic()
    try:
        for vuelta in range(10):  # el tope de vueltas
            r = client.messages.create(messages=mensajes, **pedido)
            u = r.usage
            fila["llamadas"].append({"request_id": r._request_id, "fin": r.stop_reason,
                                     "sin_cache": u.input_tokens, "cache": u.cache_read_input_tokens or 0,
                                     "escrito": u.cache_creation_input_tokens or 0, "salida": u.output_tokens})
            mensajes.append({"role": "assistant", "content": r.content})
            if r.stop_reason != "tool_use":
                return r
            fila["herramientas"] += [b.name for b in r.content if b.type == "tool_use"]
            mensajes.append({"role": "user", "content": ejecutar_herramientas(r.content)})
        fila["error"] = "tope_de_vueltas"
    except anthropic.APIError as e:
        fila["error"] = type(e).__name__
        fila["request_id_error"] = getattr(e, "request_id", None)  # para reclamarle al proveedor
        raise
    finally:
        fila["segundos"] = round(time.monotonic() - inicio, 2)
        with open("registro.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(fila, ensure_ascii=False) + "\n")
```

Una línea del registro, de una prueba con respuestas simuladas:

```text
{"conversacion": "c001", "hora": "12:27:01", "llamadas": [{"request_id": "req_1", "fin": "tool_use", "sin_cache": 450, "cache": 8000, "escrito": 0, "salida": 90}, {"request_id": "req_2", "fin": "end_turn", "sin_cache": 450, "cache": 8000, "escrito": 0, "salida": 90}], "herramientas": ["consultar_stock"], "error": null, "segundos": 0.01}
```

Cuatro cosas para mirar:

- El `finally` escribe la línea pase lo que pase: con respuesta, con error o al llegar al tope de vueltas.
- `segundos` mide el mensaje entero, herramientas incluidas: es lo que espera el cliente.
- `fin` dice cómo terminó cada llamada. Si aparece `max_tokens`, la respuesta se cortó.
- Se guardan tokens, no texto: el registro no tiene lo que escribió el cliente. Es una decisión, y se ve más abajo.

`ejecutar_herramientas` es la función que corre las herramientas, la misma que se vio con los agentes. Y `conversacion` es un número propio de la charla, no el teléfono del cliente.

Con ese registro, sacar los números del día lleva otras 25 líneas:

```python
import json, math, statistics

filas = [json.loads(linea) for linea in open("registro.jsonl", encoding="utf-8")]

def percentil(valores, p):  # el valor que deja abajo al p% de los casos
    orden = sorted(valores)
    return orden[max(1, math.ceil(p / 100 * len(orden))) - 1]

def usd(c):  # precios de Claude Opus 5.5 por millón de tokens
    return (c["sin_cache"] * 4 + c["cache"] * 0.20 + c["escrito"] * 5 + c["salida"] * 20) / 1e6

seg = [f["segundos"] for f in filas]
print(f"{len(filas)} mensajes | promedio {statistics.mean(seg):.1f} s | p50 {percentil(seg, 50):.1f} s "
      f"| p95 {percentil(seg, 95):.1f} s | p99 {percentil(seg, 99):.1f} s")

total = sum(usd(c) for f in filas for c in f["llamadas"])
llamadas = sum(len(f["llamadas"]) for f in filas)
charlas = len({f["conversacion"] for f in filas})
pedidos = sum("registrar_pedido" in f["herramientas"] for f in filas)
print(f"USD {total:.2f} | por llamada {total / llamadas:.4f} | por charla {total / charlas:.4f}")
if pedidos:
    print(f"por pedido registrado: USD {total / pedidos:.4f} ({pedidos} pedidos)")

errores = [f for f in filas if f["error"]]
print(f"errores: {len(errores)} de {len(filas)} mensajes")
```

Sobre un registro de ejemplo de 300 mensajes, armado para la prueba (no salió de un modelo):

```text
300 mensajes | promedio 4.5 s | p50 4.4 s | p95 7.4 s | p99 18.2 s
USD 2.97 | por llamada 0.0063 | por charla 0.0297
por pedido registrado: USD 0.0496 (60 pedidos)
errores: 3 de 300 mensajes
```

### Lo mismo, con el estándar

Armar el registro propio sirve para entender qué se guarda. En la práctica, el SDK lo puede hacer por vos con **OpenTelemetry**: un estándar abierto para registrar trazas, que aceptan casi todas las plataformas de monitoreo. Con el SDK de Anthropic alcanza con configurarlo al arrancar:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor

provider = TracerProvider()
provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))  # después, el de tu plataforma
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("la-esquina")

with tracer.start_as_current_span("mensaje_del_cliente"):
    ...  # el mismo loop de siempre: cada llamada al modelo queda adentro como un paso
```

Cada llamada al modelo aparece como un paso dentro de la traza del mensaje, con su número de pedido, cómo terminó, los tokens y lo que tardó, sin tocar las llamadas. Las herramientas que corre tu código hay que abrirlas como pasos propios, con otro `start_as_current_span`. Anthropic lo tiene en beta: avisa que los nombres de los campos pueden cambiar y pide fijar la versión del SDK.

Un detalle que confunde: en la traza, los tokens de entrada incluyen los de la caché, y en la respuesta de la API no. En una llamada de la prueba, la respuesta decía 400 tokens de entrada (lo que va después de la marca de caché, como se vio al hablar del caching) y la traza decía 8.400. Anthropic lo avisa: "`gen_ai.usage.input_tokens` already includes the tokens read from and written to the prompt cache, so don't add the cache attributes to it." Si se suman los dos, se cuenta doble.

## Qué mirar todos los días

Con el registro armado, la lista para La Esquina es corta:

- **Lo que tarda:** la mediana y el p95 por mensaje, con los errores aparte.
- **Lo que cuesta:** por charla y por pedido.
- **Errores y reintentos:** cuántos, y de qué tipo.
- **Cómo terminó cada llamada:** respuestas cortadas por `max_tokens` y charlas que llegaron al tope de vueltas.
- **Herramientas:** cuántas veces falla cada una y cuánto tarda. En el ejemplo, la culpable era una herramienta.
- **Controles que saltan:** cada vez que un guardrail frena algo, y cada charla que pasa a una persona.
- **El acierto de la caché**, como se vio al hablar del caching.

Falta la calidad: si el asistente responde bien. Eso no sale de los números. Se toma una muestra de charlas del día y se califica con el juez del post anterior. Con los números de ejemplo (1.500 tokens de entrada y 200 de salida por respuesta), calificar las 300 respuestas del día con Opus 5.5 cuesta USD 3, lo mismo que atender a los clientes. Con Haiku 5.5 cuesta menos de 8 centavos de dólar, pero un juez nuevo hay que volver a compararlo con una persona. Lo razonable es una muestra con el modelo grande, o todo con uno chico ya calibrado. Y además, leer algunas charlas cada semana: ninguna métrica reemplaza eso.

## Qué se guarda

El registro de La Esquina tiene datos de clientes: teléfonos, direcciones, a veces la alergia de un chico. Qué se guarda es una decisión, y cada proveedor hace algo distinto por defecto:

- **Anthropic**, en sus trazas, guarda solo datos de cada paso (tiempos, tokens, estado), sin el texto de la charla, salvo que se pida el contenido completo.
- **OpenAI**, en su kit para armar agentes (el Agents SDK), traza por defecto y guarda lo que entra y lo que sale de cada llamada: "By default, `trace_include_sensitive_data` is `True`."
- **Google**, en la consola web de Gemini (AI Studio), guarda los pedidos por defecto en los proyectos nuevos desde el 26 de octubre de 2026, solo en el plan pago. Los borra a los 55 días, salvo que se guarden como conjunto de datos.

Una regla simple: no usar el teléfono del cliente como número de la charla, porque ese número viaja a todas las trazas. Cómo tapar datos personales antes de guardarlos se ve más adelante en la serie.

### Alertas con poco tráfico

Una **alerta** es un aviso automático cuando un número se pasa de un límite. Con poco tráfico, los porcentajes engañan. Como se vio con el caching, a las 16 horas a La Esquina le llega un mensaje cada 36 minutos. Si en esa hora llegan dos mensajes y uno falla, el tablero dice "50% de errores", y no pasa nada grave. Con pocos mensajes, conviene avisar por cantidad de errores, o mirar ventanas de tiempo más largas.

## Herramientas y el estándar

No hace falta armar el tablero desde cero. Hay plataformas que reciben las trazas y las muestran, con gráficos y alertas:

- **Langfuse:** plataforma de observabilidad para aplicaciones con modelos, que se puede instalar en tu propio servidor. Desde enero de 2026 es de ClickHouse, una empresa de bases de datos.
- **LangSmith:** la parte paga de LangChain, que se vio al hablar de orquestación. Muestra paso a paso qué hizo un agente.
- **Arize Phoenix:** herramienta de Arize, una empresa de monitoreo para inteligencia artificial, para ver trazas y calificar respuestas. Es gratis y se puede instalar en tu servidor.
- **Braintrust:** plataforma paga de observabilidad y evals para agentes.

Casi todas reciben OpenTelemetry. Anthropic lista 16 plataformas asociadas que reciben sus trazas, entre ellas estas cuatro, y aclara que sirve "any observability platform that accepts OTLP" (cualquiera que acepte el formato del estándar). Eso importa, porque en 2026 varias de estas empresas cambiaron de dueño. Helicone, otra plataforma de observabilidad, la compró Mintlify, una empresa de documentación, en marzo, y quedó en mantenimiento: "We'll work closely with every customer to support a smooth migration to another platform." Si el registro usa el estándar, cambiar de herramienta es cambiar a dónde se mandan las trazas, no rehacer el registro.

Una aclaración: el estándar todavía no es estable. Las convenciones de OpenTelemetry para modelos de lenguaje siguen marcadas como "Development" al 1 de noviembre de 2026, y por eso Anthropic pide fijar la versión.

## Lo mismo en los tres

Así se ve en Claude (de Anthropic), GPT (los modelos de OpenAI que usa ChatGPT) y Gemini (de Google):

| | Claude | GPT | Gemini |
|---|---|---|---|
| Panel del proveedor | Consola: uso y costo, con gráficos de límites y del acierto de la caché | Registros del panel de OpenAI; las trazas de agentes, en su propia sección | Registros en AI Studio, solo en el plan pago; se borran a los 55 días por defecto |
| Trazas con OpenTelemetry | El SDK y la API las mandan a tu plataforma (en beta) | El Agents SDK traza por defecto al panel de OpenAI, y se pueden mandar a otras | El kit de agentes de Google sigue el estándar; en Google Cloud se prende con una variable al desplegar |
| Qué guarda por defecto | Solo datos de cada paso, sin el texto | El Agents SDK guarda lo que entra y lo que sale | Los proyectos nuevos guardan los pedidos desde el 26-10-2026; en Google Cloud, sin el texto salvo que se pida |

Los tres hablan OpenTelemetry: lo que se registra con el estándar se puede mirar en cualquier plataforma.

## Del registro al golden set

La observabilidad no reemplaza a los evals: los completa. Anthropic, en su guía de evals, pone las contras del monitoreo con clientes reales sin vueltas: "Reactive; problems reach users before you know about them" (es reactivo: los problemas llegan a los clientes antes de que te enteres), y "Lacks ground truth for grading" (no hay respuesta correcta para comparar).

Los evals frenan los errores conocidos antes de salir. El monitoreo encuentra los que nadie imaginó. Y se unen en un punto: cada falla que aparece con un cliente real se convierte en un caso del golden set. Si el viernes la consulta al stock tardó 5 segundos y el asistente le dijo al cliente que no había napolitana, ese mensaje entra al golden set, y el próximo cambio se prueba también con él.

## En resumen

- Observabilidad es poder responder qué le pasó a un mensaje sin adivinar.
- La unidad es el mensaje del cliente, no la llamada al modelo. Cada mensaje es una traza, con un paso por cada llamada y cada herramienta.
- Lo que tarda se mira con percentiles: el promedio esconde al cliente que esperó 41 segundos. En un agente, la llamada lenta se vuelve común.
- El costo que importa es por pedido, no por llamada: en el ejemplo, ocho veces más.
- El SDK reintenta solo. Sin trazas, los reintentos no existen; con el número de cada pedido, se le puede reclamar al proveedor.
- Conviene registrar con OpenTelemetry, que hablan Claude, GPT y Gemini, para poder cambiar de herramienta.
- Cada falla que aparece con clientes reales se suma al golden set.

Ahora se sabe cuánto cuesta cada pedido. Cómo hacer que cueste menos, en el próximo post.
