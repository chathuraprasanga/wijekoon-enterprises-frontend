import type { UseFormReturnType } from '@mantine/form';

// Labels of the fields that currently have errors, for the "Fix N fields" banner.
export const useErrorSummary = <T extends Record<string, unknown>>(
  form: UseFormReturnType<T>,
  labels: Partial<Record<keyof T & string, string>>,
) =>
  Object.keys(form.errors)
    .filter((k) => form.errors[k])
    .map((k) => labels[k as keyof T & string] ?? k);
