---
title: "RAG: el problema y cómo funciona"
date: 2026-10-28
order: 12
draft: true
description: "Qué problema resuelve RAG, cuándo no hace falta, cómo se cortan e indexan los documentos, qué es un embedding, cómo se buscan los fragmentos más parecidos y se arman en el prompt, el código de punta a punta y qué ofrecen Claude, OpenAI y Gemini."
---

Un cliente le escribe al asistente de la pizzería: "La de rúcula tiene frutos secos? Mi hijo es alérgico".

Si La Esquina es una sola pizzería, la respuesta es fácil. La carta con los ingredientes, los horarios y las zonas de envío ocupan unos pocos miles de tokens. Van en el system prompt y listo: el modelo los lee en cada mensaje y responde con eso.

Pero supongamos que La Esquina creció. Ahora son 30 locales, cada uno con su carta, su horario y sus zonas. Hay un manual para los empleados, fichas en PDF de cada proveedor con los alérgenos de cada insumo y un historial de reclamos que crece todos los días. La respuesta a la pregunta de la rúcula no está en la carta: está en la ficha del proveedor del pesto.

Eso ya no entra en el prompt. Y es una pregunta donde inventar es peligroso. Este post trata de cómo se le da al asistente acceso a documentos que no entran en la ventana de contexto.

## El problema

Un modelo sabe dos cosas: lo que vio cuando lo entrenaron, hasta su fecha de corte, y lo que le ponés en el prompt. No conoce la ficha del pesto de tu proveedor ni ningún documento tuyo. Y si le preguntás algo que no sabe, tiende a inventar una respuesta que suena bien.

La salida obvia es pegar todos los documentos en el prompt. Tiene tres problemas:

- **A veces no entra.** Los grandes modelos de hoy aceptan alrededor de un millón de tokens. La información de 30 locales, con manuales, fichas y años de reclamos, puede pasarse de eso.
- **Si entra, cada mensaje paga todo.** Con Claude Opus 5.5, mandar 300.000 tokens en cada mensaje cuesta USD 1,20 (USD 0,06 si están en caché). Para contestar si la rúcula lleva nueces, alcanza con un párrafo.
- **Con mucho texto alrededor, el modelo encuentra peor el dato.** Es lo que se vio con la ventana de contexto: a medida que se llena, el modelo recuerda con menos precisión lo que tiene adelante.

### Antes de seguir: si entra, ponelo en el prompt

Anthropic lo dice sin vueltas en [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval), de septiembre de 2024: si tu base de conocimiento tiene menos de 200.000 tokens (unas 500 páginas), podés ponerla entera en el prompt, y el prompt caching lo abarata.

Con una sola pizzería, no hace falta nada de lo que sigue. La carta va en el prompt. Lo que sigue es para cuando los documentos no entran, o son muchos más de lo que cada pregunta necesita.

## Qué es RAG

**RAG** viene de Retrieval-Augmented Generation, generación aumentada por recuperación. La idea entra en una oración: antes de responder, buscar en tus documentos los pedazos que sirven para esta pregunta y ponerlos en el prompt.

"Recuperar" es buscar. "Aumentar la generación" es que el modelo escribe la respuesta con esos pedazos adelante.

Lo importante: **el modelo no aprende nada**. No se entrena ni se modifica. Lee lo que le pasás, como cualquier prompt. RAG solo decide qué pedazos de tus documentos van en el prompt de cada pregunta.

Funciona en dos fases. Indexar, que se hace una vez. Y consultar, que se hace en cada mensaje.

