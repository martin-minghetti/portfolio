---
title: "Prompting: razonar paso a paso y temperatura"
date: 2026-10-27
order: 5
draft: true
description: "Por qué pensar antes de responder mejora las respuestas, cómo se controla hoy cuánto razona un modelo y qué pasó con la temperatura en Claude, OpenAI y Gemini."
---

Un cliente le escribe al asistente de la pizzería: "Hoy martes hay 2x1 en muzzarella. Pido 3 muzzarellas y una napolitana. El envío sale $1.500, gratis desde $25.000. Cuánto pago?". Si el modelo contesta de un saque, es fácil que se equivoque en la promo o en el envío. Si primero hace las cuentas, acierta mucho más seguido.

Este post trata de eso, de pedirle al modelo que piense antes de responder, y de la otra perilla clásica del prompting: qué tan predecibles o variadas son sus respuestas.

## Pensar antes de responder

**Chain-of-thought** (cadena de pensamiento) es pedirle al modelo que razone paso a paso antes de dar la respuesta final. Algo como: "Hacé las cuentas paso a paso y después decí el total."

Funciona por cómo trabaja el modelo, que se vio al principio de la serie: escribe un token por vez, y cada token sale de una cantidad fija de cálculo. Si responde de un saque, tiene ese cálculo y nada más. Si antes escribe los pasos, gana más cálculo, y los resultados intermedios quedan escritos para los tokens que siguen: "3 muzzarellas con 2x1 son 2 pagas, $18.000" queda a la vista cuando llega el momento de sumar.

La técnica se popularizó con un trabajo de Google de 2022 (Wei y otros), que mostró mejoras grandes en problemas de matemática, pero solo en modelos grandes.

## Los modelos nuevos razonan solos

Los modelos actuales son **modelos de razonamiento**: antes de responder, pueden escribir un razonamiento propio, aparte de la respuesta, sin que nadie se lo pida. Eso cambió dónde está la perilla. Ya no hace falta escribir "pensá paso a paso"; lo que se ajusta es cuánto piensa, con un parámetro de **esfuerzo**.

Los tres grandes lo resuelven parecido:

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Cómo se controla | `effort`: low, medium, high, xhigh y max | `reasoning.effort`: en GPT-6.1 Sol, de low a max | `thinking_level` en Gemini 4 Argon: low, medium y high |
| Valor de fábrica | medium en Opus 5.5 y Haiku 5.5, high en el resto | medium | medium |
| Se puede apagar | no en Opus 5.5 | no en GPT-6.1 Sol ni en GPT-6 Astra; sí en otros modelos de la familia | no tiene un nivel más bajo que low |
| Qué se ve | un resumen del razonamiento, si se lo pide | un resumen, si se lo pide | un resumen, si se lo pide |

En los tres, el razonamiento completo se cobra como salida, aunque solo se vea el resumen o nada. Más esfuerzo significa más tokens pagos y más espera.

En Claude, el razonamiento además cuenta dentro del tope de salida (`max_tokens`). Si el tope es chico y el modelo piensa mucho, la respuesta se corta a la mitad. La documentación recomienda dejar margen para las dos cosas, y permite ver cuánto se gastó en pensar en `usage.output_tokens_details.thinking_tokens`.

Cuándo subir o bajar el esfuerzo depende de la tarea. Para clasificar reseñas, que es simple y tiene que ser rápido, alcanza con `low`. Para calcular un pedido con promociones, conviene más. OpenAI, para GPT-6.1 Terra, recomienda arrancar en `medium` y subir solo si la mejora vale el tiempo y los tokens extra. La forma de saberlo es probarlo con casos reales.

Con la API de Claude, en Python, se puede comparar el mismo pedido con dos niveles:

```python
import anthropic

client = anthropic.Anthropic()
pedido = ("Hoy martes hay 2x1 en muzzarella ($9.000). Pido 3 muzzarellas y una "
          "napolitana ($10.500). El envío sale $1.500, gratis desde $25.000. Cuánto pago?")

for esfuerzo in ["low", "high"]:
    r = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,  # el razonamiento entra en este tope
        output_config={"effort": esfuerzo},
        messages=[{"role": "user", "content": pedido}],
    )
    texto = "".join(b.text for b in r.content if b.type == "text")
    print(esfuerzo, "| tokens de salida:", r.usage.output_tokens, "|", texto)
```

Con `high` debería gastar bastantes más tokens de salida. La respuesta correcta es $28.500 con envío gratis, si el 2x1 se aplica a dos de las tres muzzarellas.

## Sigue sirviendo pedir que piense?

