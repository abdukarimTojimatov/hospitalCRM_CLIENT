// src/pages/ReceptionAppointmentsPage.tsx
import React, { useEffect, useState } from "react";
import {
  Appointment,
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../api/appointmentsAPI";
import { getPatients, Patient } from "../api/patientsAPI";
import { getDoctors, Doctor } from "../api/doctorsAPI";

const ReceptionAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState<Omit<Appointment, "_id">>({
    patient: "",
    doctor: "",
    date: "",
    reason: "",
    status: "Scheduled",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch appointments");
    }
  };

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsData, doctorsData] = await Promise.all([
        getPatients(),
        getDoctors(),
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatientsAndDoctors();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAppointment(editingId, form);
        setEditingId(null);
      } else {
        await createAppointment(form);
      }
      setForm({
        patient: "",
        doctor: "",
        date: "",
        reason: "",
        status: "Scheduled",
      });
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment._id);
    setForm({
      patient: appointment.patient,
      doctor: appointment.doctor,
      date: appointment.date,
      reason: appointment.reason,
      status: appointment.status,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteAppointment(id);
        fetchAppointments();
      } catch (err: any) {
        setError(err.response?.data?.error || "Delete failed");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4 text-gray-800 dark:text-white">
        Manage Appointments
      </h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="patient"
            value={form.patient}
            onChange={handleChange}
            required
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select Patient</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
          <select
            name="doctor"
            value={form.doctor}
            onChange={handleChange}
            required
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty}
              </option>
            ))}
          </select>
          <input
            name="date"
            type="datetime-local"
            value={form.date}
            onChange={handleChange}
            required
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Reason"
            required
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {editingId ? "Update Appointment" : "Add Appointment"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                patient: "",
                doctor: "",
                date: "",
                reason: "",
                status: "Scheduled",
              });
            }}
            className="mt-4 ml-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border p-2 dark:border-gray-600">Patient</th>
            <th className="border p-2 dark:border-gray-600">Doctor</th>
            <th className="border p-2 dark:border-gray-600">Date</th>
            <th className="border p-2 dark:border-gray-600">Reason</th>
            <th className="border p-2 dark:border-gray-600">Status</th>
            <th className="border p-2 dark:border-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td className="border p-2 dark:border-gray-600">
                {appointment.patient}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {appointment.doctor}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {new Date(appointment.date).toLocaleString()}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {appointment.reason}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {appointment.status}
              </td>
              <td className="border p-2 dark:border-gray-600">
                <button
                  onClick={() => handleEdit(appointment)}
                  className="mr-2 bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(appointment._id)}
                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center p-4">
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReceptionAppointmentsPage;
