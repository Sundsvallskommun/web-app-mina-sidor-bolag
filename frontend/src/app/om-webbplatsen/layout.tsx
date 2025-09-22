'use client';

import { useEffect, useState } from 'react';
import { DefaultLayout } from '../../layouts/default-layout.component';
import FullscreenMainSpinner from '../../components/spinner/fullscreen-main-spinner.component';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <FullscreenMainSpinner />;
  }

  return <DefaultLayout>{children}</DefaultLayout>;
}
