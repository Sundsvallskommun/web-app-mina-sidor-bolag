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
      fill: '#DFCDD3',
      stroke: '#704251',
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
    light: '#DB6900',
    dark: '#FFD3A8',
  },
  previousValue: {
    light: {
      fill: '#704251',
      stroke: '#704251',
    },
    dark: {
      fill: '#2F2E2E',
      stroke: '#FAE9E7',
    },
  },
} as const;
