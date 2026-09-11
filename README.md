# FlowDesk — Workspace de automatización con React + n8n

FlowDesk es una interfaz de gestión de solicitudes construida con React y Vite. El objetivo no es solo presentar un formulario: la aplicación hace visible un flujo operativo completo, desde la captura y persistencia del borrador hasta el envío al webhook, procesamiento en n8n y registro del resultado.

## Arquitectura

```text
src/
├── components/       # Presentación e interacción de UI
├── data/             # Opciones y datos demo iniciales
├── hooks/             # Comportamiento reutilizable
├── services/          # Persistencia local e integración n8n
├── styles/            # Sistema visual y responsive
├── App.jsx            # Composición de la aplicación
└── main.jsx           # Punto de entrada React
n8n/
└── workflow-solicitudes.json
workflow/
└── flowdesk-workflow.mmd
docs/
└── informe-laboratorio.md
```

La regla principal es mantener la lógica externa fuera de los componentes: `RequestForm` comunica cambios, `storageService` maneja `localStorage` y `sendToN8n` concentra la integración HTTP. El workflow de n8n permanece independiente de la interfaz.

## Requisitos

- Node.js 18+
- n8n para probar la automatización real

## Instalación

```bash
npm install
npm run dev
```

Vite abrirá la aplicación en `http://localhost:5173`.

## Conexión con n8n

1. Abre n8n.
2. Importa `n8n/workflow-solicitudes.json`.
3. Activa el workflow.
4. Confirma el webhook de producción:
   `http://localhost:5678/webhook/flowdesk-solicitud`
5. Crea `.env.local` a partir de `.env.example`:

```env
VITE_N8N_WEBHOOK_URL=/n8n/webhook/flowdesk-solicitud
```

6. Reinicia Vite después de cambiar variables de entorno.

El prefijo `/n8n` utiliza el proxy de desarrollo definido en `vite.config.js`, por lo que el navegador no necesita comunicarse directamente con `localhost:5678` y se evita el problema habitual de CORS durante el desarrollo.

La aplicación **no inventa un éxito cuando n8n no está configurado**. Si falta la URL, hay un error de red o n8n devuelve un HTTP distinto de 2xx, el envío queda en estado de error y el formulario no se limpia. También existe un límite de 15 segundos para evitar que una solicitud quede procesando indefinidamente.

## Flujo funcional

1. El usuario completa el formulario.
2. `useAutoSave` detecta cambios y programa un guardado después de 650 ms sin escritura.
3. `storageService` conserva el borrador en `localStorage`.
4. El usuario envía la solicitud.
5. `sendToN8n` realiza el `POST` al webhook.
6. n8n valida nombre, correo y descripción.
7. n8n clasifica la prioridad y genera el resultado.
8. React registra la respuesta en el historial local.
9. La interfaz actualiza el estado y las métricas.

El temporizador de auto-guardado se limpia mediante `clearTimeout`, evitando ejecuciones pendientes cuando el valor cambia o el componente se desmonta.

## Estados de interfaz

La aplicación diferencia visualmente:

- `idle`: lista para recibir una solicitud.
- `saving`: guardando borrador.
- `saved`: borrador persistido.
- `processing`: petición enviada a n8n.
- `success`: automatización completada.
- `error`: fallo de conexión o respuesta inválida.

## Verificación

Ejecuta:

```bash
npm run build
```

Después prueba el flujo real con n8n y verifica la ejecución desde la sección **Executions** de n8n.

## Nota académica

Los registros iniciales de la pantalla son datos demo para que el dashboard tenga contenido desde el primer arranque. Las métricas se calculan sobre el historial disponible en el navegador; no se presentan como datos reales de producción.

El workflow incluido es determinista y no requiere OpenAI, modelos de pago ni credenciales externas.