<figure>
<p class="fig-title">Las dos fases de RAG</p>
<svg viewBox="0 0 400 846" width="100%" role="img" aria-labelledby="g12t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g12t">Diagrama de las dos fases de RAG. Indexar, una vez: los documentos se cortan en fragmentos, un modelo de embeddings convierte cada uno en 1.024 números y se guardan en una base vectorial. Consultar, en cada mensaje: la pregunta del cliente pasa por el mismo modelo de embeddings, se buscan en la base los fragmentos más parecidos, se arma el prompt con esos fragmentos arriba y la pregunta abajo, y Claude responde.</title>
<defs><marker id="g12ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<text x="10" y="22" font-size="15" fill="var(--color-ink)" text-anchor="start">1. Indexar: una vez</text>
<rect x="10" y="34" width="240" height="54" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="56.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Cartas, manual,</text>
<text x="130.0" y="74.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">fichas de proveedores</text>
<path d="M130 88V110" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="112" width="240" height="46" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="139.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Cortar en fragmentos</text>
<path d="M130 158V180" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="182" width="240" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="206.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Modelo de embeddings</text>
<text x="130.0" y="225.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">cada fragmento: 1.024 números</text>
<path d="M130 238V260" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="262" width="240" height="56" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="286.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Base vectorial</text>
<text x="130.0" y="305.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">fragmentos y sus números</text>
<text x="10" y="366" font-size="15" fill="var(--color-ink)" text-anchor="start">2. Consultar: en cada mensaje</text>
<rect x="10" y="378" width="240" height="56" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="401.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">"La de rúcula tiene</text>
<text x="130.0" y="419.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">frutos secos?"</text>
<path d="M130 434V456" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="458" width="240" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="482.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Modelo de embeddings</text>
<text x="130.0" y="501.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">la pregunta: 1.024 números</text>
<path d="M130 514V536" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="538" width="240" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="562.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Buscar los más parecidos</text>
<text x="130.0" y="581.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">los k de más arriba</text>
<path d="M250 290H330V566H254" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#g12ink)"/>
<text x="338" y="420" font-size="13.5" fill="var(--color-muted)" text-anchor="start">busca</text>
<text x="338" y="437" font-size="13.5" fill="var(--color-muted)" text-anchor="start">acá</text>
<path d="M130 594V616" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="618" width="240" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="642.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Armar el prompt</text>
<text x="130.0" y="661.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">fragmentos arriba, pregunta abajo</text>
<path d="M130 674V696" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="698" width="240" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="722.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Claude responde</text>
<text x="130.0" y="741.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">solo con esos fragmentos</text>
<path d="M130 754V776" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="45" y="778" width="170" height="40" rx="20" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="802.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Respuesta al cliente</text>
</svg>
<figcaption><ul><li>Celeste: lo que escribe el cliente.</li><li>Verde: los dos modelos. El de embeddings convierte texto en números; Claude escribe la respuesta.</li><li>Naranja: tu código.</li><li>Violeta: lo que se guarda, los documentos y la base vectorial.</li><li>La línea punteada: cada búsqueda usa lo que se guardó al indexar.</li></ul></figcaption>
</figure>

## Fase 1: indexar

Se hace una vez, y de nuevo cada vez que cambian los documentos.

### Cortar en fragmentos

La búsqueda tiene que traer un pedazo chico que responda, no un PDF de 40 páginas. Por eso los documentos se cortan en **fragmentos** (en inglés, **chunks**).

El tamaño importa. Muy grandes, y cada fragmento mezcla muchos temas: la búsqueda trae texto de más. Muy chicos, y pierden el contexto: un fragmento que dice "contiene nueces" no sirve si no se sabe de qué. Anthropic habla de fragmentos de no más de unos cientos de tokens. OpenAI, cuando corta por vos, usa por defecto 800 tokens.

OpenAI además repite 400 tokens entre un fragmento y el siguiente. Eso se llama **solapamiento**, y sirve para que una oración partida al medio aparezca entera en alguno de los dos:

