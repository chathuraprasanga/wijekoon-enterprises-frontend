import { useComputedColorScheme } from '@mantine/core';
import logoDark from '@/assets/brand/logo-dark.svg';
import logoLight from '@/assets/brand/logo-light.svg';
import logoWhite from '@/assets/brand/logo-white.svg';

const LOGO_ASPECT = 5127 / 998; // viewBox of the horizontal logo SVGs

type Props = { inverse?: boolean; height?: number };

// inverse = on the dark-green brand panel (always white); otherwise follows light/dark mode.
export const Wordmark = ({ inverse, height = 24 }: Props) => {
  const scheme = useComputedColorScheme('light');
  const src = inverse ? logoWhite : scheme === 'dark' ? logoDark : logoLight;
  return (
    <img
      src={src}
      alt="Wijekoon Enterprises"
      style={{ display: 'block', height, width: height * LOGO_ASPECT, flexShrink: 0 }}
    />
  );
};
