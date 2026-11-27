import { useEffect, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import {
  Checkbox,
  MultiSelect,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { FormModal } from '@/components/FormModal';
import { toNotify } from '@/hooks/toNotify';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

type Audience = 'all' | 'users' | 'roles';
type Option = { value: string; label: string };

const HINT: Record<Audience, string> = {
  all: 'Every active user will receive this, including you.',
  users: 'Only the people you pick will receive this.',
  roles: 'Everyone with one of the roles you pick will receive this.',
};

type Props = { onClose: () => void; onSent: () => void };

// Super admin: send an announcement to everyone, chosen people or chosen roles.
export const SendNotificationModal = ({ onClose, onSent }: Props) => {
  const narrow = useMediaQuery('(max-width: 480px)');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [users, setUsers] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [roleOptions, setRoleOptions] = useState<Option[]>([]);
  const [includeMe, setIncludeMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    // The lists already leave out the super admin and the system role.
    axiosInstance
      .get<{ data: { _id: string; firstName: string; lastName: string | null; email: string }[] }>(
        '/users/paged',
        { params: { limit: 100, status: 'active' } },
      )
      .then(({ data }) =>
        setUserOptions(
          data.data.map((u) => ({
            value: u._id,
            label: `${`${u.firstName} ${u.lastName ?? ''}`.trim()} · ${u.email}`,
          })),
        ),
      )
      .catch(() => undefined);
    axiosInstance
      .get<{ data: { _id: string; name: string }[] }>('/roles/paged', { params: { limit: 100 } })
      .then(({ data }) => setRoleOptions(data.data.map((r) => ({ value: r._id, label: r.name }))))
      .catch(() => undefined);
  }, []);

  const titleError = !title.trim()
    ? 'Enter a title'
    : title.length > 120
      ? 'At most 120 characters'
      : null;
  const messageError = !message.trim()
    ? 'Enter a message'
    : message.length > 2000
      ? 'At most 2000 characters'
      : null;
  const pickError =
    audience === 'users' && !users.length
      ? 'Pick at least one person'
      : audience === 'roles' && !roles.length
        ? 'Pick at least one role'
        : null;
  const show = (e: string | null) => (touched ? (e ?? undefined) : undefined);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (titleError || messageError || pickError) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.post<{ sent: number }>('/notifications/admin/send', {
        title: title.trim(),
        message: message.trim(),
        audience,
        ...(audience === 'users' && { users }),
        ...(audience === 'roles' && { roles }),
        ...(audience !== 'all' && includeMe && { includeMe: true }),
      });
      toNotify('Notification sent', `Sent to ${data.sent} user(s)`, 'SUCCESS');
      onSent();
      onClose();
    } catch (err) {
      toNotify("Couldn't send", getErrorMessage(err), 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      opened
      title="Send notification"
      submitLabel="Send"
      loading={loading}
      dirty={!!title || !!message}
      errorLabels={
        touched
          ? [titleError && 'Title', messageError && 'Message', pickError && 'Send to'].filter(
              (x): x is string => !!x,
            )
          : []
      }
      onSubmit={submit}
      onClose={onClose}
    >
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="Enter the title"
          withAsterisk
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          error={show(titleError)}
        />
        <Textarea
          label="Message"
          placeholder="Enter the message"
          withAsterisk
          autosize
          minRows={3}
          maxRows={8}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          error={show(messageError)}
        />
        <Stack gap={6}>
          <Text size="sm" fw={500}>
            Send to
          </Text>
          <SegmentedControl
            fullWidth
            size={narrow ? 'xs' : 'sm'}
            value={audience}
            onChange={(v) => setAudience(v as Audience)}
            data={[
              { value: 'all', label: 'All users' },
              { value: 'users', label: 'Specific users' },
              { value: 'roles', label: 'Specific roles' },
            ]}
          />
          <Text size="xs" c="dimmed">
            {HINT[audience]}
          </Text>
        </Stack>
        {audience === 'users' && (
          <MultiSelect
            label="Users"
            placeholder="Select users"
            data={userOptions}
            value={users}
            onChange={setUsers}
            searchable
            clearable
            nothingFoundMessage="No users"
            error={show(pickError)}
          />
        )}
        {audience === 'roles' && (
          <MultiSelect
            label="Roles"
            placeholder="Select roles"
            data={roleOptions}
            value={roles}
            onChange={setRoles}
            searchable
            clearable
            nothingFoundMessage="No roles"
            error={show(pickError)}
          />
        )}
        {audience !== 'all' && (
          <Checkbox
            label="Also send me a copy"
            checked={includeMe}
            onChange={(e) => setIncludeMe(e.currentTarget.checked)}
          />
        )}
      </Stack>
    </FormModal>
  );
};
