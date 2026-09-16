import { beforeEach, describe, expect, it } from '@jest/globals';
import { sendToN8n, storageService } from './storageService';

const DRAFT_KEY = 'flowdesk-draft';
const REQUESTS_KEY = 'flowdesk-requests';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('drafts', () => {
    it('returns null when there is no saved draft', () => {
      expect(storageService.getDraft()).toBeNull();
      expect(storageService.getDraftSavedAt()).toBeNull();
    });

    it('saves and reads a draft without exposing savedAt in the form', () => {
      const draft = { name: 'María', email: 'maria@test.com' };

      storageService.saveDraft(draft);

      expect(storageService.getDraft()).toEqual(draft);
      expect(storageService.getDraftSavedAt()).toEqual(expect.any(Date));
    });

    it('returns null for an invalid savedAt value', () => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ name: 'Test', savedAt: 'not-a-date' }));

      expect(storageService.getDraftSavedAt()).toBeNull();
    });

    it('returns null when the stored draft is not an object', () => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(['invalid']));

      expect(storageService.getDraft()).toBeNull();
    });

    it('returns fallback values when stored JSON is malformed', () => {
      localStorage.setItem(DRAFT_KEY, '{invalid-json');
      localStorage.setItem(REQUESTS_KEY, '{invalid-json');

      expect(storageService.getDraft()).toBeNull();
      expect(storageService.getRequests()).toEqual([]);
    });

    it('clears the saved draft', () => {
      storageService.saveDraft({ name: 'Test' });

      storageService.clearDraft();

      expect(storageService.getDraft()).toBeNull();
    });
  });

  describe('requests', () => {
    it('returns an empty array when there are no requests', () => {
      expect(storageService.getRequests()).toEqual([]);
    });

    it('rejects non-array request storage', () => {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify({ id: 'invalid' }));

      expect(storageService.getRequests()).toEqual([]);
    });

    it('adds a request to the beginning and replaces an existing id', () => {
      storageService.saveRequest({ id: 'FD-1', name: 'Old' });
      storageService.saveRequest({ id: 'FD-2', name: 'Second' });

      const requests = storageService.saveRequest({ id: 'FD-1', name: 'Updated' });

      expect(requests).toEqual([
        { id: 'FD-1', name: 'Updated' },
        { id: 'FD-2', name: 'Second' }
      ]);
    });

    it('keeps only the eight most recent requests', () => {
      for (let index = 1; index <= 10; index += 1) {
        storageService.saveRequest({ id: `FD-${index}` });
      }

      expect(storageService.getRequests()).toHaveLength(8);
      expect(storageService.getRequests()[0].id).toBe('FD-10');
      expect(storageService.getRequests()[7].id).toBe('FD-3');
    });
  });
});

describe('sendToN8n', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('throws a clear error when the webhook URL is missing', async () => {
    await expect(sendToN8n({ id: 'FD-1' })).rejects.toThrow('Falta VITE_N8N_WEBHOOK_URL');
  });

  it('sends a POST request and parses a JSON response', async () => {
    process.env.VITE_N8N_WEBHOOK_URL = 'https://example.test/webhook';
    const response = { ok: true, id: 'FD-1' };
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(response)
    });

    await expect(sendToN8n({ id: 'FD-1' })).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'FD-1' })
      })
    );
  });

  it('returns raw text when n8n does not return JSON', async () => {
    process.env.VITE_N8N_WEBHOOK_URL = 'https://example.test/webhook';
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => 'accepted'
    });

    await expect(sendToN8n({ id: 'FD-1' })).resolves.toEqual({ raw: 'accepted' });
  });

  it('throws the n8n message for an HTTP error', async () => {
    process.env.VITE_N8N_WEBHOOK_URL = 'https://example.test/webhook';
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: 'Payload inválido' })
    });

    await expect(sendToN8n({ id: 'FD-1' })).rejects.toThrow('Payload inválido');
  });

  it('maps network errors to a user-friendly message', async () => {
    process.env.VITE_N8N_WEBHOOK_URL = 'https://example.test/webhook';
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'));

    await expect(sendToN8n({ id: 'FD-1' })).rejects.toThrow('No se pudo conectar con el webhook de n8n.');
  });

  it('maps aborted requests to a timeout message', async () => {
    process.env.VITE_N8N_WEBHOOK_URL = 'https://example.test/webhook';
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(Object.assign(new Error('Aborted'), { name: 'AbortError' }));

    await expect(sendToN8n({ id: 'FD-1' })).rejects.toThrow('n8n tardó demasiado en responder.');
  });
});
