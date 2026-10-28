---
title: "RAG: conceptos clave y cuándo usarlo"
date: 2026-10-28
order: 13
draft: true
description: "Por qué la búsqueda de un RAG trae el fragmento equivocado y cómo se mejora: filtros, reranking, búsqueda híbrida, Contextual Retrieval y búsqueda con agentes. Y cuándo conviene poner todo en el prompt o hacer fine-tuning, con lo que ofrecen Claude, OpenAI y Gemini."
---

Un RAG de punta a punta entra en treinta líneas: cortar los documentos, convertirlos en números, buscar los fragmentos más parecidos a la pregunta y ponerlos en el prompt. Pero con la pizzería ya aparecieron dos fallas.

La búsqueda siempre trae algo. "Cuánto sale la muzzarella?" trajo dos fragmentos con puntajes de 0,40 y 0,39, aunque ninguno tenía precios. Y el más parecido no siempre es el correcto: con un modelo de embeddings chico, la pregunta por la de rúcula trajo primero la fugazzeta, porque dice "frutos secos" con todas las letras.

Con La Esquina en 30 locales aparece una tercera. Cada local tiene su horario, y el fragmento de cada uno dice algo como "Horario: todos los días, de 19 a 24". Ninguno dice de qué local es. Si un cliente pregunta "Abren los lunes en Villa Sur?", la búsqueda trae un horario, pero puede ser el de cualquiera.

Como se vio, si la búsqueda trae el pedazo equivocado, el modelo responde con el pedazo equivocado. Este post trata de cómo se mejora la búsqueda y de cuándo conviene otra cosa en vez de RAG.

## Por qué falla la búsqueda

Hay tres causas, y cada técnica que sigue ataca una:

- **El fragmento suelto no dice de qué es.** Cortar un documento le saca el contexto: el horario no dice de qué local, la advertencia no dice de qué producto.
- **Parecido no es lo mismo que correcto.** Los embeddings miden cuánto se parecen dos textos, no si uno responde al otro. La fugazzeta se parece mucho a la pregunta de la rúcula y no la responde.
- **Los embeddings son buenos con el significado y flojos con lo exacto.** Un número de lote, un código de producto o el nombre de un proveedor pueden quedar lejos de la pregunta aunque coincidan letra por letra.

## Filtrar antes de buscar

Lo más simple primero. Cada fragmento se puede guardar con **metadatos**: datos sobre el fragmento, como de qué local es, qué tipo de documento es o de qué fecha. Si el cliente escribe al WhatsApp del local de Villa Sur, la búsqueda se limita a los fragmentos de ese local antes de comparar nada.

Con 30 locales, eso saca de la cancha 29 horarios que se parecían igual. No necesita ningún modelo: si los fragmentos están en tu base de datos, es una condición más en la consulta. OpenAI y Gemini lo traen en sus búsquedas armadas, con datos que se le cargan a cada archivo.

Sirve cuando la pregunta trae el dato o tu código lo conoce. Cuando no, hacen falta las técnicas que siguen.

## Reranking: releer los candidatos

La búsqueda por embeddings es rápida porque convierte la pregunta y cada fragmento por separado, y después solo compara números. Ese es también su límite: el modelo nunca ve la pregunta y el fragmento juntos.

Un **reranker** sí. Es un modelo que recibe la pregunta y un fragmento a la vez y da un puntaje de qué tan bien lo responde. Es más preciso y más lento, así que se usa en dos pasos: la búsqueda trae muchos candidatos rápido, y el reranker los reordena y se queda con los mejores. En su prueba de 2024, Anthropic traía 150 candidatos y el reranker se quedaba con 20.

Este es el paso del reranking sobre el código de RAG que ya se vio. Usa Voyage AI, una empresa especializada en modelos de embeddings y rerankers, que hoy es parte de MongoDB (una empresa de bases de datos) y es la que usa la documentación de Claude:

