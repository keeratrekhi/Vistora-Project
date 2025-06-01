// components/EventCardActionButtons.tsx
import React from 'react'

import { ArrowUpFromLine, Settings, Share2, Trash, UserRoundPlus } from 'lucide-react'
import { EventCardActionButton } from './EventCardActionButton';

// components/EventCardActionButtons.tsx
interface EventCardActionButtonsProps {
  onDelete: () => void;
}

const EventCardActionButtons: React.FC<EventCardActionButtonsProps> = ({ 
  onDelete
}) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <>
      <EventCardActionButton icon={<UserRoundPlus size={18} />} />
      <EventCardActionButton icon={<ArrowUpFromLine size={18} />} />
      <EventCardActionButton icon={<Share2 size={18} />} />
      <EventCardActionButton icon={<Settings size={18} />} />
      <EventCardActionButton 
        icon={<Trash size={18} />} 
        onClick={handleDeleteClick}
      />
    </>
  );
};
export default EventCardActionButtons