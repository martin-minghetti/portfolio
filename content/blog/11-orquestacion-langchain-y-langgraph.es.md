---
title: "Orquestación: cuándo conviene LangChain o LangGraph"
date: 2026-10-28
order: 11
draft: true
description: "Qué es orquestar, qué agregan los frameworks, LangChain hoy, cómo funciona un grafo de LangGraph con pausas y estado guardado, el mismo flujo con y sin framework, cuándo conviene y qué hacen Claude, OpenAI y Gemini."
---

El asistente de la pizzería ya toma pedidos por WhatsApp. Es un agente con dos o tres herramientas, un loop de veinte líneas y un control en el código que no registra nada sin la confirmación del cliente.

Ahora La Esquina quiere tomar reservas del salón para cumpleaños, con seña. El flujo es otro: ver si hay lugar en el sistema de reservas (el de otra empresa, conectado por MCP), pedir la seña, esperar que el cliente pague, confirmar la reserva en el sistema y mandar un recordatorio el día antes.

Lo nuevo no es la cantidad de pasos. Son las esperas. Entre un paso y otro pueden pasar horas, el servidor se puede reiniciar en el medio, y cuando el cliente vuelve a escribir hay que saber en qué punto quedó.

Este post trata de cómo se ordenan pasos que esperan, se separan en caminos y tienen que sobrevivir a un reinicio. Y de si para eso hace falta un framework.

## Qué es orquestar

Orquestar es decidir el orden de los pasos: qué llamada al modelo va primero, qué herramienta después, qué pasa si algo falla.

Si seguiste la serie, ya lo venías haciendo. El loop del agente, que llama al modelo hasta que deja de pedir herramientas, es orquestación. El workflow de pasos fijos también. Las dos cosas estaban escritas a mano, con un `while` y unos `if`.

El modelo no orquesta nada por sí solo: responde un mensaje por vez y no recuerda nada entre una llamada y otra. Alguien tiene que guardar en qué paso va cada cliente. Ese alguien es tu código.

Un **framework de orquestación** es una librería que trae resuelto lo que todos terminan escribiendo:

- Guardar el estado de cada conversación.
- Retomar después de una caída.
- Pausar para que alguien apruebe y seguir después.
- Reintentar lo que falló y poner topes.
- Ver qué pasó, paso por paso.

Eso es lo que venden. Ninguna de esas cosas es magia: se pueden escribir. El framework te ahorra escribirlas, a cambio de aprender su forma de hacer las cosas y depender de él.

## LangChain hoy

LangChain es una librería de código abierto, en Python y JavaScript, de la empresa del mismo nombre. Es la más conocida del rubro.

Desde la versión 1.0, de octubre de 2025, su pieza central es `create_agent`: el loop de agente que ya se vio en la serie, armado y listo, con conexión a casi cualquier proveedor. Le pasás el modelo, las herramientas y el system prompt, y listo.

Lo que suma son los **middleware**: piezas que se enchufan al loop para agregar cosas sin escribirlas. Pedir aprobación antes de usar una herramienta, cortar después de cierta cantidad de llamadas, pasar a otro modelo si el primero falla, resumir la charla cuando se alarga. Son los controles que se vieron con los guardrails, empaquetados.

Su ventaja más concreta es no atarte a un proveedor. Cambiar de Claude a OpenAI es cambiar un texto: `"anthropic:claude-opus-5-5"` por el nombre del otro modelo. La contracara: lo más nuevo de cada proveedor llega primero a su propio SDK, y a LangChain después.

Un aviso para quien busque tutoriales: casi todos los de 2023 y 2024 usan "chains" (`LLMChain` y parecidas). Desde la 1.0 se mudaron a un paquete aparte, y el import viejo da error. Si un tutorial arranca con `from langchain.chains import ...`, está desactualizado.

## LangGraph: los pasos como un grafo

LangGraph es de la misma empresa. Su documentación lo define como un framework de bajo nivel para agentes "long-running" y "stateful": procesos largos, que recuerdan en qué punto están.

La idea es dibujar los pasos y cómo se conectan, como un diagrama de flechas donde una flecha puede volver atrás. Eso es un **grafo**. LangGraph se encarga de recorrerlo, guardar dónde quedó cada conversación y retomarla.

