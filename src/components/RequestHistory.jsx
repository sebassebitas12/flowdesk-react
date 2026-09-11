import { ArrowUpRight, Inbox, MoreHorizontal } from 'lucide-react';

export function RequestHistory({ requests, onViewAll }) {
  return (
    <section className="history card" aria-labelledby="history-title">
      <div className="section-heading"><div><span className="eyebrow">ACTIVIDAD RECIENTE</span><h2 id="history-title">Historial de solicitudes</h2></div><button type="button" className="text-button" onClick={onViewAll}>Ver todas <ArrowUpRight size={15} /></button></div>
      {requests.length === 0 ? <div className="empty-state"><Inbox size={22} /><strong>Aún no hay solicitudes</strong><span>Las solicitudes procesadas aparecerán aquí.</span></div> : <div className="history-list">{requests.map((item) => {
        const initials = String(item.name || 'SD').split(' ').filter(Boolean).map((name) => name[0]).slice(0, 2).join('').toUpperCase();
        return <div className="history-row" key={item.id}><div className="request-avatar">{initials}</div><div className="request-info"><strong>{item.name}</strong><span>{item.category} · {item.id}</span></div><span className={`priority ${String(item.priority || 'Media').toLowerCase()}`}>{item.priority || 'Media'}</span><span className={`result ${item.status}`}>{item.status === 'success' ? 'Completada' : 'Revisar'}</span><span className="date">{item.createdAt}</span><button type="button" className="more" aria-label={`Ver opciones de ${item.id}`} onClick={onViewAll}><MoreHorizontal size={18} /></button></div>;
      })}</div>}
    </section>
  );
}
