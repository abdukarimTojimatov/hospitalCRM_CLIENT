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

export interface AppointmentPayload {
  patient: string | null; // Only _id
  doctor: string | null; // Only _id
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  queuePosition: number;
}

export interface PaginatedAppointments {
  docs: Appointment[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface AppointmentQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// Modify the getAppointments function to support pagination
export const getAppointments = async (params: AppointmentQueryParams = {}) => {
  const { page, limit } = params;

  try {
    const response = await axiosClient.get("/appointments", {
      params: {
        page,
        limit,
      },
    });
    return response.data as PaginatedAppointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
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
