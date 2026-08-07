import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutThunk } from '@/features/auth/authSlice';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export const Topbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '';
  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : '';

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return (
    <Group gap="md">
      <ThemeToggle />
      <Menu>
        <Menu.Target>
          <UnstyledButton>
            <Group gap="sm">
              <Avatar>{initials}</Avatar>
              <Text size="sm" fw={500}>
                {fullName}
              </Text>
              <IconChevronDown size={16} />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconLogout size={16} />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};
