import { Bell, Menu, Sparkles } from 'lucide-react';

export function Header({ onNotifications, onMenu }) {
  return (
    <header className="topbar">
      <button type="button" className="mobile-menu" aria-label="Abrir menú" onClick={onMenu}><Menu size={20} /></button>
      <div className="brand"><div className="brand-mark"><Sparkles size={17} /></div><div><strong>FlowDesk</strong><span>Automation workspace</span></div></div>
      <div className="top-actions">
        <div className="status-pill"><span className="pulse-dot" /> Sistema operativo</div>
        <button type="button" className="icon-button" aria-label="Ver notificaciones" onClick={onNotifications}><Bell size={18} /><i aria-hidden="true">1</i></button>
        <div className="avatar" aria-label="Usuario Juan Diego">JD</div>
      </div>
    </header>
  );
}