```python
import numpy as np
import voyageai

fragmentos = [
    "Rúcula y parmesano: muzzarella, rúcula, parmesano y pesto de la casa. El pesto lleva nueces.",
    "Fugazzeta: cebolla, muzzarella y orégano. No lleva frutos secos.",
    "Masa sin TACC: se hace en un horno aparte y se pide con 24 horas de anticipación.",
    "Envíos: Centro, Barrio Norte y Villa Sur. Fuera de esas zonas, solo retiro en el local.",
    "Horario: de martes a domingo, de 19 a 24. Los lunes está cerrado.",
    "Si un pedido llega frío, se repone sin cargo. Pedir una foto y el número de pedido.",
]

vo = voyageai.Client()  # toma la clave de VOYAGE_API_KEY
def embeber(textos, tipo):
    return np.array(vo.embed(textos, model="voyage-4", input_type=tipo).embeddings)

vectores = embeber(fragmentos, "document")  # indexar, como siempre

pregunta = "Me llegó la pizza helada"

# Paso 1: la búsqueda por embeddings trae varios candidatos, rápido
similitud = vectores @ embeber([pregunta], "query")[0]
candidatos = [fragmentos[i] for i in np.argsort(-similitud)[:4]]

# Paso 2: el reranker lee la pregunta junto a cada candidato y los reordena
r = vo.rerank(pregunta, candidatos, model="rerank-3", top_k=2)
for x in r.results:
    print(f"{x.relevance_score:.2f}  {x.document}")
```

Lo nuevo son las últimas cuatro líneas. El reranker recibe texto, no números: la pregunta y los candidatos tal cual. Y `top_k=2` es el k de siempre, aplicado después de reordenar.

Qué arregla, con el modelo de embeddings chico y dos rerankers abiertos que corren en la computadora:

- **"Me llegó la pizza helada": sí.** La búsqueda por embeddings deja el reclamo por pedido frío tercero, detrás de la rúcula y la fugazzeta. El reranker lo sube al primer lugar.
- **La pregunta de la rúcula: no.** Los dos rerankers siguen poniendo primero la fugazzeta. También ven "frutos secos" en las dos y no terminan de entender que la pregunta es por la de rúcula.

Lo que sí arregló la rúcula fue reescribir la pregunta antes de buscar: con "La pizza de rúcula y parmesano lleva frutos secos?", el reranker puso la rúcula primera, por poco. OpenAI ofrece eso armado en su búsqueda: un modelo reescribe la pregunta antes de buscar. Con Voyage los resultados pueden ser otros: esa versión necesita clave y no está probada acá.

## Búsqueda híbrida: sumar las palabras exactas

Antes de los embeddings, los buscadores encontraban texto por palabras. El método más usado se llama **BM25**, y es el que trae por defecto Elasticsearch, uno de los buscadores de texto más usados. En criollo, BM25:

- Cuenta qué palabras de la pregunta aparecen en cada fragmento.
- Les da más peso a las palabras raras, las que aparecen en pocos fragmentos, que a las comunes.
- No premia de más que una palabra se repita mucho ni que el fragmento sea largo.

No entiende sinónimos: para "Me llegó la pizza helada" no encuentra nada útil, porque ningún fragmento dice "helada". Pero es bueno justo donde los embeddings flojean: Anthropic lo recomienda para preguntas con códigos o términos técnicos únicos, como el número de lote de una ficha de proveedor.

La **búsqueda híbrida** corre las dos búsquedas y junta los resultados. Como los puntajes de una y otra están en escalas distintas, se juntan por posición: el método más común, Reciprocal Rank Fusion, le da a cada fragmento puntos según en qué lugar quedó en cada lista, y los suma. Lo propuso la Universidad de Waterloo en 2009 en [Reciprocal Rank Fusion outperforms Condorcet and Individual Rank Learning Methods](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf).

Con la pizzería no mejoró nada. En la pregunta de la rúcula, una búsqueda ponía primera la fugazzeta y la otra la rúcula, y al juntarlas empataron exacto. Y con otro armado, la híbrida bajó del primero al tercer lugar una pregunta que antes salía bien, porque BM25 premió una palabra común como "la". BM25 rinde con muchos documentos y nombres o códigos exactos. Con seis fragmentos de una línea, no se nota.

