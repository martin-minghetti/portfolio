---
title: "Context window y cómo manejar el contexto"
date: 2026-10-31
order: 6
draft: false
description: "Qué es la ventana de contexto, qué la llena, qué pasa cuando se llena, cuánto cuesta y las técnicas para decidir qué ve el modelo, en Claude, OpenAI y Gemini."
---

El asistente de la pizzería atiende por WhatsApp toda la noche. A las nueve, un cliente avisa: "Soy celíaco". Pide, pregunta por el envío, cambia la dirección, consulta si hay stock de fainá. Cuarenta mensajes después escribe: "Agregame otra pizza, la de siempre". Para responder bien, el modelo tiene que tener presente lo de celíaco, que quedó muy atrás.

Como se vio antes en la serie, el modelo no recuerda nada entre una llamada y otra: la aplicación le reenvía la conversación entera cada vez. Este post trata de lo que pasa cuando esa conversación crece: cuánto entra, cuánto cuesta y cómo decidir qué ve el modelo.

## La ventana de contexto

La **ventana de contexto** (context window) es la cantidad máxima de tokens que el modelo puede procesar en una sola llamada. Entra todo lo que se le manda y también lo que responde. Según la documentación de Anthropic, cuentan:

- el system prompt,
- todos los mensajes de la conversación,
- las definiciones de las herramientas que puede usar, y los resultados que esas herramientas devolvieron (por ejemplo, el stock de fainá),
- las imágenes y los documentos que se adjuntan,
- la respuesta del modelo, con su razonamiento incluido.

Al principio de la charla, buena parte es lo fijo: el system prompt y las herramientas. En una charla larga, lo que más pesa son los mensajes viejos y los resultados de herramientas:

<figure>
<p class="fig-title">Qué ocupa la ventana a lo largo de una charla</p>
<div class="tok-row"><div class="tok-head"><span>Mensaje 3</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c2">herramientas</span><span class="tok c4">mensajes</span><span class="tok c1">respuesta</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Mensaje 40</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c2">herramientas</span><span class="tok c4">mensajes viejos</span><span class="tok c3">resultados de herramientas</span><span class="tok c4">más mensajes</span><span class="tok c3">más resultados</span><span class="tok c4">mensaje nuevo</span><span class="tok c1">respuesta</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Después de resumir</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c2">herramientas</span><span class="tok c4">resumen de lo anterior</span><span class="tok c4">mensaje nuevo</span><span class="tok c1">respuesta</span></div></div>
<figcaption><ul><li>Diagrama sin escala.</li><li>Violeta: system prompt.</li><li>Naranja: definiciones de herramientas.</li><li>Celeste: mensajes.</li><li>Rojo: resultados de herramientas.</li><li>Verde: la respuesta, que también ocupa lugar.</li></ul></figcaption>
</figure>

Hay un detalle fácil de pasar por alto. El razonamiento del modelo cuenta dentro del tope de salida y se cobra como salida, aunque no se muestre. Y en los modelos actuales de Claude, además, ese razonamiento se queda en el historial: en la llamada siguiente vuelve a ocupar lugar, ahora como entrada, y se vuelve a pagar.

## Qué pasa cuando se llena

En Claude hay dos casos. Si lo que se manda ya no entra en la ventana, la API rechaza el pedido con un error. Si entra, pero no queda lugar para toda la respuesta, el modelo empieza a responder y se corta al llegar al límite.

Hoy los tres grandes tienen ventanas de alrededor de un millón de tokens:

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Ventana | 1 millón en Fable 5.1, Opus 5.5, Sonnet 5.5 y Haiku 5.5 | 1,05 millones en la familia GPT-6 | 1.048.576 en Gemini 4 Argon |
| Tope de la respuesta | 128 mil tokens | 128 mil tokens | 65.536 por defecto, hasta 1.048.576 si se pide una respuesta larga |
| Recargo por largo | solo en Haiku 5.5: arriba de 100 mil tokens de entrada, todo el pedido cuesta cinco veces más | arriba de 272 mil tokens de entrada, el doble la entrada y 1,5 veces la salida, en todo el pedido | no tiene |

