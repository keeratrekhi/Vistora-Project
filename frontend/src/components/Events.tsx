import React, { useEffect, useState } from 'react'
import EventsHeader from './EventsHeader'
import { Event } from '../models/Event'
import { getAllEvents } from '../services/EventsService'
import ImageCard from './ImageCard'
import EventCardBody from './EventCardBody'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/authVerify'
import { LOGIN_ROUTE } from '../constants/RouteContant'

const Events: React.FC = () => {

    const [events, setEvents] = useState<Event[]>([]);

    const navigate = useNavigate();
    
    useEffect(() => {
        if (!isAuthenticated())
          navigate(LOGIN_ROUTE, { replace: true });

        getAllEvents()
            .then(_ => setEvents(_))
            .catch(_ => console.error("Error occured while fetching events"));
    }, [])


    // const events = [{
    //     id: 1,
    //     title: "Event 1",
    //     image: "https://th.bing.com/th?id=OIP.6Axh0-PYY8UQVpfS08w3gwHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
    //     date: "Wednesday, March 5, 2025"
    // },
    // {
    //     id: 2,
    //     title: "Event 2",
    //     image: "https://th.bing.com/th?id=OIP.Mvcr0QDsGXOx29cSBfXd6AHaE7&w=306&h=204&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
    //     date: "Friday, March 7, 2025"
    // },
    // {
    //     id: 3,
    //     title: "Event 3",
    //     image: "https://th.bing.com/th?id=OIP.EfKuvd8N9o-aNDIH2JF7aAHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
    //     date: "Friday, March 7, 2025"
    // }
    // ]

    const eventCards = events.map(_ => {
        return (
            <EventCard key={_.id} event={_} />
        )
    })

    return (
        <div>
            <EventsHeader />
            <div className='bg-gray-400 h-[0.1px]'></div>
            <div className='mt-5 flex justify-start items-center gap-5 font-medium tracking-wide'>
                <div className='cursor-pointer'>All</div>
                <div className='cursor-pointer'>Published</div>
                <div className='cursor-pointer'>Unpublished</div>
            </div>
            <div className='mt-7 flex flex-wrap justify-start gap-5 items-center'>
                {eventCards}
            </div>
        </div>
    )
}

export default Events;

interface EventCardProps {
    event: any
}

const EventCard: React.FC<EventCardProps> = ({ event }: EventCardProps) => {
    return (
        <ImageCard imageURL={event.image} title={event.title} description={event.date} body={<EventCardBody />} />
    )
}