## Contextual Retrieval: decirle a cada fragmento de dónde sale

La tercera causa, el fragmento que no dice de qué es, tiene su propia técnica. Anthropic la publicó en septiembre de 2024 en [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval).

La idea: antes de convertir cada fragmento en números, un modelo chico y barato lee el documento entero y le escribe al fragmento una o dos oraciones que dicen de dónde sale. Ese texto se guarda pegado al fragmento, y las dos búsquedas, la de embeddings y la de palabras, lo usan.

<figure>
<p class="fig-title">Tres horarios, sin y con contexto</p>
<div class="tok-row"><div class="tok-head"><span>Sin contexto</span><b>3 fragmentos</b></div><div class="tok-text"><span class="tok c4">Horario: de martes a domingo, de 19 a 24. Los lunes está cerrado.</span><span class="tok c4">Horario: todos los días, de 19 a 24.</span><span class="tok c4">Horario: todos los días, de 12 a 15 y de 19 a 24.</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Con contexto</span><b>3 fragmentos</b></div><div class="tok-text"><span class="tok c2">Horario del local Centro, de la carta de octubre.</span><span class="tok c4">Horario: de martes a domingo, de 19 a 24. Los lunes está cerrado.</span><span class="tok c2">Horario del local Villa Sur, de la carta de octubre.</span><span class="tok c4">Horario: todos los días, de 19 a 24.</span><span class="tok c2">Horario del local Barrio Norte, de la carta de octubre.</span><span class="tok c4">Horario: todos los días, de 12 a 15 y de 19 a 24.</span></div></div>
<figcaption><ul><li>Celeste: el fragmento original.</li><li>Naranja: la oración que escribe el modelo antes de indexar.</li><li>Sin contexto, para "Abren los lunes en Villa Sur?" los tres horarios valen lo mismo: ninguno dice de qué local es.</li><li>Con contexto, "Villa Sur" aparece en un solo fragmento, y las dos búsquedas lo encuentran.</li></ul></figcaption>
</figure>

Anthropic midió cuántas veces el fragmento correcto no aparecía entre los 20 primeros que se pasan al modelo. Esa medida se llama recall@20: de cada 100 preguntas, en cuántas el fragmento que responde llega al prompt. Con la búsqueda por embeddings sola, fallaba el 5,7% de las veces. Con contexto agregado, 3,7% (35% menos fallas). Sumando búsqueda por palabras, 2,9% (49% menos). Y sumando además un reranker, 1,9%: 67% menos fallas.

Escribir el contexto se paga una vez, al indexar. Anthropic calculó USD 1,02 por millón de tokens de documentos, aprovechando la caché para no pagar el documento entero en cada fragmento.

Hay modelos de embeddings que hacen algo parecido sin escribir texto: reciben todos los fragmentos de un documento juntos, y cada vector refleja el documento entero. Voyage tiene uno, `voyage-context-4`.

Así se ve la búsqueda completa, con las cuatro piezas juntas:

