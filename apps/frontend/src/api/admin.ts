import axios from "axios";
import GroupedItem from "../models/groupedItem.model";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
export const ADMIN_TOKEN_KEY = "lel_admin_token";
const ADMIN_AUTH_DISABLED = import.meta.env.VITE_ADMIN_AUTH_DISABLED === "true";

export interface AdminInventoryListParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: "id" | "type" | "gender" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
}

export interface AdminInventoryListResponse {
  data: GroupedItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type AdminLookupCategory = "types" | "genders" | "colors" | "sizes";

export interface AdminInventoryLookups {
  types: string[];
  genders: string[];
  colors: string[];
  sizes: string[];
}

const getAuthHeaders = (token: string) => {
  if (!token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getStoredToken = () =>
  ADMIN_AUTH_DISABLED ? "" : localStorage.getItem(ADMIN_TOKEN_KEY) || "";

const setStoredToken = (token: string) => {
  if (ADMIN_AUTH_DISABLED) {
    return;
  }
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

const clearStoredToken = () => {
  if (ADMIN_AUTH_DISABLED) {
    return;
  }
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

const login = async (email: string, password: string): Promise<string> => {
  if (ADMIN_AUTH_DISABLED) {
    return "";
  }

  const response = await axios.post(`${API_BASE_URL}/admin/auth/login`, {
    email,
    password,
  });

  return response.data.token;
};

const getInventory = async (
  token: string,
  params: AdminInventoryListParams,
): Promise<AdminInventoryListResponse> => {
  const response = await axios.get(
    `${API_BASE_URL}/admin/inventory`,
    {
      ...getAuthHeaders(token),
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        sortBy: params.sortBy || "createdAt",
        sortDirection: params.sortDirection || "desc",
      },
    },
  );
  return response.data;
};

const getInventoryById = async (token: string, id: string): Promise<GroupedItem> => {
  const response = await axios.get(
    `${API_BASE_URL}/admin/inventory/${encodeURIComponent(id)}`,
    getAuthHeaders(token),
  );
  return response.data.data;
};

const getInventoryLookups = async (token: string): Promise<AdminInventoryLookups> => {
  const response = await axios.get(
    `${API_BASE_URL}/admin/lookups`,
    getAuthHeaders(token),
  );
  return response.data;
};

const createInventoryLookupValue = async (
  token: string,
  category: AdminLookupCategory,
  value: string,
): Promise<AdminInventoryLookups> => {
  const response = await axios.post(
    `${API_BASE_URL}/admin/lookups/${category}`,
    { value },
    getAuthHeaders(token),
  );
  return response.data;
};

const deleteInventoryLookupValue = async (
  token: string,
  category: AdminLookupCategory,
  value: string,
): Promise<AdminInventoryLookups> => {
  const response = await axios.delete(
    `${API_BASE_URL}/admin/lookups/${category}/${encodeURIComponent(value)}`,
    getAuthHeaders(token),
  );
  return response.data;
};

const createInventory = async (
  token: string,
  payload: GroupedItem,
): Promise<GroupedItem> => {
  const response = await axios.post(
    `${API_BASE_URL}/admin/inventory`,
    payload,
    getAuthHeaders(token),
  );
  return response.data.data;
};

const updateInventory = async (
  token: string,
  id: string,
  payload: GroupedItem,
): Promise<GroupedItem> => {
  const response = await axios.put(
    `${API_BASE_URL}/admin/inventory/${id}`,
    payload,
    getAuthHeaders(token),
  );
  return response.data.data;
};

const deleteInventory = async (token: string, id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/admin/inventory/${id}`, getAuthHeaders(token));
};

const uploadInventoryImage = async (token: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axios.post(
    `${API_BASE_URL}/admin/inventory/upload-image`,
    formData,
    getAuthHeaders(token),
  );
  return response.data.imageUrl;
};

export default {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  login,
  getInventory,
  getInventoryById,
  getInventoryLookups,
  createInventoryLookupValue,
  deleteInventoryLookupValue,
  createInventory,
  updateInventory,
  deleteInventory,
  uploadInventoryImage,
};