Las piezas, con el pedido de la pizzería:

- **Estado**: lo que se sabe del pedido hasta ahora. Qué pidió, si hay stock, el total, si confirmó.
- **Pasos** (los **nodos** del grafo): cada uno es una función común. Algunos llaman al modelo y otros no. Consultar el stock no necesita un modelo.
- **Caminos** (las **aristas**): qué paso sigue a cuál. Algunos caminos eligen según el estado: si falta algo, avisar; si no, calcular el total.
- **Pausa**: el grafo se frena, guarda todo y espera. Cuando el cliente contesta, sigue desde ahí.
- **Hilos**: el estado guardado después de cada paso, uno por conversación. En la pizzería, un hilo por número de WhatsApp.

<figure>
<p class="fig-title">El pedido como grafo</p>
<div class="tok-row"><div class="tok-head"><span>Camino principal</span></div><div class="tok-text"><span class="tok c4">Quiero 3 muzzarellas</span><span class="tok c1">entender el pedido</span><span class="tok c2">consultar stock</span><span class="tok c2">calcular total</span><span class="tok c0">pausa: Lo confirmo?</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Horas después</span></div><div class="tok-text"><span class="tok c4">si</span><span class="tok c0">retoma donde quedó</span><span class="tok c3">registrar pedido</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Si falta algo</span></div><div class="tok-text"><span class="tok c2">consultar stock</span><span class="tok c2">avisar: hoy no queda napolitana</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Si dice que no</span></div><div class="tok-text"><span class="tok c0">pausa</span><span class="tok c2">fin, sin registrar</span></div></div>
<figcaption>Celeste: lo que escribe el cliente. Verde: el único paso que usa el modelo. Naranja: pasos de tu código. Violeta: la pausa, que guarda el pedido con el número del cliente. Rojo: lo que tiene efecto. Registrar solo se alcanza después de un "si": no hay otro camino.</figcaption>
</figure>

LangChain y LangGraph se llevan así: `create_agent` está construido sobre LangGraph. Uno es el auto armado y el otro es el motor. Y el motor se puede usar solo: la documentación lo dice tal cual, "you don't need to use LangChain to use LangGraph". Adentro de un paso podés llamar al SDK de Anthropic directo, sin LangChain.

## Workflow o agente, otra vez

La diferencia que se vio con los agentes vuelve acá. Un grafo es un workflow: los pasos y los caminos los decide tu código. `create_agent` es un agente: los pasos los decide el modelo.

LangGraph deja mezclar los dos. Un grafo de pasos fijos donde uno de los pasos es un agente que decide solo. Para la pizzería: el flujo de la reserva es fijo (lugar, seña, pago, confirmación), pero el paso de "entender qué quiere el cliente" puede ser un agente con herramientas.

## Cómo se ve en código

Este es el pedido completo como grafo, con LangGraph en Python. El paso que en la vida real llama al modelo acá devuelve un pedido fijo, para que se pueda correr sin clave:

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command

STOCK = {"muzzarella": 12, "napolitana": 0}
PRECIOS = {"muzzarella": 9000, "napolitana": 10500}

class Pedido(TypedDict, total=False):
    mensaje: str
    items: dict
    faltantes: list
    total: int
    confirmado: bool
    respuesta: str

def entender_pedido(p):
    # Acá el modelo lee p["mensaje"] y devuelve los productos; para probar, fijo:
    return {"items": {"muzzarella": 3}}

def consultar_stock(p):
    return {"faltantes": [x for x, n in p["items"].items() if STOCK[x] < n]}

def calcular_total(p):
    total = sum(PRECIOS[x] * n for x, n in p["items"].items())
    return {"total": total + (0 if total >= 25000 else 1500)}

def pedir_confirmacion(p):
    dijo = interrupt(f"Son ${p['total']}. Lo confirmo?")  # se frena hasta que el cliente conteste
    return {"confirmado": dijo == "si"}

def registrar_pedido(p):
    return {"respuesta": "Listo, pedido 128."}

def avisar_faltante(p):
    return {"respuesta": f"Hoy no queda {', '.join(p['faltantes'])}."}

g = StateGraph(Pedido)
for paso in (entender_pedido, consultar_stock, calcular_total,
             pedir_confirmacion, registrar_pedido, avisar_faltante):
    g.add_node(paso)
