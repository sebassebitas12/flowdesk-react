import { Activity, CheckCircle2, GitBranch, Play, Zap } from 'lucide-react';

export function WorkflowPreview({ executions = 0, successRate = 0 }) {
  return (
    <section className="workflow card" aria-labelledby="workflow-title">
      <div className="section-heading"><div><span className="eyebrow">AUTOMATIZACIÓN ACTIVA</span><h2 id="workflow-title">Solicitud inteligente</h2></div><span className="active-badge"><span className="pulse-dot" /> Activa</span></div>
      <div className="flow-rail">
        <div className="flow-node trigger"><div><Zap size={17} /></div><span>Trigger</span><small>Formulario enviado</small></div><div className="flow-connector" aria-hidden="true" />
        <div className="flow-node"><div><Play size={17} /></div><span>Procesar</span><small>Validar y clasificar</small></div><div className="flow-connector" aria-hidden="true" />
        <div className="flow-node"><div><GitBranch size={17} /></div><span>Decisión</span><small>¿Datos correctos?</small></div><div className="flow-connector" aria-hidden="true" />
        <div className="flow-node success-node"><div><CheckCircle2 size={17} /></div><span>Responder</span><small>Registrar resultado</small></div>
      </div>
      <div className="workflow-foot"><span><Activity size={15} /> {executions} ejecuciones registradas</span><span className="success-text">{successRate}% tasa de éxito</span></div>
    </section>
  );
}
