'use client';

import { Download } from 'lucide-react';
import { Button } from '@sk-web-gui/react';

export const ExportStatisticsButton = () => {
  return (
    <Button size="lg" variant="tertiary" leftIcon={<Download />}>
      Exportera statistik
    </Button>
  );
};
