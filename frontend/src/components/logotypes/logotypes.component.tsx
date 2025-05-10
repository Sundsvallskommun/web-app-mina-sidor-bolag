import Image from 'next/image';
import React from 'react';
import NextLink from 'next/link';

interface LogotypeProps {
  customerEngagements: string[];
  width?: number;
  height?: number;
}

export const Logotypes = (props: LogotypeProps) => {
  const { width, height } = props;

  return (
    <div className="flex gap-24">
      <NextLink href="https://sundsvallelnat.se/" target="_blank">
        <Image src="/sundsvall-elnat.webp" alt={'Sundsvall elnäts logotyp'} width={width} height={height} />
      </NextLink>

      <NextLink href="https://sundsvallenergi.se/" target="_blank">
        <Image src="/sundsvall-energi.png" alt={'Sundsvall energis logotyp'} width={width} height={height} />
      </NextLink>
    </div>
  );
};
