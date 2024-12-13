// src/api/doctorsAPI.ts
import axiosClient from "./axiosClient";

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  contactNumber: string;
  email?: string;
}

export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await axiosClient.get<Doctor[]>("/doctors");
  return response.data;
};

export const createDoctor = async (
  doctor: Omit<Doctor, "_id">
): Promise<Doctor> => {
  const response = await axiosClient.post<Doctor>("/doctors", doctor);
  return response.data;
};

export const updateDoctor = async (
  id: string,
  doctor: Partial<Omit<Doctor, "_id">>
): Promise<Doctor> => {
  const response = await axiosClient.put<Doctor>(`/doctors/${id}`, doctor);
  return response.data;
};

export const deleteDoctor = async (id: string): Promise<void> => {
  await axiosClient.delete(`/doctors/${id}`);
};
