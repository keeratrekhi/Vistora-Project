import React from "react";
import Navbar from "./Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useDispatch } from "react-redux";
import { SignOutSuccess } from "@/redux/user/slice";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleProfileClick = () => {
    navigate("/profile/:id");
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(SignOutSuccess());
        console.log("Logged out successfully");
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Navbar onProfileClick={handleProfileClick} onLogout={handleLogout} />
      <Sidebar />
      <main className="pt-16 ml-64 min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
