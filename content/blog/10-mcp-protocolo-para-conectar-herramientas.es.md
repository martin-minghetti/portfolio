---
title: "MCP: el protocolo para conectar herramientas"
date: 2026-10-27
order: 10
draft: true
description: "Qué es MCP, qué problema resuelve, las tres piezas, qué ofrece un servidor, local o remoto, un servidor de 15 líneas para la pizzería, cómo se conecta desde Claude, OpenAI y Gemini, cuándo conviene y qué cuidar."
---

Hasta acá, todas las herramientas del asistente de la pizzería, el que atiende a los clientes por WhatsApp, eran tuyas. `consultar_stock` y `registrar_pedido` viven en tu código, y tu código las ejecuta.

Ahora pasan dos cosas. La Esquina empieza a tomar reservas para el salón con un sistema de otra empresa, y el asistente tiene que poder consultarlo. Y el dueño quiere preguntarle a Claude desde su compu "cuánta muzzarella queda", sin pasar por el asistente.

Sin un acuerdo común, eso es escribir código para hablar con el sistema de reservas dentro del asistente. Después, escribir otra vez `consultar_stock` para la aplicación de escritorio. Y otra vez si mañana el dueño prefiere ChatGPT. Cada aplicación con cada sistema, una integración distinta.

Este post trata de cómo se escribe una herramienta una sola vez y se usa desde cualquier aplicación, y de cómo se usa una que escribió otro.

## Qué es MCP

**MCP** (Model Context Protocol) es un protocolo: un acuerdo público sobre cómo se hablan dos programas. En este caso, cómo una aplicación de IA le pregunta a otro programa qué herramientas tiene, y cómo le pide que ejecute una.

La documentación oficial lo compara con un puerto USB-C: el mismo conector para cualquier aparato. Lo creó Anthropic a fines de 2024. Desde diciembre de 2025 lo cuida la Agentic AI Foundation, parte de la Linux Foundation, que fundaron Anthropic, OpenAI y Block. Por eso hoy lo usan ChatGPT, Claude, Cursor, Gemini, Microsoft Copilot y VS Code, entre otros.

El problema que resuelve se ve con números chicos. Tres aplicaciones (el asistente, Claude en la compu del dueño y ChatGPT) y dos sistemas (stock y reservas) son seis integraciones. Con MCP, cada sistema escribe un **servidor** una vez, y cada aplicación que ya habla MCP lo puede usar.

## Para el modelo no cambia nada

Esta es la idea que ordena todo el post. El modelo sigue haciendo lo mismo que se vio con las herramientas: recibe una lista, pide una, recibe el resultado. No sabe que hay MCP en el medio.

Lo que cambia es de dónde sale la lista de herramientas y quién las ejecuta:

<figure>
<p class="fig-title">Lo que cambia cuando la herramienta llega por MCP</p>
<svg viewBox="0 0 400 530" width="100%" role="img" aria-labelledby="g10t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g10t">Diagrama de secuencia entre el modelo, tu aplicación y un servidor MCP: la aplicación pide la lista de herramientas al servidor, llama al modelo, y cuando el modelo pide una herramienta se la pasa al servidor para que la ejecute.</title>
<defs><marker id="g10c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(55% 0.15 300)"/></marker><marker id="g10c1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(52% 0.13 150)"/></marker><marker id="g10c2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(58% 0.13 70)"/></marker></defs>
<path d="M60 58V520" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M200 58V520" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M340 58V520" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<rect x="4" y="14" width="112" height="44" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="60.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Modelo</text>
<rect x="144" y="14" width="112" height="44" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Tu aplicación</text>
<rect x="284" y="14" width="112" height="44" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="340.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Servidor MCP</text>
<path d="M204 100H336" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g10c2)"/>
<text x="270.0" y="92" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">1. qué herramientas tenés?</text>
<path d="M336 140H204" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g10c2)"/>
<text x="270.0" y="132" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">consultar_stock y su descripción</text>
<path d="M196 212H64" fill="none" stroke="oklch(55% 0.15 300)" stroke-width="1.6" marker-end="url(#g10c0)"/>
<text x="130.0" y="187" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">2. system, herramientas</text>
<text x="130.0" y="204" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">y "Hay napolitana?"</text>
<path d="M64 272H196" fill="none" stroke="oklch(52% 0.13 150)" stroke-width="1.6" marker-end="url(#g10c1)"/>
<text x="130.0" y="247" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">3. pide consultar_stock</text>
<text x="130.0" y="264" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">(napolitana)</text>
<path d="M204 322H336" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g10c2)"/>
<text x="270.0" y="314" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">4. ejecutá consultar_stock</text>
<path d="M336 362H204" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g10c2)"/>
<text x="270.0" y="354" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">napolitana: 0 unidades</text>
<path d="M196 432H64" fill="none" stroke="oklch(55% 0.15 300)" stroke-width="1.6" marker-end="url(#g10c0)"/>
<text x="130.0" y="407" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">5. todo lo anterior</text>
<text x="130.0" y="424" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">y el resultado</text>
<path d="M64 502H196" fill="none" stroke="oklch(52% 0.13 150)" stroke-width="1.6" marker-end="url(#g10c1)"/>
<text x="130.0" y="477" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">6. "Hoy no queda napolitana.</text>
<text x="130.0" y="494" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">Te tomo una muzzarella?"</text>
</svg>
<figcaption><ul><li>Verde: el modelo y lo que escribe.</li><li>Violeta: tu aplicación (Claude, el asistente).</li><li>Naranja: el servidor MCP y lo que devuelve.</li><li>Los pasos 2, 3, 5 y 6 son los mismos que se vieron con las herramientas. Lo nuevo son el 1 y el 4: la lista y la ejecución vienen de un programa aparte, que puede haber escrito otro.</li></ul></figcaption>
</figure>

## Las tres piezas

- **Servidor**: el programa que ofrece las herramientas. Por ejemplo, uno que expone `consultar_stock`. Lo puede escribir el dueño de los datos o cualquier empresa. Mercado Pago, por ejemplo, publica uno para desarrolladores: desde Claude, Cursor o ChatGPT se puede buscar su documentación, crear usuarios de prueba o configurar los avisos de pagos. Es para quien programa la integración, no para cobrarle al cliente.
- **Host**: la aplicación donde está el modelo. Claude Code, ChatGPT, el asistente de la pizzería.
- **Cliente**: la parte de la aplicación que habla con un servidor. Hay uno por cada servidor conectado. Para arrancar, alcanza con saber que la aplicación lo trae adentro.

En el resto del post, "la aplicación" es el host con sus clientes.

## Qué ofrece un servidor

Un servidor puede ofrecer tres cosas, y cada una la decide alguien distinto:

- **Herramientas**: funciones que el modelo decide usar, como `consultar_stock`.
- **Recursos**: datos para leer, que trae la aplicación. Por ejemplo, el menú del día como texto.
- **Prompts**: plantillas que elige el usuario, como "armá el resumen de ventas del día".

En la práctica, casi todo son herramientas. Las APIs de Claude, OpenAI y Gemini solo toman herramientas de un servidor. Los recursos y los prompts los aprovechan aplicaciones como Claude Code.

## Local o remoto

Hay dos formas de conectar un servidor:

- **Local.** La aplicación arranca el servidor como un programa en tu compu, y se hablan por la entrada y la salida de ese programa, como en una terminal. A esto se le dice **stdio**. Sirve para una persona: el dueño en su notebook.
- **Remoto.** El servidor está en internet, en una dirección web, y atiende a muchos. A esta forma se le dice **Streamable HTTP**. Es la que necesita el asistente de la pizzería si quiere que el proveedor del modelo se conecte al servidor, porque las APIs de los tres solo se conectan a servidores remotos.

Desde julio de 2026, la versión vigente del protocolo es más simple: cada pedido viaja con todo lo que necesita, sin una conexión que haya que mantener abierta. Eso hace más fácil repartir un servidor remoto entre varias máquinas.

## Cómo se ve en código

Este es un servidor completo, con el SDK oficial de Python, que expone `consultar_stock` con la misma descripción que se vio con las herramientas:

