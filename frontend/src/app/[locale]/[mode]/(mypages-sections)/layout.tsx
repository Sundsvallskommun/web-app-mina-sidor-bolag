'use client';

import { useEffect, useState } from 'react';
import FullscreenMainSpinner from '../../../../components/spinner/fullscreen-main-spinner.component';
import { useAppContext } from '../../../../contexts/app.context';
import { RepresentingMode } from '../../../../interfaces/app';
import { DefaultLayout } from '../../../../layouts/default-layout.component';
import { useApi } from '../../../../services/api-service';
import { toRepresentingLabel } from '@utils/to-representing-label';
import { useParams } from 'next/navigation';
import { RepresentingEntity } from '@data-contracts/backend/data-contracts';

interface DefaultLayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: Readonly<DefaultLayoutProps>) {
  const { representingMode, setRepresentingMode, setRepresentingName } = useAppContext();
  const { mode } = useParams();
  const {
    data: representingEntity,
    isLoading: representingIsLoading,
    isFetching: representingIsFetching,
  } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !representingIsLoading && !representingIsFetching) {
      if (
        mode === 'foretag' &&
        (representingEntity?.mode !== RepresentingMode.BUSINESS || representingMode !== RepresentingMode.BUSINESS)
      ) {
        setRepresentingMode(RepresentingMode.BUSINESS);
      } else if (
        mode === 'privat' &&
        (representingEntity?.mode !== RepresentingMode.PRIVATE || representingMode !== RepresentingMode.PRIVATE)
      ) {
        setRepresentingMode(RepresentingMode.PRIVATE);
      }
      setRepresentingName(toRepresentingLabel(representingEntity));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, representingIsLoading, representingIsFetching]);

  const hasRespresentingEntity = () => {
    switch (representingEntity?.mode) {
      case RepresentingMode.BUSINESS:
        return representingEntity.BUSINESS !== undefined;
      case RepresentingMode.PRIVATE:
        return representingEntity.PRIVATE !== undefined;
      default:
        return false;
    }
  };

  if (!mounted || representingEntity === undefined || !hasRespresentingEntity()) {
    return <FullscreenMainSpinner />;
  }

  return <DefaultLayout>{children}</DefaultLayout>;
}
