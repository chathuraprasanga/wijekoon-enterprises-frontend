import { Box, Group, Text, VisuallyHidden } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

const STEPS = ['Request code', 'Verify', 'New password'];

type Props = {
  /** 0-based index of the active step; 3 marks every step as done. */
  current: number;
};

// Three-step progress for the password-recovery flow (Request code, Verify, New password).
export const AuthSteps = ({ current }: Props) => (
  <Group
    gap="xs"
    wrap="nowrap"
    mb="lg"
    component="ol"
    m={0}
    p={0}
    style={{ listStyle: 'none' }}
    aria-label="Password recovery progress"
  >
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <Group
          key={label}
          component="li"
          gap={8}
          wrap="nowrap"
          style={{ flex: i < STEPS.length - 1 ? 1 : undefined }}
          aria-current={active ? 'step' : undefined}
        >
          <Box
            w={24}
            h={24}
            fz={12}
            fw={600}
            style={{
              display: 'grid',
              placeItems: 'center',
              flex: 'none',
              borderRadius: '50%',
              border: `1.5px solid ${done || active ? 'var(--ldg-accent)' : 'var(--ldg-border-input)'}`,
              background: done ? 'var(--ldg-accent)' : 'transparent',
              color: done
                ? 'var(--ldg-on-accent)'
                : active
                  ? 'var(--ldg-accent-text)'
                  : 'var(--ldg-text-muted)',
            }}
          >
            {done ? <IconCheck size={14} stroke={3} aria-hidden /> : i + 1}
          </Box>
          <Text
            size="sm"
            fw={active ? 600 : 400}
            c={active ? undefined : 'dimmed'}
            visibleFrom={active ? undefined : 'xs'}
            style={{ whiteSpace: 'nowrap' }}
          >
            {label}
            {done && <VisuallyHidden> (done)</VisuallyHidden>}
          </Text>
          {i < STEPS.length - 1 && (
            <Box
              aria-hidden
              style={{
                flex: 1,
                minWidth: 12,
                height: 1.5,
                background: done ? 'var(--ldg-accent)' : 'var(--ldg-border-strong)',
              }}
            />
          )}
        </Group>
      );
    })}
  </Group>
);
