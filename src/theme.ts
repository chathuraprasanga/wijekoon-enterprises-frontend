import { createTheme } from '@mantine/core';

const theme = createTheme({
  colors: {
    // Cinema gold — IMDb-inspired primary accent
    cinema: [
      '#fff8e1', // cinema.0
      '#ffecb3', // cinema.1
      '#ffe082', // cinema.2
      '#ffd54f', // cinema.3
      '#ffca28', // cinema.4
      '#f5c518', // cinema.5  ← main accent
      '#e0a800', // cinema.6
      '#c79100', // cinema.7
      '#a67a00', // cinema.8
      '#7a5900', // cinema.9
    ],
  },
  fontFamily: 'Ubuntu, sans-serif',
  primaryColor: 'gray',
  primaryShade: { light: 5, dark: 5 },
  defaultRadius: 'md',
  components: {},
});

export default theme;
