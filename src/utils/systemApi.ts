import axios from 'axios';
import { API_BASE_URL } from '@/utils/apiBaseUrl';

export type SystemStatus = { initialized: boolean; setupRequired: boolean };

// Public endpoints (no token): whether first-time setup has happened, and the setup itself.
export const fetchSystemStatus = async () => {
  const { data } = await axios.get<SystemStatus>(`${API_BASE_URL}/system/status`);
  return data;
};

export type SetupInput = { fullName: string; email: string; phone: string; setupToken: string };

export const submitSetup = async (input: SetupInput) => {
  const { data } = await axios.post<{ message: string }>(`${API_BASE_URL}/system/setup`, input);
  return data;
};
