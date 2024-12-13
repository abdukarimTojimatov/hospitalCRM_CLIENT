// src/pages/AdminDoctorPage.tsx
import React, { useEffect, useState } from "react";
import {
  Doctor,
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../api/doctorsAPI";

const AdminDoctorPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState<Omit<Doctor, "_id">>({
    firstName: "",
    lastName: "",
    specialty: "",
    contactNumber: "",
    email: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch doctors");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoctor(editingId, form);
        setEditingId(null);
      } else {
        await createDoctor(form);
      }
      setForm({
        firstName: "",
        lastName: "",
        specialty: "",
        contactNumber: "",
        email: "",
      });
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingId(doctor._id);
    setForm({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialty: doctor.specialty,
      contactNumber: doctor.contactNumber,
      email: doctor.email || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await deleteDoctor(id);
        fetchDoctors();
      } catch (err: any) {
        setError(err.response?.data?.error || "Delete failed");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4 text-gray-800 dark:text-white">
        Manage Doctors
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
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            placeholder="Specialty"
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
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {editingId ? "Update Doctor" : "Add Doctor"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                firstName: "",
                lastName: "",
                specialty: "",
                contactNumber: "",
                email: "",
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
            <th className="border p-2 dark:border-gray-600">Specialty</th>
            <th className="border p-2 dark:border-gray-600">Contact Number</th>
            <th className="border p-2 dark:border-gray-600">Email</th>
            <th className="border p-2 dark:border-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor._id}>
              <td className="border p-2 dark:border-gray-600">
                {doctor.firstName}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {doctor.lastName}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {doctor.specialty}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {doctor.contactNumber}
              </td>
              <td className="border p-2 dark:border-gray-600">
                {doctor.email}
              </td>
              <td className="border p-2 dark:border-gray-600">
                <button
                  onClick={() => handleEdit(doctor)}
                  className="mr-2 bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doctor._id)}
                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {doctors.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center p-4">
                No doctors found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDoctorPage;
