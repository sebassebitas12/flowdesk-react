import { useEffect, useRef, useState } from 'react';
import { storageService } from '../services/storageService';

export function useAutoSave(value, enabled = true) {
  const [saveState, setSaveState] = useState('idle');
  const [lastSaved, setLastSaved] = useState(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (!enabled) return undefined;
    if (firstRender.current) {
      firstRender.current = false;
      const savedAt = storageService.getDraftSavedAt();
      if (savedAt) setLastSaved(savedAt);
      return undefined;
    }
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      try { storageService.saveDraft(value); setLastSaved(new Date()); setSaveState('saved'); }
      catch { setSaveState('error'); }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [value, enabled]);

  return { saveState, lastSaved };
}