<figure>
<p class="fig-title">Buscar en dos pasos</p>
<svg viewBox="0 0 400 560" width="100%" role="img" aria-labelledby="g13t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g13t">Diagrama de la búsqueda en dos pasos: la pregunta del cliente pasa por un filtro que deja solo los fragmentos de su local; después se busca por significado con embeddings y por palabras con BM25; las dos listas se juntan por posición; un reranker relee los candidatos y se queda con los mejores; tu código arma el prompt y Claude responde.</title>
<defs><marker id="g13ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<rect x="100" y="14" width="200" height="54" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="36.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">"Abren los lunes</text>
<text x="200.0" y="54.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">en Villa Sur?"</text>
<path d="M200 68V90" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="100" y="92" width="200" height="46" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="119.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Filtro: solo Villa Sur</text>
<path d="M160 138L102 166" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<path d="M240 138L298 166" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="10" y="168" width="180" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="100.0" y="192.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Por significado</text>
<text x="100.0" y="211.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">embeddings</text>
<rect x="210" y="168" width="180" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="300.0" y="192.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Por palabras</text>
<text x="300.0" y="211.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">BM25</text>
<path d="M100 224L168 254" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<path d="M300 224L232 254" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="100" y="256" width="200" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="280.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Juntar las dos listas</text>
<text x="200.0" y="299.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">150 candidatos</text>
<path d="M200 312V334" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="100" y="336" width="200" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="360.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Reranker</text>
<text x="200.0" y="379.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">se queda con los 20 mejores</text>
<path d="M200 392V414" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="100" y="416" width="200" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="440.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Armar el prompt</text>
<text x="200.0" y="459.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">los 20, arriba de la pregunta</text>
<path d="M200 472V494" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="100" y="496" width="200" height="46" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="523.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Claude responde</text>
</svg>
<figcaption><ul><li>Celeste: lo que escribe el cliente.</li><li>Rojo: el filtro, que deja afuera los fragmentos de los otros 29 locales antes de buscar.</li><li>Verde: los modelos (el de embeddings, el reranker y Claude).</li><li>Naranja: tu código.</li><li>Las cantidades son las de la prueba de Anthropic: 150 candidatos, 20 al prompt.</li></ul></figcaption>
</figure>

## Cortar mejor

