'use client';

import { cx } from '@sk-web-gui/react';
import { appName } from '@utils/app-name';
import Image from 'next/image';
import React from 'react';
import EmptyLayout from './empty-layout.component';

export const EntryLayout: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  logoClasses?: string;
}> = ({ title, children, className, logoClasses }) => {
  return (
    <EmptyLayout title={`${appName()} - ${title}`}>
      <div className="relative">
        <div className="absolute w-full bg-brand-primary">
          <div className="h-[26.4rem] max-w-[80rem] mx-auto relative overflow-hidden">
            <div className="hidden lg:block -mt-[4rem] -ml-34 absolute w-[36rem]"></div>
          </div>
        </div>
        <div className={cx('relative items-center justify-center px-20 py-40 lg:py-80 lg:px-40', className)}>
          <div className="flex justify-self-center gap-24">
            <Image
              className={cx(`text-black w-[7.7rem] h-[3.6rem] lg:h-[5rem] lg:w-[10rem] mb-32 lg:mb-48`, logoClasses)}
              src="/sundsvall-elnat.webp"
              alt={'Sundsvall elnäts logotyp'}
              width={100}
              height={50}
            />
            <Image
              className={cx(`text-black w-[7.7rem] h-[3.6rem] lg:h-[5rem] lg:w-[10rem] mb-32 lg:mb-48`, logoClasses)}
              src="/sundsvall-energi.png"
              alt={'Sundsvall energis logotyp'}
              width={100}
              height={50}
            />
          </div>
          <div className="justify-self-center">{children}</div>
        </div>
      </div>
    </EmptyLayout>
  );
};
