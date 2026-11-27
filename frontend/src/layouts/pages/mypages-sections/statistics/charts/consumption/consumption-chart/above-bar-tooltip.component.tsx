'use client';

import { usePlotArea } from 'recharts';
import { useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import CustomTooltip from '@layouts/pages/mypages-sections/statistics/charts/custom-tooltip.component';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

type AboveBarTooltipProps = ComponentProps<typeof CustomTooltip> & {
  coordinate?: { x: number; y: number };
};

export const AboveBarTooltip = ({ coordinate, ...props }: AboveBarTooltipProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const plotArea = usePlotArea();

  useLayoutEffect(() => {
    setWidth(boxRef.current?.offsetWidth ?? 0);
  }, [props.label, props.payload]);

  if (!props.active || !props.payload?.length || !coordinate || !plotArea) {
    return null;
  }

  const left = clamp(coordinate.x - width / 2, plotArea.x, plotArea.x + plotArea.width - width);

  return (
    <div
      ref={boxRef}
      className="absolute w-max -translate-y-full"
      style={{
        left,
        top: -4,
        visibility: width ? 'visible' : 'hidden',
      }}
    >
      <CustomTooltip {...props} />
    </div>
  );
};
