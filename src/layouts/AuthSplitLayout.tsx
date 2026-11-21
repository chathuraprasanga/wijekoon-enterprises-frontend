import { Box, Stack, Text, Title } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { Wordmark } from '@/components/Wordmark';

// Desktop: flat brand panel + form column. Tablet and mobile: brand band on top, form below.
export const AuthSplitLayout = () => (
  <Box display="flex" mih="100vh" style={{ background: 'var(--ldg-surface)' }}>
    <Box
      visibleFrom="md"
      w="46%"
      p={48}
      style={{
        background: 'var(--ldg-brand-panel)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Wordmark inverse height={30} />
      <Stack gap="sm" maw={460}>
        <Title order={1} fz={30} lh={1.25} c="#ffffff">
          Every sale, cheque and supplier, kept exactly.
        </Title>
        <Text c="rgba(255,255,255,0.84)" size="md">
          The back-office for customers, products, sales and cheques at Wijekoon Enterprises.
        </Text>
      </Stack>
      <Text size="sm" c="rgba(255,255,255,0.78)">
        Staff sign-in only.
      </Text>
    </Box>
    <Box flex={1} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Box
        hiddenFrom="md"
        px="md"
        h={80}
        style={{ background: 'var(--ldg-brand-panel)', display: 'flex', alignItems: 'center' }}
      >
        <Wordmark inverse />
      </Box>
      <Box flex={1} px="md" style={{ display: 'grid', placeItems: 'center' }}>
        <Box w="100%" maw={417} py={40}>
          <Outlet />
          <Text size="sm" c="dimmed" ta="center" mt="xl">
            Wijekoon Enterprises back-office
          </Text>
        </Box>
      </Box>
    </Box>
  </Box>
);
