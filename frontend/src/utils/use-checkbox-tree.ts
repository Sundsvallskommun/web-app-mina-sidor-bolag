'use client';

import { useMemo, useState } from 'react';

export interface CheckboxTreeGroup {
  key: string;
  items: string[];
}

const toKey = (groupKey: string, item: string) => `${groupKey}::${item}`;

export const useCheckboxTree = (groups: CheckboxTreeGroup[], initialCheckedKeys?: string[]) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => new Set(initialCheckedKeys ?? []));

  const allKeys = useMemo(() => groups.flatMap((group) => group.items.map((item) => toKey(group.key, item))), [groups]);

  const totalCount = allKeys.length;
  const checkedCount = checkedItems.size;
  const allChecked = totalCount > 0 && checkedCount === totalCount;
  const noneChecked = checkedCount === 0;

  const toggleItem = (groupKey: string, item: string) => {
    setCheckedItems((prev) => {
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
    setCheckedItems((prev) => {
      const next = new Set(prev);
      const keys = items.map((item) => toKey(groupKey, item));
      const allSelected = keys.every((key) => next.has(key));
      keys.forEach((key) => (allSelected ? next.delete(key) : next.add(key)));
      return next;
    });
  };

  const toggleAll = () => {
    setCheckedItems(allChecked ? new Set() : new Set(allKeys));
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
    setCheckedItems(new Set(keys ?? []));
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
