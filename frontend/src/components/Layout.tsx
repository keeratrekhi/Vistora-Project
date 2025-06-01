
import React from 'react'
import Navbar from './layout/Navbar'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-1 pt-16"> {/* Add pt-16 for navbar height */}
                <Sidebar />
                <div className="flex-1 sm:ml-64">
                    <div className="bg-gradient-to-b from-pink-100 via-slate-100 to-blue-100 min-h-[calc(100vh-4rem)] p-5">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Layout