import type { ReactNode } from 'react';
import { Center, SegmentedControl, useMantineColorScheme } from '@mantine/core';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';

const ICON_PROPS = { size: 16, stroke: 1.75 };

const iconLabel = (icon: ReactNode) => (
  <Center w={16} h={16}>
    {icon}
  </Center>
);

export const ThemeToggle = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      value={colorScheme}
      onChange={(value) => setColorScheme(value as 'light' | 'dark' | 'auto')}
      data={[
        { value: 'light', label: iconLabel(<IconSun {...ICON_PROPS} />) },
        { value: 'dark', label: iconLabel(<IconMoon {...ICON_PROPS} />) },
        { value: 'auto', label: iconLabel(<IconDeviceDesktop {...ICON_PROPS} />) },
      ]}
    />
  );
};