g.add_edge(START, "entender_pedido")
g.add_edge("entender_pedido", "consultar_stock")
g.add_conditional_edges("consultar_stock",
    lambda p: "avisar_faltante" if p["faltantes"] else "calcular_total")
g.add_edge("calcular_total", "pedir_confirmacion")
g.add_conditional_edges("pedir_confirmacion",
    lambda p: "registrar_pedido" if p["confirmado"] else END)
g.add_edge("registrar_pedido", END)
g.add_edge("avisar_faltante", END)
grafo = g.compile(checkpointer=InMemorySaver())

charla = {"configurable": {"thread_id": "+54 9 294 555-0101"}}  # un hilo por cliente
r = grafo.invoke({"mensaje": "Quiero 3 muzzarellas"}, charla)
print(r["__interrupt__"][0].value)                  # Son $27000. Lo confirmo?
r = grafo.invoke(Command(resume="si"), charla)      # minutos después, el cliente dice "si"
print(r["respuesta"])                               # Listo, pedido 128.
```

Lo que hay que mirar:

- **El control quedó en la forma del grafo.** `registrar_pedido` solo se alcanza por el camino que sale de la confirmación cuando el cliente dijo que sí. El "no registrar sin confirmación" que se vio con los guardrails ya no es un `if` que alguien se puede olvidar: no hay otro camino que llegue ahí.
- **El hilo une las dos mitades.** Entre el primer `invoke` y el segundo pueden pasar horas. Lo que los conecta es el `thread_id`, el número de WhatsApp del cliente.
- **LangGraph no le escribe al cliente.** El texto de la pausa vuelve en `r["__interrupt__"]`, y lo manda tu código por WhatsApp.
- **En memoria no alcanza.** `InMemorySaver` guarda el estado en la memoria del programa: si se reinicia, se pierde. Para que sobreviva, se cambia por uno que guarda en una base de datos, como SQLite o Postgres.

Y una trampa que conviene conocer antes de que muerda. Cuando el grafo retoma, el paso de la pausa vuelve a correr desde el principio. La [documentación de las pausas](https://docs.langchain.com/oss/python/langgraph/interrupts) lo avisa: todo lo que está antes del `interrupt` se ejecuta otra vez. Si `pedir_confirmacion` mandara un WhatsApp antes de pausar, el cliente lo recibiría dos veces. Por eso el total se calcula en el paso anterior, y el paso de la pausa no hace nada antes de frenarse.

## Lo mismo sin framework

Este es el mismo flujo en Python común, sin ninguna librería:

```python
STOCK = {"muzzarella": 12, "napolitana": 0}
PRECIOS = {"muzzarella": 9000, "napolitana": 10500}
pendientes = {}  # en la vida real, una tabla en la base de datos

def nuevo_pedido(telefono, items):
    faltan = [p for p, n in items.items() if STOCK[p] < n]
    if faltan:
        return f"Hoy no queda {', '.join(faltan)}."
    total = sum(PRECIOS[p] * n for p, n in items.items())
    total += 0 if total >= 25000 else 1500
    pendientes[telefono] = {"items": items, "total": total}
    return f"Son ${total}. Lo confirmo?"

def respuesta_del_cliente(telefono, dijo):
    pedido = pendientes.pop(telefono, None)
    if pedido is None or dijo != "si":
        return "Dale, no lo registro."
    return "Listo, pedido 128."  # acá se llama a registrar_pedido
