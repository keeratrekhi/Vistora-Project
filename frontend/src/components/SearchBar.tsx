import React from 'react'
import { Link } from 'react-router-dom'
import { CREATE_EVENT_ROUTE, DASHBOARD_ROUTE, ADMIN_EVENTS_ROUTE, PORTFOLIO_INFO_ROUTE } from '../constants/RouteContant'

const Sidebar: React.FC = () => {
    return (
        <>
            <button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" className="fixed top-16 left-0 z-40 flex items-center p-2 mt-2 ms-3 text-sm text-white-500 rounded-lg sm:hidden hover:bg-white-100 focus:outline-none focus:ring-2 focus:ring-white-200 dark:text-white-400 dark:hover:bg-white-700 dark:focus:ring-white-600">
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
            </button>

            <aside id="default-sidebar" className="fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
                <div className="h-full px-3 py-4 overflow-y-auto bg-white-50 dark:bg-[#2C3E50]">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link to={DASHBOARD_ROUTE} className="flex items-center p-2 text-white-900 rounded-lg dark:text-white hover:bg-white-100 dark:hover:bg-white-100 group hover:text-black">
                                <svg className="w-5 h-5 text-white-500 transition duration-75 dark:text-white-100 group-hover:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                </svg>
                                <span className="ms-3">Home</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={ADMIN_EVENTS_ROUTE} className="flex items-center p-2 text-white-900 rounded-lg dark:text-white hover:bg-white-100 dark:hover:bg-white-100 group hover:text-black">
                                <svg className="w-5 h-5 text-white-500 transition duration-75 dark:text-white-100 group-hover:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Events</span>
                                <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-white">3</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={CREATE_EVENT_ROUTE} className="flex items-center p-2 text-white-900 rounded-lg dark:text-white hover:bg-white-100 dark:hover:bg-white-100 group hover:text-black">
                                <svg className="w-5 h-5 text-white-500 transition duration-75 dark:text-white-100 group-hover:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512">
                                    <path d="M512 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l128 0c20.1 0 39.1 9.5 51.2 25.6l19.2 25.6c6 8.1 15.5 12.8 25.6 12.8l160 0c35.3 0 64 28.7 64 64l0 256zM232 376c0 13.3 10.7 24 24 24s24-10.7 24-24l0-64 64 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-64 0 0-64c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 64-64 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l64 0 0 64z"/>
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Create Event</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={PORTFOLIO_INFO_ROUTE} className="flex items-center p-2 text-white-900 rounded-lg dark:text-white hover:bg-white-100 dark:hover:bg-white-100 group hover:text-black">
                                <svg className="w-5 h-5 text-white-500 transition duration-75 dark:text-white-100 group-hover:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 576 512">
                                    <path d="M512 80c8.8 0 16 7.2 16 16l0 320c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16L48 96c0-8.8 7.2-16 16-16l448 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM208 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128zm-32 32c-44.2 0-80 35.8-80 80c0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16c0-44.2-35.8-80-80-80l-64 0zM376 144c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0z"/>
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Portfolio Information</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
