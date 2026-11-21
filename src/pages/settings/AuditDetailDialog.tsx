import { useEffect, useState } from 'react';
import { Alert, Box, Code, Group, Loader, ScrollArea, Table, Text } from '@mantine/core';
import { DetailDialog } from '@/components/DetailDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

type Change = { old?: unknown; new?: unknown };
type Detail = {
  _id: string;
  createdAt: string;
  action: string;
  operation: string;
  module: string;
  entity: string | null;
  entityId: string | null;
  description: string;
  status: 'SUCCESS' | 'FAILED';
  user: { firstName: string; lastName?: string | null; email: string; type?: string } | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  changes: Record<string, Change> | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  integrity: 'VALID' | 'INVALID' | 'UNSIGNED';
};

// "addressLine1" / "permissions.0" -> "Address line 1"-ish: split camelCase and dots.
const fieldLabel = (key: string) => {
  const s = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\./g, ' › ')
    .toLowerCase();
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
};

// A missing value is not the same as null/empty: say which.
const Value = ({ present, value }: { present: boolean; value: unknown }) => {
  if (!present)
    return (
      <Text size="sm" c="dimmed" fs="italic">
        not set
      </Text>
    );
  if (value === null)
    return (
      <Text size="sm" c="dimmed">
        null
      </Text>
    );
  if (value === '')
    return (
      <Text size="sm" c="dimmed">
        empty
      </Text>
    );
  if (typeof value === 'object')
    return (
      <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {JSON.stringify(value, null, 1)}
      </Code>
    );
  return (
    <Text size="sm" style={{ wordBreak: 'break-word' }}>
      {String(value)}
    </Text>
  );
};

const Snapshot = ({ data }: { data: Record<string, unknown> }) => (
  <Table withRowBorders>
    <Table.Tbody>
      {Object.entries(data).map(([k, v]) => (
        <Table.Tr key={k}>
          <Table.Td w="38%">
            <Text size="sm" fw={500}>
              {fieldLabel(k)}
            </Text>
          </Table.Td>
          <Table.Td>
            <Value present value={v} />
          </Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  </Table>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box mb="md">
    <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb={6}>
      {title}
    </Text>
    {children}
  </Box>
);

type Props = { id: string; onClose: () => void };

// One audit entry in full: what was created, the exact before/after of an update, the deleted record,
// or the event's details, plus where/when/who and the integrity check.
const Inner = ({ id, onClose }: Props) => {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    axiosInstance
      .get<Detail>(`/audit-logs/${id}`)
      .then(({ data }) => live && setDetail(data))
      .catch((e) => live && setError(getErrorMessage(e)));
    return () => {
      live = false;
    };
  }, [id]);

  const d = detail;
  const who = d?.user ? `${d.user.firstName} ${d.user.lastName ?? ''}`.trim() : 'Unknown';
  const changes = d?.changes ? Object.entries(d.changes) : [];

  return (
    <DetailDialog
      opened
      onClose={onClose}
      title="Audit entry"
      subtitle={d ? d.description : undefined}
    >
      {error && <Alert color="red">{error}</Alert>}
      {!d && !error && (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      )}
      {d && (
        <>
          <Group gap="xs" mb="md">
            <StatusBadge
              tone={d.status === 'FAILED' ? 'danger' : 'success'}
              label={d.status === 'FAILED' ? 'Failed' : 'Success'}
            />
            <StatusBadge tone="info" label={d.operation} />
            <StatusBadge tone="neutral" label={d.module} />
          </Group>

          <Section title="Who, what, when">
            <Table withRowBorders>
              <Table.Tbody>
                {(
                  [
                    ['When', new Date(d.createdAt).toLocaleString('en-GB')],
                    [
                      'User',
                      d.user ? `${who}${d.user.email ? ` (${d.user.email})` : ''}` : 'Unknown',
                    ],
                    [
                      'Record',
                      d.entity ? `${d.entity}${d.entityId ? ` · ${d.entityId}` : ''}` : '—',
                    ],
                    ['IP address', d.ipAddress ?? '—'],
                    ['Request ID', d.requestId ?? '—'],
                    ['Device', d.userAgent ?? '—'],
                  ] as const
                ).map(([k, v]) => (
                  <Table.Tr key={k}>
                    <Table.Td w="30%">
                      <Text size="sm" fw={500}>
                        {k}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" style={{ wordBreak: 'break-word' }}>
                        {v}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Section>

          {d.operation === 'UPDATE' && changes.length > 0 && (
            <Section title={`What changed (${changes.length})`}>
              <ScrollArea>
                <Table withRowBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Field</Table.Th>
                      <Table.Th>Before</Table.Th>
                      <Table.Th>After</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {changes.map(([k, c]) => (
                      <Table.Tr key={k}>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {fieldLabel(k)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Value present={'old' in c} value={c.old} />
                        </Table.Td>
                        <Table.Td>
                          <Value present={'new' in c} value={c.new} />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Section>
          )}

          {d.operation === 'CREATE' && d.newData && (
            <Section title="Created with">
              <Snapshot data={d.newData} />
            </Section>
          )}
          {d.operation === 'DELETE' && d.oldData && (
            <Section title="Deleted record">
              <Snapshot data={d.oldData} />
            </Section>
          )}
          {d.metadata && Object.keys(d.metadata).length > 0 && (
            <Section title="Details">
              <Snapshot data={d.metadata} />
            </Section>
          )}

          {d.integrity === 'INVALID' && (
            <Alert color="red" title="Integrity check failed">
              This entry no longer matches its signature. It may have been altered outside the
              application.
            </Alert>
          )}
          {d.integrity === 'UNSIGNED' && (
            <Text size="xs" c="dimmed">
              Recorded before entries were signed; integrity cannot be verified.
            </Text>
          )}
        </>
      )}
    </DetailDialog>
  );
};

// Mounted per entry (keyed by id), so each opening starts from a clean loading state.
export const AuditDetailDialog = ({ id, onClose }: { id: string | null; onClose: () => void }) =>
  id ? <Inner key={id} id={id} onClose={onClose} /> : null;
