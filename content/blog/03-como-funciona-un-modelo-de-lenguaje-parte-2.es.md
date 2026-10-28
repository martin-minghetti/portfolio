---
title: "Cómo funciona un modelo de lenguaje: roles, memoria y pesos"
date: 2026-10-28
order: 3
draft: false
description: "Cómo se arma una conversación con un modelo, por qué no recuerda nada entre una llamada y otra, qué cuesta eso y dónde queda guardado lo que aprendió."
---

Una pizzería pone un asistente en su web. Un cliente pregunta "tienen pizza sin gluten?", el asistente dice que sí, y el cliente sigue: "y cuánto sale?". Para contestar la segunda pregunta, el asistente tiene que saber de qué pizza se habla. Pero el modelo no recuerda nada: cada vez que la aplicación lo llama, empieza de cero.

Este post explica cómo se resuelve eso, con los roles de una conversación, qué cuesta resolverlo así, y dónde queda guardado lo que el modelo sí sabe.

## Una conversación es una lista de mensajes

Cuando una aplicación le habla a un modelo por la API, no le manda un bloque de texto suelto. Le manda una lista de mensajes, en orden, y cada uno tiene un **rol** que dice de quién es:

- **system:** las instrucciones de fondo. Quién es el asistente, qué reglas sigue, en qué formato responde. Por ejemplo: "sos el asistente de una pizzería y respondés corto". Va adelante de todo.
- **user:** lo que la aplicación manda del lado del usuario. Casi siempre es lo que escribió la persona, pero también puede incluir documentos o datos que la aplicación suma a la pregunta.
- **assistant:** las respuestas del modelo. La aplicación también puede escribir mensajes de este rol, por ejemplo para mostrarle al modelo cómo tiene que responder. Anthropic lo dice en su documentación: los turnos anteriores no tienen por qué haber salido del modelo.

La idea es la misma en los tres grandes, pero cada uno lo nombra a su manera:

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Instrucciones de fondo | parámetro `system`, aparte de la lista | rol `developer` o parámetro `instructions` | parámetro `system_instruction` |
| Lo que manda el usuario | `user` | `user` | `user` |
| Lo que responde el modelo | `assistant` | `assistant` | `model` |

OpenAI aclara además que las instrucciones del developer tienen prioridad sobre lo que diga el usuario.

## Por dentro, los roles son texto con marcas

El modelo, como se vio en el post anterior, solo ve una secuencia de tokens. Antes de llegarle, la lista de mensajes se convierte en un único texto, con marcas especiales que indican dónde empieza cada mensaje y de quién es. Cada familia de modelos usa sus propias marcas; en algunos modelos abiertos, por ejemplo, cada mensaje arranca con algo como `<|im_start|>user`.

El modelo respeta esas marcas porque en el post-entrenamiento aprendió con conversaciones escritas en ese formato. Por eso distingue una instrucción del system de una pregunta del usuario, y por eso el system pesa más: así lo entrenaron.

## El modelo no recuerda nada

La API de Claude no guarda nada entre una llamada y la siguiente. Según su documentación, siempre hay que mandarle la conversación entera. Para que el asistente de la pizzería "se acuerde" de la primera pregunta, la aplicación vuelve a mandar todo: el system, la primera pregunta, la primera respuesta y la pregunta nueva. La memoria de un chat es, en el fondo, esa lista que se reenvía cada vez.

Eso tiene un costo. Como se paga por cada token que entra, cada llamada paga de nuevo todo lo anterior, y lo que se manda crece con cada vuelta:

<figure>
<p class="fig-title">Lo que se manda en cada llamada de una conversación</p>
<div class="tok-row"><div class="tok-head"><span>Llamada 1</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c4">pregunta 1</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Llamada 2</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c4">pregunta 1</span><span class="tok c1">respuesta 1</span><span class="tok c4">pregunta 2</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Llamada 3</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c4">pregunta 1</span><span class="tok c1">respuesta 1</span><span class="tok c4">pregunta 2</span><span class="tok c1">respuesta 2</span><span class="tok c4">pregunta 3</span></div></div>
<figcaption><ul><li>Violeta: system.</li><li>Celeste: mensajes del usuario.</li><li>Verde: respuestas del modelo.</li><li>Diagrama sin escala: cada llamada lleva todo lo anterior más lo nuevo.</li></ul></figcaption>
</figure>

OpenAI y Google ofrecen guardar el historial de su lado, para no tener que reenviarlo: OpenAI con un identificador de la respuesta anterior y Google con su API de Interactions, que guarda las conversaciones 55 días en el plan pago. Eso ahorra trabajo, pero el modelo sigue sin recordar nada: el proveedor arma la lista y se la pasa entera. OpenAI aclara que, aun así, todos los tokens anteriores se cobran de nuevo como entrada. Hay formas de abaratar esa repetición, como la caché, que se ven más adelante en la serie.

