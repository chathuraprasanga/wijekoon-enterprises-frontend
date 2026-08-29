import { createTheme, Modal } from '@mantine/core';

const theme = createTheme({
  colors: {
    // Neutral gray sampled from the company logo (assets/company-logo.png,
    // dominant fill ≈ rgb(108,108,108)) — brand.5 matches it directly.
    brand: [
      '#f7f7f7', // brand.0
      '#ededed', // brand.1
      '#d9d9d9', // brand.2
      '#bdbdbd', // brand.3
      '#999999', // brand.4
      '#6c6c6c', // brand.5  ← logo's dominant gray
      '#5c5c5c', // brand.6
      '#4a4a4a', // brand.7
      '#383838', // brand.8
      '#242424', // brand.9
    ],
  },
  fontFamily: 'Ubuntu, sans-serif',
  primaryColor: 'brand',
  primaryShade: { light: 5, dark: 5 },
  defaultRadius: 'md',
  components: {
    Modal: Modal.extend({
      styles: {
        title: { fontSize: 'var(--mantine-font-size-xl)', fontWeight: 700 },
      },
    }),
  },
});

export default theme;
