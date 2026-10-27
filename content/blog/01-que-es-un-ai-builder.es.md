---
title: "Qué es un AI Builder y qué hace"
date: 2026-10-27
order: 1
description: "Un AI Builder construye software cuyo cerebro es un modelo de lenguaje. Qué es, en qué se diferencia de un desarrollador tradicional y qué hace en el día a día."
---

Hace poco empecé a escuchar el término AI Builder en todos lados, y la definición cambia según quién la cuente. Esto es lo que entendí, escrito de la forma más simple que pude.

## La idea en una frase

Un AI Builder es alguien que construye software cuyo cerebro es un modelo de lenguaje.

Un modelo de lenguaje es lo que está detrás de Claude, ChatGPT o Gemini: un programa que lee texto y escribe texto. Un AI Builder no lo fabrica. Lo usa, ya hecho, y arma un producto alrededor.

## En qué se diferencia de un desarrollador tradicional

El desarrollador tradicional escribe reglas explícitas: "si pasa X, hacé Y". Todo lo que el programa decide, lo decidió una persona antes, línea por línea.

El AI Builder le deja una parte de la decisión a un modelo que razona sobre lenguaje. Por ejemplo, en vez de programar veinte reglas para clasificar los mensajes de clientes, se le explica al modelo qué buscar y él decide. El trabajo pasa a ser otro: lograr que ese modelo se comporte de forma confiable, barata y medible dentro de un producto real.

## Lo que no es

No es un investigador de IA. Ese entrena modelos desde cero, con matemática pesada y muchas placas de video. El AI Builder usa modelos que ya existen (Claude, GPT, Gemini) a través de su API, que es la puerta por la que el código de una app le habla al modelo.

## Qué hace en el día a día

1. **Conecta modelos a productos.** Un chat, un asistente, un generador de contenido, un analizador de datos.
2. **Diseña los pasos.** Cuándo llamar al modelo, qué darle, qué hacer con la respuesta, cuándo usar otra herramienta.
3. **Controla el comportamiento.** Que siga las reglas, que no se desvíe, que no invente y que no gaste de más.
4. **Mide y opera.** Pone métricas, detecta cuándo algo anda mal y lo arregla.
5. **Decide la arquitectura.** Elige entre varias formas de armar el sistema y justifica la elección con costo, velocidad y escala.

Hay un término que se usa mucho desde fines de 2025: **context engineering** (ingeniería de contexto). Significa cuidar todo lo que el modelo ve en cada llamada (instrucciones, documentos, herramientas, historial), no solo escribir un buen prompt. Más adelante en la serie hay un post entero sobre eso.

## Los niveles

- **Junior o mid:** sabe llamar a la API, arma flujos, usa frameworks. Construye.
- **Senior:** tiene una opinión justificada sobre cuándo no usar IA, lleva los sistemas a producción con control de costos y de errores, y resuelve incidentes. Decide y opera, no solo construye.

La frase que resume la diferencia: un mid sabe que el modelo puede hacer algo; un senior sabe cuándo no conviene que lo haga.

## De qué trata esta serie

Son 22 posts, como máximo uno por semana, para entender qué pasa por debajo cuando se construye con un modelo de lenguaje: cómo funciona un modelo, prompting, contexto, herramientas, agentes, RAG, evaluación, costos, seguridad. Son notas de aprendizaje, no de alguien que ya lo sabe todo. La idea es aprender en voz alta, y que quien lo lea aprenda también.

El próximo post arranca por lo básico: qué es un modelo de lenguaje y cómo lee el texto.
