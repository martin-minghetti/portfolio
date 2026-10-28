---
title: "Structured output: respuestas que tu código puede leer"
date: 2026-10-28
order: 14
draft: true
description: "Cómo hacer que un modelo responda con un formato fijo que tu código pueda leer: qué es JSON y un esquema, cómo lo asegura la API, qué no garantiza, cómo diseñar el esquema para que no invente y cómo se hace en Claude, OpenAI y Gemini."
---

Volvamos a un solo local de La Esquina. Un cliente escribe por WhatsApp: "quiero 2 muzzas y una fugazzeta sin cebolla para Barrio Norte".

El asistente contesta bien: "Dale, te anoto 2 muzzarellas y una fugazzeta sin cebolla. A qué dirección te lo mando?". Para el cliente, perfecto. Para el sistema de pedidos del local, es un problema. Tu código tiene que sacar de esa frase cuántas pizzas son, de qué tipo, qué hay que sacarles y adónde van. Y la frase cambia en cada respuesta: mañana el modelo escribe "dos de muzza", o pone la fugazzeta primero.

Hasta acá, el asistente respondía con texto libre, que es para personas. Este post trata de cómo pedirle una respuesta con un formato fijo, que tu código pueda leer sin adivinar. Eso se llama **structured output**, o salida estructurada.

## Qué es JSON y qué es un esquema

El formato casi universal es **JSON**: una forma de escribir datos como texto, con campos entre llaves, que entienden casi todos los lenguajes de programación. El pedido de arriba, en JSON, se ve así:

<figure>
<p class="fig-title">El mismo pedido, en texto y en JSON</p>
<div class="tok-row"><div class="tok-head"><span>Lo que escribe el cliente</span></div><div class="tok-text"><span class="tok c4">quiero 2 muzzas y una fugazzeta sin cebolla para Barrio Norte</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Lo que recibe tu código</span></div>
<pre><code>{
  "items": [
    {
      "producto": <span class="tok c0">"muzzarella"</span>,
      "cantidad": <span class="tok c1">2</span>,
      "sin": []
    },
    {
      "producto": <span class="tok c0">"fugazzeta"</span>,
      "cantidad": <span class="tok c1">1</span>,
      "sin": <span class="tok c2">["cebolla"]</span>
    }
  ],
  "barrio": <span class="tok c0">"barrio_norte"</span>,
  "direccion": <span class="tok">null</span>,
  "falta": <span class="tok c3">["dirección"]</span>
}</code></pre></div>
<figcaption><ul><li>Celeste: lo que escribió el cliente.</li><li>Violeta: opciones cerradas. El producto y el barrio solo pueden ser valores de una lista: "muzzas" pasa a ser "muzzarella".</li><li>Verde: números. Siempre un número, nunca "dos".</li><li>Naranja: una lista de textos, lo que hay que sacarle a la pizza.</li><li>Gris: null, que quiere decir "no hay dato". El cliente no dijo la dirección, y el formato deja decirlo.</li><li>Rojo: lo que falta, que tu código tiene que preguntar.</li></ul></figcaption>
</figure>

Para que tu código pueda confiar en eso, hace falta un **esquema**: la lista de campos, de qué tipo es cada uno y cuáles son obligatorios. La forma estándar de escribirlo se llama **JSON Schema**. Si seguiste la serie, ya viste uno: es lo mismo que se usa para describir los datos que recibe una herramienta.

## Pedirlo en el prompt no alcanza

Lo primero que se le ocurre a cualquiera es pedirlo en el system prompt: "Respondé solo con JSON, con estos campos". Con un par de ejemplos, como se vio al hablar de prompting, el modelo lo hace casi siempre.

El problema es el "casi". Alguna vez el JSON queda mal cerrado, falta un campo, o la cantidad viene como texto ("2" entre comillas, o "dos"). Con unos pocos mensajes no se nota. Con miles por día, cada una de esas veces es un pedido que tu código no puede leer.

## Cómo lo asegura la API

Hoy los tres grandes proveedores tienen la salida estructurada en su API: le pasás el esquema junto con el mensaje y la respuesta lo cumple. No es que el modelo se esfuerce más. Es que no puede salirse.

Como se vio al principio de la serie, un modelo escribe de a un token por vez: calcula qué tan probable es cada opción y elige una. Con salida estructurada, la API convierte el esquema en reglas y, en cada paso, solo le deja elegir tokens que mantengan el JSON dentro de esas reglas. Anthropic lo llama "constrained decoding", algo así como generación restringida.