<figure>
<p class="fig-title">La ficha del pesto, cortada en fragmentos</p>
<div class="tok-row"><div class="tok-head"><span>Sin solapamiento</span><b>3 fragmentos</b></div><div class="tok-text"><span class="tok c0">Pesto de albahaca. Ingredientes: albahaca, aceite de oliva,</span><span class="tok c1">queso, nueces y ajo. Puede contener</span><span class="tok c2">trazas de maní. Conservar en frío, hasta 5 días abierto.</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Con solapamiento</span><b>3 fragmentos</b></div><div class="tok-text"><span class="tok c0">Pesto de albahaca. Ingredientes: albahaca, aceite de oliva,</span><span class="tok c1">aceite de oliva, queso, nueces y ajo. Puede contener trazas de maní.</span><span class="tok c2">Puede contener trazas de maní. Conservar en frío, hasta 5 días abierto.</span></div></div>
<figcaption><ul><li>Cada color es un fragmento.</li><li>Sin solapamiento, "Puede contener trazas de maní" queda partida: un fragmento dice "puede contener" sin decir qué, y el otro dice "trazas de maní" sin el "puede contener".</li><li>Con solapamiento, el borde de cada fragmento se repite al principio del siguiente, y la advertencia queda entera.</li><li>Ficha inventada para el ejemplo, y fragmentos mucho más cortos que los reales.</li></ul></figcaption>
</figure>

### Convertir cada fragmento en números

Acá entra un segundo modelo, distinto del que responde. Es un **modelo de embeddings**: recibe un texto y devuelve una lista de números que representa su significado. Esa lista es el **embedding** (o vector) del texto.

Anthropic no tiene un modelo de embeddings propio. Su documentación usa los de Voyage AI, una empresa especializada en estos modelos que hoy es parte de MongoDB. Con el modelo de Voyage, cada fragmento se convierte en una lista de 1.024 números. Lo útil es esto: textos que dicen cosas parecidas quedan con números parecidos, aunque usen otras palabras. "Frutos secos" y "nueces" quedan cerca. "Me llegó la pizza helada" queda cerca de "si un pedido llega frío, se repone".

Una regla: el mismo modelo de embeddings para los documentos y para las preguntas. Los números de modelos distintos no se pueden comparar. Google lo avisa en su documentación: los vectores de su modelo viejo y del nuevo son incompatibles. Si cambiás de modelo, hay que volver a convertir todos los fragmentos.

### Guardarlos en una base vectorial

Cada fragmento se guarda junto con sus números en una **base vectorial** (en inglés, vector store): una base de datos que sabe buscar los vectores más cercanos a otro. Si ya usás Postgres, una base de datos de código abierto muy común, la extensión pgvector le agrega eso. Si no, hay servicios dedicados.

## Fase 2: consultar

En cada mensaje del cliente pasan cuatro cosas:

1. La pregunta pasa por el mismo modelo de embeddings y se convierte en su propia lista de números.
2. La base busca los fragmentos con los números más parecidos a los de la pregunta.
3. Tu código arma el prompt con esos fragmentos y la pregunta.
4. El modelo responde con eso adelante.

### Qué es "parecido"

Una lista de números se puede pensar como una flecha que apunta a algún lado. Dos textos con significado parecido dan flechas que apuntan para el mismo lado. La **similitud coseno** mide justo eso: 1 es la misma dirección, 0 es que no tienen nada que ver.

Voyage, OpenAI y Gemini entregan flechas del mismo largo (largo 1). Con eso, calcular el coseno es multiplicar los números de a pares y sumarlos, que es la cuenta más rápida que hay. Ojo: no todos los modelos lo hacen, y con uno que no lo hace esa cuenta da cualquier número.

### Cuántos traer

Se traen los **k** fragmentos más parecidos (el **top-k**). Pocos, y quizás quede afuera el que respondía. Muchos, y vuelve el problema del texto de más. En las pruebas de Anthropic de 2024, con fragmentos de unos cientos de tokens, pasar los 20 más parecidos rindió mejor que pasar 10 o 5. En el ejemplo de abajo hay seis fragmentos, así que alcanza con dos.

### Dónde van en el prompt

