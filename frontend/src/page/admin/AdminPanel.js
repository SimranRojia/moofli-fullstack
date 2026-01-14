import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../config";
import { Sidebar } from "../../component/sideBar/sideBar";
import { MobileNavbar } from "../../component/Navbar/MobileNavbar";
import { motion } from "framer-motion";

// Default profile SVG
const DefaultAvatar = () => (
  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center border">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-slate-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5.121 17.804A9 9 0 1118.364 4.56M12 14a5 5 0 100-10 5 5 0 000 10zm-7 8a7 7 0 0114 0H5z"
      />
    </svg>
  </div>
);

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch {
      toast.error("Not authorized");
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Error deleting user");
    }
  };

  const makeAdmin = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/users/${id}/make-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User promoted");
      fetchUsers();
    } catch {
      toast.error("Error promoting user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <MobileNavbar />

      <main className="lg:pl-[256px] p-6 sm:p-10">
        {/* Header */}
        <motion.h1
          className="text-4xl font-bold font-['Fredoka_One'] text-slate-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Admin Panel
        </motion.h1>

        <p className="mt-2 text-slate-500">Manage users and admin access.</p>

        {/* Stats */}
        <motion.div
          className="mt-8 bg-white p-6 rounded-2xl shadow-lg border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-2xl font-bold text-slate-800">Total Users</h2>
          <p className="text-5xl font-extrabold text-green-600 mt-3">
            {users.length}
          </p>
        </motion.div>

        {/* Desktop Table - Hidden on Mobile */}
        <div className="hidden lg:block mt-10 bg-white rounded-2xl shadow-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="p-4 text-left font-semibold text-slate-600">User</th>
                  <th className="p-4 text-left font-semibold text-slate-600">Email</th>
                  <th className="p-4 text-left font-semibold text-slate-600">Joined On</th>
                  <th className="p-4 text-left font-semibold text-slate-600">Admin?</th>
                  <th className="p-4 text-left font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u, index) => (
                  <motion.tr
                    key={u._id}
                    className="border-b hover:bg-slate-50"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="p-4 flex items-center gap-4">
                      {u.profilePicture ? (
                        <img
                          src={u.profilePicture}
                          className="h-12 w-12 rounded-full border object-cover"
                        />
                      ) : (
                        <DefaultAvatar />
                      )}
                      <span className="font-semibold">{u.username}</span>
                    </td>

                    <td className="p-4">{u.email}</td>

                    <td className="p-4">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </td>

                    <td className="p-4 font-bold">
                      {u.isAdmin ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-500">No</span>
                      )}
                    </td>

                    <td className="p-4 flex gap-3">
                      {!u.isAdmin && (
                        <button
                          onClick={() => makeAdmin(u._id)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Make Admin
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="lg:hidden mt-10 space-y-6">
          {users.map((u, index) => (
            <motion.div
              key={u._id}
              className="bg-white p-5 rounded-2xl border shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-4">
                {u.profilePicture ? (
                  <img
                    src={u.profilePicture}
                    className="h-14 w-14 rounded-full border object-cover"
                  />
                ) : (
                  <DefaultAvatar />
                )}

                <div>
                  <p className="text-lg font-semibold">{u.username}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>
              </div>

              <p className="mt-4 text-sm">
                <span className="font-semibold">Joined:</span>{" "}
                {new Date(u.createdAt).toLocaleDateString()}
              </p>

              <p className="mt-1 text-sm">
                <span className="font-semibold">Admin:</span>{" "}
                {u.isAdmin ? "Yes" : "No"}
              </p>

              {/* Mobile Action Buttons */}
              <div className="mt-4 flex gap-3">
                {!u.isAdmin && (
                  <button
                    onClick={() => makeAdmin(u._id)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold"
                  >
                    Make Admin
                  </button>
                )}

                <button
                  onClick={() => deleteUser(u._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-xl font-semibold"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
