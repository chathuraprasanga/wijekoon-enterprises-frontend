import { axiosClient } from '@/api/axiosClient';
import type { PagedResponse } from '@/types/api';
import type { Role, SafeUser } from '@/types/user';

// Deliberately not used: GET /users returns the full unpaginated collection.
// Always use getPaged for list/table views.

export interface GetPagedParams {
  page: number;
  limit: number;
}

export const getPaged = async ({
  page,
  limit,
}: GetPagedParams): Promise<PagedResponse<SafeUser>> => {
  const { data } = await axiosClient.get<PagedResponse<SafeUser>>('/users/paged', {
    params: { page, limit },
  });
  return data;
};

export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  phone: string;
  email: string;
  role: Role;
}

export const createUser = async (payload: CreateUserPayload): Promise<SafeUser> => {
  const { data } = await axiosClient.post<SafeUser>('/users', payload);
  return data;
};

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<SafeUser> => {
  const { data } = await axiosClient.patch<SafeUser>(`/users/${id}`, payload);
  return data;
};

export const changeUserRole = async (id: string, role: Role): Promise<SafeUser> => {
  const { data } = await axiosClient.patch<SafeUser>(`/users/${id}/role`, { role });
  return data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosClient.delete<{ message: string }>(`/users/${id}`);
  return data;
};
