import { Box, Center, Divider, Group, Image, Stack, Text, Title } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import companyLogo from '../../assets/company-logo.png';

export const AuthSplitLayout = () => {
  return (
    <Box display="flex" h="100vh">
      <Box
        visibleFrom="sm"
        w="50%"
        h="100%"
        pos="relative"
        style={{
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, var(--mantine-color-gray-8), var(--mantine-color-dark-9))',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            top: '-12%',
            right: '-10%',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)',
          }}
        />
        <Box
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)',
          }}
        />
        <Center h="100%" pos="relative">
          <Stack align="center" gap="lg" px="xl" maw={420}>
            <Image src={companyLogo} w={140} fit="contain" />
            <Stack align="center" gap={4}>
              <Title order={2} c="white" ta="center">
                Wijekoon Enterprises
              </Title>
              <Divider w={48} color="gray.5" size="sm" />
              <Text c="gray.4" ta="center" size="sm" maw={320}>
                Manage customers, suppliers, products and your team from one simple admin panel.
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Box>
      <Box w={{ base: '100%', sm: '50%' }} h="100%">
        <Center h="100%">
          <Box w="100%" maw={420} px="md">
            <Group justify="flex-end" mb="sm">
              <ThemeToggle />
            </Group>
            <Outlet />
          </Box>
        </Center>
      </Box>
    </Box>
  );
};
