import { SegmentedControl, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconDeviceDesktop, IconMoonStars, IconSun } from '@tabler/icons-react';

export const ThemeToggle = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      size="xs"
      value={colorScheme}
      onChange={(value) => setColorScheme(value as 'light' | 'dark' | 'auto')}
      data={[
        {
          value: 'light',
          label: (
            <Tooltip label="Light">
              <IconSun size={16} style={{ display: 'block' }} />
            </Tooltip>
          ),
        },
        {
          value: 'dark',
          label: (
            <Tooltip label="Dark">
              <IconMoonStars size={16} style={{ display: 'block' }} />
            </Tooltip>
          ),
        },
        {
          value: 'auto',
          label: (
            <Tooltip label="System">
              <IconDeviceDesktop size={16} style={{ display: 'block' }} />
            </Tooltip>
          ),
        },
      ]}
    />
  );
};
