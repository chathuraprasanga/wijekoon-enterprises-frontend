import type { ReactNode } from 'react';
import { Button, Loader } from '@mantine/core';

type Props = { loading?: boolean; disabled?: boolean; loadingLabel: string; children: ReactNode };

// Full-width 44px submit: shows a spinner and the "…ing" label while the request runs.
export const AuthSubmitButton = ({ loading, disabled, loadingLabel, children }: Props) => (
  <Button
    type="submit"
    size="md"
    h={44}
    fullWidth
    disabled={disabled}
    aria-busy={loading}
    leftSection={loading ? <Loader size={16} color="currentColor" /> : undefined}
    style={loading ? { opacity: 0.8, pointerEvents: 'none' } : undefined}
  >
    {loading ? loadingLabel : children}
  </Button>
);
