// components/EventCardActionButton.tsx
interface EventCardActionButtonProps {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export const EventCardActionButton: React.FC<EventCardActionButtonProps> = ({ 
  icon, 
  onClick
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    e.preventDefault(); // Prevent default behavior
    onClick?.(e);
  };

  return (
    <button 
      onClick={handleClick}
      className="p-2 rounded-full text-blue-800 hover:bg-gray-900 transition-colors duration-200"
    >
      {icon}
    </button>
  );
};