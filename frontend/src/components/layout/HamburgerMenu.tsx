import React from 'react';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col justify-center items-center w-8 h-8 bg-transparent border-none cursor-pointer focus:outline-none group"
      aria-label="Toggle Sidebar"
    >
      <span
        className={`block w-6 h-0.5 bg-white rounded-sm transition-all duration-300 ease-in-out ${
          isOpen ? 'rotate-45 translate-y-1.5' : ''
        } group-hover:bg-cyan-400`}
      />
      <span
        className={`block w-6 h-0.5 bg-white rounded-sm transition-all duration-300 ease-in-out my-1 ${
          isOpen ? 'opacity-0' : ''
        } group-hover:bg-cyan-400`}
      />
      <span
        className={`block w-6 h-0.5 bg-white rounded-sm transition-all duration-300 ease-in-out ${
          isOpen ? '-rotate-45 -translate-y-1.5' : ''
        } group-hover:bg-cyan-400`}
      />
    </button>
  );
};

export default HamburgerMenu;