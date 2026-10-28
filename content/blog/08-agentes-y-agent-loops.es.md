---
title: "Agentes: cuando el modelo decide los pasos"
date: 2026-10-27
order: 8
draft: true
description: "Qué es un agente, en qué se diferencia de un flujo de pasos fijos, cómo funciona el loop y cómo se corta, qué puede salir mal, y cuándo conviene uno, varios o ninguno, en Claude, OpenAI y Gemini."
---

Un martes, un cliente le escribe a la pizzería: "Quiero 3 muzzarellas y una napolitana, a Mitre 450". Los martes hay 2x1 en muzzarella, y el envío cuesta $1.500, gratis desde $25.000.

Para contestar bien hay que hacer varias cosas: ver si hay stock de las dos pizzas, calcular el total con la promo y el envío, mostrárselo al cliente, esperar que diga que sí y recién ahí registrar el pedido. Y si la napolitana se acabó, el total cambia. Como se vio antes en la serie, un modelo puede pedir una herramienta y responder con el resultado. Acá tiene que encadenar varias y decidir sobre la marcha.

## Qué es un agente

Un **agente** es un modelo que, con herramientas, decide sus propios pasos hasta terminar una tarea. Funciona en un loop (un bucle): en cada vuelta, el modelo mira lo que tiene, pide una o varias herramientas, tu código las ejecuta y el resultado vuelve. Después, otra vuelta. Termina cuando el modelo responde sin pedir nada más.

Es el mismo ida y vuelta que se vio con las herramientas. Lo nuevo es que ahora el modelo da varias vueltas y elige qué hacer en cada una.