```

Hace lo mismo con dos funciones y un diccionario. Son 18 líneas contra casi 60. La espera es guardar el pedido pendiente con el teléfono del cliente: es el hilo de LangGraph, hecho a mano.

Lo que no tiene: guardar solo después de cada paso, retomar cualquier punto de un flujo largo, ver el historial de pasos, reintentos. Con una sola espera, no se extraña. Con cinco esperas y tres caminos, como en las reservas con seña, sí.

## Cuándo conviene un framework

Con la pizzería se ve claro.

**El asistente de pedidos de hoy: sin framework.** Un agente, pocas herramientas, una sola espera. El loop a mano y una tabla de pedidos pendientes alcanzan. Un framework sumaría una dependencia que se actualiza seguido, una forma de pensar nueva y una capa entre vos y el modelo.

Anthropic lo dice así en [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), de diciembre de 2024: conviene empezar usando la API directo, porque muchos patrones se resuelven en pocas líneas. Y advierte que los frameworks suelen agregar capas que esconden los prompts que se le mandan al modelo, y eso hace más difícil encontrar errores.

**Las reservas con seña: ahí empieza a convenir.** Varias esperas: el pago, la confirmación del sistema de reservas, el recordatorio del día antes. Caminos distintos: si no paga en una hora, se libera la mesa; si el sistema de reservas falla, se reintenta. Y un proceso que dura días y tiene que sobrevivir a un reinicio. Es justo para lo que LangChain dice que sirve LangGraph en el anuncio de su versión 1.0: procesos de negocio largos, y flujos sensibles donde una persona tiene que aprobar.

**Probar varios proveedores sin reescribir: LangChain ayuda.** Si hoy no sabés si vas a quedarte con Claude, OpenAI o Gemini, cambiar de uno a otro es cambiar un texto.

**Un equipo que necesita una forma común de armar agentes: un framework ordena.** Para una persona sola con un asistente, no hace falta.

Una regla para quedarse: empezar sin framework, y sumarlo cuando te encuentres escribiendo a mano lo que el framework ya trae, como guardar el estado de cada charla, pausas o reintentos. Y si lo usás, entender qué hace por debajo. Es el mismo consejo de Anthropic.

## Lo mismo en los tres

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Su kit para agentes | Claude Agent SDK: el agente de Claude Code como librería | Agents SDK | ADK |
| Cómo se ordenan varios pasos | El modelo arma el flujo para cada tarea (dynamic workflows) | Con código Python común, o pasando la charla a otro agente | Grafos que escribís vos, desde ADK 2.0 |
| Alojado por el proveedor | Managed Agents (beta) | Agents API | Agent Runtime, que también aloja agentes de LangGraph |

Cada uno apuesta a algo distinto:

- **Google**, a grafos que escribís vos, como LangGraph. Están en ADK 2.0, para Python, TypeScript y Go.
- **OpenAI**, a código común. Su documentación del Agents SDK lo dice así: orquestar con código hace las tareas más predecibles en velocidad, costo y resultado. Y está cerrando Agent Builder, su editor para armar flujos arrastrando cajas.
- **Anthropic**, a que el modelo arme el flujo. En Claude Code y en Managed Agents, el agente puede escribir su propio programa que reparte el trabajo entre varios agentes. En [A harness for every task](https://claude.dev/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code/), de junio de 2026, avisa que eso suele gastar más tokens y conviene para tareas complejas que lo valen.

Los tres modelos se pueden usar desde LangChain y LangGraph, pero ninguno de los tres arma su propio kit sobre ellos.

Dos cosas más del mundo LangChain, que vas a ver nombradas. **LangSmith** es la parte paga de la empresa: sirve para ver paso a paso qué hizo un agente, medirlo y alojarlo. Tiene un plan gratis, no es obligatorio, y se ve más adelante en la serie. LangGraph es código abierto y gratis. Y LangChain puede cargar las herramientas de un servidor MCP como herramientas propias: el sistema de reservas de otra empresa entra al grafo como un paso más.

## En resumen

- Orquestar es decidir el orden de los pasos. El loop del agente y el workflow de pasos fijos ya lo eran.
- Un framework no hace nada que no puedas escribir vos. Te ahorra escribirlo, a cambio de aprender su forma y depender de él.
- LangChain hoy es un agente armado (`create_agent`) con piezas enchufables. Las chains de los tutoriales viejos quedaron atrás.
- LangGraph arma los pasos como un grafo que guarda dónde quedó cada conversación, y puede pausar y retomar horas después.
- Para un flujo corto, el código propio alcanza y se entiende mejor. El framework conviene cuando hay esperas largas, muchos caminos y procesos que tienen que sobrevivir a un reinicio.
- Claude, OpenAI y Gemini tienen su propio kit, y cada uno ordena los pasos a su manera.

Hasta acá, el asistente sabe lo que está en su prompt y lo que le devuelven sus herramientas. Más adelante en la serie: cómo darle acceso a documentos que no entran en la ventana de contexto.
