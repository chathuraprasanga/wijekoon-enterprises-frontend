import { Box, Group, Text } from '@mantine/core';

type Props = { inverse?: boolean };

// Text wordmark; swap for the logo asset when one is supplied.
export const Wordmark = ({ inverse }: Props) => (
  <Group gap="sm" wrap="nowrap">
    <Box
      w={30}
      h={30}
      fw={600}
      fz={16}
      aria-hidden
      style={{
        display: 'grid',
        placeItems: 'center',
        borderRadius: 6,
        flexShrink: 0,
        background: inverse ? '#ffffff' : 'var(--ldg-accent)',
        color: inverse ? '#0f5c4f' : 'var(--ldg-on-accent)',
      }}
    >
      W
    </Box>
    <Box lh={1.2}>
      <Text fw={600} fz={13} lts="0.1em" c={inverse ? '#ffffff' : undefined}>
        WIJEKOON
      </Text>
      <Text fz={10} lts="0.2em" c={inverse ? 'rgba(255,255,255,0.72)' : 'dimmed'}>
        ENTERPRISES
      </Text>
    </Box>
  </Group>
);
