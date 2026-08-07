import type { ReactNode } from 'react';
import { Group, Text } from '@mantine/core';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/common/ThemeToggle';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-[var(--mantine-color-body)]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#013037] to-[#025864] p-10 lg:flex lg:w-[55%]">
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute right-24 top-1/4 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -left-10 bottom-1/4 h-24 w-24 rounded-full bg-white/5" />

        <h2 className="relative z-10 max-w-sm text-3xl font-semibold leading-tight text-white">
          Empowering your business, all in one place.
        </h2>
      </div>

      <div className="flex w-full flex-col overflow-y-auto px-8 py-10 sm:px-16 lg:w-[45%]">
        <Group justify="flex-end">
          <ThemeToggle />
        </Group>

        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <Group justify="center" gap={6} mt="lg">
            <Logo h={18} />
            <Text size="xs" c="dimmed">
              Powered by Xcorpion
            </Text>
          </Group>
        </div>
      </div>
    </div>
  );
};
