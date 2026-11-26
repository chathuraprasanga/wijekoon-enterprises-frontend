import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Group,
  List,
  PasswordInput,
  PinInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { InlineAlert } from '@/components/InlineAlert';
import { ResponsiveModal } from '@/components/ResponsiveModal';
import { toNotify } from '@/hooks/toNotify';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatCountdown } from '@/utils/format';

export type ClearMode = 'keep_super_user' | 'everything';

const COPY: Record<
  ClearMode,
  { title: string; button: string; deletes: string[]; keeps: string[] }
> = {
  keep_super_user: {
    title: 'Clear all data',
    button: 'Clear all data',
    deletes: [
      'Customers, suppliers and products',
      'Sales, orders, payments and cheques',
      'Notifications and audit logs',
      'Every user except the super user',
    ],
    keeps: ['The super user account', 'Roles and permissions', 'Business rules', 'The bank list'],
  },
  everything: {
    title: 'Clear everything, including the super user',
    button: 'Clear everything',
    deletes: [
      'All business data, users, roles, banks and settings',
      'The super user account (you will be signed out)',
    ],
    keeps: ['Nothing. The system returns to first-time setup, where a new super user is created.'],
  },
};

const CONFIRM_WORD = 'CLEAR';
const RESEND_SECONDS = 60;

type Props = {
  mode: ClearMode;
  email: string;
  onClose: () => void;
  onDone: (mode: ClearMode) => void;
};

/** Step 1: read what goes, type CLEAR, enter the super user's password. Step 2: the emailed code. */
export const DataClearModal = ({ mode, email, onClose, onDone }: Props) => {
  const copy = COPY[mode];
  const [step, setStep] = useState<'confirm' | 'code'>('confirm');
  const [word, setWord] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = async () => {
    setBusy(true);
    setError('');
    try {
      await axiosInstance.post('/system/clear/request', { mode, password });
      setStep('code');
      setCode('');
      setWait(RESEND_SECONDS);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    setBusy(true);
    setError('');
    try {
      await axiosInstance.post('/system/clear/confirm', { mode, otp: code });
      toNotify(
        'Data cleared',
        mode === 'everything' ? 'Setting the system up again.' : 'The data is gone.',
        'SUCCESS',
      );
      onDone(mode);
    } catch (e) {
      setError(getErrorMessage(e));
      setBusy(false);
    }
  };

  return (
    <ResponsiveModal
      opened
      onClose={onClose}
      title={copy.title}
      subtitle={step === 'confirm' ? 'This cannot be undone' : 'Step 2 of 2'}
      width={520}
      closeOnClickOutside={!busy}
    >
      <Box px={20} py={16}>
        <Stack gap="md">
          {error && (
            <InlineAlert
              tone="danger"
              title={step === 'confirm' ? "Couldn't send the code" : "Couldn't clear the data"}
            >
              {error}
            </InlineAlert>
          )}
          {step === 'confirm' ? (
            <>
              <Box>
                <Text size="sm" fw={600} c="var(--ldg-danger-text)" mb={4}>
                  Deleted
                </Text>
                <List size="sm" spacing={2}>
                  {copy.deletes.map((d) => (
                    <List.Item key={d}>{d}</List.Item>
                  ))}
                </List>
              </Box>
              <Box>
                <Text size="sm" fw={600} mb={4}>
                  Kept
                </Text>
                <List size="sm" spacing={2}>
                  {copy.keeps.map((d) => (
                    <List.Item key={d}>{d}</List.Item>
                  ))}
                </List>
              </Box>
              <PasswordInput
                label="Super user password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                description={`A code will be emailed to ${email}.`}
              />
              <TextInput
                label={`Type ${CONFIRM_WORD} to confirm`}
                value={word}
                onChange={(e) => setWord(e.currentTarget.value)}
                autoComplete="off"
              />
            </>
          ) : (
            <Stack gap="xs">
              <Text size="sm">
                Enter the 6-digit code we emailed to <strong>{email}</strong>. It expires in 10
                minutes.
              </Text>
              <PinInput
                autoFocus
                oneTimeCode
                size="lg"
                gap="xs"
                length={6}
                type="number"
                inputMode="numeric"
                disabled={busy}
                aria-label="6-digit confirmation code"
                value={code}
                onChange={setCode}
              />
              <Group gap="xs">
                <Button
                  variant="subtle"
                  size="compact-sm"
                  disabled={wait > 0 || busy}
                  onClick={sendCode}
                >
                  {wait > 0 ? `Resend code in ${formatCountdown(wait)}` : 'Resend code'}
                </Button>
              </Group>
            </Stack>
          )}
        </Stack>
      </Box>
      <Group className="sheet-footer" justify="flex-end" px={20} py={12} gap="xs">
        <Button variant="default" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        {step === 'confirm' ? (
          <Button
            color="red"
            loading={busy}
            disabled={word.trim() !== CONFIRM_WORD || !password}
            onClick={sendCode}
          >
            Send code
          </Button>
        ) : (
          <Button color="red" loading={busy} disabled={code.length !== 6} onClick={clear}>
            {copy.button}
          </Button>
        )}
      </Group>
    </ResponsiveModal>
  );
};