<figure>
<p class="fig-title">Lo que el modelo puede escribir</p>
<div class="tok-row"><div class="tok-head"><span>Ya escrito</span></div><div class="tok-text"><span class="tok">{"producto": "muzzarella", "cantidad":</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Opciones para el siguiente token</span></div><div class="tok-text"><span class="tok c1">2 (61%)</span><span class="tok" style="text-decoration:line-through;opacity:.5">" (20%)</span><span class="tok" style="text-decoration:line-through;opacity:.5">dos (12%)</span><span class="tok" style="text-decoration:line-through;opacity:.5">} (7%)</span></div></div>
<figcaption><ul><li>Verde: la única opción que cumple el esquema.</li><li>Tachadas: la comilla abriría un texto donde va un número, "dos" no es un número, y cerrar la llave dejaría el pedido sin terminar.</li><li>El modelo calcula todas las opciones como siempre; la API descarta las que romperían el esquema, y elige entre las que quedan.</li><li>Las probabilidades son de ejemplo.</li></ul></figcaption>
</figure>

Por eso es una garantía y no un pedido. Tiene un costo chico: la primera vez que se usa un esquema, la API lo prepara y la respuesta tarda más (Claude lo guarda 24 horas), y la API agrega unas instrucciones al prompt que se cobran como cualquier token.

## Diseñar el esquema para que no tenga que inventar

Hay una trampa en esa garantía. Si el esquema dice que la dirección es obligatoria y tiene que ser un texto, el modelo tiene que escribir una dirección, la haya dicho el cliente o no. El formato lo empuja a completar. OpenAI lo advierte en su documentación: el modelo siempre intenta cumplir el esquema, y eso puede llevarlo a inventar si el mensaje no tiene que ver con lo que se pide.

Tres reglas para el esquema de la pizzería:

- **Listas cerradas para lo que tiene opciones fijas.** Los productos de la carta, los barrios con envío. Es lo mismo que las opciones cerradas de las herramientas: así "muzzas" solo puede salir como `muzzarella`.
- **Una forma permitida de decir "no sé".** La dirección acepta `null`, y un campo `falta` lista lo que no estaba en el mensaje. Si no existe esa salida, el modelo la inventa.
- **Descripciones en los campos.** "Calle y número. null si el cliente no la dijo." El modelo las lee, igual que las descripciones de una herramienta.

Y una que ya se vio al hablar de razonar paso a paso: no agregar un campo "razonamiento" para que el modelo explique cómo llegó al resultado. En Claude, eso puede terminar en un rechazo.

## Cómo se ve en código

Este es el pedido con el SDK de Anthropic y **Pydantic**, una librería de Python para definir datos con sus tipos y validarlos. De una clase de Pydantic sale el JSON Schema solo, y el SDK se lo manda a Claude:

```python
from typing import Literal
import anthropic
from pydantic import BaseModel, Field, ValidationError

class Item(BaseModel):
    producto: Literal["muzzarella", "napolitana", "fugazzeta", "rúcula", "fainá"]
    cantidad: int = Field(ge=1)
    sin: list[str] = Field(description="Ingredientes que el cliente pidió sacar")

class Pedido(BaseModel):
    items: list[Item]
    barrio: Literal["centro", "barrio_norte", "villa_sur"] | None
    direccion: str | None = Field(description="Calle y número. null si el cliente no la dijo")
    falta: list[str] = Field(description="Datos que faltan para poder registrar el pedido")

client = anthropic.Anthropic()
mensaje = "quiero 2 muzzas y una fugazzeta sin cebolla para Barrio Norte"

try:
    r = client.messages.parse(
        model="claude-opus-5-5",
        max_tokens=16000,
        system="Convertís mensajes de WhatsApp de la pizzería La Esquina en pedidos. "
               "No inventes datos: si algo no está en el mensaje, va en null y en 'falta'.",
        messages=[{"role": "user", "content": mensaje}],
        output_format=Pedido,
    )
    pedido = r.parsed_output  # un Pedido ya validado, o None si el modelo se negó
except ValidationError:  # llegó cortado, o rompe una regla que el modelo no ve
    pedido = None

if pedido is None:
    print("No se pudo leer el pedido. Lo pasamos a una persona.")
else:
    for item in pedido.items:
        print(item.cantidad, item.producto, item.sin)
    print("Barrio:", pedido.barrio, "| Falta:", pedido.falta)
```

Lo que hay que mirar:

- **`Literal` es la lista cerrada.** El producto solo puede ser uno de los cinco de la carta, y el barrio uno de los tres con envío (o `None`).
- **`| None` y `falta` son la salida para "no sé".** Con el mensaje del ejemplo, lo esperable es `direccion` en `None` y `falta` con la dirección.
- **Los valores de las listas van en minúscula y sin espacios.** Claude no garantiza las mayúsculas de esos valores: puede devolver "Barrio_norte" en vez de "barrio_norte", y Pydantic lo rechazaría.
- **`Field(ge=1)` es una regla que el modelo no ve.** Claude no acepta mínimos ni máximos en el esquema. El SDK saca la regla, la escribe en la descripción del campo para que el modelo la tenga en cuenta, y la chequea cuando vuelve la respuesta.
- **`parsed_output` ya es un objeto con tipos.** `item.cantidad` es un número, listo para usar.
- **El `try` no es de adorno.** Si la respuesta se corta por `max_tokens`, el JSON llega a la mitad y `parse` falla con un error de validación antes de devolver nada. Si el modelo se niega, `parsed_output` viene vacío.

Sin conectar con la API, se puede probar qué hace Pydantic con distintas respuestas. Un JSON con "dos" en la cantidad da `Input should be a valid integer` (tiene que ser un número entero). Uno con "pizza de queso" da `Input should be 'muzzarella', 'napolitana', 'fugazzeta', 'rúcula' or 'fainá'`. Y uno cortado a la mitad da `Invalid JSON: EOF while parsing` (el texto se terminó antes de cerrar el JSON). La llamada a Claude necesita clave y no está probada acá.

## Lo que no garantiza

La API asegura la forma. No asegura el contenido.

**Que los valores sean correctos.** Este pedido pasa la validación sin ningún error: 500 fugazzetas, sin cebolla y sin muzzarella, para Villa Sur. Es un JSON perfecto y un pedido absurdo: una fugazzeta sin cebolla ni muzzarella es una masa sola. El esquema no sabe de pizzas. Los tres proveedores lo dicen a su manera. OpenAI: la salida estructurada "can still contain mistakes" (todavía puede tener errores). Google: aunque el JSON sea correcto, "always validate values in your application" (validá siempre los valores en tu aplicación).

**Que siempre haya respuesta.** Si el modelo se niega a responder, la respuesta no cumple el esquema: Claude lo marca con `stop_reason: "refusal"`, y OpenAI con un campo `refusal`. Si se corta por el límite de tokens, el JSON queda a la mitad.

**Que todas las reglas del esquema se apliquen.** Claude no garantiza las mayúsculas de las listas cerradas. Gemini ignora sin avisar algunas reglas, como el largo mínimo o máximo de un texto.

Por eso se valida dos veces, y después se aplican las reglas del negocio. Es el control de salida que se vio con los guardrails, ahora con datos en vez de texto:

<figure>
<p class="fig-title">Del mensaje al pedido registrado</p>
<svg viewBox="0 0 400 482" width="100%" role="img" aria-labelledby="g14t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g14t">Diagrama del mensaje al pedido registrado: tu código manda el mensaje del cliente con el esquema Pedido; Claude escribe solo lo que el esquema permite; Pydantic valida el JSON en tu código; después las reglas de La Esquina; si todo pasa, se registra el pedido. Si Claude se niega, la respuesta se corta o no pasa la validación, el pedido va a una persona; si falta un dato, se le pregunta al cliente.</title>
<defs><marker id="g14ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<rect x="10" y="14" width="240" height="58" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="38.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">"quiero 2 muzzas y una</text>
<text x="130.0" y="56.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">fugazzeta sin cebolla..."</text>
<path d="M130 72V94" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g14ink)"/>
<rect x="10" y="96" width="240" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="120.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Tu código manda el mensaje</text>
<text x="130.0" y="138.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">y el esquema Pedido</text>
<path d="M130 152V174" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g14ink)"/>
<rect x="10" y="176" width="240" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="200.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Claude escribe el JSON</text>
<text x="130.0" y="218.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">solo lo que el esquema permite</text>
<path d="M250 204H326V234" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#g14ink)"/>
<text x="334" y="196" font-size="13" fill="var(--color-muted)" text-anchor="start">se negó</text>
<text x="334" y="212" font-size="13" fill="var(--color-muted)" text-anchor="start">o se cortó</text>
<rect x="262" y="236" width="128" height="58" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="326.0" y="260.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Pasar a</text>
<text x="326.0" y="278.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">una persona</text>
<path d="M130 232V254" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g14ink)"/>
<rect x="10" y="256" width="240" height="56" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="280.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Pydantic valida</text>
<text x="130.0" y="298.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">la forma y lo que el modelo no ve</text>
<path d="M250 284H260" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#g14ink)"/>
<path d="M130 312V334" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g14ink)"/>
<rect x="10" y="336" width="240" height="56" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="360.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Reglas de La Esquina</text>
<text x="130.0" y="378.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">más de 20, falta la dirección</text>
<path d="M250 364H260" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#g14ink)"/>
<rect x="262" y="336" width="128" height="56" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="326.0" y="359.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Preguntarle</text>
<text x="326.0" y="377.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">al cliente</text>
<path d="M130 392V414" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g14ink)"/>
<rect x="10" y="416" width="240" height="50" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="445.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Registrar el pedido</text>
</svg>
<figcaption><ul><li>Celeste: el cliente.</li><li>Naranja: tu código.</li><li>Verde: el modelo.</li><li>Rojo: los controles. Si Claude se niega, si la respuesta llega cortada o si el JSON no pasa la validación, el pedido va a una persona. Si las reglas del local encuentran un problema, se le pregunta al cliente (o, con más de 20 pizzas, a una persona).</li><li>Violeta: lo que se guarda.</li></ul></figcaption>
</figure>

