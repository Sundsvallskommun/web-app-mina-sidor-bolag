import { CustomerRelation } from '@data-contracts/customer/data-contracts';
import { useApi } from '@services/api-service';
import React, { useMemo } from 'react';
import { LogoGroup } from './logo-group.component';

interface LogotypeProps {
  width?: number;
  height?: number;
}

export const Logotypes = (props: LogotypeProps) => {
  const { width, height } = props;

  const { data: relations } = useApi<CustomerRelation[]>({ url: '/myrelations', method: 'get' });
  const customerEngagements = useMemo(() => relations?.map((r) => r.organizationNumber ?? '') ?? [], [relations]);

  return (
    <div className="flex gap-24">
      <LogoGroup height={height} width={width} organizations={customerEngagements} />
    </div>
  );
};
