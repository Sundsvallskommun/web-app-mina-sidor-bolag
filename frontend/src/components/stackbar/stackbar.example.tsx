import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { StackBar, BarShapeHashed } from '@components/stackbar';

const data = [
  { name: 'Jan', value1: 400, value2: 240, value3: 100 },
  { name: 'Feb', value1: 300, value2: 221, value3: 120 },
  { name: 'Mar', value1: 200, value2: 229, value3: 150 },
];

/**
 * Basic example of the StackBar component with default radius
 *
 * The StackBar component automatically applies the appropriate shape to each bar:
 * - Single bar: BarShapeSingle (rounded corners on both top and bottom)
 * - First bar (in multi-bar stack): BarShapeBottomRounded (rounded bottom corners)
 * - Last bar (in multi-bar stack): BarShapeTopRounded (rounded top corners)
 * - Middle bars: BarShapeMiddle (no rounded corners)
 * - Gap between bars: 3px (default)
 *
 * @param radius - Corner radius in pixels. Can be a number or [topRadius, bottomRadius]. Defaults to 8.
 */
const StackBarBasicExample = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <StackBar radius={8}>
          <Bar dataKey="value1" fill="#8884d8" />
          <Bar dataKey="value2" fill="#82ca9d" />
          <Bar dataKey="value3" fill="#ffc658" />
        </StackBar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Example with custom gap between bars
 *
 * @param gap - Space between stacked bars in pixels. Defaults to 3.
 * The gap is applied equally at the bottom of each bar except the last one.
 */
const StackBarWithCustomGapExample = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <StackBar radius={8} gap={5}>
          <Bar dataKey="value1" fill="#8884d8" />
          <Bar dataKey="value2" fill="#82ca9d" />
          <Bar dataKey="value3" fill="#ffc658" />
        </StackBar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Example with custom className applied to all bars
 *
 * @param className - CSS class to apply to all Bar components.
 * Individual Bar components can override this with their own className prop.
 */
const StackBarWithClassNameExample = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <StackBar radius={8} className="dark:bg-background-content">
          <Bar dataKey="value1" fill="#8884d8" />
          <Bar dataKey="value2" fill="#82ca9d" />
          <Bar dataKey="value3" fill="#ffc658" />
        </StackBar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Example with className override on individual bar
 *
 * Individual Bar components can override the StackBar's className.
 * The Bar's className takes precedence over the StackBar's className.
 */
const StackBarWithClassNameOverrideExample = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <StackBar radius={8} className="dark:bg-background-content">
          <Bar dataKey="value1" fill="#8884d8" />
          <Bar dataKey="value2" fill="#82ca9d" className="custom-bar-class" />
          <Bar dataKey="value3" fill="#ffc658" />
        </StackBar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Example with custom barSize
 *
 * @param barSize - Width of bars as percentage or pixel value. Defaults to '100%'.
 * Can be a number (pixels) or string (e.g., '80%', '100px').
 */
const StackBarWithCustomBarSizeExample = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <StackBar radius={8} barSize="80%">
          <Bar dataKey="value1" fill="#8884d8" />
          <Bar dataKey="value2" fill="#82ca9d" />
          <Bar dataKey="value3" fill="#ffc658" />
        </StackBar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Example with custom BarShapeHashed on individual bar
 *
 * You can override the automatic shape by providing a custom shape prop on a Bar.
 * StackBar will not override bars that already have a custom shape.
 */
const StackBarWithHashedBarExample = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <StackBar radius={8}>
          <Bar dataKey="value1" fill="#8884d8" />
          <Bar dataKey="value2" fill="#82ca9d" shape={<BarShapeHashed />} />
          <Bar dataKey="value3" fill="#ffc658" />
        </StackBar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Example with single bar
 *
 * When StackBar contains only one bar, it automatically applies BarShapeSingle,
 * which creates rounded corners on both top and bottom using the provided radius value.
 * This ensures a complete rounded appearance for singular bars.
 */
const StackBarSingleBarExample = () => {
  const singleBarData = [
    { name: 'Q1', value: 400 },
    { name: 'Q2', value: 300 },
    { name: 'Q3', value: 200 },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={singleBarData}>
        <XAxis dataKey="name" />
        <YAxis />
        <StackBar radius={8}>
          <Bar dataKey="value" fill="#8884d8" />
        </StackBar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Example with single bar and flexible radius formats
 *
 * Demonstrates the flexible radius handling for single bars. All these formats work identically:
 * - radius={5} - single number, applied to both top and bottom
 * - radius={[5]} - single element array, applied to both top and bottom
 * - radius={[5, 2]} - two element array, first for top, second for bottom
 * - radius={[5, 3, 6]} - ignores extra elements, uses first two
 * - radius={[7, 1, 4, 3]} - ignores extra elements, uses first two
 */
const StackBarSingleBarWithArrayRadiusExample = () => {
  const singleBarData = [
    { name: 'Q1', value: 400 },
    { name: 'Q2', value: 300 },
    { name: 'Q3', value: 200 },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={singleBarData}>
        <XAxis dataKey="name" />
        <YAxis />
        <StackBar radius={[10, 5]}>
          <Bar dataKey="value" fill="#8884d8" />
        </StackBar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Example with array radius for flexible corner control
 *
 * The radius prop supports flexible formats:
 * - radius={5} - single number, applied uniformly to both top and bottom
 * - radius={[5]} - single element array, same as {5}
 * - radius={[5, 2]} - two element array, first for top corners, second for bottom corners
 * - radius={[5, 3, 6]} - extra elements are ignored, only first two are used
 *
 * For multi-bar stacks: topRadius applies to the last bar's top corners,
 * bottomRadius applies to the first bar's bottom corners.
 */
const StackBarWithArrayRadiusExample = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <StackBar radius={[10, 5]}>
          <Bar dataKey="value1" fill="#8884d8" />
          <Bar dataKey="value2" fill="#82ca9d" />
          <Bar dataKey="value3" fill="#ffc658" />
        </StackBar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export {
  StackBarBasicExample,
  StackBarWithCustomGapExample,
  StackBarWithClassNameExample,
  StackBarWithClassNameOverrideExample,
  StackBarWithCustomBarSizeExample,
  StackBarWithHashedBarExample,
  StackBarSingleBarExample,
  StackBarSingleBarWithArrayRadiusExample,
  StackBarWithArrayRadiusExample,
};
export default StackBarBasicExample;
