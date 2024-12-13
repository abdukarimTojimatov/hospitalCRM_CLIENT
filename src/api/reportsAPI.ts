// src/api/reportsAPI.ts
import axiosClient from "./axiosClient";

export interface ReportsResponse {
  count: number;
}

export const getDailyReports = async (): Promise<ReportsResponse> => {
  const response = await axiosClient.get<ReportsResponse>("/reports/daily");
  return response.data;
};

export const getMonthlyReports = async (): Promise<ReportsResponse> => {
  const response = await axiosClient.get<ReportsResponse>("/reports/monthly");
  return response.data;
};
