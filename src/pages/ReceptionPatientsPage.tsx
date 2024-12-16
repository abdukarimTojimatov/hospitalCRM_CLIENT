// src/pages/ReceptionPatientsPage.tsx
import React, { useEffect, useState } from "react";
import {
  Patient,
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../api/patientsAPI";

const ReceptionPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<Omit<Patient, "_id">>({
    firstName: "",
    lastName: "",
    dob: "",
    contactNumber: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch patients");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePatient(editingId, form);
        setEditingId(null);
      } else {
        console.log("form:::::::::", form);
        await createPatient(form);
      }
      setForm({
        firstName: "",
        lastName: "",
        dob: "",
        contactNumber: "",
        email: "",
        address: {
          street: "",
          city: "",
          state: "",
          zip: "",
        },
      });
      fetchPatients();
    } catch (err: any) {
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingId(patient._id);
    setForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dob: patient.dob,
      contactNumber: patient.contactNumber,
      email: patient.email || "",
      address: {
        street: patient.address?.street || "",
        city: patient.address?.city || "",
        state: patient.address?.state || "",
        zip: patient.address?.zip || "",
      },
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(id);
        fetchPatients();
      } catch (err: any) {
        setError(err.response?.data?.error || "Delete failed");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4 text-gray-800 dark:text-white">
        Manage Patients
      </h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
            placeholder="Date of Birth"
            required
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="Contact Number"
            required
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {/* Address Fields */}
          <input
            name="address.street"
            value={form.address?.street}
            onChange={handleChange}
            placeholder="Street"
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="address.city"
            value={form.address?.city}
            onChange={handleChange}
            placeholder="City"
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="address.state"
            value={form.address?.state}
            onChange={handleChange}
            placeholder="State"
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="address.zip"
            value={form.address?.zip}
            onChange={handleChange}
            placeholder="ZIP Code"
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {editingId ? "Update Patient" : "Add Patient"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                firstName: "",
                lastName: "",
                dob: "",
                contactNumber: "",
                email: "",
                address: {
                  street: "",
                  city: "",
                  state: "",
                  zip: "",
                },
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
            <th className="border p-2 dark:border-gray-600">First Name</th>
            <th className="border p-2 dark:border-gray-600">Last Name</th>
            <th className="border p-2 dark:border-gray-600">DOB</th>
            <th className="border p-2 dark:border-gray-600">Contact Number</th>
            <th className="border p-2 dark:border-gray-600">Email</th>
            <th className="border p-2 dark:border-gray-600">Address</th>
            <th className="border p-2 dark:border-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient._id}>
              <td className="border p-2 dark:border-gray-600">
                {patient.firstName}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {patient.lastName}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {new Date(patient.dob).toLocaleDateString()}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {patient.contactNumber}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {patient.email}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {patient.address?.street}, {patient.address?.city},{" "}
                {patient.address?.state} {patient.address?.zip}
              </td>
              <td className="border p-2 dark:border-gray-600">
                <button
                  onClick={() => handleEdit(patient)}
                  className="mr-2 bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(patient._id)}
                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {patients.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center p-4">
                No patients found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReceptionPatientsPage;
