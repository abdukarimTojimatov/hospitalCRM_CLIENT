// src/api/appointmentsAPI.ts
import axiosClient from "./axiosClient";

export interface Appointment {
  _id: string;
  patient: string; // Patient ID
  doctor: string; // Doctor ID
  date: string;
  reason: string;
  status: string;
}

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await axiosClient.get<Appointment[]>("/appointments");
  return response.data;
};

export const createAppointment = async (
  appointment: Omit<Appointment, "_id">
): Promise<Appointment> => {
  const response = await axiosClient.post<Appointment>(
    "/appointments",
    appointment
  );
  return response.data;
};

export const updateAppointment = async (
  id: string,
  appointment: Partial<Omit<Appointment, "_id">>
): Promise<Appointment> => {
  const response = await axiosClient.put<Appointment>(
    `/appointments/${id}`,
    appointment
  );
  return response.data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await axiosClient.delete(`/appointments/${id}`);
};
