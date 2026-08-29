import { useCallback, useEffect, useState } from 'react';
import { ActionIcon, Badge, Box, Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  type User,
  type UserRole,
} from '@/store/userSlice/userSlice';
import { UserForm, type UserFormValues } from '@/components/UserForm';
import { toNotify } from '@/hooks/toNotify';

const RECORDS_PER_PAGE_OPTIONS = [10, 20, 50];

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.user.items);
  const total = useAppSelector((state) => state.user.total);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [fetching, setFetching] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formOpened, setFormOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    setFetching(true);
    try {
      await dispatch(fetchUsers({ page, limit })).unwrap();
    } catch (error) {
      toNotify('Failed to load users', error as string, 'ERROR');
    } finally {
      setFetching(false);
    }
  }, [dispatch, page, limit]);

  useEffect(() => {
    // Deferred a microtask so the fetch's loading state isn't set synchronously
    // during the effect itself (react-hooks/set-state-in-effect).
    queueMicrotask(loadUsers);
  }, [loadUsers]);

  const handleRecordsPerPageChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormOpened(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormOpened(true);
  };

  const closeFormModal = () => {
    setFormOpened(false);
    setEditingUser(null);
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    setSubmitting(true);
    try {
      if (editingUser) {
        await dispatch(
          updateUser({
            _id: editingUser._id,
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone,
            email: values.email,
            role: values.role as UserRole,
            isActive: values.isActive,
          }),
        ).unwrap();
        toNotify('Updated', 'User has been updated.', 'SUCCESS');
      } else {
        await dispatch(
          createUser({
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone,
            email: values.email,
            role: values.role as UserRole,
          }),
        ).unwrap();
        toNotify('Created', 'User has been created.', 'SUCCESS');
      }
      closeFormModal();
      await loadUsers();
    } catch (error) {
      toNotify(
        editingUser ? 'Failed to update user' : 'Failed to create user',
        error as string,
        'ERROR',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    try {
      await dispatch(deleteUser(pendingDeleteId)).unwrap();
      toNotify('Deleted', 'User has been deleted.', 'SUCCESS');
      await loadUsers();
    } catch (error) {
      toNotify('Failed to delete user', error as string, 'ERROR');
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Box>
          <Title order={2}>Users</Title>
          <Text>All the users data</Text>
        </Box>

        <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
          Add new
        </Button>
      </Group>

      <DataTable<User>
        withTableBorder
        withColumnBorders
        highlightOnHover
        idAccessor="_id"
        fetching={fetching}
        records={users}
        noRecordsText="No users found"
        page={page}
        onPageChange={setPage}
        totalRecords={total}
        recordsPerPage={limit}
        onRecordsPerPageChange={handleRecordsPerPageChange}
        recordsPerPageOptions={RECORDS_PER_PAGE_OPTIONS}
        columns={[
          {
            accessor: 'firstName',
            title: 'Name',
            render: (record) => `${record.firstName} ${record.lastName ?? ''}`.trim(),
          },
          { accessor: 'email' },
          { accessor: 'phone' },
          { accessor: 'role' },
          {
            accessor: 'isActive',
            title: 'Status',
            render: (record) => (
              <Badge color={record.isActive ? 'green' : 'gray'} variant="light">
                {record.isActive ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            render: (record) => (
              <Group gap="xs" justify="flex-end">
                <ActionIcon
                  variant="subtle"
                  onClick={() => openEditModal(record)}
                  aria-label="Edit user"
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  loading={deletingId === record._id}
                  onClick={() => setPendingDeleteId(record._id)}
                  aria-label="Delete user"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />

      <Modal
        opened={formOpened}
        onClose={closeFormModal}
        title={editingUser ? 'Edit user' : 'Add user'}
      >
        <UserForm
          key={editingUser?._id ?? 'new'}
          mode={editingUser ? 'edit' : 'create'}
          initialValues={
            editingUser
              ? {
                  firstName: editingUser.firstName,
                  lastName: editingUser.lastName ?? '',
                  phone: editingUser.phone,
                  email: editingUser.email,
                  role: editingUser.role,
                  isActive: editingUser.isActive,
                }
              : undefined
          }
          onSubmit={handleFormSubmit}
          loading={submitting}
        />
      </Modal>

      <Modal
        opened={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        title="Delete user"
      >
        <Stack gap="md">
          <Text size="sm">Are you sure you want to delete this user? This cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPendingDeleteId(null)}>
              Cancel
            </Button>
            <Button color="red" loading={deletingId !== null} onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default UsersPage;
