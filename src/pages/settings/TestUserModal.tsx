import { useState } from 'react';
import { SimpleGrid, Text, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { FormModal } from '@/components/FormModal';
import { useErrorSummary } from '@/hooks/useErrorSummary';
import { toNotify } from '@/hooks/toNotify';
import { useAppDispatch } from '@/store/hooks';
import { createTestUser } from '@/store/userSlice/userSlice';
import { dateTimeToIso } from '@/utils/format';
import { digitsOnly, email, phone, required } from '@/utils/validators';

const inDays = (n: number) => {
  const d = new Date(Date.now() + n * 86_400_000);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:00`;
};

type Props = { onClose: () => void; onSaved: () => void };

/** Super admin: a user with every business permission who works on a private copy of sample data. */
export const TestUserModal = ({ onClose, onSaved }: Props) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: { firstName: '', lastName: '', email: '', phone: '', expiresAt: inDays(7) },
    validate: {
      firstName: required('First name is required.'),
      phone,
      email,
      expiresAt: (v) =>
        v && new Date(v.replace(' ', 'T')) > new Date() ? null : 'Choose a time in the future',
    },
  });

  const submit = async (v: typeof form.values) => {
    setLoading(true);
    try {
      await dispatch(
        createTestUser({
          firstName: v.firstName.trim(),
          lastName: v.lastName.trim(),
          email: v.email.trim(),
          phone: digitsOnly(v.phone),
          expiresAt: dateTimeToIso(v.expiresAt),
        }),
      ).unwrap();
      toNotify('Test user added', 'Their login details have been emailed to them.', 'SUCCESS');
      onSaved();
      onClose();
    } catch (error) {
      toNotify("Couldn't add the test user", error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  const errorLabels = useErrorSummary(form, {
    firstName: 'First name',
    phone: 'Phone',
    email: 'Email',
    expiresAt: 'Expires',
  });

  return (
    <FormModal
      opened
      title="Add test user"
      subject="Works on sample data only"
      size="md"
      submitLabel="Create test user"
      loading={loading}
      dirty={form.isDirty()}
      errorLabels={errorLabels}
      onSubmit={form.onSubmit(submit)}
      onClose={onClose}
    >
      <Text size="sm" c="dimmed">
        They can do anything, on their own copy of sample data. Nothing they do touches real
        records, and the sample data resets when their time ends.
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput label="First name" required {...form.getInputProps('firstName')} />
        <TextInput label="Last name" {...form.getInputProps('lastName')} />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput
          label="Email"
          required
          leftSection={<IconMail size={16} aria-hidden />}
          {...form.getInputProps('email')}
        />
        <TextInput
          label="Phone"
          required
          leftSection={<IconPhone size={16} aria-hidden />}
          {...form.getInputProps('phone')}
        />
      </SimpleGrid>
      <DateTimePicker
        label="Test access ends"
        description="They are signed out then, and the sample data is reset."
        required
        minDate={new Date()}
        valueFormat="DD MMM YYYY, hh:mm A"
        {...form.getInputProps('expiresAt')}
      />
    </FormModal>
  );
};
