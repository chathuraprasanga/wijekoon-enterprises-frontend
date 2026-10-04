import { useState } from 'react';
import {
  Avatar,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPencil } from '@tabler/icons-react';
import { PageHeader } from '@/components/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changePassword, updateProfile } from '@/store/authSlice/authSlice';
import { toNotify } from '@/hooks/toNotify';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(070|071|072|074|075|076|077|078)\d{7}$/;

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Milo', 'Zoe', 'Leo', 'Nala', 'Max', 'Luna', 'Rex', 'Coco'];
const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

const ProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  if (!user) return null;

  return (
    <Stack gap="md">
      <PageHeader title="Profile" description="Manage your personal account details." />
      <Paper withBorder radius="md" p="lg">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group wrap="nowrap">
            <UnstyledButton onClick={() => setAvatarOpen(true)}>
              <Avatar src={user.avatar} size={72} radius="xl">
                {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
              </Avatar>
            </UnstyledButton>
            <Stack gap={2}>
              <Text fw={600} size="lg">
                {user.firstName} {user.lastName ?? ''}
              </Text>
              <Text size="sm" c="dimmed">
                {user.email}
              </Text>
              <Text size="sm" c="dimmed">
                {user.phone}
              </Text>
            </Stack>
          </Group>
          <Button
            variant="default"
            leftSection={<IconPencil size={16} />}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
        </Group>
        <Divider my="lg" />
        <Group justify="space-between" wrap="nowrap">
          <Stack gap={2}>
            <Text fw={600}>Password</Text>
            <Text size="sm" c="dimmed">
              Change your account password.
            </Text>
          </Stack>
          <Button variant="default" onClick={() => setPasswordOpen(true)}>
            Change password
          </Button>
        </Group>
      </Paper>
      <EditProfileModal opened={editOpen} onClose={() => setEditOpen(false)} />
      <AvatarPickerModal opened={avatarOpen} onClose={() => setAvatarOpen(false)} />
      <ChangePasswordModal opened={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </Stack>
  );
};

type ModalProps = { opened: boolean; onClose: () => void };

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const EditProfileModal = ({ opened, onClose }: ModalProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    initialValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
    validate: {
      firstName: (value) => (value.trim() ? null : 'First name is required'),
      email: (value) => (EMAIL_REGEX.test(value) ? null : 'Enter a valid email address'),
      phone: (value) => (PHONE_REGEX.test(value) ? null : 'Enter a valid 10-digit mobile number'),
    },
  });

  const handleSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      await dispatch(
        updateProfile({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim() || null,
          email: values.email.trim(),
          phone: values.phone.trim(),
          avatar: user.avatar,
        }),
      ).unwrap();
      toNotify('Updated', 'Profile updated successfully', 'SUCCESS');
      onClose();
    } catch (error) {
      toNotify('Failed to update profile', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit profile" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="First name"
            withAsterisk
            placeholder="Enter first name"
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Last name"
            placeholder="Enter last name"
            {...form.getInputProps('lastName')}
          />
          <TextInput
            label="Email"
            withAsterisk
            placeholder="Enter email address"
            {...form.getInputProps('email')}
          />
          <TextInput
            label="Phone"
            withAsterisk
            placeholder="07XXXXXXXX"
            {...form.getInputProps('phone')}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

const AvatarPickerModal = ({ opened, onClose }: ModalProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
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
      toNotify('Updated', 'Avatar updated successfully', 'SUCCESS');
      onClose();
    } catch (error) {
      toNotify('Failed to update avatar', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Choose an avatar" centered>
      <Stack gap="md">
        <SimpleGrid cols={5} spacing="md" pt={6}>
          <UnstyledButton
            onClick={() => setSelected(null)}
            style={{
              width: 56,
              height: 56,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              outline: selected === null ? '2px solid var(--mantine-color-gray-8)' : 'none',
              outlineOffset: 3,
            }}
          >
            <Avatar size={56} radius="xl" color="gray">
              {`${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()}
            </Avatar>
          </UnstyledButton>
          {AVATAR_SEEDS.map((seed) => {
            const url = avatarUrl(seed);
            const isSelected = selected === url;
            return (
              <UnstyledButton
                key={seed}
                onClick={() => setSelected(url)}
                style={{
                  width: 56,
                  height: 56,
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  outline: isSelected ? '2px solid var(--mantine-color-gray-8)' : 'none',
                  outlineOffset: 3,
                }}
              >
                <Avatar src={url} size={56} radius="xl" />
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordModal = ({ opened, onClose }: ModalProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const form = useForm<PasswordFormValues>({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: {
      currentPassword: (value) => (value ? null : 'Current password is required'),
      newPassword: (value) => (value.length >= 8 ? null : 'Must be at least 8 characters'),
      confirmPassword: (value, values) =>
        value === values.newPassword ? null : 'Passwords do not match',
    },
  });

  const handleSubmit = async (values: PasswordFormValues) => {
    setLoading(true);
    try {
      await dispatch(
        changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      ).unwrap();
      toNotify('Updated', 'Password changed successfully', 'SUCCESS');
      form.reset();
      onClose();
    } catch (error) {
      toNotify('Failed to change password', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title="Change password"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <PasswordInput
            label="Current password"
            withAsterisk
            placeholder="Enter current password"
            {...form.getInputProps('currentPassword')}
          />
          <PasswordInput
            label="New password"
            withAsterisk
            placeholder="Enter new password"
            {...form.getInputProps('newPassword')}
          />
          <PasswordInput
            label="Confirm new password"
            withAsterisk
            placeholder="Re-enter new password"
            {...form.getInputProps('confirmPassword')}
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                form.reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Change password
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default ProfilePage;
