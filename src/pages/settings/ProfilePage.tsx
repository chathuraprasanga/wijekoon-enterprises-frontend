import { useState, type ReactNode } from 'react';
import {
  Avatar,
  Box,
  Button,
  Group,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLock, IconMail, IconPencil, IconPhone } from '@tabler/icons-react';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FormModal } from '@/components/FormModal';
import { useErrorSummary } from '@/hooks/useErrorSummary';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changePassword, updateProfile } from '@/store/authSlice/authSlice';
import { toNotify } from '@/hooks/toNotify';
import { email, password, phone, required, digitsOnly } from '@/utils/validators';
import { formatDate, formatPhone, fullName, initials } from '@/utils/format';

// Optional illustrated avatars are the one third-party image source in the app.
const AVATAR_SEEDS = [
  'Felix',
  'Aneka',
  'Milo',
  'Zoe',
  'Leo',
  'Nala',
  'Max',
  'Luna',
  'Rex',
  'Coco',
  'Oscar',
  'Mia',
  'Jasper',
  'Ruby',
];
const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

type ModalProps = { opened: boolean; onClose: () => void };

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box>
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    <Text component="div">{children}</Text>
  </Box>
);

const ProfilePage = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [modal, setModal] = useState<'edit' | 'avatar' | 'password' | null>(null);
  if (!user) return null;
  const close = () => setModal(null);

  return (
    <Stack gap="md">
      <SectionCard
        title="Your profile"
        action={
          <Button
            variant="default"
            leftSection={<IconPencil size={16} aria-hidden />}
            onClick={() => setModal('edit')}
          >
            Edit profile
          </Button>
        }
      >
        <Group gap="md" wrap="nowrap" mb="lg">
          <Avatar src={user.avatar} size={66} radius="xl" color="forest" aria-hidden>
            {initials(user)}
          </Avatar>
          <Stack gap={4} align="flex-start">
            <Group gap="sm" wrap="wrap">
              <Text fz={20} fw={600} lh={1.25}>
                {fullName(user)}
              </Text>
              {user.isSuperAdmin && <StatusBadge tone="accent" label="Super admin" />}
            </Group>
            <UnstyledButton
              onClick={() => setModal('avatar')}
              fz="sm"
              fw={500}
              c="var(--ldg-accent-text)"
            >
              Change avatar
            </UnstyledButton>
          </Stack>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
          <Field label="Full name">{fullName(user)}</Field>
          <Field label="Email">{user.email}</Field>
          <Field label="Phone">
            <span className="num">{formatPhone(user.phone)}</span>
          </Field>
          <Field label="Member since">{formatDate(user.createdAt)}</Field>
        </SimpleGrid>
      </SectionCard>
      <SectionCard title="Password">
        <Group justify="space-between" gap="md" wrap="wrap">
          <Box>
            <Text fw={500}>Password</Text>
            <Text size="sm" c="dimmed">
              Change the password you use to sign in.
            </Text>
          </Box>
          <Button
            variant="default"
            leftSection={<IconLock size={16} aria-hidden />}
            onClick={() => setModal('password')}
          >
            Change password
          </Button>
        </Group>
      </SectionCard>
      {modal === 'edit' && <EditProfileModal opened onClose={close} />}
      {modal === 'avatar' && <AvatarPickerModal opened onClose={close} />}
      {modal === 'password' && <ChangePasswordModal opened onClose={close} />}
    </Stack>
  );
};

type ProfileValues = { firstName: string; lastName: string; email: string; phone: string };

