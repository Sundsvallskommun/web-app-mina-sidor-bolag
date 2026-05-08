'use client';

import { useMemo, useState } from 'react';

export interface CheckboxTreeGroup {
  key: string;
  items: string[];
}

export interface UseCheckboxTreeOptions {
  /** Uncontrolled: initial selected keys. Ignored in controlled mode. */
  initialCheckedKeys?: string[];
  /** Controlled: externally managed checked-set. Must be paired with `onChange`. */
  value?: Set<string>;
  /** Controlled: called whenever the selection changes. */
  onChange?: (next: Set<string>) => void;
}

const toKey = (groupKey: string, item: string) => `${groupKey}::${item}`;

export const useCheckboxTree = (groups: CheckboxTreeGroup[], options?: UseCheckboxTreeOptions) => {
  const isControlled = options?.value !== undefined;
  const [internalChecked, setInternalChecked] = useState<Set<string>>(
    () => new Set(options?.initialCheckedKeys ?? [])
  );

  const checkedItems = options?.value ?? internalChecked;

  const update = (compute: (prev: Set<string>) => Set<string>) => {
    if (isControlled) {
      options?.onChange?.(compute(checkedItems));
    } else {
      setInternalChecked(compute);
    }
  };

  const allKeys = useMemo(() => groups.flatMap((group) => group.items.map((item) => toKey(group.key, item))), [groups]);

  const totalCount = allKeys.length;
  const checkedCount = checkedItems.size;
  const allChecked = totalCount > 0 && checkedCount === totalCount;
  const noneChecked = checkedCount === 0;

  const toggleItem = (groupKey: string, item: string) => {
    update((prev) => {
      const next = new Set(prev);
      const key = toKey(groupKey, item);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleGroup = (groupKey: string, items: string[]) => {
    update((prev) => {
      const next = new Set(prev);
      const keys = items.map((item) => toKey(groupKey, item));
      const allSelected = keys.every((key) => next.has(key));
      keys.forEach((key) => (allSelected ? next.delete(key) : next.add(key)));
      return next;
    });
  };

  const toggleAll = () => {
    update(() => (allChecked ? new Set() : new Set(allKeys)));
  };

  const groupStates = useMemo(() => {
    const map = new Map<string, { checked: boolean; indeterminate: boolean }>();
    for (const group of groups) {
      const keys = group.items.map((item) => toKey(group.key, item));
      const selectedCount = keys.filter((key) => checkedItems.has(key)).length;
      map.set(group.key, {
        checked: selectedCount > 0,
        indeterminate: selectedCount > 0 && selectedCount < keys.length,
      });
    }
    return map;
  }, [checkedItems, groups]);

  const isItemChecked = (groupKey: string, item: string) => checkedItems.has(toKey(groupKey, item));

  const reset = (keys?: string[]) => {
    update(() => new Set(keys ?? []));
  };

  return {
    checkedItems,
    checkedCount,
    totalCount,
    allChecked,
    noneChecked,
    toggleItem,
    toggleGroup,
    toggleAll,
    groupStates,
    isItemChecked,
    reset,
  };
};