En vez de cortar cada tantos tokens, se puede cortar donde cambia el tema o respetando los títulos del documento: cada sección de la ficha del proveedor, un fragmento. Chroma, una empresa que vende una base vectorial, lo midió en 2024 en [Evaluating Chunking Strategies for Retrieval](https://www.trychroma.com/research/evaluating-chunking). Cortar por significado anduvo bien, pero un corte simple de unos 200 tokens, sin solapamiento y respetando párrafos y oraciones, anduvo casi igual. Lo que más pesó fue el tamaño: el corte por defecto de OpenAI, de 800 tokens con 400 de solapamiento, quedó entre los peores. Antes de cortar más inteligente, conviene probar fragmentos más chicos.

## Búsqueda agéntica: que el modelo decida cuándo buscar

Hasta acá, la búsqueda corre siempre una vez, antes de responder. Pero hay preguntas que necesitan dos búsquedas distintas: "Pedí la de rúcula en Villa Sur hace una hora y no llegó: me devuelven la plata?" necesita las zonas de envío de ese local y la política de reclamos.

La otra forma es la que se vio con los agentes: la búsqueda pasa a ser una herramienta, y el modelo decide cuándo buscar, qué buscar y si vuelve a buscar con otras palabras. Cada búsqueda es una vuelta más del loop, con su costo y su demora.

La versión extrema es Claude Code, el asistente de programación de Anthropic que trabaja sobre los archivos de un proyecto. En [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), de septiembre de 2025, Anthropic cuenta que no arma un índice de embeddings del proyecto: busca en los archivos en el momento, con comandos como `grep`, y así se evita buscar en un índice desactualizado. La contracara, en sus palabras: explorar en el momento es más lento que buscar en algo ya indexado.

Para preguntas globales, como "Cuáles son las quejas más repetidas en los 30 locales este año?", ninguna búsqueda de fragmentos sirve: la respuesta no está en ningún pedazo. Para eso Microsoft Research, el área de investigación de Microsoft, propuso en 2024 [GraphRAG](https://arxiv.org/abs/2404.16130): un modelo lee todo y arma un mapa de qué cosas hay (locales, proveedores, reclamos) y cómo se relacionan, y se responde sobre ese mapa. Es caro de armar, y no encontré comparaciones independientes recientes.

## Cómo saber si mejoró

Ninguna de estas técnicas mejora siempre. Con la pizzería, el reranker arregló una pregunta y no otra, y la búsqueda híbrida empeoró una que andaba. Por eso, antes de sumar una pieza, conviene armar unas cuantas preguntas con el fragmento que las responde y medir antes y después cuántas veces llega al prompt. Cómo se arma eso se ve más adelante en la serie.

## Cuándo conviene otra cosa

RAG no es la única forma de darle al modelo lo que necesita saber. Hay dos alternativas, y una sirve para algo distinto.

### Ponerlo todo en el prompt, con caché

La regla de Anthropic: si tus documentos tienen menos de unos 200.000 tokens, ponelos enteros en el prompt. Lo que lo hace viable es el **prompt caching**: la parte del prompt que se repite igual en cada mensaje se guarda y se cobra mucho más barata. Se ve en detalle más adelante en la serie.

Una cuenta con un solo local de La Esquina, con su carta, el manual, las fichas de proveedores y los reclamos del año. Supongamos que son unos 150.000 tokens (es un número de ejemplo, no medido). Con Claude Opus 5.5, solo la entrada de cada mensaje:

- **Todo en el prompt, sin caché:** USD 0,60 por mensaje.
- **Todo en el prompt, leído de caché:** USD 0,03.
- **RAG, con unos 3.000 tokens de fragmentos e instrucciones:** USD 0,012.

Con caché, ponerlo todo cuesta dos veces y media lo que RAG, y no tiene búsqueda que falle. Para un local, puede ser la mejor opción.

RAG gana en tres casos:

- **No entra.** Los 30 locales pasan del millón de tokens, el máximo de los grandes modelos de hoy.
- **Cambia todo el día.** Cada reclamo nuevo cambia la parte fija del prompt, y volver a guardarla en caché cuesta USD 0,75 cada vez.
- **El texto de más molesta.** Como se vio con la ventana de contexto, con mucho texto alrededor el modelo encuentra peor el dato.

### Fine-tuning

El **fine-tuning** es seguir entrenando un modelo con ejemplos tuyos, para que cambien sus pesos. Suena a la forma de que "aprenda" tu carta, y es la confusión más común del tema.

OpenAI lo explica en [Optimizing LLM accuracy](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy): hay que trabajar el contexto (RAG) cuando al modelo le falta conocimiento, porque no estaba en su entrenamiento, está desactualizado o es privado. Y hay que trabajar el modelo (fine-tuning) cuando responde con formato inconsistente, con el tono equivocado o sin seguir el razonamiento pedido. Uno es lo que sabe. El otro, cómo responde.

Para la carta de 30 locales, el fine-tuning no sirve. Lo que aprende queda fijo en los pesos, y la carta cambia. No dice de dónde sacó un dato. Y cada cambio obliga a volver a entrenar.

Además, hoy casi no está disponible:

- **OpenAI lo está cerrando.** Desde mayo de 2026 no acepta organizaciones que no lo hayan usado antes, y desde el 6 de enero de 2027 nadie va a poder crear entrenamientos nuevos. Los modelos ya entrenados siguen andando.
- **Anthropic no lo ofrece para sus modelos actuales.** El único camino era Claude 3 Haiku en Amazon Bedrock, el servicio de Amazon para usar modelos de varias empresas, y ese modelo ya fue retirado.
- **Google lo ofrece solo en su plataforma para empresas**, para algunos modelos Flash y Gemini 2.5 Pro, no para Gemini 4. En la API de Gemini no está.

Si el problema es cómo responde, lo primero son instrucciones claras y unos pocos ejemplos en el system prompt, como se vio con el prompting. El fine-tuning queda para cuando eso no alcanza y tu proveedor lo ofrece.

<figure>
<p class="fig-title">Qué usar</p>
<svg viewBox="0 0 400 540" width="100%" role="img" aria-labelledby="g13bt" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g13bt">Diagrama de decisión: si el problema es que el modelo no conoce tus datos y entran en el prompt y cambian poco, van en el prompt con caché; si no entran o cambian seguido, RAG. Si el problema es cómo responde, primero instrucciones y ejemplos en el prompt; si no alcanza, fine-tuning, si tu proveedor lo ofrece.</title>
<defs><marker id="g13bink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<rect x="10" y="14" width="230" height="58" rx="10" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="38.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">El problema es que</text>
<text x="125.0" y="56.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">no conoce tus datos?</text>
<path d="M125 72V106" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="135" y="94" font-size="14" fill="var(--color-muted)" text-anchor="start">si</text>
<rect x="10" y="108" width="230" height="58" rx="10" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="132.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Entran en el prompt</text>
<text x="125.0" y="150.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">y cambian poco?</text>
<path d="M240 137H260" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="250" y="128" font-size="14" fill="var(--color-muted)" text-anchor="middle">si</text>
<rect x="262" y="108" width="128" height="58" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="326.0" y="132.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">En el prompt,</text>
<text x="326.0" y="150.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">con caché</text>
<path d="M125 166V200" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="135" y="188" font-size="14" fill="var(--color-muted)" text-anchor="start">no</text>
<rect x="10" y="202" width="230" height="46" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="229.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">RAG</text>
<path d="M240 43H394V330H242" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="388" y="228" font-size="14" fill="var(--color-muted)" text-anchor="end">no: el problema</text>
<text x="388" y="245" font-size="14" fill="var(--color-muted)" text-anchor="end">es cómo responde</text>
<rect x="10" y="302" width="230" height="58" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="326.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Instrucciones y</text>
<text x="125.0" y="344.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">ejemplos en el prompt</text>
<path d="M125 360V394" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<rect x="10" y="396" width="230" height="46" rx="10" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="423.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Alcanza?</text>
<path d="M240 419H260" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="250" y="410" font-size="14" fill="var(--color-muted)" text-anchor="middle">si</text>
<rect x="262" y="400" width="110" height="38" rx="19" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="317.0" y="423.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Listo</text>
<path d="M125 442V476" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="135" y="464" font-size="14" fill="var(--color-muted)" text-anchor="start">no</text>
<rect x="10" y="478" width="230" height="52" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="499.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Fine-tuning, si tu</text>
<text x="125.0" y="517.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">proveedor lo ofrece</text>
</svg>
<figcaption><ul><li>Blanco: las preguntas.</li><li>Naranja: lo que se resuelve con tu prompt y tu código.</li><li>Verde: lo que cambia el modelo.</li><li>Primero hay que saber qué falla: si no sabe algo, o si lo sabe y responde mal.</li></ul></figcaption>
</figure>

## Lo mismo en los tres

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Reranker | No tiene propio. Su documentación usa Voyage (`rerank-3`) | No hay uno suelto: su File Search ordena por dentro | Un servicio de reranking en su plataforma para empresas |
| Búsqueda híbrida armada | No: queda en tu código | File Search junta embeddings y palabras, y se ajusta el peso de cada una | File Search busca solo por embeddings, según su documentación |
| Filtros por metadatos | En tu código | Sí, con datos que se le cargan a cada archivo | Sí, con datos que se le cargan a cada archivo |
| Fine-tuning | No, para los modelos actuales | Cerrando: desde enero de 2027, nadie | Solo en su plataforma para empresas, y no para Gemini 4 |

OpenAI trae la búsqueda armada más completa: híbrida, con filtros, reescritura de la pregunta y un umbral para descartar resultados flojos. Con Claude, todo lo de este post queda de tu lado, con el reranker y la base que elijas.

## En resumen

- La búsqueda falla por tres causas: el fragmento no dice de qué es, parecido no es correcto, y los embeddings son flojos con lo exacto.
- Los filtros por metadatos acotan antes de buscar. Son lo más simple, y lo primero si la pregunta trae el dato.
- El reranking relee los candidatos junto con la pregunta y los reordena.
- La búsqueda híbrida suma la búsqueda por palabras (BM25) para nombres y códigos exactos.
- Contextual Retrieval le escribe a cada fragmento de dónde sale. Con las tres técnicas juntas, Anthropic midió 67% menos fallas.
- Un agente puede buscar varias veces, a cambio de más vueltas.
- Ninguna técnica mejora siempre: se mide con preguntas conocidas, antes y después.
- Si tus documentos entran y cambian poco, ponerlos en el prompt con caché puede ser mejor que RAG.
- El fine-tuning cambia cómo responde un modelo, no lo que sabe. Y hoy casi no está disponible.

Hasta acá, el asistente responde con texto libre. Más adelante en la serie: cómo pedirle al modelo una respuesta con un formato fijo que tu código pueda leer.
