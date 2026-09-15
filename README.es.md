# 🇨🇺 CubaCell Connect — Landing Page

[![GitHub Stars](https://img.shields.io/github/stars/albertolicea00/cubacell-connect?style=flat&logo=github&label=stars&color=000066)](https://github.com/albertolicea00/CubaCellConnect)
![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Alpine.js](https://img.shields.io/badge/Alpine.js-8BC0D0?style=flat&logo=alpinedotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

Página de destino (landing page) + marcador USSD web para la aplicación iOS [CubaCell Connect](https://github.com/albertolicea00/CubaCellConnect). Sin paso de compilación.

[Read English version](README.md)

## Estructura

```
├── index.html        página de destino
├── dial.html         marcador USSD web (ETECSA/Cubacel, funciona independiente desde la pantalla de inicio de iOS)
├── style.css         estilos de componentes
├── app.js            componentes Alpine.js (página de destino + formulario de notificación compartido)
├── sw.js             service worker — soporte offline completo, ver Soporte Offline abajo
├── api/subscribe.js  función serverless de Vercel — añade correos electrónicos a Brevo
├── vercel.json       URLs limpias + caché a largo plazo para /assets
├── assets/           iconos, imagen OG, maquetas de funciones
└── .env.example      variables de entorno requeridas
```

A diferencia de [Banca Remota](https://github.com/albertolicea00/BancaRemota) (multibanco), esta app atiende a un solo operador — ETECSA —, por lo que `dial.html` es una lista única agrupada por categorías y buscable en lugar de un diseño con pestañas por banco, y no hay `op-icons.json`: solo existen 4 iconos de categoría, mapeados inline en `dial.html`.

## Páginas

**`index.html`** — página de destino: hero, funcionamiento (tres pasos), sección de catálogo (descarga de `ussd_codes.json`), tabla comparativa, Preguntas Frecuentes (FAQ), mapa de ruta (roadmap) y sección de **Apps similares**. Realiza una petición en el cliente a `https://api.github.com/repos/albertolicea00/cubacell-connect` para mostrar el conteo de estrellas de GitHub en vivo.

**`dial.html`** — marcador USSD web: busca en todo el catálogo de ETECSA por título, código o descripción; toca una tarjeta para abrir `tel:<code>` y realizar la llamada. Los códigos que necesitan un valor de variable (un número de tarjeta para `*662*{input}#`, un número telefónico para `#31#{input}#`) abren primero un pequeño paso de entrada — reflejando el `CodeDetailView` de la app iOS. Mismo modo oscuro, formulario de notificación y guía de instalación de iOS que la página de destino. Consulta **Soporte Offline** abajo para ver cómo obtiene sus datos y funciona sin conexión.

Ambas páginas comparten `app.js` (`notifyForm()` para el formulario de suscripción, gestión de modo oscuro) y los estilos `.code-card` en `style.css`.

## Formulario "Avísame" / suscripción

`notifyForm()` en `app.js` envía un `{ email }` mediante `POST /api/subscribe` (`api/subscribe.js`, función serverless de Vercel), la cual añade la dirección a una lista de Brevo — utilizada para "notificar cuando la app llegue a la App Store". Requiere `BREVO_API_KEY` y `BREVO_LIST_ID` (consulta `.env.example`).

## Guía iOS "Añadir a la pantalla de inicio"

En Safari de iOS (detectado vía UA / `MacIntel` + multitáctil, no en modo standalone aún), ambas páginas muestran un modal después de ~1.5s guiando al usuario a través de Compartir → Añadir a la pantalla de inicio, para que el sitio se comporte como una app instalada (icono propio, sin barra de Safari, `apple-mobile-web-app-capable`). La desestimación se recuerda en `localStorage['installGuideSeenAt']` (se vuelve a mostrar tras una semana). El botón "Instalar" de la navegación lo vuelve a abrir bajo demanda mediante un evento personalizado `open-install-guide`. Irrelevante en Android/escritorio — restringido tras la verificación de iOS.

## Soporte Offline

`dial.html` no incluye su propia copia del catálogo — siempre descarga el `codes.json` más reciente directamente desde el repositorio principal [CubaCellConnect](https://github.com/albertolicea00/cubacell-connect) (el mismo archivo que incluye la app iOS):

```
https://raw.githubusercontent.com/albertolicea00/cubacell-connect/refs/heads/main/CubacellConnect/codes.json
```

La capacidad offline real reside en `sw.js`, un service worker registrado tanto en `index.html` como en `dial.html`. Almacena todo lo necesario para renderizar la app en Cache Storage (que no tiene expiración):

- **Precargado en la instalación**: ambas páginas, `style.css`, `app.js`, los SVGs de iconos, favicon, el JSON del catálogo remoto y los scripts CDN de Tailwind/Alpine de los que dependen las páginas. Se precarga explícitamente en lugar de dejarlo para la caché del primer uso, porque la primera petición de la página para el catálogo se dispara desde el `init()` de Alpine *antes* de que el service worker termine de registrarse (el registro solo comienza en el evento `load`) — sin precargarlo, una instalación nueva que pase a estar offline antes de una segunda visita mostraría un cascarón funcional sin códigos.
- **En tiempo de ejecución (stale-while-revalidate)**: cualquier otra cosa solicitada posteriormente se sirve desde la caché de forma instantánea si está presente, con una nueva descarga en segundo plano para mantenerla actualizada para la próxima vez.

Efecto neto: tras una visita online exitosa, el marcador (y la página de destino) siguen funcionando sin conexión indefinidamente, manteniendo las correcciones de códigos USSD enviadas al repositorio de la app siempre que haya conexión disponible, sin necesidad de desplegar una nueva versión de este sitio web.

Dos detalles a tener en cuenta al modificar `sw.js`: incrementa `CACHE_NAME` cada vez que cambie la lista de precarga, o los usuarios recurrentes seguirán sirviendo el cascarón antiguo cacheado; y las URLs CDN de origen cruzado sin cabecera `Access-Control-Allow-Origin` (como `cdn.tailwindcss.com`) deben ser cacheadas mediante un `fetch()` manual + `cache.put()` con `mode: 'no-cors'` — `cache.add()`/`addAll()` lanzan un error con respuestas opacas por especificación.

## Desarrollo local

```bash
npx serve .
```

`api/subscribe.js` es una función serverless de Vercel — `npx serve` no la ejecutará. Usa `vercel dev` para probar el formulario de notificación localmente contra una lista real de Brevo.

## Despliegue

Push a `main` → Vercel despliega automáticamente. Añade las variables de entorno de `.env.example` en el panel de control de Vercel.

## Colores

| Token            | Hex       |                      |
| ---------------- | --------- | -------------------- |
| `--color-navy`   | `#000066` | Acento de marca principal |
| `--color-accent` | `#0099cc` | Destacados en cian   |

Coincide con la paleta de colores de la app iOS (azul marino `rgb(0, 0, 102)`, cian `#09C`).

## Más Aplicaciones

Otras aplicaciones de códigos USSD del mismo autor:

- [Banca Remota](https://bancaremota.vercel.app/) — página de destino + marcador web para la alternativa no oficial para iOS a las apps bancarias de Cuba.

## Contribuir

Consulta el [CONTRIBUTING.md](https://github.com/albertolicea00/CubaCellConnect/blob/main/CONTRIBUTING.md) del proyecto principal. Los Issues, PRs y mensajes de commit deben estar en inglés.

---

*Parte del proyecto [CubaCell Connect](https://github.com/albertolicea00/CubaCellConnect) por [Alberto Licea](https://www.linkedin.com/in/albertolicea00).*
