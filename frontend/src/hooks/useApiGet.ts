import { useEffect, useState, type DependencyList } from 'react';
import { useSnackbar } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

export function useApiGet<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
  errorKey: string,
  enabled: boolean = true
) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const message = useSnackbar();
  const { t } = useTranslation();

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    setLoading(true);
    setLoaded(false);
    setData(null);

    fetcher()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        message({ message: t(errorKey), status: 'warning' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [...deps, enabled]);
  // eslint-disable-line react-hooks/exhaustive-deps

  return { loading, loaded, data };
}
