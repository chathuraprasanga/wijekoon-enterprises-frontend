import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export const ThemeToggle = () => {
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const next = scheme === 'dark' ? 'light' : 'dark';

  return (
    <Tooltip label={`Switch to ${next} mode`}>
      <ActionIcon
        variant="subtle"
        size={36}
        aria-label={`Switch to ${next} mode`}
        onClick={() => setColorScheme(next)}
      >
        {scheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
};
