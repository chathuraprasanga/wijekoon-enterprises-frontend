import { Image } from '@mantine/core';
import logoSrc from '../../../assets/dev-logo.png';

interface LogoProps {
  h?: number;
}

export const Logo = ({ h = 32 }: LogoProps) => {
  return <Image src={logoSrc} alt="Wijekoon Enterprises" h={h} w="auto" fit="contain" />;
};