```python
from typing import Literal
from mcp.server import MCPServer

mcp = MCPServer("pizzeria-la-esquina")

STOCK = {"muzzarella": 12, "napolitana": 0, "fainá": 5}  # en la vida real, una base de datos


@mcp.tool()
def consultar_stock(producto: Literal["muzzarella", "napolitana", "fainá"]) -> dict:
    """Devuelve cuántas unidades quedan hoy de un producto de la pizzería La Esquina.
    Usala cuando el cliente pregunte si hay algo o quiera pedirlo, antes de confirmar.
    No devuelve precios: están en el menú. Si devuelve 0, se acabó por hoy."""
    return {"unidades": STOCK[producto]}


if __name__ == "__main__":
    mcp.run()  # por defecto, local: la aplicación lo arranca como un programa
```

Y para usarlo desde Claude Code, en la compu del dueño:

```bash
pip install mcp
claude mcp add pizzeria -- python /ruta/completa/servidor_pizzeria.py
```

Tres cosas para mirar:

- Con las herramientas, la definición iba aparte de la función: el nombre, la descripción y los datos con sus opciones. Acá el SDK la saca de la función misma. El nombre sale del nombre de la función, la descripción del texto entre comillas triples, y los datos de los tipos: `producto` queda como obligatorio y con tres opciones.
- Si alguien pide `consultar_stock("calabresa")`, el servidor no ejecuta la función: devuelve un error que dice cuáles son las opciones válidas.
- En el comando, el `--` separa las opciones de Claude Code del comando que arranca el servidor.

Un aviso para quien busque más ejemplos: casi todos los tutoriales empiezan con `from mcp.server.fastmcp import FastMCP`. Con la versión actual del SDK, la 2, esa línea da error. La clase ahora se llama `MCPServer`.

Para que el servidor sea remoto, la última línea cambia a `mcp.run(transport="streamable-http")`. Para que lo use la API de un proveedor, además, tiene que estar publicado en internet.

## Cómo se usa desde tu programa

Si la aplicación es tuya, como el asistente de la pizzería, hay dos formas de conectar un servidor.

**Que el proveedor lo llame por vos.** Le pasás la dirección del servidor en el pedido, y el proveedor habla con él. En Claude es el conector MCP de la API, que todavía está en beta (la función existe, pero puede cambiar):

```python
r = client.beta.messages.create(
    model="claude-opus-5-5", max_tokens=16000,
    betas=["mcp-client-2025-11-20"],
    mcp_servers=[{"type": "url", "name": "pizzeria",
                  "url": "https://tu-servidor.example/mcp"}],
    tools=[{"type": "mcp_toolset", "mcp_server_name": "pizzeria"}],
    messages=[{"role": "user", "content": "Hay napolitana?"}],
)
```

No hay loop: Anthropic llama al servidor, y la respuesta ya trae el pedido del modelo y el resultado. Es cómodo, pero tiene una contracara importante. Tu código no ve el pedido antes de que se ejecute. Lo que controlás es qué herramientas del servidor habilitás.

**Hacer de cliente vos.** Tu programa se conecta al servidor con el SDK de MCP, le pide la lista de herramientas y se la pasa al modelo como herramientas normales. Cuando el modelo pide una, tu código se la pasa al servidor. Es más trabajo, pero el pedido pasa por tu código, y los controles que se vieron con los guardrails siguen valiendo. Es también la forma de usar un servidor local, o los recursos y prompts.

Un ejemplo de por qué importa: si `registrar_pedido` estuviera en un servidor MCP y el asistente lo conectara con el conector del proveedor, el control de "no registrar sin confirmación" tendría que vivir en el servidor. En el asistente ya no hay un lugar donde ponerlo.

## Cuándo conviene MCP

MCP no hace falta siempre. Un criterio simple:

