import { CustomerRelation } from '@data-contracts/customer/data-contracts';
import { useApi } from '@services/api-service';
import Image from 'next/image';
import React, { useMemo } from 'react';

interface LogotypeProps {
  width?: number;
  height?: number;
}

export const Logotypes = (props: LogotypeProps) => {
  const { width, height } = props;

  const { data: relations } = useApi<CustomerRelation[]>({ url: '/myrelations', method: 'get' });
  const customerEngagements = useMemo(() => relations?.map((r) => r.organizationNumber || '') || [], [relations]);

  return (
    <div className="flex gap-24">
      {customerEngagements.includes('5564786647') && (
        <Image src="/sundsvall-energi.png" alt={'Sundsvall energis logotyp'} width={width} height={height} />
      )}
      {customerEngagements.includes('5565027223') && (
        <Image src="/sundsvall-elnat.webp" alt={'Sundsvall elnäts logotyp'} width={width} height={height} />
      )}
    </div>
  );
};
