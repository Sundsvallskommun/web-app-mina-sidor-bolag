export const chartColors = {
  xAxis: {
    light: '#444450',
    dark: '#FFFFFF',
  },
  yAxis: {
    light: '#444450',
    dark: '#FFFFFF',
  },
  singleBar: {
    light: {
      fill: '#A06A7C',
      stroke: '#A06A7C',
    },
    dark: {
      fill: '#A06A7C',
      stroke: '#A06A7C',
    },
  },
  stackBar: {
    light: ['#600724', '#803950', '#A06A7C', '#DFCDD3'],
    dark: ['#DFCDD3', '#BF9CA7', '#A06A7C', '#803950'],
    borderLight: ['#600724', '#803950', '#A06A7C', '#803950'],
    borderDark: ['#DFCDD3', '#BF9CA7', '#A06A7C', '#BF9CA7'],
  },
  hashBar: {
    borderLight: '#FFFFFF',
    borderDark: '#1F1F25',
  },
  temperature: {
    light: '#242424',
    dark: '#FAFAFA',
  },
  previousValue: {
    light: {
      fill: '#B5C1E3',
      stroke: '#B5C1E3',
    },
    dark: {
      fill: '#FFD3A8',
      stroke: '#FFD3A8',
    },
  },
} as const;
