import { ArrowUpRight, Command, FileText, Mail, UserRound } from 'lucide-react';
import { categories, priorities } from '../data/formData';

export function RequestForm({ form, onChange, onSubmit, onClear, submitting }) {
  const update = (key) => (event) => onChange({ ...form, [key]: event.target.value });
  return (
    <form className="request-form" onSubmit={onSubmit}>
      <div className="section-heading"><div><span className="eyebrow">NUEVA AUTOMATIZACIÓN</span><h2>Crear solicitud</h2></div><span className="required-note">* Campos obligatorios</span></div>
      <div className="field-grid">
        <label><span>Nombre completo <b>*</b></span><div className="input-wrap"><UserRound size={17} aria-hidden="true" /><input name="name" value={form.name} onChange={update('name')} placeholder="Ej. Valentina Rojas" autoComplete="name" required /></div></label>
        <label><span>Correo electrónico <b>*</b></span><div className="input-wrap"><Mail size={17} aria-hidden="true" /><input name="email" type="email" value={form.email} onChange={update('email')} placeholder="nombre@empresa.com" autoComplete="email" required /></div></label>
        <label><span>Categoría</span><select name="category" value={form.category} onChange={update('category')}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Prioridad</span><select name="priority" value={form.priority} onChange={update('priority')}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <label className="full-field"><span>Descripción <b>*</b></span><div className="input-wrap textarea-wrap"><FileText size={17} aria-hidden="true" /><textarea name="description" value={form.description} onChange={(event) => { if (event.target.value.length <= 500) update('description')(event); }} placeholder="Describe brevemente lo que necesitas..." rows="5" maxLength="500" required /></div><small>{form.description.length}/500 caracteres</small></label>
      <div className="form-footer"><div className="shortcut"><Command size={14} aria-hidden="true" /><span>Guardado automático mientras escribes</span></div><div className="form-actions"><button type="button" className="button ghost" onClick={onClear} disabled={submitting}>Limpiar</button><button type="submit" className="button primary" disabled={submitting}>{submitting ? 'Procesando...' : <>Enviar solicitud <ArrowUpRight size={17} /></>}</button></div></div>
    </form>
  );
}