Los fragmentos van arriba y la pregunta abajo, separados con etiquetas. La [guía de prompting de Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) recomienda poner los documentos largos al principio: según sus pruebas, la pregunta al final mejora las respuestas hasta un 30%, sobre todo con varios documentos.

Y una instrucción que no puede faltar: responder solo con lo que está en los fragmentos, y decir que no sabe si no alcanza. Más abajo se ve por qué.

## Cómo se ve en código

Este es RAG de punta a punta con la pizzería, en Python. Usa Voyage para los embeddings y Claude para responder. Los fragmentos son de una línea para que se lean; en la vida real son de unos cientos de tokens.

```python
import numpy as np
import voyageai, anthropic

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

# Indexar: una vez, y de nuevo cuando cambian los documentos
vectores = embeber(fragmentos, "document")

# Consultar: en cada mensaje del cliente
pregunta = "La de rúcula tiene frutos secos? Mi hijo es alérgico"
p = embeber([pregunta], "query")[0]
similitud = vectores @ p           # vectores de largo 1: el producto punto es el coseno
top = np.argsort(-similitud)[:2]   # top-k, con k = 2
for i in top:
    print(f"{similitud[i]:.2f}  {fragmentos[i]}")

contexto = "\n".join(fragmentos[i] for i in top)
r = anthropic.Anthropic().messages.create(
    model="claude-opus-5-5", max_tokens=16000,
    system="Sos el asistente de la pizzería La Esquina. Respondé solo con la información "
           "de <info>. Si no alcanza, decí que lo consultás con el local.",
    messages=[{"role": "user", "content": f"<info>\n{contexto}\n</info>\n\n{pregunta}"}],
)
print("".join(b.text for b in r.content if b.type == "text"))
```

Lo que hay que mirar:

- **Las dos fases están separadas.** Indexar corre una vez. Consultar, en cada mensaje.
- **Hay dos modelos.** Voyage convierte texto en números; Claude escribe la respuesta. Es la confusión más común: el modelo que responde nunca ve los números, solo el texto de los fragmentos elegidos.
- **`input_type` marca qué es cada cosa.** Un fragmento se embebe como `"document"` y la pregunta como `"query"`. Voyage le agrega a cada uno un texto distinto antes de convertirlo, y eso mejora la búsqueda. Su documentación pide no omitirlo.
- **`vectores @ p` es la búsqueda.** Multiplica y suma: con vectores de largo 1, es el coseno. Con seis fragmentos alcanza con numpy, la librería de Python para hacer cuentas. Con miles, eso lo hace la base vectorial.
- **El prompt pone los fragmentos arriba**, entre etiquetas `<info>`, y la pregunta abajo.

Para probar solo la búsqueda sin clave, se puede reemplazar `embeber` por un modelo de embeddings que corre en la computadora, como EmbeddingGemma de Google (con la librería `fastembed`; la primera vez baja 1,2 GB). Con ese modelo, la búsqueda trae esto:

```text
0.44  Rúcula y parmesano: muzzarella, rúcula, parmesano y pesto de la casa. El pesto lleva nueces.
0.35  Fugazzeta: cebolla, muzzarella y orégano. No lleva frutos secos.
```

El fragmento que responde sale primero. Con Voyage los números serían otros; lo que importa es el orden.

## Lo que puede fallar

Con el mismo modelo local, dos pruebas muestran los límites de la búsqueda.

**Siempre trae algo.** Si el cliente pregunta "Cuánto sale la muzzarella?", no hay ningún fragmento con precios. La búsqueda igual devuelve dos: la rúcula con 0,40 y la fugazzeta con 0,39, porque las dos nombran la muzzarella. Son puntajes parecidos a los de la pregunta anterior, que sí tenía respuesta. La búsqueda no sabe que no encontró nada: trae los k más parecidos, sirvan o no. Por eso el prompt le da al modelo una salida: "si no alcanza, decí que lo consultás con el local". Sin esa línea, el modelo tiene adelante dos fragmentos que nombran la muzzarella y ningún precio, y puede inventar uno.

