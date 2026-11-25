import { axiosInstance } from '@/interceptors/axiosInterceptor';

export type Point = {
  date: string;
  sales: number | null;
  received: number | null;
  purchases: number | null;
  prevSales: number | null;
  prevReceived: number | null;
  prevPurchases: number | null;
};
export type Total = { value: number; previous: number };
export type Named = { name: string; value: number; orders: number };
export type DueBucket = {
  start: string | null;
  value: number;
  count: number;
  oldest: string | null;
};

/** `null` sections are ones the signed-in user may not read: the page hides those cards. */
export type DashboardData = {
  range: { from: string; to: string; days: number; previousFrom: string; previousTo: string };
  series: Point[];
  totals: {
    sales: Total | null;
    received: Total | null;
    purchases: Total | null;
    receivables: number | null;
    payables: number | null;
    cheques: { count: number; value: number } | null;
  };
  paymentSplit: { method: string; value: number; count: number }[] | null;
  saleStatus: { status: string; value: number; count: number }[] | null;
  topCustomers: Named[] | null;
  topProducts: {
    quantity: { name: string; quantity: number; revenue: number }[];
    revenue: { name: string; quantity: number; revenue: number }[];
  } | null;
  topSuppliers: Named[] | null;
  ageing: number[] | null;
  chequePipeline: { status: string; value: number; count: number }[] | null;
  chequesDue: DueBucket[] | null;
};

export const fetchDashboard = async (from: string, to: string) =>
  (await axiosInstance.get<DashboardData>('/dashboard', { params: { from, to } })).data;
