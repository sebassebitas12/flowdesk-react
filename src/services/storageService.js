const DRAFT_KEY = 'flowdesk-draft';
const REQUESTS_KEY = 'flowdesk-requests';

function read(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

export const storageService = {
  getDraft() {
    const draft = read(DRAFT_KEY, null);
    if (!draft || typeof draft !== 'object') return null;
    const { savedAt, ...form } = draft;
    return form;
  },
  getDraftSavedAt() {
    const draft = read(DRAFT_KEY, null);
    if (!draft?.savedAt) return null;
    const date = new Date(draft.savedAt);
    return Number.isNaN(date.getTime()) ? null : date;
  },
  saveDraft(draft) { write(DRAFT_KEY, { ...draft, savedAt: new Date().toISOString() }); },
  clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ } },
  getRequests() { const requests = read(REQUESTS_KEY, []); return Array.isArray(requests) ? requests : []; },
  saveRequest(request) {
    const next = [request, ...this.getRequests().filter((item) => item.id !== request.id)].slice(0, 8);
    write(REQUESTS_KEY, next);
    return next;
  }
};

export async function sendToN8n(payload, webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL) {
  const url = webhookUrl;
  if (!url) throw new Error('Falta VITE_N8N_WEBHOOK_URL. Configura .env.local y reinicia Vite.');
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('n8n tardó demasiado en responder.');
    throw new Error('No se pudo conectar con el webhook de n8n.');
  } finally {
    window.clearTimeout(timeout);
  }
  const raw = await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { raw }; }
  if (!response.ok) throw new Error(data.message || `n8n respondió con ${response.status}`);
  return data;
}
