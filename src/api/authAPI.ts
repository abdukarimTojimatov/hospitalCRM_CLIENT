// src/api/authAPI.ts
import axiosClient from "./axiosClient";

interface LoginResponse {
  token: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  console.log("response::::::::::", response);
  return response.data;
};