La idea de alternar entre pensar y actuar tiene nombre: **ReAct** (de razonar y actuar), un trabajo de [Princeton y Google de 2022](https://arxiv.org/abs/2210.03629). Hoy es la forma básica de casi todos los agentes.

## Workflow o agente: quién decide los pasos

Anthropic separa dos cosas en su guía "Building effective agents", de diciembre de 2024:

- En un **workflow** (un flujo de pasos fijos), el orden lo escribe tu código. El modelo puede intervenir en algún paso, pero no decide qué viene después.
- En un **agente**, los pasos los decide el modelo.

Con la pizzería, un workflow sería: tu código siempre consulta el stock de lo pedido, si falta algo avisa, calcula el total, pide confirmación y registra. Un agente sería darle al modelo las herramientas y el objetivo, "tomar pedidos", y dejar que decida el orden.

Para el pedido del principio, un workflow alcanza, porque los pasos se conocen de antemano. El agente gana cuando el mensaje es desordenado: "Cambiá la dirección del pedido de recién, sumale un fainá si queda y decime si llega antes de las diez". Ahí no hay un orden fijo que se pueda escribir antes. Google lo dice parecido: lo predecible va con pasos fijos, y lo abierto, con un sistema que planifica solo.

Un workflow también puede ser elaborado. La guía de Anthropic describe cinco formas comunes: encadenar pasos, derivar cada caso al camino que le corresponde, hacer varias cosas en paralelo, un modelo que reparte el trabajo entre otros, y uno que genera mientras otro evalúa. Esas formas se ven más adelante en la serie.

## El loop, vuelta por vuelta

Así se resolvería el pedido del martes con un agente que tiene tres herramientas: consultar el stock, calcular el total y registrar el pedido.

<figure>
<p class="fig-title">Un pedido, vuelta por vuelta</p>
<svg viewBox="0 0 400 432" width="100%" role="img" aria-labelledby="g08t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g08t">Diagrama del loop de un agente: el cliente escribe, se llama al modelo con todo lo anterior; si pide herramientas, tu código las ejecuta y se vuelve a llamar al modelo; si no, responde y corta. Un tope de vueltas corta el loop.</title>
<defs><marker id="g08ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<rect x="10" y="20" width="200" height="50" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="110.0" y="49.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">El cliente escribe</text>
<path d="M110 70V98" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<rect x="10" y="100" width="200" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="110.0" y="124.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Llamar al modelo</text>
<text x="110.0" y="143.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">con todo lo anterior</text>
<path d="M110 156V186" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<path d="M110 188L198 226L110 264L22 226Z" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="110" y="231" font-size="15" fill="var(--color-ink)" text-anchor="middle">Pide herramientas?</text>
<path d="M198 226H243" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<text x="220" y="216" font-size="14" fill="var(--color-muted)" text-anchor="middle">si</text>
<rect x="245" y="200" width="145" height="52" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="317.5" y="221.3" font-size="16" fill="var(--color-ink)" text-anchor="middle">Tu código</text>
<text x="317.5" y="240.3" font-size="16" fill="var(--color-ink)" text-anchor="middle">las ejecuta</text>
<path d="M317 200V128H212" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<text x="330" y="168" font-size="14" fill="var(--color-muted)" text-anchor="start">otra vuelta</text>
<path d="M317 252V284" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<rect x="245" y="286" width="145" height="52" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="317.5" y="308.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Tope de vueltas</text>
<text x="317.5" y="327.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">si se pasa, corta</text>
<path d="M110 264V296" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<text x="120" y="286" font-size="14" fill="var(--color-muted)" text-anchor="start">no</text>
<rect x="10" y="298" width="200" height="50" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="110.0" y="327.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Responde y corta</text>
<path d="M110 348V378" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<rect x="35" y="380" width="150" height="40" rx="20" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="110.0" y="404.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Espera al cliente</text>
</svg>
<figcaption><ul><li>Celeste: lo que escribe el cliente.</li><li>Verde: las llamadas al modelo y su respuesta.</li><li>Naranja: tu código, que ejecuta las herramientas.</li><li>Rojo: el tope, que corta aunque el modelo siga pidiendo.</li><li>En el ejemplo: la vuelta 1 consulta el stock de muzzarella y napolitana, la 2 calcula el total ($19.500) y la 3 responde "Lo confirmo?". Cuando el cliente dice "Dale", la vuelta 4 registra el pedido y la 5 responde "Listo, tu pedido es el 128."</li><li>Cada vuelta es una llamada al modelo que vuelve a mandar todo lo anterior.</li></ul></figcaption>
</figure>

En la primera vuelta, el modelo pide las dos consultas de stock juntas. La napolitana está en 0. En la segunda, calcula el total solo con las muzzarellas: con el 2x1 paga dos, $18.000, más $1.500 de envío porque no llega a $25.000. En la tercera, responde sin pedir herramientas y el loop termina, aunque el pedido todavía no está hecho: terminar también puede ser preguntar. Cuando el cliente confirma, empieza otra tanda de vueltas.

Nadie programó "si falta la napolitana, recalcular sin ella". Lo decidió el modelo con el resultado de la primera vuelta. Y no registra hasta que el cliente confirma, porque el system prompt se lo pide: es el cuidado de confirmar antes de lo que no se puede deshacer, que se vio antes en la serie.

## Cómo se corta

Un loop necesita una salida. Hay tres formas:

- **Cuando el modelo termina.** Responde sin pedir herramientas. Es lo normal. Pero también puede cortar porque se quedó sin espacio para escribir o porque se negó a seguir, y en esos casos el trabajo no está hecho. Conviene revisar el motivo antes de darlo por terminado.
- **Un tope de vueltas.** Tu código cuenta las vueltas y corta en un número, por ejemplo 10. Anthropic lo recomienda en su guía de 2024. Qué hacer al llegar al tope es una decisión de producto: en la pizzería, pasarle la charla a una persona. Los kits que traen el loop armado tienen cada uno su propio tope por defecto, y algunos no tienen ninguno: el ayudante de las librerías de Claude da vueltas hasta que el modelo termina, salvo que le pongas un tope. Conviene revisarlo en el kit que se use.
- **Un presupuesto.** En vez de contar vueltas, se cuenta el gasto. Claude tiene en beta un presupuesto de tokens para toda la tarea: el modelo ve cuánto le queda y se dosifica para terminar prolijo en vez de quedar cortado a la mitad. Anthropic aclara que es una guía para el modelo, no un tope duro.

Estos topes son el primer control de un agente. El resto de los controles se ven más adelante en la serie.

## Qué puede salir mal

**Loops sin fin.** El modelo consulta el stock una y otra vez, o dos agentes se pasan el trabajo entre ellos sin terminar. Google lo marca como el riesgo principal de los loops. Para eso está el tope.

**Errores que se acumulan.** Un error en la segunda vuelta, como un total mal calculado, arrastra todo lo que sigue. Anthropic lo resume así: los agentes tienen memoria de lo que pasó, y los errores se suman. Una cuenta para que se entienda, que supone pasos independientes: si cada paso sale bien el 95% de las veces, diez pasos seguidos salen bien alrededor del 60%. Por eso conviene que las cuentas las haga una herramienta y no el modelo, y que las herramientas devuelvan errores claros.

**Costo y tiempo.** Cada vuelta reenvía todo lo anterior, como se vio con la ventana de contexto. Cinco vueltas no cuestan cinco veces una llamada: cuestan más, porque cada una es más larga que la anterior. En 2025, Anthropic midió que un agente gasta unas 4 veces más tokens que una charla común, y un sistema de varios agentes, unas 15 veces más.

## Cómo se ve en código

El código que se vio con las herramientas ya era un loop. Este suma dos cosas: varias herramientas, y un tope de vueltas.

```python
import json
from datetime import date
import anthropic

client = anthropic.Anthropic()
STOCK = {"muzzarella": 12, "napolitana": 0}

def consultar_stock(producto):
    return {"unidades": STOCK[producto]}

def calcular_total(muzzarellas, napolitanas=0):
    es_martes = date.today().weekday() == 1  # el día lo sabe tu código, no el modelo
    pagas = muzzarellas - muzzarellas // 2 if es_martes else muzzarellas  # 2x1 los martes
    subtotal = pagas * 9000 + napolitanas * 10500
    envio = 0 if subtotal >= 25000 else 1500
    return {"total": subtotal + envio}

def registrar_pedido(muzzarellas, napolitanas, direccion):
    return {"pedido": 128}  # en la vida real, se guarda en una base de datos

FUNCIONES = {"consultar_stock": consultar_stock, "calcular_total": calcular_total,
             "registrar_pedido": registrar_pedido}
herramientas = [...]  # las tres definiciones: nombre, descripción y datos, como se vio antes
system = ("Sos el asistente de la pizzería La Esquina. Antes de registrar un pedido, "
          "mostrá el total y pedí confirmación.")
mensajes = [{"role": "user", "content": "Quiero 3 muzzarellas y una napolitana, a Mitre 450"}]
MAX_VUELTAS = 10

for vuelta in range(MAX_VUELTAS):
    r = client.messages.create(model="claude-opus-5-5", max_tokens=16000,
                               system=system, tools=herramientas, messages=mensajes)
    mensajes.append({"role": "assistant", "content": r.content})
    if r.stop_reason != "tool_use":
        break  # respondió sin pedir herramientas

    resultados = []
    for b in r.content:
        if b.type == "tool_use":
            print(f"Vuelta {vuelta + 1}: {b.name} {b.input}")
            try:
                salida = FUNCIONES[b.name](**b.input)
                resultados.append({"type": "tool_result", "tool_use_id": b.id,
                                   "content": json.dumps(salida)})
            except Exception as e:
                resultados.append({"type": "tool_result", "tool_use_id": b.id, "is_error": True,
                                   "content": f"{b.name} falló: {e}. Avisale al cliente."})
    mensajes.append({"role": "user", "content": resultados})
else:
    print("Llegó al tope de vueltas sin terminar: pasarle la charla a una persona.")

if r.stop_reason == "end_turn":  # terminó bien, no por falta de espacio ni por negarse
    print("".join(b.text for b in r.content if b.type == "text"))
```

Lo que cambia respecto de aquel código:

- El `for` con `MAX_VUELTAS` reemplaza al `while` sin fin: es el tope. El `else` del `for` solo corre si se acabaron las vueltas sin llegar al `break`.
- `FUNCIONES[b.name]` elige qué función correr según lo que pidió el modelo.
- El cálculo del total lo hace tu código, no el modelo, y el día también: el modelo no sabe si hoy es martes.
- Con este mensaje, el código llega hasta la pregunta "Lo confirmo?". La respuesta del cliente se agrega a `mensajes` y se vuelve a correr el loop.

La regla de confirmar antes de registrar está en el system prompt, y es un pedido, no una garantía. Un control en el código, que no deje registrar sin una confirmación guardada, es más firme. Eso también se ve más adelante en la serie.

No hace falta armar este loop en tu código: los tres grandes traen kits que lo resuelven. Claude tiene un ayudante en sus librerías (en beta) y Managed Agents (también en beta), donde Anthropic corre el agente por vos. OpenAI tiene su Agents SDK, y Google, su ADK. Igual, entender el loop por dentro ayuda a saber qué pasa cuando algo falla.

## Cuándo conviene un agente

De lo más simple a lo más complejo, con la pizzería:

- **Una sola llamada:** "Cuánto sale la napolitana?". El precio está en el system prompt.
- **Una herramienta, una vuelta:** "Hay fainá?".
- **Un workflow:** el pedido común, con pasos que se conocen de antemano.
- **Un agente:** el mensaje desordenado, o cualquier tarea donde no se sabe cuántos pasos va a llevar.

La regla de Anthropic es buscar la solución más simple posible y sumar complejidad solo cuando hace falta, y aclara que a veces eso significa no armar un agente. Google coincide: para resumir o traducir un texto, probablemente no haga falta.

## Un agente o varios

Con la pizzería, la tentación es armar un agente de pedidos, otro de reclamos, otro de promos y un "jefe" que reparte. Los tres grandes recomiendan lo contrario: empezar con uno.

- **Anthropic**, en una guía de octubre de 2026, dice que un solo agente con skills suele dar mejor calidad que varios, muchas veces con menos costo y demora. En cada pase de un agente a otro se pierde información, como en el teléfono descompuesto. Un cliente que comparó las dos formas vio que un solo agente corría el doble de rápido. En la pizzería: un solo asistente, con una skill de reclamos que carga solo cuando alguien se queja.
- **OpenAI**: "empezá con un agente siempre que puedas", y separá solo cuando una parte necesita otras instrucciones o permisos.
- **Google**: un solo agente es ideal para tareas de varios pasos con datos externos, y recomienda empezar por ahí.

Un **subagente**, otro agente al que el principal le encarga una parte, sí tiene sentido para tareas pesadas que llenarían la ventana. Por ejemplo, leer las 2.000 reseñas del mes y devolver las tres quejas más repetidas: lo hace en su propia ventana y devuelve solo el resumen. También sirve para tareas en paralelo.

Esa es la contracara que se anunció al hablar de la ventana de contexto: según Anthropic, en enero de 2026, varios agentes gastan entre 3 y 10 veces más tokens que uno solo para la misma tarea. Y juntar agentes también puede romper algo: en un ejemplo de la guía de octubre, al fusionar un subagente de envíos con el principal, el asistente empezó a contestar solo y dejó de consultar la fecha de entrega. Por eso la guía pide medir antes y después de cada cambio. Cómo se mide se ve más adelante en la serie.

No es "nunca varios". En 2025, Anthropic mostró que para investigar un tema, que se reparte bien en partes, varios agentes rindieron 90% más que uno en su prueba interna, a cambio de muchos más tokens. Es "varios, solo con una razón concreta".

## En resumen

- Un agente es un modelo que elige sus propios pasos con herramientas, en un loop que corta cuando responde sin pedir nada.
- Si los pasos se conocen de antemano, alcanza un workflow, más barato y predecible.
- Todo loop necesita una salida: el modelo que termina, un tope de vueltas o un presupuesto.
- Cada vuelta reenvía todo lo anterior, así que el costo crece rápido, y los errores se arrastran de una vuelta a la siguiente.
- Conviene empezar con un solo agente y sumar otros solo cuando hay una razón concreta y las pruebas lo confirman.

Con un modelo que actúa solo, la pregunta siguiente es cómo ponerle límites. Eso se ve más adelante en la serie.
