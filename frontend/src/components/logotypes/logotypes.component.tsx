import Image from 'next/image';
import React from 'react';

interface LogotypeProps {
  customerEngagements: string[];
  width?: number;
  height?: number;
}

export const Logotypes = (props: LogotypeProps) => {
  const { width, height } = props;

  return (
    <div className="flex gap-24">
      <Image src="/sundsvall-elnat.webp" alt={'Sundsvall elnäts logotyp'} width={width} height={height} />
      <Image src="/sundsvall-energi.png" alt={'Sundsvall energis logotyp'} width={width} height={height} />
    </div>
  );
};
