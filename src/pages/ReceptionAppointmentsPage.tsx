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
import AppointmentModal from "../components/AppointmentModal"; // Import the new modal
import * as XLSX from "xlsx";

interface SelectOption {
  label: string;
  value: string;
}
const ReceptionAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

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

  // State for modal and editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: "",
    patientId: "",
    doctorId: "",
    startDate: "",
    endDate: "",
  });

  // Fetch appointments from the backend
  const fetchAppointments = async (page = 1, limit = 10) => {
    try {
      const data = await getAppointments({
        page,
        limit,
        status: filters.status,
        patientId: filters.patientId,
        doctorId: filters.doctorId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      setAppointmentsData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch appointments");
    }
  };

  const exportToExcel = async () => {
    try {
      // Fetch ALL appointments without pagination
      const allAppointmentsData = await getAppointments({
        page: 1,
        limit: 100000, // A very large number to get all appointments
        status: filters.status,
        patientId: filters.patientId,
        doctorId: filters.doctorId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      // Transform appointments data for Excel
      const excelData = allAppointmentsData.docs.map((appointment) => ({
        "Patient Name": appointment.patient
          ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
          : "Unknown Patient",
        "Doctor Name": appointment.doctor
          ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
          : "Unknown Doctor",
        "Appointment Date": appointment.createdAt
          ? new Date(appointment.createdAt).toLocaleString()
          : "Invalid Date",
        Reason: appointment.reason || "",
        Status: appointment.status || "",
        "Queue Position": appointment.queuePosition || "N/A",
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Create workbook and add worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");

      // Generate Excel file
      XLSX.writeFile(
        workbook,
        `Appointments_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to export appointments");
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

  // Pagination effect
  useEffect(() => {
    fetchAppointments(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Socket connection effect
  useEffect(() => {
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

  // Handle appointment submission (create or update)
  const handleAppointmentSubmit = async (
    appointmentData: AppointmentPayload
  ) => {
    try {
      if (editingAppointment) {
        // Update existing appointment
        await updateAppointment(editingAppointment._id, appointmentData);
      } else {
        // Create new appointment
        await createAppointment(appointmentData);
      }

      // Refetch appointments to get latest data
      fetchAppointments(currentPage, pageSize);

      // Close modal and reset editing state
      setIsModalOpen(false);
      setEditingAppointment(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  // Open modal for editing an appointment
  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  // Delete an appointment
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteAppointment(id);
        fetchAppointments(currentPage, pageSize);
      } catch (err: any) {
        setError(err.response?.data?.error || "Delete failed");
      }
    }
  };

  // Pagination change handlers (existing code)
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: "",
      patientId: "",
      doctorId: "",
      startDate: "",
      endDate: "",
    });
    fetchAppointments(1, pageSize);
  };

  // Rendering methods remain the same as in the previous implementation
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

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded">
          {/* Status Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          {/* Patient Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Patient
            </label>
            <Select
              value={
                filters.patientId
                  ? {
                      label: `${
                        patients.find((p) => p._id === filters.patientId)
                          ?.firstName
                      } ${
                        patients.find((p) => p._id === filters.patientId)
                          ?.lastName
                      }`,
                      value: filters.patientId,
                    }
                  : null
              }
              onChange={(selectedOption: SingleValue<SelectOption>) => {
                setFilters((prev) => ({
                  ...prev,
                  patientId: selectedOption?.value || "",
                }));
              }}
              options={patients.map((patient) => ({
                label: `${patient.firstName} ${patient.lastName}`,
                value: patient._id,
              }))}
              placeholder="Select Patient"
            />
          </div>
          {/* Doctor Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Doctor
            </label>
            <Select
              value={
                filters.doctorId
                  ? {
                      label: `Dr. ${
                        doctors.find((d) => d._id === filters.doctorId)
                          ?.firstName
                      } ${
                        doctors.find((d) => d._id === filters.doctorId)
                          ?.lastName
                      }`,
                      value: filters.doctorId,
                    }
                  : null
              }
              onChange={(selectedOption: SingleValue<SelectOption>) => {
                setFilters((prev) => ({
                  ...prev,
                  doctorId: selectedOption?.value || "",
                }));
              }}
              options={doctors.map((doctor) => ({
                label: `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialty}`,
                value: doctor._id,
              }))}
              placeholder="Select Doctor"
            />
          </div>
          {/* Date Range Filters */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="p-6">
          <button
            onClick={() => fetchAppointments(currentPage, pageSize)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300 ml-2"
          >
            Clear Filters
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 ml-2"
          >
            Export to Excel
          </button>
        </div>

        {/* Add Appointment Button */}
        <div className="p-6">
          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            Add New Appointment
          </button>
        </div>

        {/* Existing Appointments Table */}
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
                    Queue
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
                {appointmentsData.docs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
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

        {/* Appointment Modal */}
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAppointment(null);
          }}
          onSubmit={handleAppointmentSubmit}
          patients={patients}
          doctors={doctors}
          initialAppointment={editingAppointment}
        />
      </div>
    </div>
  );
};

export default ReceptionAppointmentsPage;