const EditProfileModal = ({ opened, onClose }: ModalProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileValues>({
    initialValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
    validate: {
      firstName: required('First name is required.'),
      email,
      phone,
    },
  });

  const errorLabels = useErrorSummary(form, {
    firstName: 'First name',
    email: 'Email',
    phone: 'Phone',
  });

  const handleSubmit = async (v: ProfileValues) => {
    if (!user) return;
    setLoading(true);
    try {
      await dispatch(
        updateProfile({
          firstName: v.firstName.trim(),
          lastName: v.lastName.trim() || null,
          email: v.email.trim(),
          phone: digitsOnly(v.phone),
          avatar: user.avatar,
        }),
      ).unwrap();
      toNotify('Profile saved', 'Your details were updated.', 'SUCCESS');
      onClose();
    } catch (error) {
      toNotify("Couldn't save profile", error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      opened={opened}
      title="Edit profile"
      submitLabel="Save changes"
      loading={loading}
      dirty={form.isDirty()}
      errorLabels={errorLabels}
      onSubmit={form.onSubmit(handleSubmit)}
      onClose={onClose}
    >
      <SimpleGrid cols={{ base: 1, xs: 2 }}>
        <TextInput
          label="First name"
          placeholder="Enter first name"
          withAsterisk
          {...form.getInputProps('firstName')}
        />
        <TextInput
          label="Last name"
          placeholder="Enter last name"
          {...form.getInputProps('lastName')}
        />
      </SimpleGrid>
      <TextInput
        label="Email"
        placeholder="Enter email address"
        withAsterisk
        type="email"
        autoComplete="email"
        leftSection={<IconMail size={16} aria-hidden />}
        {...form.getInputProps('email')}
      />
      <TextInput
        label="Phone"
        withAsterisk
        inputMode="tel"
        autoComplete="tel"
        placeholder="Enter phone number"
        description="Sri Lankan mobile or landline, 10 digits."
        leftSection={<IconPhone size={16} aria-hidden />}
        {...form.getInputProps('phone')}
      />
    </FormModal>
  );
};

const AvatarPickerModal = ({ opened, onClose }: ModalProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [selected, setSelected] = useState<string | null>(user?.avatar ?? null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await dispatch(
        updateProfile({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          avatar: selected,
        }),
      ).unwrap();
      toNotify('Avatar saved', 'Your avatar was updated.', 'SUCCESS');
      onClose();
    } catch (error) {
      toNotify("Couldn't save avatar", error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  const choices: { key: string; url: string | null; label: string }[] = [
    { key: 'initials', url: null, label: 'Use initials' },
    ...AVATAR_SEEDS.map((seed) => ({ key: seed, url: avatarUrl(seed), label: `Avatar ${seed}` })),
  ];

  return (
    <FormModal
      opened={opened}
      title="Choose an avatar"
      submitLabel="Save avatar"
      loading={loading}
      dirty={selected !== (user?.avatar ?? null)}
      onSubmit={(e) => {
        e.preventDefault();
        void handleSave();
      }}
      onClose={onClose}
    >
      <Text size="sm" c="dimmed">
        Pick initials or an illustrated avatar.
      </Text>
      <SimpleGrid cols={5} spacing="sm">
        {choices.map((c) => (
          <UnstyledButton
            key={c.key}
            aria-label={c.label}
            aria-pressed={selected === c.url}
            onClick={() => setSelected(c.url)}
            style={{
              borderRadius: '50%',
              padding: 3,
              justifySelf: 'center',
              outline: selected === c.url ? '2px solid var(--ldg-accent)' : '2px solid transparent',
              outlineOffset: 2,
            }}
          >
            <Avatar src={c.url} size={48} radius="xl" color="forest">
              {initials(user)}
            </Avatar>
          </UnstyledButton>
        ))}
      </SimpleGrid>
    </FormModal>
  );
};

type PasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string };

const ChangePasswordModal = ({ opened, onClose }: ModalProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const form = useForm<PasswordValues>({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: {
      currentPassword: required('Current password is required.'),
      newPassword: password,
      confirmPassword: (v, values) => (v === values.newPassword ? null : 'Passwords do not match'),
    },
  });

  const handleSubmit = async (v: PasswordValues) => {
    setLoading(true);
    try {
      await dispatch(
        changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword }),
      ).unwrap();
      toNotify('Password changed', 'Use your new password next time you sign in.', 'SUCCESS');
      onClose();
    } catch (error) {
      toNotify("Couldn't change password", error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      opened={opened}
      title="Change password"
      submitLabel="Change password"
      loading={loading}
      dirty={form.isDirty()}
      onSubmit={form.onSubmit(handleSubmit)}
      onClose={onClose}
    >
      <PasswordInput
        label="Current password"
        placeholder="Enter your current password"
        withAsterisk
        autoComplete="current-password"
        {...form.getInputProps('currentPassword')}
      />
      <PasswordInput
        label="New password"
        placeholder="Enter a new password"
        withAsterisk
        autoComplete="new-password"
        description="At least 8 characters."
        {...form.getInputProps('newPassword')}
      />
      <PasswordInput
        label="Confirm new password"
        placeholder="Re-enter the new password"
        withAsterisk
        autoComplete="new-password"
        {...form.getInputProps('confirmPassword')}
      />
    </FormModal>
  );
};

export default ProfilePage;
