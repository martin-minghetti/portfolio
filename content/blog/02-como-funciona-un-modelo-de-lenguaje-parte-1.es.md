---
title: "Cómo funciona un modelo de lenguaje: qué es, tokens y entrenamiento"
date: 2026-10-25
order: 2
draft: true
description: "Qué hace un modelo de lenguaje, cómo pasa de predecir texto a seguir instrucciones, qué son los tokens y por qué definen lo que se paga y lo que se espera."
---

Si a un modelo de lenguaje se le da el texto "El gato se sentó en la", lo que hace es elegir qué viene después: "cama", "silla", "ventana". Elige una opción, la suma al texto y vuelve a empezar. Todo lo que se construye con IA, desde un chat hasta un agente, se apoya en ese mecanismo. Este post y el siguiente lo explican en lo mínimo necesario para trabajar con él.

## Qué es un modelo de lenguaje

Un modelo de lenguaje es un programa que aprendió, leyendo cantidades enormes de texto, a **predecir el siguiente pedazo de texto** a partir de lo anterior. Ese pedazo se llama token, y más abajo se explica qué es. En inglés se lo llama **LLM** (Large Language Model, modelo de lenguaje grande).

Funciona en un ciclo: recibe un texto, predice el siguiente token, lo agrega al texto y vuelve a predecir. Así, de a un token por vez, se escribe cada respuesta.

El modelo no tiene una única respuesta guardada para cada texto. Calcula qué tan probable es cada continuación posible y elige entre las más probables. Por eso la misma pregunta puede dar respuestas un poco distintas cada vez. Cuánto margen tiene para elegir se puede ajustar.

Parece poco para todo lo que hace, pero el aprendizaje es enorme: un modelo se entrena con billones de tokens (millones de millones). Meta, por ejemplo, entrenó Llama 3 con más de 15 billones; Anthropic, OpenAI y Google no publican la cifra de sus modelos. Para predecir bien tanto texto, el modelo tiene que captar gramática, datos del mundo y formas de razonar, y de ahí salen capacidades como resumir, traducir o programar. Nadie se las programó una por una.

## De predecir texto a seguir instrucciones

Predecir texto no alcanza para tener un asistente. El entrenamiento tiene dos etapas:

- **Pre-entrenamiento (pre-training):** el modelo aprende a predecir texto leyendo una parte enorme de internet y otros documentos. Según la documentación de Anthropic, un modelo que solo pasó por esta etapa no es bueno respondiendo preguntas ni siguiendo instrucciones: tiende a continuar el texto, no a contestarlo.
- **Post-entrenamiento (post-training):** se lo sigue entrenando con ejemplos de conversaciones y con las preferencias de personas que comparan respuestas y eligen la mejor. A esta última técnica se la llama **RLHF**, por Reinforcement Learning from Human Feedback (aprendizaje por refuerzo con retroalimentación humana).

La segunda etapa es la que le enseña a seguir instrucciones, a responder con tono de asistente y a negarse a ciertos pedidos. Por eso un modelo hace caso a las instrucciones que se le dan antes de la conversación (el system prompt), y por eso a veces dice que no.

## Tokens: lo que el modelo realmente ve

El modelo no ve palabras ni letras. Ve **tokens**, que son pedazos de texto: una palabra entera, parte de una palabra o un signo. El programa que corta el texto en tokens se llama **tokenizador**, y cada proveedor tiene el suyo.

Un ejemplo: en el tokenizador de OpenAI, "Hola mundo" son 2 tokens, "Hola" y " mundo". El espacio va pegado al segundo token, lo que muestra que los tokens no son palabras.

Se usan pedazos y no palabras porque las palabras posibles son infinitas, y el modelo no sabría qué hacer con una que nunca vio. Tampoco se usan letras sueltas, porque cada texto sería larguísimo de procesar. Los pedazos son el punto medio: las palabras comunes entran enteras y las raras se arman con partes.

En español, las palabras largas se parten en más pedazos que en inglés:

<figure>
<p class="fig-title">La misma frase, cortada en tokens</p>
<div class="tok-row"><div class="tok-head"><span>Español: 4 palabras</span><b>9 tokens</b></div><div class="tok-text"><span class="tok-word"><span class="tok c0">Los</span></span><span class="tok-word"><span class="tok c1">electro</span><span class="tok c2">domést</span><span class="tok c3">icos</span></span><span class="tok-word"><span class="tok c4">llegaron</span></span><span class="tok-word"><span class="tok c0">des</span><span class="tok c1">arm</span><span class="tok c2">ados</span><span class="tok c3">.</span></span></div></div>
<div class="tok-row"><div class="tok-head"><span>Inglés: 5 palabras</span><b>7 tokens</b></div><div class="tok-text"><span class="tok-word"><span class="tok c0">The</span></span><span class="tok-word"><span class="tok c1">household</span></span><span class="tok-word"><span class="tok c2">appliances</span></span><span class="tok-word"><span class="tok c3">arrived</span></span><span class="tok-word"><span class="tok c4">dis</span><span class="tok c0">assembled</span><span class="tok c1">.</span></span></div></div>
<figcaption>Cada color es un token. Las palabras largas del español se parten en más pedazos. Cortado con o200k_base, el tokenizador público de OpenAI que usan GPT-4o y GPT-5; cada modelo corta distinto, y con palabras cortas y comunes la diferencia entre idiomas es más chica.</figcaption>
</figure>

