import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, Check, ChevronDown, CircleHelp, FilePlus2, Gauge, HelpCircle, LayoutDashboard, LineChart, LogOut, Settings2, Sparkles, TrendingUp, X, Zap } from 'lucide-react';
import { Header } from './components/Header';
import { AutomationStatus } from './components/AutomationStatus';
import { RequestForm } from './components/RequestForm';
import { RequestHistory } from './components/RequestHistory';
import { WorkflowPreview } from './components/WorkflowPreview';
import { emptyRequest, sampleRequests } from './data/formData';
import { sendToN8n, storageService } from './services/storageService';
import { useAutoSave } from './hooks/useAutoSave';
import './styles/app.css';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Workspace' },
  { id: 'new', label: 'Nueva solicitud', icon: FilePlus2, group: 'Workspace' },
  { id: 'analytics', label: 'Analíticas', icon: LineChart, group: 'Workspace' },
  { id: 'settings', label: 'Configuración', icon: Settings2, group: 'Administración' },
  { id: 'help', label: 'Centro de ayuda', icon: HelpCircle, group: 'Administración' }
];

const todayLabel = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

function App() {
  const [form, setForm] = useState(() => storageService.getDraft() || { ...emptyRequest });
  const [requests, setRequests] = useState(() => {
    const stored = storageService.getRequests();
    return stored.length ? stored : sampleRequests;
  });
  const [automation, setAutomation] = useState('idle');
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState('overview');
  const [toast, setToast] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const { saveState, lastSaved } = useAutoSave(form);
  const visibleStatus = automation === 'idle' && saveState === 'saving' ? 'saving' : automation;

  const stats = useMemo(() => {
    const total = requests.length;
    const success = requests.filter((item) => item.status === 'success').length;
    const failed = requests.filter((item) => item.status === 'error').length;
    const rate = total ? ((success / total) * 100).toFixed(1) : '0.0';
    const savedMinutes = success * 12;
    return { total, success, failed, rate, savedMinutes };
  }, [requests]);

  useEffect(() => {
    const current = navItems.find((item) => item.id === view);
    document.title = `FlowDesk · ${current?.label || 'Workspace'}`;
  }, [view]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message, type = 'info') => setToast({ message, type });

  const goTo = (nextView) => {
    setView(nextView);
    setMobileNav(false);
    if (nextView === 'new') window.setTimeout(() => document.querySelector('.request-form input')?.focus(), 80);
  };

  const updateForm = (nextForm) => {
    setForm(nextForm);
    if (automation === 'success' || automation === 'error') setAutomation('idle');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setAutomation('processing');

    try {
      const result = await sendToN8n(form);
      const isSuccess = result.status === 'success';
      const item = {
        ...form,
        id: result.requestId || `FD-${Date.now().toString().slice(-6)}`,
        status: isSuccess ? 'success' : 'error',
        createdAt: 'Ahora',
        route: result.route || null
      };

      const nextRequests = storageService.saveRequest(item);
      setRequests(nextRequests);
      storageService.clearDraft();
      setAutomation(item.status);
      setForm({ ...emptyRequest });
      notify(isSuccess ? 'Solicitud registrada y automatizada correctamente.' : 'n8n rechazó la solicitud por datos inválidos.', isSuccess ? 'success' : 'error');
      setView('overview');
    } catch (error) {
      setAutomation('error');
      notify(error.message || 'No se pudo conectar con n8n.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const clearForm = () => {
    setForm({ ...emptyRequest });
    storageService.clearDraft();
    setAutomation('idle');
    notify('Formulario limpio.');
  };

  const workspaceNav = navItems.filter((item) => item.group === 'Workspace');
  const adminNav = navItems.filter((item) => item.group === 'Administración');

  return (
    <div className="app-shell">
      {mobileNav && <button className="mobile-backdrop" aria-label="Cerrar menú" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="side-logo"><div className="brand-mark"><Sparkles size={17} /></div><span>FlowDesk</span><button className="close-sidebar" onClick={() => setMobileNav(false)} aria-label="Cerrar menú"><X size={18} /></button></div>
        <div className="workspace-selector"><div className="workspace-avatar">JD</div><div><strong>Juan Diego</strong><small>Workspace personal</small></div><ChevronDown size={15} /></div>
        <nav aria-label="Navegación principal">
          <span className="nav-label">Workspace</span>
          {workspaceNav.map(({ id, label, icon: Icon }, index) => <button type="button" className={`nav-link ${view === id ? 'active' : ''}`} key={id} onClick={() => goTo(id)}><Icon size={18} /> <span>{label}</span>{index === 0 && <b>⌘1</b>}</button>)}
          <span className="nav-label secondary">Administración</span>
          {adminNav.map(({ id, label, icon: Icon }) => <button type="button" className={`nav-link ${view === id ? 'active' : ''}`} key={id} onClick={() => goTo(id)}><Icon size={18} /><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-box"><div className="upgrade-icon"><Sparkles size={16} /></div><strong>Tu flujo está listo</strong><p>Conecta n8n para procesar solicitudes en tiempo real.</p><button type="button" onClick={() => goTo('settings')}>Revisar conexión <ChevronDown size={13} /></button></div>
          <button type="button" className="logout" onClick={() => notify('La sesión demo permanece activa.')}><LogOut size={17} /> Sesión demo activa</button>
        </div>
      </aside>

      <main className="main-content">
        <Header onNotifications={() => notify('No tienes notificaciones nuevas.')} onMenu={() => setMobileNav(true)} />
        <div className="content-wrap">

          {/* ── OVERVIEW ── */}
          {view === 'overview' && <>
            <div className="welcome-row">
              <div><div className="breadcrumb">Workspace <span>/</span> Overview</div><h1>Buenos días, Juan <span>✦</span></h1><p>Una vista operativa de tus solicitudes y automatizaciones.</p></div>
              <div className="date-chip"><Activity size={14} /> {todayLabel}</div>
            </div>

            <div className="stats-grid">
              <div className="stat-card"><span className="stat-icon purple"><LayoutDashboard size={18} /></span><div><small>Solicitudes registradas</small><strong>{stats.total}</strong></div><em>En local</em></div>
              <div className="stat-card"><span className="stat-icon green"><Check size={18} /></span><div><small>Procesadas con éxito</small><strong>{stats.success}</strong></div><em>{stats.rate}%</em></div>
              <div className="stat-card"><span className="stat-icon orange"><TrendingUp size={18} /></span><div><small>Requieren revisión</small><strong>{stats.failed}</strong></div><em className="muted">Resultado n8n</em></div>
              <div className="stat-card accent"><div className="metric-orbit"><Gauge size={20} /><span>EFICIENCIA</span></div><div><small>Tiempo estimado ahorrado</small><strong>{stats.savedMinutes} min</strong></div><span className="sparkle">✦</span></div>
            </div>

            {/* Dashboard split: workflow left, CTA right */}
            <div className="dashboard-grid">
              <WorkflowPreview executions={stats.total} successRate={stats.rate} />
              <div className="overview-cta-panel">
                <div className="cta-glow-bg" aria-hidden="true" />
                <div className="cta-body">
                  <div className="cta-icon-wrap"><Zap size={22} /></div>
                  <h2>Automatiza en segundos</h2>
                  <p>Crea una solicitud y el flujo de n8n se encarga del resto: valida, clasifica y registra sin intervención manual.</p>
                  <button type="button" className="button primary cta-main" onClick={() => goTo('new')}>
                    Nueva solicitud <ArrowUpRight size={16} />
                  </button>
                  <div className="cta-stats-row">
                    <div><strong>{stats.rate}%</strong><span>tasa de éxito</span></div>
                    <div className="cta-divider" aria-hidden="true" />
                    <div><strong>{stats.savedMinutes} min</strong><span>ahorrados</span></div>
                    <div className="cta-divider" aria-hidden="true" />
                    <div><strong>{stats.total}</strong><span>solicitudes</span></div>
                  </div>
                </div>
              </div>
            </div>

            <RequestHistory requests={requests} onViewAll={() => notify(`Se muestran ${requests.length} registros locales.`)} />
          </>}

          {/* ── NUEVA SOLICITUD ── */}
          {view === 'new' && <div className="single-view">
            <div className="page-heading"><span className="eyebrow">WORKSPACE / NUEVA SOLICITUD</span><h1>Automatiza una nueva solicitud</h1><p>Completa los datos. El borrador se guarda mientras escribes y n8n procesa el envío.</p></div>
            <AutomationStatus state={visibleStatus} lastSaved={lastSaved} />
            <RequestForm form={form} onChange={updateForm} onSubmit={handleSubmit} onClear={clearForm} submitting={submitting} />
          </div>}

          {/* ── ANALÍTICAS ── */}
          {view === 'analytics' && <div className="single-view"><div className="page-heading"><span className="eyebrow">WORKSPACE / ANALÍTICAS</span><h1>Rendimiento del flujo</h1><p>Métricas calculadas a partir del historial disponible en este navegador.</p></div><div className="analytics-grid">
            <div className="analytics-card"><small>Ejecuciones registradas</small><strong>{stats.total}</strong><span>Historial local</span></div>
            <div className="analytics-card"><small>Tasa de éxito</small><strong>{stats.rate}%</strong><span className="trend-up">{stats.success} solicitudes completadas</span></div>
            <div className="analytics-card"><small>Resultados para revisar</small><strong>{stats.failed}</strong><span>Respuestas de n8n con error</span></div>
            <div className="analytics-card"><small>Tiempo estimado ahorrado</small><strong>{stats.savedMinutes} min</strong><span>Referencia: 12 min por solicitud automatizada</span></div>
            <div className="analytics-card wide"><WorkflowPreview executions={stats.total} successRate={stats.rate} /></div>
          </div></div>}

          {/* ── CONFIGURACIÓN ── */}
          {view === 'settings' && <div className="single-view"><div className="page-heading"><span className="eyebrow">ADMINISTRACIÓN / CONFIGURACIÓN</span><h1>Conexiones del workspace</h1><p>La interfaz conserva la integración existente y solo expone su estado.</p></div><div className="settings-card">
            <div className="setting-row"><div><strong>Webhook n8n</strong><p>Endpoint configurado mediante <code>VITE_N8N_WEBHOOK_URL</code>.</p></div><span className={`connection-badge ${import.meta.env.VITE_N8N_WEBHOOK_URL ? 'green' : ''}`}>{import.meta.env.VITE_N8N_WEBHOOK_URL ? 'Configurado' : 'No configurado'}</span></div>
            <div className="setting-row"><div><strong>Persistencia local</strong><p>Borradores e historial se guardan únicamente en este navegador.</p></div><span className="connection-badge green">Activa</span></div>
            <div className="setting-row"><div><strong>Motor de automatización</strong><p>Validación, clasificación y respuesta mediante el workflow incluido de n8n.</p></div><span className="connection-badge green">n8n</span></div>
          </div></div>}

          {/* ── AYUDA ── */}
          {view === 'help' && <div className="single-view"><div className="page-heading"><span className="eyebrow">CENTRO DE AYUDA</span><h1>Cómo funciona FlowDesk</h1><p>La interfaz hace visible el flujo completo sin esconder la lógica detrás de una pantalla decorativa.</p></div><div className="help-card"><div className="help-title"><CircleHelp size={22} /><div><h2>Prueba rápida</h2><p>Recorre el flujo en menos de un minuto.</p></div></div><ol><li><strong>Crea</strong> una solicitud desde Nueva solicitud.</li><li><strong>Espera</strong> 650 ms y observa el auto-guardado.</li><li><strong>Envía</strong> para ejecutar el webhook configurado en n8n.</li><li><strong>Comprueba</strong> el resultado en el historial y las analíticas.</li></ol></div></div>}
        </div>
        {toast && <div className={`toast ${toast.type}`} role="alert"><span className="toast-dot" />{toast.message}</div>}
      </main>
    </div>
  );
}

export default App;
