import React, { useEffect, useState } from "react";
import {
  Appointment,
  AppointmentPayload,
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  PaginatedAppointments,
} from "../api/appointmentsAPI";
import { getPatients, Patient } from "../api/patientsAPI";
import { getDoctors, Doctor } from "../api/doctorsAPI";
import { io, Socket } from "socket.io-client";
import Select, { SingleValue } from "react-select";

interface SelectOption {
  label: string;
  value: string;
}

const ReceptionAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState<AppointmentPayload>({
    patient: null,
    doctor: null,
    reason: "",
    status: "Scheduled",
    queuePosition: 0,
  });

  const [appointmentsData, setAppointmentsData] =
    useState<PaginatedAppointments>({
      docs: [],
      totalDocs: 0,
      limit: 10,
      page: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
    });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State for tracking which appointment is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments from the backend
  const fetchAppointments = async (page = 1, limit = 10) => {
    try {
      const data = await getAppointments({
        page,
        limit,
      });
      setAppointmentsData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch appointments");
    }
  };

  // Fetch patients and doctors lists
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

  // Initial data fetch when component mounts
  useEffect(() => {
    fetchAppointments();
    fetchPatientsAndDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatientsAndDoctors();

    const socket: Socket = io("http://localhost:3000", {
      withCredentials: true,
      extraHeaders: {
        "my-custom-header": "abcd",
      },
    });
    socket.on("appointments", (updatedAppointments: Appointment[]) => {
      setAppointments(updatedAppointments);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  const renderPagination = () => {
    const { page, totalPages, hasNextPage, hasPrevPage } = appointmentsData;

    return (
      <div className="flex justify-between items-center mt-4 px-6">
        <div className="flex items-center space-x-2">
          <span>Page Size:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="p-2 border rounded"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={!hasPrevPage}
            className={`px-4 py-2 border rounded ${
              !hasPrevPage
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Previous
          </button>
          <span className="self-center">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasNextPage}
            className={`px-4 py-2 border rounded ${
              !hasNextPage
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "patient" || name === "doctor") {
      setForm((prevForm) => ({ ...prevForm, [name]: value || null }));
    } else {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!form.patient || !form.doctor) {
      setError("Please select both a patient and a doctor.");
      return;
    }
    try {
      if (editingId) {
        // Update existing appointment
        await updateAppointment(editingId, form);
        setEditingId(null);
      } else {
        // Create new appointment
        await createAppointment(form);
      }

      setForm({
        patient: null,
        doctor: null,
        reason: "",
        status: "Scheduled",
        queuePosition: 0,
      });

      // Refetch appointments to get latest data
      fetchAppointments();

      // Clear any previous errors
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  // Prepare an appointment for editing
  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment._id);
    setForm({
      patient: appointment.patient?._id || null,
      doctor: appointment.doctor?._id || null,
      reason: appointment.reason,
      status: appointment.status,
      queuePosition: appointment.queuePosition,
    });
  };

  // Delete an appointment
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

  // Cancel editing and reset form
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      patient: null,
      doctor: null,
      reason: "",
      status: "Scheduled",
      queuePosition: 0,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Manage Appointments
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Appointment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Patient Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Patient
              </label>
              <Select
                name="patient"
                value={
                  form.patient
                    ? {
                        label: `${
                          patients.find((p) => p._id === form.patient)
                            ?.firstName || ""
                        } ${
                          patients.find((p) => p._id === form.patient)
                            ?.lastName || ""
                        }`,
                        value: form.patient,
                      }
                    : null
                }
                onChange={(selectedOption: SingleValue<SelectOption>) => {
                  setForm((prevForm) => ({
                    ...prevForm,
                    patient: selectedOption?.value || null,
                  }));
                }}
                options={patients.map((patient) => ({
                  label: `${patient.firstName} ${patient.lastName}`,
                  value: patient._id,
                }))}
                placeholder="Select Patient"
              />
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Doctor
              </label>
              <Select
                name="doctor"
                value={
                  form.doctor
                    ? {
                        label: `Dr. ${
                          doctors.find((d) => d._id === form.doctor)
                            ?.firstName || ""
                        } ${
                          doctors.find((d) => d._id === form.doctor)
                            ?.lastName || ""
                        } - ${
                          doctors.find((d) => d._id === form.doctor)
                            ?.specialty || ""
                        }`,
                        value: form.doctor,
                      }
                    : null
                }
                onChange={(selectedOption: SingleValue<SelectOption>) => {
                  setForm((prevForm) => ({
                    ...prevForm,
                    doctor: selectedOption?.value || null,
                  }));
                }}
                options={doctors.map((doctor) => ({
                  label: `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialty}`,
                  value: doctor._id,
                }))}
                placeholder="Select Doctor"
              />
            </div>

            {/* Reason Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason
              </label>
              <input
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Appointment Reason"
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Status Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
            >
              {editingId ? "Update Appointment" : "Add Appointment"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Appointments Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left border dark:border-gray-600">
                    Patient
                  </th>
                  <th className="p-3 text-left border dark:border-gray-600">
                    Doctor
                  </th>
                  <th className="p-3 text-left border dark:border-gray-600">
                    Date
                  </th>
                  <th className="p-3 text-left border dark:border-gray-600">
                    Reason
                  </th>
                  <th className="p-3 text-left border dark:border-gray-600">
                    Status
                  </th>
                  <th className="p-3 text-left border dark:border-gray-600">
                    QueuePositions
                  </th>
                  <th className="p-3 text-left border dark:border-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointmentsData.docs.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-3 border dark:border-gray-600">
                      {appointment.patient
                        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                        : "Unknown Patient"}
                    </td>
                    <td className="p-3 border dark:border-gray-600">
                      {appointment.doctor
                        ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                        : "Unknown Doctor"}
                    </td>
                    <td className="p-3 border dark:border-gray-600">
                      {appointment?.createdAt &&
                      !isNaN(new Date(appointment?.createdAt).getTime())
                        ? new Date(appointment?.createdAt).toLocaleString()
                        : "Invalid Date"}
                    </td>

                    <td className="p-3 border dark:border-gray-600">
                      {appointment.reason}
                    </td>
                    <td className="p-3 border dark:border-gray-600">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          appointment.status === "Scheduled"
                            ? "bg-yellow-100 text-yellow-800"
                            : appointment.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="p-3 border dark:border-gray-600">
                      {appointment.queuePosition}
                    </td>
                    <td className="p-3 border dark:border-gray-600">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(appointment._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* No Appointments Message */}
                {appointmentsData.docs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center p-4 text-gray-500 dark:text-gray-400"
                    >
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {renderPagination()}
      </div>
    </div>
  );
};

export default ReceptionAppointmentsPage;
