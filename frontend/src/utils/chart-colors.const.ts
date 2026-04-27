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
      fill: '#600724',
      stroke: '#600724',
    },
    dark: {
      fill: '#FAE9E7',
      stroke: '#FAE9E7',
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
  previousValue: {
    light: {
      fill: '#DFCDD3',
      stroke: '#FAE9E7',
    },
    dark: {
      fill: '#2F2E2E',
      stroke: '#FAE9E7',
    },
  },
} as const;
