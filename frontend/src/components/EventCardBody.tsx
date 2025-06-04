
import React from 'react'
import EventCardActionButtons from './EventCardActionButtons'
import { Image, UserRound, Video } from 'lucide-react'
import CustomBadge from './CustomBadge'

interface EventCardBodyProps {
  onDelete: () => void; // Add onDelete prop
}

const EventCardBody: React.FC<EventCardBodyProps> = ({ 
  onDelete // Destructure onDelete
}) => {
  return (
    <>
      <div className='flex mb-3'>
        <CustomBadge text={'10'} icon={<Image size={15} />} />
        <CustomBadge text={'5'} icon={<Video size={15} />} />
        <CustomBadge text='1' icon={<UserRound size={15} />} />
      </div>
      <div className='flex mt-6'>
        <EventCardActionButtons onDelete={onDelete} /> {/* Pass onDelete */}
      </div>
    </>
  )
}

export default EventCardBody