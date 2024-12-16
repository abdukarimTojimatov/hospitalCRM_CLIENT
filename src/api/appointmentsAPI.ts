import axiosClient from "./axiosClient";

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
}

export interface Appointment {
  _id: string;
  patient: Patient | null; // Allow null for form initialization
  doctor: Doctor | null;
  date: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  queuePosition: number;
  createdAt: string | null;
  updatedAt: string | null;
}

// New interface for creating/updating appointments with only _id for patient and doctor
export interface AppointmentPayload {
  patient: string | null; // Only _id
  doctor: string | null; // Only _id
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  queuePosition: number;
}

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await axiosClient.get<Appointment[]>("/appointments");
  return response.data;
};

export const createAppointment = async (
  appointment: AppointmentPayload
): Promise<Appointment> => {
  const response = await axiosClient.post<Appointment>(
    "/appointments",
    appointment
  );
  return response.data;
};

export const updateAppointment = async (
  id: string,
  appointment: Partial<AppointmentPayload>
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
