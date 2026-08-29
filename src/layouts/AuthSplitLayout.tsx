import { Box, Center, Group, Image, Stack, Text } from '@mantine/core';
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
        style={{
          background:
            'linear-gradient(135deg, var(--mantine-color-gray-8), var(--mantine-color-dark-9))',
        }}
      >
        <Center h="100%">
          <Stack align="center" gap={4} px="xl">
            <Image src={companyLogo} w={180} fit="contain" />
            <Text c="gray.4" ta="center">
              Manage your business, all in one place.
            </Text>
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
