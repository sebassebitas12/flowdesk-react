import { CheckCircle2, CircleDashed, LoaderCircle, Save, XCircle } from 'lucide-react';

const states = {
  idle: ['Listo para automatizar', CircleDashed],
  saving: ['Guardando borrador', LoaderCircle],
  saved: ['Borrador guardado', Save],
  processing: ['Procesando solicitud', LoaderCircle],
  success: ['Automatización exitosa', CheckCircle2],
  error: ['Automatización con error', XCircle]
};

export function AutomationStatus({ state, lastSaved }) {
  const [label, Icon] = states[state] || states.idle;
  return (
    <div className={`automation-status ${state}`} role="status" aria-live="polite">
      <div className="status-icon"><Icon size={20} /></div>
      <div><span className="eyebrow">ESTADO DEL FLUJO</span><strong>{label}</strong>
        {state === 'saving' && <small>Guardando cambios automáticamente</small>}
        {state === 'saved' && lastSaved && <small>Último guardado: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>}
        {state === 'processing' && <small>Enviando los datos al webhook de n8n</small>}
        {state === 'success' && <small>La solicitud fue procesada por la automatización</small>}
        {state === 'error' && <small>La solicitud no pudo completarse; tus datos se conservaron</small>}
      </div>
      <span className="live-line" aria-hidden="true" />
    </div>
  );
}