En los tres, la entrada y la respuesta salen del mismo espacio. Un millón de tokens es mucho, pero no es infinito, y no conviene usarlo entero.

## Más contexto no siempre es mejor

A medida que la ventana se llena, el modelo recuerda con menos precisión lo que tiene adelante. Anthropic lo llama **context rot** (algo así como "el contexto que se echa a perder"). La empresa Chroma lo midió en 2025 con 18 modelos: todos rindieron peor a medida que la entrada crecía, y más cuando había datos parecidos que distraían.

La causa tiene que ver con la **atención**, el mecanismo con el que el modelo relaciona cada token con los demás. Con más texto, esa atención se reparte entre más cosas, y lo importante tiene más competencia. En la pizzería, "soy celíaco" compite con cuarenta mensajes sobre direcciones, envíos y stock.

También importa dónde está el dato. Un estudio de 2023 de la Universidad de Stanford, llamado [Lost in the Middle](https://arxiv.org/abs/2307.03172) ("perdido en el medio"), encontró que los modelos de ese momento usaban mejor la información puesta al principio o al final que la del medio. Los modelos mejoraron desde entonces, y cada proveedor recomienda su propio orden, como se vio al hablar del system prompt.

Por eso, desde septiembre de 2025, Anthropic habla de **context engineering** (ingeniería de contexto): cuidar durante toda la tarea que el modelo vea el conjunto más chico posible de información útil, y no solo escribir bien el primer prompt.

## Cuánto cuesta

Como cada llamada reenvía todo, cada mensaje cuesta más que el anterior: el mensaje 40 paga los 39 que vinieron antes. A eso se suman los recargos por largo de la tabla: en OpenAI, pasar de 272 mil tokens encarece el pedido entero, y en Claude Haiku 5.5, pasar de 100 mil lo multiplica por cinco.

La caché, que se ve más adelante en la serie, abarata lo que se repite. Pero no libera lugar: según Anthropic, lo que está en caché sigue ocupando la ventana.

## Cómo manejar el contexto

Estas son las técnicas más usadas, de la más simple a la más elaborada.

**Recortar.** Mandar solo los últimos mensajes y descartar los más viejos. Es lo más barato, y Anthropic cuenta que algunos chats lo hacen así. Pero se pierde lo del principio: en la pizzería, lo de celíaco.

**Resumir o compactar.** Cuando la conversación se acerca a un límite, se reemplazan los mensajes viejos por un resumen y se sigue desde ahí. Un buen resumen conserva lo de celíaco y descarta los detalles del envío. Tiene dos costos: el resumen es una llamada más al modelo, y pierde detalles. En un ejemplo de Anthropic, de seis datos, los tres centrales sobrevivieron al resumen y los tres que venían de tablas de un apéndice se perdieron.

- **Claude** lo hace en su API, en beta, de dos formas: sola, al pasar un límite que uno fija, o cuando se lo pedís. Anthropic recomienda la segunda.
- **OpenAI** también compacta en su API, al pasar un límite o a pedido. El resumen viene cifrado: no se puede leer qué conservó.
- **Gemini**: su API no lo trae y hay que programarlo. El ADK, el kit de Google para armar agentes, sí lo hace.

**Borrar resultados viejos de herramientas.** Si el modelo ya usó el resultado de una herramienta y no lo necesita más, se saca de la ventana y queda un aviso en su lugar. Sirve cuando el dato se puede volver a pedir: si el modelo lo necesita otra vez, llama de nuevo a la herramienta. Volver a pedirlo cuesta una llamada más, y el dato puede haber cambiado: el stock de fainá de las diez no es el de las nueve. Claude lo ofrece en beta.

**Traer solo lo relevante.** En vez de pegar el menú completo o todas las reseñas, buscar las partes que sirven para la pregunta y mandar solo esas. Esa técnica se llama RAG y tiene su propio post más adelante.

**Guardar memoria fuera de la ventana.** El modelo anota lo importante, como "cliente celíaco", y lo vuelve a leer cuando hace falta, incluso en otra sesión. Ninguna de las tres API básicas guarda memoria entre sesiones por su cuenta. Claude trae una herramienta de memoria: el modelo pide guardar o leer una nota, y la que la guarda es tu aplicación, donde quieras. La memoria es tuya, no del proveedor. En un ejemplo de Anthropic, una segunda sesión con memoria llegó a usar casi la mitad de contexto que sin ella (173 mil tokens contra 334 mil). Google ofrece algo parecido en su plataforma de agentes (Memory Bank).

**Cargar justo a tiempo.** En vez de precargar todo, se le dan al modelo referencias livianas, como nombres de archivos o links, y él trae el contenido solo cuando lo necesita. Las skills (paquetes de instrucciones que el modelo carga para una tarea puntual) funcionan así: el modelo ve una descripción corta de cada una y carga el resto solo si la va a usar.

**Repartir el trabajo.** Un agente puede mandar a otro, un subagente, a investigar algo en su propia ventana, y recibir de vuelta solo un resumen corto. Según Anthropic, suelen ser entre mil y dos mil tokens. Tiene su contracara, y se ve con los agentes, más adelante en la serie.

## Cuál usar

Depende de qué esté llenando la ventana:

| Qué la llena | Qué hacer |
|---|---|
| Resultados de herramientas que se pueden volver a pedir | Borrarlos |
| La conversación y el razonamiento | Resumir |
| Documentos o datos grandes | Traer solo lo relevante, o cargarlo justo a tiempo |
| Algo que tiene que sobrevivir a la próxima sesión | Memoria |

Se pueden combinar. Anthropic sugiere empezar por la que ataca lo que de verdad se ve crecer.

## Contar antes de mandar

Los tres grandes permiten saber cuántos tokens ocupa un pedido antes de mandarlo, y después de cada llamada lo informan en la respuesta. Con la API de Claude, en Python, se puede medir la conversación y recortarla si se pasa de un límite:

```python
import anthropic

client = anthropic.Anthropic()
system = "Sos el asistente de la pizzería La Esquina. Respondés corto."
LIMITE = 100_000  # tokens

def preparar(historial):
    n = client.messages.count_tokens(
        model="claude-opus-5-5", system=system, messages=historial
    ).input_tokens
    print("tokens de entrada:", n)
    if n < LIMITE:
        return historial
    # Recortar: se queda con los últimos 20 mensajes.
    # Lo que se dijo antes, como "soy celíaco", se pierde.
    # Ojo: si el corte separa un pedido a una herramienta de su
    # resultado, la API devuelve error. Hay que cortar en un mensaje del cliente.
    return historial[-20:]
```

El recorte es la técnica más simple, y el comentario muestra su problema. Para no perder lo de celíaco, ese último paso se reemplaza por un resumen o por una nota en la memoria.

## En resumen

- La ventana de contexto es todo lo que el modelo procesa en una llamada: system prompt, mensajes, herramientas, sus resultados y la respuesta, razonamiento incluido.
- Los tres grandes rondan el millón de tokens, pero llenarla sale caro y no da mejores resultados: el modelo recuerda peor cuanto más tiene adelante.
- En una charla larga, lo que más la llena son los mensajes viejos y los resultados de herramientas.
- Hay técnicas para cada caso: recortar, resumir, borrar resultados de herramientas, traer solo lo relevante, memoria, cargar justo a tiempo y repartir el trabajo. Se elige según qué esté llenando la ventana.

El próximo post trata de herramientas: cómo un modelo que solo escribe texto puede hacer cosas en el mundo, como buscar datos o mandar un mail.
