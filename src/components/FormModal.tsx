import { useState, type FormEventHandler, type ReactNode } from 'react';
import { Box, Button, Group, Stack } from '@mantine/core';
import { InlineAlert } from '@/components/InlineAlert';
import { ResponsiveModal } from '@/components/ResponsiveModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type Props = {
  opened: boolean;
  title: string;
  /** Record being edited (name or id), shown under the title and in the discard prompt. */
  subject?: string;
  submitLabel: string;
  loading?: boolean;
  /** Labels of fields with errors; shows a "Fix N fields before saving" banner above the form. */
  errorLabels?: string[];
  /** True when the form has unsaved edits; closing then asks before discarding. */
  dirty?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
  children: ReactNode;
};

const Footer = ({
  loading,
  submitLabel,
  onCancel,
}: {
  loading?: boolean;
  submitLabel: string;
  onCancel: () => void;
}) => (
  <Group className="sheet-footer" justify="flex-end" px={20} py={12} gap="xs">
    <Button variant="default" onClick={onCancel} disabled={loading}>
      Cancel
    </Button>
    <Button type="submit" loading={loading}>
      {submitLabel}
    </Button>
  </Group>
);

// Modal for forms (size sm/md/lg for more fields). Footer: Cancel left of the primary action, right-aligned.
export const FormModal = ({
  opened,
  title,
  subject,
  submitLabel,
  loading,
  dirty,
  errorLabels = [],
  size = 'sm',
  onSubmit,
  onClose,
  children,
}: Props) => {
  const [discardOpen, setDiscardOpen] = useState(false);
  const banner =
    errorLabels.length > 0 ? (
      <InlineAlert
        tone="danger"
        title={`Fix ${errorLabels.length} field${errorLabels.length > 1 ? 's' : ''} before saving`}
      >
        {errorLabels
          .map((l, i) => (i === 0 ? l : l.toLowerCase()))
          .reduce(
            (acc, l, i, all) =>
              i === 0 ? l : i === all.length - 1 ? `${acc} and ${l}` : `${acc}, ${l}`,
            '',
          )}{' '}
        {errorLabels.length > 1 ? 'need' : 'needs'} your attention.
      </InlineAlert>
    ) : null;

  const requestClose = () => (dirty && !loading ? setDiscardOpen(true) : onClose());

  return (
    <>
      <ResponsiveModal
        opened={opened}
        onClose={requestClose}
        title={title}
        subtitle={subject}
        width={size === 'sm' ? 520 : size === 'md' ? 600 : 680}
        closeOnClickOutside={!loading}
        closeOnEscape={!loading}
      >
        <form onSubmit={onSubmit} noValidate>
          <Box px={20} py={16}>
            <Stack gap="md">
              {banner}
              {children}
            </Stack>
          </Box>
          <Footer loading={loading} submitLabel={submitLabel} onCancel={requestClose} />
        </form>
      </ResponsiveModal>
      <ConfirmDialog
        opened={discardOpen}
        title="Discard unsaved changes?"
        trashIcon={false}
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false);
          onClose();
        }}
      >
        {subject ? (
          <>
            You&apos;ve edited <strong>{subject}</strong> but haven&apos;t saved. If you close now,
            those changes are lost.
          </>
        ) : (
          'You haven’t saved your edits. If you close now, those changes are lost.'
        )}
      </ConfirmDialog>
    </>
  );
};
