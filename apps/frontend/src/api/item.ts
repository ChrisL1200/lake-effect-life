import axios, { AxiosResponse } from "axios";
import GroupedItem from "../models/groupedItem.model";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const getGroupedItems = async () => {
  const response: AxiosResponse = await axios.get(`${API_BASE_URL}/grouped-items`);
  return response.data.data as GroupedItem[];
};

export default { getGroupedItems };
