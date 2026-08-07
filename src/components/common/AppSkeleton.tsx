import { Skeleton } from '@mantine/core';

export const AppSkeleton = () => {
  return (
    <div className="flex h-screen w-full bg-[var(--mantine-color-body)]">
      <div className="hidden w-[260px] flex-col gap-2 border-r border-[var(--mantine-color-default-border)] p-4 sm:flex">
        <Skeleton height={28} width={28} radius="md" />
        <div className="mt-6 flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={38} radius="md" />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-end gap-3 border-b border-[var(--mantine-color-default-border)] px-6">
          <Skeleton height={30} width={96} radius="md" />
          <Skeleton height={36} width={36} radius="xl" />
        </div>

        <div className="flex flex-col gap-4 p-6">
          <Skeleton height={140} radius="lg" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton height={92} radius="lg" />
            <Skeleton height={92} radius="lg" />
            <Skeleton height={92} radius="lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
