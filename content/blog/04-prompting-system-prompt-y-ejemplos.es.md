---
title: "Prompting: system prompt y ejemplos"
date: 2026-10-27
order: 4
draft: true
description: "Cómo escribir un system prompt que el modelo siga, qué recomienda cada proveedor y cuándo conviene darle ejemplos, con un caso concreto de punta a punta."
---

El post anterior armó la conversación del asistente de una pizzería: una lista de mensajes, con las instrucciones de fondo adelante de todo. Este post trata de qué escribir ahí, y de cómo mostrarle al modelo ejemplos de lo que se espera.

Un **prompt** es el texto que se le da al modelo. **Prompting**, o **prompt engineering**, es la técnica de escribir ese texto para obtener buenas respuestas.

## Un system prompt malo y uno bueno

El **system prompt** son las instrucciones de fondo: el rol del modelo, sus reglas, el formato y el tono de las respuestas. Va adelante de todo, en cada llamada.

Un system prompt flojo para la pizzería sería este:

```text
Sos un asistente útil. Sé amable.
```

No dice qué vende el local, ni qué hacer cuando falta un dato. Si alguien pregunta cuánto sale una pizza, el modelo va a llenar el hueco como pueda, y eso puede ser un precio inventado. Uno mejor:

```text
Sos el asistente de la pizzería La Esquina. Respondés en dos o tres oraciones,
porque la gente lee desde el celular.

<menu>
Muzzarella: $9.000
Napolitana: $10.500
Sin gluten (muzzarella): $11.000
</menu>

Respondé solo sobre el menú, los horarios y los pedidos. Si te preguntan un precio
que no está en <menu>, decí que no lo tenés y ofrecé tomar el pedido por WhatsApp:
un precio inventado termina en un reclamo.
```

Tiene cuatro partes: quién es y para quién escribe, los datos que necesita (separados con etiquetas), hasta dónde llega, y qué hacer cuando no sabe algo. Cada regla viene con su porqué.

Igual, un system prompt es una instrucción que el modelo suele seguir, no un candado. Los controles que no dependen de que el modelo obedezca se ven más adelante en la serie.

## Cómo escribir instrucciones que se sigan

Las guías oficiales de los proveedores coinciden en algunas ideas:

- **Explicar el porqué.** Anthropic da este ejemplo: "NUNCA uses puntos suspensivos" funciona peor que "la respuesta la va a leer un sintetizador de voz, así que no uses puntos suspensivos, porque no sabe pronunciarlos". Con la razón, el modelo puede aplicar la regla a casos que no estaban escritos.
- **Decir qué hacer, no solo qué no hacer.** "Respondé en párrafos" funciona mejor que "no uses listas".
- **No dar nada por obvio.** Anthropic avisa que sus modelos actuales siguen las instrucciones más al pie de la letra que los anteriores. Si una regla vale para todas las respuestas, hay que decirlo.
- **La prueba del colega.** Anthropic propone mostrarle el prompt a alguien que no conoce la tarea: si esa persona se confundiría, el modelo también.

Donde las guías difieren es en cómo ordenar el prompt:

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Cómo separar las partes | etiquetas XML, como `<menu>` o `<instrucciones>` | títulos de Markdown para las secciones y etiquetas XML para delimitar contenido | etiquetas XML o títulos de Markdown, pero uno solo en todo el prompt |
| Orden sugerido | documentos largos arriba, la pregunta al final | identidad, instrucciones, ejemplos y contexto, en ese orden | todo el contexto primero, la pregunta al final |

Anthropic dice que poner la pregunta al final, después de documentos largos, mejoró la calidad de las respuestas hasta un 30% en sus pruebas.

## Qué va en el system prompt y qué no

El system prompt se manda y se paga en cada llamada, así que lo que casi nunca se usa solo ocupa lugar y cuesta plata.

En una guía sobre agentes de comercio de septiembre de 2026, Anthropic propone un punto de partida: va al system prompt lo que sirve para un tercio o más de los pedidos. Las reglas críticas van siempre, aunque se usen poco: seguridad, temas legales, restricciones de marca y datos clave del usuario, como una alergia. Lo demás puede ir en **skills**, instrucciones aparte de las que el modelo ve solo el nombre y una descripción corta, y que carga enteras cuando las necesita. La guía aclara la contracara: cargar una skill le cuesta al modelo un paso más, y por eso lo que se usa casi siempre conviene dejarlo fijo. El umbral, dice, depende de cada caso y de lo que muestren las pruebas.

## Zero-shot y few-shot: pedir con o sin ejemplos

La pizzería quiere clasificar las reseñas de sus clientes en positivas y negativas. Hay dos formas de pedirlo:

- **Zero-shot:** se pide sin ejemplos. "Clasificá esta reseña como positiva o negativa."
- **Few-shot:** se incluyen unos pocos ejemplos resueltos, para que el modelo vea el formato y el criterio.

Los ejemplos muestran cosas que cuesta describir con palabras. Si una reseña dice "rica, pero cara", es positiva o negativa? Una regla larga lo podría explicar; un ejemplo lo resuelve en una línea:

```python
import anthropic

client = anthropic.Anthropic()
system = """Clasificás reseñas de una pizzería. Respondés solo "positiva" o "negativa".
<ejemplos>
<ejemplo>"Llegó caliente y rápido" -> positiva</ejemplo>
<ejemplo>"Tardó una hora y vino fría" -> negativa</ejemplo>
<ejemplo>"Rica, pero cara" -> positiva</ejemplo>
</ejemplos>"""

r = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=2048,
    system=system,
    messages=[{"role": "user", "content": '"La masa estaba cruda"'}],
)
print("".join(b.text for b in r.content if b.type == "text"))
```

Los ejemplos pueden ir así, dentro del system y entre etiquetas, o como pares de mensajes user y assistant escritos por la aplicación, como se vio en el post anterior.

Qué dice cada proveedor sobre los ejemplos:

- **Anthropic** los llama una de las formas más confiables de guiar el formato y el tono, recomienda de 3 a 5, variados, y aclara que también sirven cuando el modelo razona antes de responder.
- **Google** recomienda incluirlos siempre, y avisa que con demasiados el modelo puede empezar a copiarlos de más.
- **OpenAI** pide ejemplos variados. Para sus modelos de razonamiento de la serie o, en cambio, sugiere probar primero sin ejemplos y sumarlos solo si hace falta.

El riesgo de los ejemplos es que el modelo copie más de lo que se quería: el largo, las palabras, el orden. Por eso conviene que sean distintos entre sí.

Aprender de los ejemplos del prompt tiene un nombre: **in-context learning**, aprendizaje en contexto. El modelo no cambia sus pesos, que se vieron en el post anterior: aprende de lo que tiene adelante en ese momento. Y vale mientras esté en lo que se le manda. Si la próxima llamada no incluye los ejemplos, el modelo no los conoce.

## En resumen

- El system prompt fija el rol, las reglas, el formato y el tono. Uno bueno dice quién es el asistente, qué datos tiene, hasta dónde llega y qué hacer cuando no sabe.
- Las instrucciones funcionan mejor con su porqué, diciendo qué hacer y sin dar nada por obvio: los modelos actuales las siguen al pie de la letra.
- En el system prompt va lo que se usa seguido y las reglas críticas. Lo demás puede cargarse solo cuando hace falta.
- Few-shot es pedir con ejemplos. Suele dar respuestas más consistentes, pero los ejemplos tienen que ser variados para que el modelo no los copie de más.

El próximo post sigue con prompting: pedirle al modelo que razone paso a paso y cómo controlar qué tan creativas o predecibles son sus respuestas.
