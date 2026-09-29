import type { ReactNode } from 'react';
import { Center, Image, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconDeviceDesktop } from '@tabler/icons-react';
import companyLogo from '../../assets/company-logo.png';

// Covers phones and tablets (portrait and landscape) — this admin portal's
// data tables/forms aren't designed for small-screen use.
const MOBILE_MAX_WIDTH = '(max-width: 1024px)';

type Props = {
  children: ReactNode;
};

export const DesktopOnlyGate = ({ children }: Props) => {
  const isSmallScreen = useMediaQuery(MOBILE_MAX_WIDTH);

  if (isSmallScreen) {
    return (
      <Center h="100vh" p="md">
        <Stack align="center" gap="md" maw={360}>
          <Image src={companyLogo} h={48} w={48} fit="contain" />
          <IconDeviceDesktop size={40} stroke={1.5} />
          <Title order={3} ta="center">
            Desktop required
          </Title>
          <Text c="dimmed" ta="center">
            Wijekoon Enterprises admin portal is designed for desktop use. Please switch to a
            desktop or laptop browser to continue.
          </Text>
        </Stack>
      </Center>
    );
  }

  return children;
};
