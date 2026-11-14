import type { FormEventHandler, ReactNode } from 'react';
import { Stack, Text, Title } from '@mantine/core';

type Props = {
  title: string;
  subtitle: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  /** Progress indicator shown above the heading (recovery flow). */
  steps?: ReactNode;
};

// Shared frame for the auth forms.
export const AuthFormShell = ({ title, subtitle, onSubmit, children, steps }: Props) => (
  <form onSubmit={onSubmit} noValidate>
    {steps}
    <Stack gap={4} mb="lg">
      <Title order={1}>{title}</Title>
      <Text size="sm" c="dimmed">
        {subtitle}
      </Text>
    </Stack>
    <Stack gap="md">{children}</Stack>
  </form>
);
