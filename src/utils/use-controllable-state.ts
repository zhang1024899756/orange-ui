'use client';

import { useCallback, useState } from 'react';

interface Options<T> {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}

/**
 * 受控 / 非受控统一处理。
 * 受控模式下只回调、绝不改内部状态（否则就是双源状态）。
 */
export function useControllableState<T>({ value, defaultValue, onChange }: Options<T>) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState<T>(defaultValue);
  const current = controlled ? (value as T) : inner;

  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  return [current, setValue] as const;
}
