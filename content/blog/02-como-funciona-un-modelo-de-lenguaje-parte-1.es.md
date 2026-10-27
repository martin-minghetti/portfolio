---
title: "Cómo funciona un modelo de lenguaje: qué es, tokens y entrenamiento"
date: 2026-10-25
order: 2
description: "Lo mínimo para no estar perdido: qué hace un modelo de lenguaje, qué son los tokens y la diferencia entre entrenar y usar un modelo."
---

No hace falta saber la matemática para trabajar con un modelo de lenguaje. Sí hace falta un modelo mental correcto, porque casi todo lo que viene en esta serie depende de él. Este post y el siguiente son ese modelo mental, lo mínimo para no estar perdido.

## Qué es un modelo de lenguaje

Un modelo de lenguaje es un programa que aprendió, leyendo cantidades enormes de texto, a **predecir cuál es la siguiente palabra** a partir de un texto anterior. En inglés se lo llama **LLM** (Large Language Model, modelo de lenguaje grande).

Eso es todo lo que hace en su núcleo: recibe un texto y predice qué viene después, una pieza por vez. Lo escribe, lo suma al texto, y vuelve a predecir.

Suena demasiado simple y engaña un poco. Como esa predicción se aprende sobre billones de ejemplos, aparecen capacidades que parecen razonamiento: resumir, traducir, programar, responder preguntas. Nadie le programó cada una de esas cosas. Salieron de predecir bien.

## Tokens: lo que el modelo realmente ve

El modelo no ve palabras. Ve **tokens**, que son pedazos de texto: una palabra, parte de una palabra, un signo de puntuación. "Hola mundo" puede ser 3 o 4 tokens, según cómo lo corte el modelo.

Esto importa por dos razones prácticas:

- **Se paga por token**, tanto el que entra como el que sale. Más tokens significa más plata y más tiempo de espera.
- **Los límites del modelo se miden en tokens**, no en palabras. Cuánto texto cabe en una conversación es una cuenta en tokens.

Cuánto texto entra en un token depende del modelo, porque cada proveedor corta el texto a su manera. En inglés, la regla que publica cada uno es esta:

<figure>
<p class="fig-title">Cuántas palabras en inglés entran en un millón de tokens</p>
<div class="bars">
<div class="bar-row"><span>Claude</span><div class="bar-track" title="Claude: unas 555 mil palabras"><div class="bar" style="width:55.5%"></div></div><span class="bar-val">555 mil</span></div>
<div class="bar-row"><span>ChatGPT</span><div class="bar-track" title="ChatGPT: unas 750 mil palabras"><div class="bar" style="width:75%"></div></div><span class="bar-val">750 mil</span></div>
<div class="bar-row"><span>Gemini</span><div class="bar-track" title="Gemini: entre 600 y 800 mil palabras"><div class="bar" style="width:60%;border-radius:0"></div><div class="bar bar--range" style="left:60%;width:20%"></div></div><span class="bar-val">600 a 800 mil</span></div>
<div class="bar-axis"><span></span><span><span style="left:0">0</span><span style="left:25%">250 mil</span><span style="left:50%">500 mil</span><span style="left:75%">750 mil</span><span style="left:100%">1 millón</span></span><span></span></div>
</div>
<figcaption>Es la regla que publica cada proveedor para texto en inglés; Google da un rango, por eso la barra rayada. El mismo millón de tokens no rinde lo mismo en cada uno, así que comparar precios por token entre proveedores engaña un poco. Fuentes: documentación de Anthropic, OpenAI y Google, octubre de 2026.</figcaption>
</figure>

En español sale algo más caro, porque las palabras largas se parten en más pedazos:

<figure>
<p class="fig-title">La misma frase, cortada en tokens</p>
<div class="tok-row"><div class="tok-head"><span>Español: 4 palabras</span><b>9 tokens</b></div><div class="tok-text"><span class="tok-word"><span class="tok">Los</span></span><span class="tok-word"><span class="tok">electro</span><span class="tok">domést</span><span class="tok">icos</span></span><span class="tok-word"><span class="tok">llegaron</span></span><span class="tok-word"><span class="tok">des</span><span class="tok">arm</span><span class="tok">ados</span><span class="tok">.</span></span></div></div>
<div class="tok-row"><div class="tok-head"><span>Inglés: 5 palabras</span><b>7 tokens</b></div><div class="tok-text"><span class="tok-word"><span class="tok">The</span></span><span class="tok-word"><span class="tok">household</span></span><span class="tok-word"><span class="tok">appliances</span></span><span class="tok-word"><span class="tok">arrived</span></span><span class="tok-word"><span class="tok">dis</span><span class="tok">assembled</span><span class="tok">.</span></span></div></div>
<figcaption>Cada color es un token. Las palabras largas del español se parten en más pedazos. Cortado con o200k, el tokenizador público de OpenAI; cada modelo corta distinto, y con palabras cortas y comunes la diferencia entre idiomas es más chica.</figcaption>
</figure>

Ningún proveedor publica una cifra oficial para el español, así que para saber el número exacto de un texto conviene medirlo con el contador de tokens que ofrece la API.

## Entrenamiento e inferencia

Hay dos momentos muy distintos en la vida de un modelo:

- **Entrenamiento (training):** el proceso caro y lento en el que el modelo aprende leyendo una parte enorme de internet y otros textos. Lo hacen empresas como Anthropic, OpenAI o Google, con miles de placas de video (GPUs) durante meses. Quien construye un producto con IA no hace esto nunca.
- **Inferencia (inference):** usar el modelo ya entrenado para generar una respuesta. Es lo que pasa cada vez que se le escribe a Claude o que una app llama a su API. Es rápido y relativamente barato.

Se puede correr un modelo en la propia computadora, y eso es hacer inferencia en hardware propio. Hoy una Mac con chip Apple Silicon corre modelos chicos y medianos, según estimaciones de terceros, pero no los modelos más grandes, que tienen cientos de miles de millones de parámetros.

En producción lo normal sigue siendo la API: la inferencia pasa en los servidores del proveedor, y la computadora de uno solo manda texto y recibe texto. Por eso no hacen falta máquinas potentes para construir con IA. El trabajo pesado ocurre del otro lado.

## Para quedarse con algo

- Un modelo de lenguaje predice la siguiente pieza de texto, una por vez.
- Lo que ve son tokens, no palabras, y los tokens son la unidad de costo y de límite.
- Entrenar es caro y lo hacen pocos. Usar el modelo (inferencia) es lo que hace todo el mundo.

El próximo post sigue con dos ideas más de este modelo mental: dónde queda guardado lo que el modelo aprendió (los pesos) y cómo se estructura una conversación (los roles).
