export const emptyRequest = { name: '', email: '', category: 'Soporte técnico', priority: 'Media', description: '' };
export const categories = ['Soporte técnico', 'Facturación', 'Acceso a cuenta', 'Solicitud comercial'];
export const priorities = ['Baja', 'Media', 'Alta', 'Urgente'];
export const sampleRequests = [
  { id: 'FD-1048', name: 'María González', category: 'Acceso a cuenta', priority: 'Alta', status: 'success', createdAt: 'Hoy, 10:42' },
  { id: 'FD-1047', name: 'Carlos Pérez', category: 'Facturación', priority: 'Media', status: 'success', createdAt: 'Ayer, 16:18' },
  { id: 'FD-1046', name: 'Ana Torres', category: 'Soporte técnico', priority: 'Urgente', status: 'error', createdAt: 'Ayer, 09:07' }
];
