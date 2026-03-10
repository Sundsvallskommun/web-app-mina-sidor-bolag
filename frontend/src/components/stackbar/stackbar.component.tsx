import React from 'react';

const defaultGap = 3;

/**
 * Normalizes radius values to [topRadius, bottomRadius] tuple
 * Handles all cases:
 * - 5 -> [5, 5]
 * - [5] -> [5, 5]
 * - [5, 2] -> [5, 2]
 * - [5, 3, 6] -> [5, 3] (ignores extras)
 * - undefined -> [0, 0]
 */
const normalizeRadius = (radius?: number | number[]): [number, number] => {
  if (radius === undefined) return [0, 0];
  if (typeof radius === 'number') return [radius, radius];
  if (!Array.isArray(radius)) return [0, 0];
  if (radius.length === 0) return [0, 0];
  if (radius.length === 1) return [radius[0] ?? 0, radius[0] ?? 0];
  return [radius[0] ?? 0, radius[1] ?? 0];
};

interface IBarWithGapProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
  radius?: number | number[];
  gap?: number;
}

/**
 * Creates a path for a rectangle with rounded top corners
 */
const createTopRoundedRectPath = (x: number, y: number, width: number, height: number, topRadius: number) => {
  const r = Math.min(topRadius, width / 2, height / 2);
  return `
    M ${x + r} ${y}
    L ${x + width - r} ${y}
    Q ${x + width} ${y} ${x + width} ${y + r}
    L ${x + width} ${y + height}
    L ${x} ${y + height}
    L ${x} ${y + r}
    Q ${x} ${y} ${x + r} ${y}
  `;
};

/**
 * Creates a path for a rectangle with rounded bottom corners
 */
const createBottomRoundedRectPath = (x: number, y: number, width: number, height: number, bottomRadius: number) => {
  const r = Math.min(bottomRadius, width / 2, height / 2);
  return `
    M ${x} ${y}
    L ${x + width} ${y}
    L ${x + width} ${y + height - r}
    Q ${x + width} ${y + height} ${x + width - r} ${y + height}
    L ${x + r} ${y + height}
    Q ${x} ${y + height} ${x} ${y + height - r}
    L ${x} ${y}
  `;
};

/**
 * Creates a path for a rectangle with rounded corners on both top and bottom
 */
const createSingleRoundedRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  topRadius: number,
  bottomRadius: number
) => {
  const tr = Math.min(topRadius, width / 2, height / 2);
  const br = Math.min(bottomRadius, width / 2, height / 2);
  return `
    M ${x + tr} ${y}
    L ${x + width - tr} ${y}
    Q ${x + width} ${y} ${x + width} ${y + tr}
    L ${x + width} ${y + height - br}
    Q ${x + width} ${y + height} ${x + width - br} ${y + height}
    L ${x + br} ${y + height}
    Q ${x} ${y + height} ${x} ${y + height - br}
    L ${x} ${y + tr}
    Q ${x} ${y} ${x + tr} ${y}
  `;
};

/**
 * Bar shape with rounded top corners and gap
 * Used for the last bar in a stacked layout
 */