El límite de 20 pizzas no va en el esquema. Si estuviera ahí, un pedido de 25 daría error y se perdería; en tu código, se le pasa a una persona, como se vio con los guardrails.

## Salida estructurada o herramienta

Las herramientas también tienen modo estricto, que asegura que el pedido de una herramienta cumpla su esquema. Entonces, cuándo usar cada uno. Los tres proveedores dan casi la misma regla:

- **Herramienta**, cuando el modelo tiene que hacer algo en el medio de la charla: consultar el stock o registrar el pedido dentro del loop del agente.
- **Salida estructurada**, cuando querés la respuesta final con un formato fijo: un paso de tu código que convierte el mensaje en un pedido. Es lo que faltaba en el paso "entender el pedido" del ejemplo de LangGraph, que había quedado con un pedido fijo para probar.

Se pueden usar las dos en el mismo pedido.

Una duda que aparece seguido: si obligar al modelo a un formato no le hace pensar peor. Un estudio de 2024 de Appier, una empresa de inteligencia artificial de Taiwán, junto con la Universidad Nacional de Taiwán, [Let Me Speak Freely?](https://arxiv.org/abs/2408.02442), encontró que el formato empeoraba las tareas de razonamiento y mejoraba las de clasificar. Otros lo discutieron, entre ellos .txt, una empresa que vende herramientas de salida con formato. Con los modelos de hoy, la pregunta cambió: Claude puede pensar antes de responder, y el formato se aplica solo a la respuesta final, no a ese razonamiento. Además, convertir un mensaje en un pedido se parece mucho más a clasificar que a razonar.

## Lo mismo en los tres

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Cómo se pide | `output_config.format`, con el esquema | `text.format`, con el esquema y `strict: true` | `response_format`, con el esquema |
| Con Pydantic | `messages.parse()` devuelve el objeto validado | `responses.parse()` devuelve el objeto validado | Se manda el esquema y se valida en tu código |
| Campos opcionales | Se permiten | Todos obligatorios: lo opcional acepta `null` | Se permiten |
| Mínimos y máximos | No los acepta; el SDK los chequea al volver | Sí | En números los acepta; los largos de texto se ignoran sin aviso |
| Si se niega | `stop_reason: "refusal"` | Un campo `refusal` | Su documentación no lo dice |
| Junto con herramientas | Sí | Sí | En prueba, solo en los modelos Gemini 3 |

Para TypeScript (JavaScript con tipos), el equivalente de Pydantic es **Zod**, y los SDK lo aceptan igual.

En tutoriales viejos de OpenAI vas a ver el "JSON mode": asegura que la respuesta sea JSON válido, pero no que cumpla tu esquema. Si se puede, conviene la salida estructurada.

Y un cierre para lo que se vio con RAG: OpenAI nombraba el formato inconsistente como un motivo para hacer fine-tuning. Hoy, para el formato, alcanza con la API.

## En resumen

- El texto libre es para personas. Para que tu código lea una respuesta, hace falta un formato fijo: casi siempre JSON, con un esquema que dice qué campos tiene y de qué tipo.
- Pedirlo en el prompt funciona casi siempre, y "casi" no alcanza con miles de mensajes.
- Con salida estructurada, la API solo deja escribir tokens que cumplan el esquema. La forma está garantizada.
- La forma no es el contenido: un JSON válido puede traer un pedido absurdo o un dato inventado.
- Hay que manejar el rechazo y la respuesta cortada, y validar en tu código.
- El esquema tiene que dejarle decir "no sé": campos que aceptan null y una lista de lo que falta.
- Las reglas del negocio van en tu código, no en el esquema.
- Herramienta para que el modelo haga algo en la charla; salida estructurada para la respuesta final.

Cada pedido manda el mismo system prompt, el mismo esquema y la misma carta, y se cobran en cada mensaje. Más adelante en la serie: cómo hacer que esa parte fija salga mucho más barata.
