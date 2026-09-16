import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { storageService } from '../services/storageService';
import { useAutoSave } from './useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts idle and restores the last saved date on first render', () => {
    const savedAt = new Date('2026-09-16T10:00:00.000Z');
    jest.spyOn(storageService, 'getDraftSavedAt').mockReturnValue(savedAt);

    const { result } = renderHook(() => useAutoSave({ name: 'Test' }));

    expect(result.current.saveState).toBe('idle');
    expect(result.current.lastSaved).toBe(savedAt);
  });

  it('does not save when disabled', () => {
    const saveDraft = jest.spyOn(storageService, 'saveDraft');
    const { rerender } = renderHook(({ value }) => useAutoSave(value, false), {
      initialProps: { value: { name: 'Initial' } }
    });

    rerender({ value: { name: 'Changed' } });
    act(() => jest.advanceTimersByTime(1000));

    expect(saveDraft).not.toHaveBeenCalled();
  });

  it('debounces changes and saves after 650ms', () => {
    const saveDraft = jest.spyOn(storageService, 'saveDraft');
    const { result, rerender } = renderHook(({ value }) => useAutoSave(value), {
      initialProps: { value: { name: 'Initial' } }
    });

    rerender({ value: { name: 'Changed' } });
    expect(result.current.saveState).toBe('saving');
    expect(saveDraft).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(649));
    expect(saveDraft).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));
    expect(saveDraft).toHaveBeenCalledWith({ name: 'Changed' });
    expect(result.current.saveState).toBe('saved');
    expect(result.current.lastSaved).toEqual(expect.any(Date));
  });

  it('cancels a pending save when the value changes before the delay', () => {
    const saveDraft = jest.spyOn(storageService, 'saveDraft');
    const { rerender } = renderHook(({ value }) => useAutoSave(value), {
      initialProps: { value: { name: 'Initial' } }
    });

    rerender({ value: { name: 'First change' } });
    act(() => jest.advanceTimersByTime(300));
    rerender({ value: { name: 'Final change' } });
    act(() => jest.advanceTimersByTime(650));

    expect(saveDraft).toHaveBeenCalledTimes(1);
    expect(saveDraft).toHaveBeenCalledWith({ name: 'Final change' });
  });

  it('reports an error when saving throws', () => {
    jest.spyOn(storageService, 'saveDraft').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    const { result, rerender } = renderHook(({ value }) => useAutoSave(value), {
      initialProps: { value: { name: 'Initial' } }
    });

    rerender({ value: { name: 'Changed' } });
    act(() => jest.advanceTimersByTime(650));

    expect(result.current.saveState).toBe('error');
    expect(result.current.lastSaved).toBeNull();
  });
});