Cuánto texto entra en un token también depende del proveedor. En inglés, la regla que publica cada uno es esta:

<figure>
<p class="fig-title">Cuántas palabras en inglés entran en un millón de tokens</p>
<div class="bars">
<div class="bar-row"><span>Claude</span><div class="bar-track" title="Claude: unas 555 mil palabras"><div class="bar" style="width:55.5%"></div></div><span class="bar-val">555 mil</span></div>
<div class="bar-row"><span>GPT</span><div class="bar-track" title="GPT: unas 750 mil palabras"><div class="bar" style="width:75%"></div></div><span class="bar-val">750 mil</span></div>
<div class="bar-row"><span>Gemini</span><div class="bar-track" title="Gemini: entre 600 y 800 mil palabras"><div class="bar" style="width:60%;border-radius:0"></div><div class="bar bar--range" style="left:60%;width:20%"></div></div><span class="bar-val">600 a 800 mil</span></div>
<div class="bar-axis"><span></span><span><span style="left:0">0</span><span style="left:25%">250 mil</span><span style="left:50%">500 mil</span><span style="left:75%">750 mil</span><span style="left:100%">1 millón</span></span><span></span></div>
</div>
<figcaption>La cifra de Claude es la de su tokenizador actual. Las de OpenAI y Google son reglas generales para cualquier modelo suyo (Google da un rango, por eso la barra rayada), así que la comparación es aproximada. Fuentes: documentación de Anthropic, OpenAI y Google, octubre de 2026.</figcaption>
</figure>

La cuenta puede cambiar incluso dentro de un mismo proveedor. Anthropic cambió de tokenizador con Claude Opus 4.7: antes, en un millón de tokens entraban unas 750 mil palabras en inglés, y ahora entran 555 mil. Según Anthropic, el mismo texto da alrededor de un 30% más de tokens.

Ningún proveedor publica una cifra oficial para el español. Para saber el número exacto de un texto hay que medirlo: Anthropic y Google ofrecen en su API una función que cuenta los tokens antes de mandar el pedido, y OpenAI publica su tokenizador (tiktoken) y una página web para probarlo.

## Por qué importan los tokens

Los tokens son la unidad de casi todo lo que importa al construir con un modelo:

- **El costo.** Se paga por token, y los que genera el modelo cuestan bastante más que los que se le mandan. En los tres grandes, en octubre de 2026, un token de salida cuesta 5 veces uno de entrada: Claude Opus 5.5 cobra 4 dólares por millón de tokens de entrada y 20 por millón de salida; GPT-6.1 Sol, 2 y 10; Gemini 4 Argon, 2 y 10 hasta el 30 de noviembre y 4 y 20 desde diciembre. Si el modelo razona antes de responder, ese razonamiento también se cobra como salida, aunque no se muestre.
- **El tiempo de espera.** Como el modelo escribe un token por vez, lo que más tarda es la respuesta. Según la guía de OpenAI, recortar la salida a la mitad puede bajar la espera cerca de un 50%, mientras que recortar a la mitad el texto que se manda la baja apenas entre 1% y 5%.
- **Los límites.** Lo que el modelo puede procesar en una sola llamada se mide en tokens: hoy, alrededor de un millón entre lo que entra y lo que sale, con un tope aparte para la respuesta (128 mil tokens en Claude).

## Entrenamiento e inferencia

Hay dos momentos muy distintos en la vida de un modelo:

- **Entrenamiento (training):** el proceso caro y lento en el que el modelo aprende. Lo hacen empresas como Anthropic, OpenAI o Google, con miles de placas de video (GPUs) durante meses. Quien construye un producto con IA no hace nunca el pre-entrenamiento; ajustar un modelo ya entrenado sí se puede, y eso se llama fine-tuning.
- **Inferencia (inference):** usar el modelo ya entrenado para generar una respuesta. Es lo que pasa cada vez que se le escribe a Claude o que una app llama a su API.

El entrenamiento tiene una fecha de corte. Los modelos actuales de Claude, por ejemplo, conocen el mundo hasta junio de 2026, según Anthropic. Usar el modelo no le enseña nada nuevo: si hace falta información posterior o privada, hay que dársela en el pedido.

Un modelo también se puede correr en la propia computadora. Los modelos abiertos chicos y medianos andan en una computadora de escritorio. Claude, GPT y Gemini no: sus empresas no publican el modelo, así que solo se usan por la API. En una app que usan clientes, lo normal es la API: la inferencia pasa en los servidores del proveedor y la computadora propia solo manda y recibe texto. Por eso no hacen falta máquinas potentes para construir con IA.

## En resumen

- Un modelo de lenguaje predice el siguiente token, uno por vez, eligiendo entre las opciones más probables.
- Aprende a predecir texto en el pre-entrenamiento, y a seguir instrucciones en el post-entrenamiento.
- Los tokens definen lo que se paga, lo que se espera y lo que entra. La salida cuesta 5 veces la entrada y es lo que más tarda.
- Entrenar es caro y lo hacen pocos. Usar el modelo (inferencia) es lo que hace todo el mundo, y el modelo no sabe nada posterior a su fecha de corte.

El próximo post sigue con dos ideas más: dónde queda guardado lo que el modelo aprendió (los pesos) y cómo se estructura una conversación (los roles).