**El más parecido no siempre es el correcto.** Con un modelo de embeddings más chico (`paraphrase-multilingual-MiniLM-L12-v2`), la pregunta de la rúcula trae primero la fugazzeta, porque dice literalmente "frutos secos". Es el fragmento equivocado. Con k = 2, el correcto entra igual en el segundo lugar, y el modelo que responde puede leer los dos. Con k = 1, la respuesta habría sido "no lleva frutos secos". El modelo de embeddings importa, y traer más de uno da margen.

La idea que no hay que perder: **si la búsqueda trae el pedazo equivocado, el modelo responde con el pedazo equivocado**. Casi siempre, cuando un RAG responde mal, el problema está en la búsqueda, no en el modelo.

### El índice hay que mantenerlo

Si un local cambia el horario o el proveedor del pesto cambia la receta, hay que volver a cortar y embeber ese documento. Si no, el asistente responde muy seguro con datos viejos. Indexar no es una tarea que se hace una vez y se olvida: es una tarea que corre cada vez que cambian los documentos.

## Lo mismo en los tres

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Modelo de embeddings | No tiene propio. Su documentación usa Voyage: `voyage-4`, 1.024 números por texto | `text-embedding-3-small` (1.536 números) y `text-embedding-3-large` (3.072) | `gemini-embedding-2` (3.072 números), que también acepta imágenes, audio, video y PDF |
| Búsqueda armada | No hay: la búsqueda queda en tu código | File Search: subís archivos y OpenAI corta, embebe y busca | File Search: lo mismo, del lado de Google |
| Citar de dónde salió | Citations, y bloques de resultados de búsqueda para tus propios fragmentos | Citas a los archivos en la respuesta | Citas a los archivos en la respuesta |

Lo que cuesta, con los precios publicados al 28-10-2026:

- **Voyage**: `voyage-4` sale USD 0,06 por millón de tokens, con 200 millones gratis. Indexar todo el ejemplo cuesta fracciones de centavo.
- **OpenAI**: guardar hasta 1 GB en sus bases vectoriales es gratis; después, USD 0,10 por GB por día. Corta por defecto en fragmentos de 800 tokens con 400 de solapamiento.
- **Gemini**: se paga convertir los documentos al indexar. Guardarlos y convertir las preguntas es gratis.

La diferencia de fondo: con OpenAI y Gemini se puede tener RAG sin armar la búsqueda, a cambio de no controlar del todo cómo se corta ni cómo se busca. Con Claude, la búsqueda queda de tu lado, con el modelo de embeddings y la base que elijas.

Un aviso para quien busque tutoriales: muchos de RAG con OpenAI usan la Assistants API, que cerró en agosto de 2026. Hoy lo mismo se hace con File Search en la Responses API.

## En resumen

- Un modelo no sabe lo tuyo: solo lo que vio al entrenarse y lo que le ponés en el prompt.
- Si tus documentos entran en el prompt (Anthropic pone la línea en unos 200.000 tokens), ponelos ahí. Con una sola pizzería, no hace falta RAG.
- Si no entran, RAG busca en cada pregunta los pedazos que sirven y los pone en el prompt. El modelo no aprende nada: lee lo que le pasás.
- Indexar, una vez: cortar en fragmentos, convertir cada uno en números con un modelo de embeddings y guardarlos en una base vectorial.
- Consultar, cada vez: convertir la pregunta con el mismo modelo, traer los k fragmentos más parecidos y armar el prompt con ellos arriba.
- La búsqueda siempre trae algo, y no siempre lo correcto. Por eso el prompt tiene que dejar decir "no sé", y conviene traer más de un fragmento.
- Claude no tiene embeddings propios y la búsqueda queda en tu código; OpenAI y Gemini ofrecen una búsqueda armada.

Qué hacer cuando la búsqueda trae el fragmento equivocado, y cuándo conviene otra cosa en vez de RAG, se ve más adelante en la serie.
