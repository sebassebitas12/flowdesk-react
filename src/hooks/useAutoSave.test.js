import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { storageService } from '../services/storageService';
import { useAutoSave } from './useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('starts idle and restores the last saved date on first render', () => {
    const savedAt = new Date('2026-09-16T10:00:00.000Z');
    jest.spyOn(storageService, 'getDraftSavedAt').mockReturnValue(savedAt);

    const { result } = renderHook(() => useAutoSave({ name: 'Test' }));

    expect(result.current.saveState).toBe('idle');
    expect(result.current.lastSaved).toBe(savedAt);
  });

  it('starts with no saved date when no draft exists', () => {
    jest.spyOn(storageService, 'getDraftSavedAt').mockReturnValue(null);
    const { result } = renderHook(() => useAutoSave({ name: 'Test' }));
    expect(result.current.saveState).toBe('idle');
    expect(result.current.lastSaved).toBeNull();
  });

  it('does not save when disabled', () => {
    const saveDraft = jest.spyOn(storageService, 'saveDraft');
    const { result, rerender } = renderHook(({ value }) => useAutoSave(value, false), {
      initialProps: { value: { name: 'Initial' } }
    });

    rerender({ value: { name: 'Changed' } });
    act(() => jest.advanceTimersByTime(1000));

    expect(saveDraft).not.toHaveBeenCalled();
    expect(result.current.saveState).toBe('idle');
  });

  it('debounces changes and saves after exactly 650ms', () => {
    const saveDraft = jest.spyOn(storageService, 'saveDraft');
    const { result, rerender } = renderHook(({ value }) => useAutoSave(value), {
      initialProps: { value: { name: 'Initial' } }
    });

    rerender({ value: { name: 'Changed' } });
    expect(result.current.saveState).toBe('saving');

    act(() => jest.advanceTimersByTime(649));
    expect(saveDraft).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));
    expect(saveDraft).toHaveBeenCalledTimes(1);
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

  it('cleans up a pending timer when the hook unmounts', () => {
    const saveDraft = jest.spyOn(storageService, 'saveDraft');
    const { rerender, unmount } = renderHook(({ value }) => useAutoSave(value), {
      initialProps: { value: { name: 'Initial' } }
    });

    rerender({ value: { name: 'Changed' } });
    unmount();
    act(() => jest.advanceTimersByTime(650));

    expect(saveDraft).not.toHaveBeenCalled();
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

  it('uses the latest value when several changes happen during the debounce window', () => {
    const saveDraft = jest.spyOn(storageService, 'saveDraft');
    const { rerender } = renderHook(({ value }) => useAutoSave(value), {
      initialProps: { value: { name: 'Initial' } }
    });

    rerender({ value: { name: 'A' } });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: { name: 'B' } });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: { name: 'C' } });
    act(() => jest.advanceTimersByTime(650));

    expect(saveDraft).toHaveBeenCalledTimes(1);
    expect(saveDraft).toHaveBeenCalledWith({ name: 'C' });
  });
});
