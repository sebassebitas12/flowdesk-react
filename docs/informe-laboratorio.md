# Informe de laboratorio: Automatización en React

## 1. Descripción de la solución

FlowDesk es una aplicación web desarrollada con Vite y React para automatizar la recepción de solicitudes. La solución combina una experiencia de formulario, persistencia local y procesamiento opcional mediante n8n. El usuario no necesita guardar manualmente el texto: cada cambio activa un temporizador y, después de un breve intervalo sin nuevas modificaciones, el borrador se almacena en `localStorage`.

El caso de uso fue seleccionado porque representa una automatización útil y observable. También permite demostrar el comportamiento completo solicitado por el laboratorio: disparador, proceso temporal, tarea asíncrona, estados de ejecución, resultado exitoso, manejo de errores y limpieza de efectos.

## 2. Disparadores y flujo de estados

El primer disparador es el cambio de valor en cualquiera de los campos del formulario. El hook `useAutoSave` detecta el cambio mediante `useEffect`, establece el estado de guardado y programa un `setTimeout` de 650 milisegundos. Si el usuario continúa escribiendo antes de que termine ese intervalo, React ejecuta la función de limpieza y cancela el temporizador anterior. Cuando el intervalo termina, el borrador se guarda en `localStorage` y la interfaz informa la hora del último guardado.

El segundo disparador es el botón **Enviar solicitud**. La aplicación cambia al estado `processing` y ejecuta una operación asíncrona. Si existe `VITE_N8N_WEBHOOK_URL`, se realiza una petición `fetch` al webhook de n8n. Si la variable no existe, se activa un modo demostración local con un retraso controlado. En ambos casos se registra la solicitud y se muestra el estado `success`. Una respuesta HTTP inválida, un error de red o una validación incorrecta llevan al estado `error`.

## 3. Implementación técnica

La aplicación usa `useState` para controlar el contenido del formulario, la lista de solicitudes, el estado de automatización y el indicador de envío. Utiliza `useEffect` para reaccionar a cambios del formulario y para actualizar el título del documento según el estado actual. El hook personalizado `useAutoSave` concentra la lógica reutilizable del auto-guardado.

La limpieza es esencial en este flujo. El retorno del efecto ejecuta `clearTimeout(timer)`, por lo que no quedan temporizadores activos cuando el usuario modifica nuevamente el formulario o cuando el componente deja de existir. Esta práctica evita ejecuciones duplicadas y fugas de memoria.

La solución está dividida en componentes: `Header`, `AutomationStatus`, `RequestForm`, `RequestHistory` y `WorkflowPreview`. Los servicios de persistencia y comunicación externa se mantienen fuera de los componentes para separar presentación y lógica. El workflow n8n valida los campos obligatorios y el correo, decide si los datos son correctos, clasifica la prioridad y devuelve una respuesta JSON. No requiere inteligencia artificial ni credenciales de pago.

## 4. Verificación y conclusión

La aplicación cumple los requisitos técnicos del laboratorio. Fue creada con Vite y React, utiliza los hooks solicitados, incorpora un proceso temporal y asíncrono, limpia sus efectos, supera el mínimo de dos componentes reutilizables y representa los estados `inactivo`, `en ejecución`, `éxito` y `error`. El diagrama `workflow/flowdesk-workflow.mmd` documenta el flujo completo con inicio, disparadores, procesos, decisión y caminos alternativos.

La solución también cumple los entregables: código fuente organizado, README con instrucciones, workflow n8n en JSON, diagrama y este informe. Para demostrarla basta ejecutar `npm install`, `npm run dev`, completar el formulario, observar el auto-guardado y enviar una solicitud. La conexión con n8n es opcional para que el laboratorio pueda ejecutarse sin servicios de pago.