const BarShapeTopRounded = (props: IBarWithGapProps) => {
  const { x, y, width, height, fill, radius, stroke, strokeWidth, gap } = props;
  const halfGap = (gap ?? defaultGap) / 2;

  if (height === undefined || height <= halfGap) return null;

  const [topRadius] = normalizeRadius(radius);
  const rectY = (y ?? 0) + halfGap;
  const rectHeight = height - halfGap;

  return (
    <path
      d={createTopRoundedRectPath(x ?? 0, rectY, width ?? 0, rectHeight, topRadius)}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

/**
 * Bar shape with rounded bottom corners and gap
 * Used for the first bar in a stacked layout or a single bar
 */
const BarShapeBottomRounded = (props: IBarWithGapProps) => {
  const { x, y, width, height, fill, radius, stroke, strokeWidth, gap } = props;
  const halfGap = (gap ?? defaultGap) / 2;

  if (height === undefined || height <= halfGap) return null;

  const [, bottomRadius] = normalizeRadius(radius);
  const rectY = (y ?? 0) + halfGap;
  const rectHeight = height - halfGap;

  return (
    <path
      d={createBottomRoundedRectPath(x ?? 0, rectY, width ?? 0, rectHeight, bottomRadius)}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

/**
 * Bar shape with rounded corners on both top and bottom
 * Used for single bars in StackBar to create a fully rounded appearance
 */
const BarShapeSingle = (props: IBarWithGapProps) => {
  const { x, y, width, height, fill, stroke, strokeWidth, radius, gap: propGap } = props;
  const gap = propGap ?? defaultGap;
  const halfGap = gap / 2;

  if (height === undefined || height <= halfGap) return null;

  const [topRadius, bottomRadius] = normalizeRadius(radius);
  const rectY = (y ?? 0) + halfGap;
  const rectHeight = height - halfGap;

  return (
    <path
      d={createSingleRoundedRectPath(x ?? 0, rectY, width ?? 0, rectHeight, topRadius, bottomRadius)}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

/**
 * Bar shape with no rounded corners and gap
 * Used for middle bars in stacked layouts
 */
const BarShapeMiddle = (props: IBarWithGapProps) => {
  const { x, y, width, height, fill, stroke, strokeWidth, gap } = props;
  const halfGap = (gap ?? defaultGap) / 2;

  if (height === undefined || height <= halfGap) return null;

  const cornerRadius = 0;

  return (
    <rect
      x={x}
      y={(y ?? 0) + halfGap}
      width={width}
      height={height - halfGap}
      fill={fill}
      rx={cornerRadius}
      ry={cornerRadius}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

/**
 * Bar shape with diagonal/hashed lines at 45 degrees
 */
export const BarShapeHashed = (props: IBarWithGapProps) => {
  const { x = 0, y = 0, width, height, fill, stroke, strokeWidth, gap } = props;
  const halfGap = (gap ?? defaultGap) / 2;
  const lineSpacing = 4;
  const lineColor = '#ffffff';

  if (height === undefined || height <= halfGap) return null;

  const rectY = y + halfGap;
  const rectHeight = height - halfGap;
  const rectX = x;
  const rectWidth = width || 0;

  // Generate diagonal lines at 45 degrees
  const lines = [];
  const startX = rectX - rectHeight;

  for (let i = startX; i < rectX + rectWidth + rectHeight; i += lineSpacing) {
    const x1 = i + rectHeight;
    const y1 = rectY;
    const x2 = i;
    const y2 = rectY + rectHeight;
    lines.push(<line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke || lineColor} strokeWidth="1" />);
  }

  const clipId = `hashed-clip-${crypto.randomUUID()}`;

  return (
    <g>
      <rect
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <g clipPath={`url(#${clipId})`}>{lines}</g>
      <defs>
        <clipPath id={clipId}>
          <rect x={rectX} y={rectY} width={rectWidth} height={rectHeight} />
        </clipPath>
      </defs>
    </g>
  );
};

interface StackBarProps {
  children: React.ReactNode;
  radius?: number | number[];
  barSize?: number | string;
  className?: string;
  gap?: number;
}

/**
 * StackBar Component
 *
 * A wrapper component for stacking multiple recharts Bar components.
 * Automatically applies appropriate bar shapes to create a cohesive stacked appearance:
 * - Single bar gets rounded corners on both top and bottom
 * - First bar (in multi-bar stack) gets rounded bottom corners
 * - Last bar (in multi-bar stack) gets rounded top corners
 * - Middle bars have no rounded corners
 * - All bars have automatic gaps between them
 *
 * Note: If a Bar already has a custom `shape` prop, StackBar will not override it.
 * In this case, you're responsible for providing the appropriate shape (e.g., BarShapeHashed).
 *
 * @param children - React nodes representing recharts Bar components to stack.
 * @param radius - Optional corner radius (number) or [topRadius, bottomRadius] array. Defaults to 8.
 * @param barSize - Optional bar size (number or string). Defaults to '100%'.
 * @param className - Optional className to apply to all Bar children. Can be overridden by individual Bar components.
 *
 * @example
 * ```tsx
 * // Auto-apply rounded corners
 * <StackBar radius={8}>
 *   <Bar dataKey="data1" />
 *   <Bar dataKey="data2" />
 *   <Bar dataKey="data3" />
 * </StackBar>
 *
 * // Apply className to all bars
 * <StackBar radius={8} className="dark:bg-background-content">
 *   <Bar dataKey="data1" />
 *   <Bar dataKey="data2" />
 * </StackBar>
 *
 * // Override className for specific bar - individual Bar className takes precedence
 * <StackBar radius={8} className="dark:bg-background-content">
 *   <Bar dataKey="data1" />
 *   <Bar dataKey="data2" className="custom-class" />
 * </StackBar>
 *
 * // Use custom shape (won't be overridden by StackBar)
 * <StackBar radius={8}>
 *   <Bar dataKey="data1" shape={<BarShapeHashed />} />
 *   <Bar dataKey="data2" />
 * </StackBar>
 * ```
 */
export const StackBar: React.FC<StackBarProps> = ({ children, radius = 8, barSize, className, gap }) => {
  const childArray = React.Children.toArray(children);
  const barCount = childArray.length;

  const enhancedChildren = childArray.map((child, index) => {
    if (!React.isValidElement(child)) return child;

    let shapeComponent;

    if (barCount === 1) {
      // Single bar - use rounded corners on both sides
      shapeComponent = (props: IBarWithGapProps) => <BarShapeSingle {...props} gap={gap} />;
    } else if (index === 0) {
      // First bar - rounded bottom
      shapeComponent = (props: IBarWithGapProps) => <BarShapeBottomRounded {...props} gap={gap} />;
    } else if (index === barCount - 1) {
      // Last bar - rounded top
      shapeComponent = (props: IBarWithGapProps) => <BarShapeTopRounded {...props} gap={gap} />;
    } else {
      // Middle bars - no rounding
      shapeComponent = (props: IBarWithGapProps) => <BarShapeMiddle {...props} gap={gap} />;
    }

    if ((child.props as Record<string, unknown>).shape) {
      const originalShape = (child.props as Record<string, unknown>).shape;

      if (React.isValidElement(originalShape)) {
        // It's a JSX element, extract the component type
        const shapeType = (originalShape as React.ReactElement).type;
        shapeComponent = (props: IBarWithGapProps) =>
          React.createElement(shapeType as React.ComponentType<any>, { ...props, gap });
      } else {
        // It's already a component function
        shapeComponent = (props: IBarWithGapProps) =>
          React.createElement(originalShape as React.ComponentType<any>, { ...props, gap });
      }
    }
    return React.cloneElement(child, {
      ...(child.props as Record<string, unknown>),
      stackId: 'stack',
      shape: shapeComponent,
      radius: Array.isArray(radius) ? radius : [radius, radius],
      barSize: (child.props as Record<string, unknown>).barSize || barSize || '100%',
      className: (child.props as Record<string, unknown>).className || className,
    } as Record<string, unknown>);
  });

  return <>{enhancedChildren}</>;
};

export default StackBar;