Cuando el modelo usa herramientas, como buscar un dato o consultar una base, los resultados también entran a esta lista como mensajes. También se ve más adelante.

Con la API de Claude, en Python, la conversación de la pizzería se arma así:

```python
import anthropic

client = anthropic.Anthropic()
system = "Sos el asistente de una pizzería. Respondés corto."
historial = []

for pregunta in ["Tienen pizza sin gluten?", "Y cuánto sale?"]:
    historial.append({"role": "user", "content": pregunta})
    # En cada vuelta se manda el historial completo
    r = client.messages.create(model="claude-opus-5-5", max_tokens=2048, system=system, messages=historial)
    historial.append({"role": "assistant", "content": r.content})
    texto = "".join(b.text for b in r.content if b.type == "text")
    print(texto, "| tokens de entrada:", r.usage.input_tokens)
```

En la segunda vuelta, `input_tokens` es más grande que en la primera, aunque la pregunta sea más corta: lleva adentro todo lo anterior.

## Pesos: lo que el modelo aprendió

Lo que el modelo sí sabe, lo aprendió en el entrenamiento, y quedó guardado en miles de millones de números. Esos números se llaman **pesos** o **parámetros** (weights y parameters, en inglés); en la práctica se usan como sinónimos.

Para hacerlo concreto: Llama 2 70B, un modelo de Meta, tiene 70 mil millones de parámetros (la B es de billion, mil millones en inglés). Guardado, es un archivo de unos 140 GB, porque cada número ocupa 2 bytes. Ninguno de esos números guarda una frase ni un dato que se pueda leer: lo aprendido está repartido entre todos, y solo aparece cuando el modelo hace una predicción. Por eso no se puede "abrir" un modelo y ver qué sabe.

Usar el modelo o escribirle un prompt no cambia sus pesos. Solo los cambia el entrenamiento, o un ajuste posterior (fine-tuning).

En general, más parámetros dan más capacidad, pero también hacen más caro correrlo. Hay un matiz: muchos modelos actuales usan solo una parte de sus parámetros para cada token. gpt-oss-120b, de OpenAI, tiene 117 mil millones y usa 5,1 mil millones por token. Anthropic, OpenAI y Google no publican cuántos parámetros tienen sus modelos cerrados.

## Modelos abiertos y cerrados

- **Modelos de pesos abiertos:** la empresa publica los pesos, y cualquiera puede descargarlos y correrlos en su computadora o servidor, o usarlos a través de un tercero que los ofrezca. Pesos abiertos no es lo mismo que código abierto: en general no se publican los datos ni el código con que se entrenaron.
- **Modelos cerrados:** los pesos no se publican, y el modelo solo se usa por la API del proveedor o de las nubes que lo ofrecen (Claude, por ejemplo, también está en Amazon, Google Cloud y Microsoft).

De los tres grandes, OpenAI y Google publican también modelos abiertos: OpenAI tiene gpt-oss y Google tiene Gemma, cuya versión 4 salió en abril de 2026 con licencia Apache 2.0, que permite uso comercial. Anthropic no publica modelos abiertos. Otras familias abiertas conocidas son Llama, de Meta, y Qwen y DeepSeek, de empresas chinas.

Que un modelo sea abierto no lo hace mejor ni peor. Cambia otras cosas: los datos no salen del servidor propio, a mucho volumen puede salir más barato, y el modelo no se retira. Los cerrados sí tienen fecha de retiro: Anthropic, por ejemplo, se compromete a mantener Claude Opus 5.5 hasta por lo menos septiembre de 2027. A cambio, un modelo abierto hay que correrlo y mantenerlo uno mismo.

## En resumen

- Una conversación es una lista de mensajes con roles: las instrucciones de fondo (system), lo que manda el usuario (user) y lo que responde el modelo (assistant). Cada proveedor les pone nombres un poco distintos.
- Por dentro, esa lista se convierte en texto con marcas, y el modelo las respeta porque se entrenó así.
- El modelo no recuerda nada: cada llamada manda la conversación entera, y por eso lo que se paga de entrada crece con cada vuelta.
- Lo que el modelo aprendió vive en sus pesos, que son números, no frases. Abierto o cerrado depende de si se publican esos pesos, no de qué tan bueno es el modelo.

El próximo post entra en prompting: cómo escribir el system prompt y por qué darle ejemplos al modelo cambia tanto su respuesta.
