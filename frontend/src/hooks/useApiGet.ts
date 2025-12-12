import { useEffect, useState, type DependencyList } from 'react';
import { useSnackbar } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

export function useApiGet<T>(fetcher: () => Promise<T>, deps: DependencyList, errorKey: string) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const message = useSnackbar();
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    setLoaded(false);
    setData(null);

    fetcher()
      .then((res) => {
        setData(res);
        setLoaded(true);
      })
      .catch(() => {
        message({ message: t(errorKey), status: 'warning' });
      })
      .finally(() => setLoading(false));
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { loading, loaded, data };
}
