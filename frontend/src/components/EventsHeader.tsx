
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CREATE_EVENT_ROUTE } from '../constants/RouteContant';

const EventsHeader: React.FC = () => {

    const navigate = useNavigate();

    return (
        <div className='w-full flex justify-between items-center py-5'>
            <div className='flex justify-center items-center'>
                <h1 className='font-medium text-2xl tracking-wide text-gray-800'>My Events</h1>
            </div>  
            <button className="text-white bg-gray-700 hover:bg-gray-800 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800 cursor-pointer" onClick={() => navigate(CREATE_EVENT_ROUTE)}>Create Event</button>
        </div>
    )
}

export default EventsHeader