- **Herramienta propia.** Si la usa una sola aplicación y la escribiste vos, alcanza con definirla como se vio con las herramientas. El asistente con `registrar_pedido` no gana nada con MCP: suma un programa más que mantener.
- **MCP.** Si la herramienta ya existe y la armó otro (el sistema de reservas, GitHub, Notion), o si la querés usar desde varias aplicaciones: el asistente, Claude en la compu del dueño y ChatGPT.
- **Skill.** Si lo que falta no es acceso a un sistema sino saber cómo hacer algo, como el procedimiento para un reclamo, que ya apareció en la serie. Anthropic lo resume así, en un artículo de 2026: MCP conecta a Claude con los datos; las skills le enseñan qué hacer con ellos. Se usan juntas.

Y un costo que conviene tener en cuenta: cada servidor suma definiciones de herramientas a cada llamada. En un artículo de noviembre de 2025, [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp), Anthropic contó un caso que pasó de 150.000 tokens a 2.000 cargando las herramientas solo cuando hacían falta. Conectar diez servidores "por las dudas" llena la ventana de contexto, como se vio antes en la serie.

## Qué cuidar

Un servidor que conectás mete dos cosas en tu agente. Texto que el modelo lee, como las descripciones de las herramientas y lo que devuelven. Y acciones que se ejecutan afuera de tu código.

Con un servidor local es todavía más directo. La [guía de seguridad para servidores locales](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/local-server-security) de MCP lo dice sin vueltas: es código bajado de internet que corre con tu usuario, y puede leer todo lo que tu usuario puede leer. Del lado remoto, OpenAI avisa en su guía que un servidor malicioso puede sacar datos de todo lo que entra al contexto del modelo.

Tres reglas para empezar:

1. **Saber de quién es cada servidor.** Estar en el registro oficial de servidores de MCP no es una garantía: su propia política dice que hay que asumir una moderación mínima o nula.
2. **Habilitar solo las herramientas que usás**, y sacar los servidores que ya no usás.
3. **Aprobación para lo que tiene efecto.** Claude Code pide aprobación antes de usar un servidor compartido en un proyecto, y OpenAI pide aprobación antes de cada llamada, salvo que la apagues.

Los ataques con nombre propio y cómo se defienden se ven más adelante en la serie.

## Lo mismo en los tres

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Conectar un servidor desde la API | Conector MCP (beta) | Herramienta `mcp` | Herramienta `mcp_server` |
| Qué servidores acepta | Remotos | Remotos; locales con un túnel | Remotos, solo con Streamable HTTP |
| Quién aprueba cada llamada | Nadie: elegís qué herramientas habilitar | Pide aprobación por defecto; se puede apagar | Su guía no lo menciona |
| En sus herramientas para agentes | Claude Code y el Agent SDK, locales y remotos | Agents SDK, locales y remotos | ADK, locales y remotos |

Los tres toman solo herramientas del servidor, y OpenAI aclara que no cobra aparte por usarlo: solo los tokens. En Gemini hay un detalle sin resolver: una página de Google dice que Gemini 3 todavía no acepta servidores remotos, y otra lo muestra funcionando con un Gemini 3. Antes de contar con eso, conviene probarlo.

Y para no confundir, lo que MCP no es. No es un modelo ni la API de un proveedor. No reemplaza al uso de herramientas: es lo mismo, con la lista y la ejecución afuera. Y no es A2A, otro protocolo abierto, creado por Google y hoy también en la Agentic AI Foundation, que sirve para que un agente hable con otro agente.

## En resumen

- MCP es un acuerdo para que cualquier aplicación use las herramientas de cualquier servidor. Se escribe la herramienta una vez y se usa desde muchas.
- Para el modelo no cambia nada: una herramienta MCP es una herramienta más. Cambia quién tiene la lista y quién la ejecuta.
- Un servidor ofrece sobre todo herramientas. Puede ser local, en tu compu, o remoto, en internet.
- Con el SDK oficial, un servidor entra en 15 líneas.
- Conviene cuando la herramienta la armó otro o la querés en varias aplicaciones. Para una herramienta propia de una sola aplicación, no hace falta.
- Conectá solo servidores que conocés, con las herramientas que usás, y con aprobación para lo que tiene efecto.

Con herramientas propias y ajenas, un agente puede hacer mucho. Más adelante en la serie: cómo se ordenan varios pasos con un framework.
