import type { ReactNode } from 'react';
import { Box, Group, Switch, Text } from '@mantine/core';

type Props = {
  /** Section label in capitals, e.g. STATUS, ACCOUNT. */
  label: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  extra?: ReactNode;
};

// Bordered switch card used in detail dialogs (Active customer, Active account, …).
export const StatusSection = ({
  label,
  title,
  description,
  checked,
  disabled,
  onChange,
  extra,
}: Props) => (
  <Box mt="lg">
    <Text className="eyebrow" mb={6}>
      {label}
    </Text>
    <Group
      justify="space-between"
      wrap="nowrap"
      gap="md"
      p="md"
      style={{ border: '1px solid var(--ldg-border)', borderRadius: 8 }}
    >
      <Box>
        <Text fw={500}>{title}</Text>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </Box>
      <Switch
        size="md"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={`${title}: ${checked ? 'on' : 'off'}`}
      />
    </Group>
    {extra}
  </Box>
);
