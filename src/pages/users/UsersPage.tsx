import { useState } from 'react';
import { ActionIcon, Button, Group, Skeleton, Title } from '@mantine/core';
import { IconDatabaseOff, IconEdit, IconTrash, IconUserCog } from '@tabler/icons-react';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { useUsers } from '@/features/users/useUsers';
import { deleteUser } from '@/features/users/usersApi';
import { notifyError, notifySuccess } from '@/utils/notify';
import { useAppSelector } from '@/store/hooks';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { CreateUserModal } from '@/pages/users/CreateUserModal';
import { EditUserModal } from '@/pages/users/EditUserModal';
import { ChangeRoleModal } from '@/pages/users/ChangeRoleModal';
import type { SafeUser } from '@/types/user';

const RECORDS_PER_PAGE_OPTIONS = [10, 20, 30];

interface SkeletonRow {
  id: string;
  __skeleton: true;
}

type UserRow = SafeUser | SkeletonRow;

const isSkeletonRow = (row: UserRow): row is SkeletonRow => '__skeleton' in row;

const buildSkeletonRows = (count: number): SkeletonRow[] =>
  Array.from({ length: count }, (_, index) => ({ id: `skeleton-${index}`, __skeleton: true }));

export const UsersPage = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data, page, limit, total, loading, setPage, setLimit, refetch } = useUsers();

  const [createOpened, setCreateOpened] = useState(false);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [roleUser, setRoleUser] = useState<SafeUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<SafeUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deletingUser.id);
      notifySuccess('User deleted successfully.');
      setDeletingUser(null);
      refetch();
    } catch (error) {
      notifyError(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: DataTableColumn<UserRow>[] = [
    {
      accessor: 'firstName',
      title: 'Name',
      render: (row) =>
        isSkeletonRow(row) ? (
          <Skeleton height={16} width="70%" />
        ) : (
          [row.firstName, row.lastName].filter(Boolean).join(' ')
        ),
    },
    {
      accessor: 'email',
      title: 'Email',
      render: (row) => (isSkeletonRow(row) ? <Skeleton height={16} width="85%" /> : row.email),
    },
    {
      accessor: 'phone',
      title: 'Phone',
      render: (row) => (isSkeletonRow(row) ? <Skeleton height={16} width="60%" /> : row.phone),
    },
    {
      accessor: 'role',
      title: 'Role',
      render: (row) => (isSkeletonRow(row) ? <Skeleton height={16} width="50%" /> : row.role),
    },
    {
      accessor: 'actions',
      title: '',
      textAlign: 'right',
      render: (row) => {
        if (isSkeletonRow(row)) {
          return <Skeleton height={20} width={80} ml="auto" />;
        }

        const isSelf = row.id === currentUser?.id;
        return (
          <Group gap="xs" justify="flex-end">
            <ActionIcon onClick={() => setEditingUser(row)} aria-label="Edit user">
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon onClick={() => setRoleUser(row)} disabled={isSelf} aria-label="Change role">
              <IconUserCog size={18} />
            </ActionIcon>
            <ActionIcon
              color="red"
              onClick={() => setDeletingUser(row)}
              disabled={isSelf}
              aria-label="Delete user"
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        );
      },
    },
  ];

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Users</Title>
        <Button onClick={() => setCreateOpened(true)}>Create User</Button>
      </Group>

      <DataTable
        withTableBorder
        borderRadius="md"
        striped
        highlightOnHover
        records={loading ? buildSkeletonRows(limit) : data}
        columns={columns}
        page={page}
        onPageChange={setPage}
        totalRecords={total}
        recordsPerPage={limit}
        recordsPerPageOptions={RECORDS_PER_PAGE_OPTIONS}
        onRecordsPerPageChange={setLimit}
        idAccessor="id"
        noRecordsIcon={<IconDatabaseOff size={36} />}
        noRecordsText="No data"
      />

      <CreateUserModal
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        onCreated={refetch}
      />

      {editingUser && (
        <EditUserModal
          key={editingUser.id}
          opened
          onClose={() => setEditingUser(null)}
          onUpdated={refetch}
          user={editingUser}
        />
      )}

      {roleUser && (
        <ChangeRoleModal
          key={roleUser.id}
          opened
          onClose={() => setRoleUser(null)}
          onChanged={refetch}
          user={roleUser}
        />
      )}

      <ConfirmModal
        opened={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Delete user"
        message={`Are you sure you want to delete ${deletingUser?.firstName ?? 'this user'}? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </>
  );
};
