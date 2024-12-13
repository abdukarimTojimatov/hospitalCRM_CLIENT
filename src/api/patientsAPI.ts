// src/api/patientsAPI.ts
import axiosClient from "./axiosClient";

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dob: string;
  contactNumber: string;
  email?: string;
  address?: Address;
}

export const getPatients = async (): Promise<Patient[]> => {
  const response = await axiosClient.get<Patient[]>("/patients");
  return response.data;
};

export const createPatient = async (
  patient: Omit<Patient, "_id">
): Promise<Patient> => {
  const response = await axiosClient.post<Patient>("/patients", patient);
  return response.data;
};

export const updatePatient = async (
  id: string,
  patient: Partial<Omit<Patient, "_id">>
): Promise<Patient> => {
  const response = await axiosClient.put<Patient>(`/patients/${id}`, patient);
  return response.data;
};

export const deletePatient = async (id: string): Promise<void> => {
  await axiosClient.delete(`/patients/${id}`);
};
