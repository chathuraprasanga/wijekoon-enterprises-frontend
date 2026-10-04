import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Group, Paper, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBox, IconTruckDelivery, IconUsers } from '@tabler/icons-react';
import { PageHeader } from '@/components/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCustomers } from '@/store/customerSlice/customerSlice';
import { fetchSuppliers } from '@/store/supplierSlice/supplierSlice';
import { fetchProducts } from '@/store/productSlice/productSlice';
import { toNotify } from '@/hooks/toNotify';

const STAT_CARDS = [
  { key: 'customer', label: 'Customers', path: '/app/customers', icon: IconUsers, color: 'blue' },
  {
    key: 'supplier',
    label: 'Suppliers',
    path: '/app/suppliers',
    icon: IconTruckDelivery,
    color: 'orange',
  },
  { key: 'product', label: 'Products', path: '/app/products', icon: IconBox, color: 'grape' },
] as const;

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const totals = useAppSelector((state) => ({
    customer: state.customer.total,
    supplier: state.supplier.total,
    product: state.product.total,
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([
          dispatch(fetchCustomers({ page: 1, limit: 1 })).unwrap(),
          dispatch(fetchSuppliers({ page: 1, limit: 1 })).unwrap(),
          dispatch(fetchProducts({ page: 1, limit: 1 })).unwrap(),
        ]);
      } catch (error) {
        toNotify('Failed to load dashboard stats', error as string, 'ERROR');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch]);

  return (
    <Stack gap="md">
      <PageHeader
        title="Dashboard"
        description={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}.`}
      />
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="md">
        {STAT_CARDS.map((card) => (
          <Paper
            key={card.key}
            component={Link}
            to={card.path}
            withBorder
            radius="md"
            p="lg"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={2}>
                <Text size="sm" c="dimmed">
                  {card.label}
                </Text>
                {loading ? (
                  <Skeleton height={28} width={60} radius="sm" />
                ) : (
                  <Text size="xl" fw={700}>
                    {totals[card.key]}
                  </Text>
                )}
              </Stack>
              <ThemeIcon color={card.color} variant="light" size={44} radius="md">
                <card.icon size={24} />
              </ThemeIcon>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default DashboardPage;
