import { Box, Center, Stack, Text, Title } from '@mantine/core';
import { Outlet } from 'react-router-dom';

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
            <Title order={2} c="white">
              Wijekoon Enterprises
            </Title>
            <Text c="gray.4" ta="center">
              Manage your business, all in one place.
            </Text>
          </Stack>
        </Center>
      </Box>
      <Box w={{ base: '100%', sm: '50%' }} h="100%">
        <Center h="100%">
          <Box w="100%" maw={420} px="md">
            <Outlet />
          </Box>
        </Center>
      </Box>
    </Box>
  );
};
