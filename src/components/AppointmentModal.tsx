import React, { useState, useEffect } from "react";
import Select, { SingleValue } from "react-select";
import {
  Patient,
  Doctor,
  Appointment,
  AppointmentPayload,
} from "../api/appointmentsAPI";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: AppointmentPayload) => Promise<void>;
  patients: Patient[];
  doctors: Doctor[];
  initialAppointment?: Appointment | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patients,
  doctors,
  initialAppointment = null,
}) => {
  const [form, setForm] = useState<AppointmentPayload>({
    patient: null,
    doctor: null,
    reason: "",
    status: "Scheduled",
    queuePosition: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or initial appointment changes
  useEffect(() => {
    if (initialAppointment) {
      setForm({
        patient: initialAppointment.patient?._id || null,
        doctor: initialAppointment.doctor?._id || null,
        reason: initialAppointment.reason,
        status: initialAppointment.status,
        queuePosition: initialAppointment.queuePosition,
      });
    } else {
      // Reset to default when no initial appointment
      setForm({
        patient: null,
        doctor: null,
        reason: "",
        status: "Scheduled",
        queuePosition: 0,
      });
    }
  }, [initialAppointment, isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!form.patient || !form.doctor) {
      setError("Please select both a patient and a doctor.");
      return;
    }

    try {
      await onSubmit(form);
      onClose(); // Close modal on successful submission
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  // If modal is not open, return null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none dark:bg-gray-800 focus:outline-none">
          {/* Modal Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t dark:border-gray-700">
            <h3 className="text-2xl font-semibold">
              {initialAppointment ? "Edit Appointment" : "Add New Appointment"}
            </h3>
            <button
              className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 dark:text-white focus:outline-none"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="relative flex-auto p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 text-red-500 dark:text-red-400">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Patient Selection */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Patient
                </label>
                <Select
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
                  onChange={(
                    selectedOption: SingleValue<{
                      label: string;
                      value: string;
                    }>
                  ) => {
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
                  onChange={(
                    selectedOption: SingleValue<{
                      label: string;
                      value: string;
                    }>
                  ) => {
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
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
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
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as AppointmentPayload["status"],
                    })
                  }
                  required
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-6 border-t border-solid rounded-b dark:border-gray-700">
              <button
                type="button"
                className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-red-500 uppercase transition-all duration-150 ease-linear outline-none background-transparent focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none bg-blue-500 hover:bg-blue-600 focus:outline-none"
              >
                {initialAppointment ? "Update Appointment" : "Add Appointment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