Con los modelos de razonamiento, la perilla principal es el esfuerzo, pero el prompt todavía empuja. Anthropic recomienda ajustar primero el esfuerzo y, si hace falta, sumar una frase como "esta tarea tiene varios pasos, pensá con cuidado antes de responder". OpenAI, en su guía para los modelos de razonamiento de la serie o, recomienda no pedirles que piensen paso a paso, porque ya lo hacen solos.

Hay un cuidado nuevo con Claude: no conviene pedirle que escriba su razonamiento dentro de la respuesta, por ejemplo en una sección "razonamiento" antes del resultado o en un campo de un JSON. Los modelos más recientes pueden rechazar ese pedido, y el rechazo se cobra igual. Si hace falta ver cómo llegó a la respuesta, se le pide una explicación corta, o se activa el resumen del razonamiento.

## Temperatura: cómo elige entre opciones

Al principio de la serie se vio que el modelo calcula qué tan probable es cada continuación y elige entre las más probables. La **temperatura** decide cuánto se arriesga al elegir. Con temperatura baja, casi siempre gana la opción más probable. Con temperatura alta, las opciones se emparejan y aparecen más seguido las menos probables:

<figure>
<p class="fig-title">Cómo sigue "El gato se sentó en la..."</p>
<div class="tok-row"><div class="tok-head"><span>Temperatura baja</span></div><div class="tok-text"><span class="tok c1">cama</span><span class="tok" style="opacity:.35">silla</span><span class="tok" style="opacity:.35">ventana</span><span class="tok" style="opacity:.35">biblioteca</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Temperatura alta</span></div><div class="tok-text"><span class="tok c1">cama</span><span class="tok c1">silla</span><span class="tok c1">ventana</span><span class="tok c1">biblioteca</span></div></div>
<figcaption>Diagrama explicativo, sin números: con temperatura baja casi siempre sale la opción más probable; con temperatura alta, cualquiera de las razonables, incluso las raras.</figcaption>
</figure>

El valor va en general de 0 a 1 o de 0 a 2, según el proveedor, y el de fábrica suele ser 1. Hay dos controles parecidos: `top_k`, que deja elegir solo entre las k opciones más probables, y `top_p`, que descarta las poco probables hasta cubrir cierta probabilidad total.

Durante años la regla fue: temperatura baja para clasificar o extraer datos, alta para ideas y textos creativos.

## La temperatura está desapareciendo

Con los modelos de razonamiento, los tres grandes la fueron sacando de las manos de quien construye:

- **Claude:** desde los modelos 4.7 (Opus 4.7 en adelante y toda la familia 5), mandar `temperature`, `top_p` o `top_k` con un valor distinto al de fábrica da error. Y desde la versión de la API del 21 de octubre de 2026 (una fecha que el código manda en cada pedido; las librerías nuevas mandan la nueva), da error en cualquier modelo aunque se mande el valor de fábrica.
- **OpenAI:** la temperatura solo se acepta con el razonamiento apagado (nivel `none`). Con GPT-6.1 Sol, que no se puede apagar, no hay temperatura.
- **Gemini 4 Argon:** no da error, la ignora sin avisar. Lo que sí da error es el modo viejo de fijar un presupuesto de tokens de pensamiento, igual que en Claude.

Además, ni siquiera con temperatura 0 había garantía de recibir siempre la misma respuesta. Anthropic lo aclara en su documentación: aun así, las respuestas no son del todo deterministas. Para quien construye, eso significa dos cosas: las pruebas tienen que tolerar respuestas distintas, y si una respuesta tiene que ser siempre igual, hay que guardarla, no volver a pedirla.

## Qué usar en lugar de la temperatura

Lo que antes se buscaba con la temperatura ahora se pide de otras formas:

- **Para respuestas predecibles:** un prompt cerrado, ejemplos como los del post anterior, un esfuerzo bajo, y pedir un formato fijo. Más adelante en la serie se ve cómo obligar al modelo a responder con una estructura exacta.
- **Para respuestas variadas:** pedirlas en el prompt. Por ejemplo, "proponé cuatro nombres para la promo del martes, bien distintos entre sí", en una sola llamada.

## En resumen

- Razonar antes de responder le da al modelo más cálculo y deja a la vista los pasos intermedios. Por eso mejora en tareas de varios pasos.
- Los modelos actuales razonan solos. Lo que se ajusta es el esfuerzo, que en los tres grandes se cobra como salida y suma espera.
- La temperatura decide cuánto se arriesga el modelo al elegir. Hoy Claude la rechaza, OpenAI la acepta solo sin razonamiento y Gemini la ignora.
- Ni la temperatura 0 garantizaba la misma respuesta. Lo predecible o lo variado ahora se pide en el prompt, con ejemplos y con el formato.

El próximo post cambia de tema: la ventana de contexto, o cuánto puede leer el modelo de una sola vez, y cómo manejarla.
