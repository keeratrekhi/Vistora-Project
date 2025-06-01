// src/components/PinModal.tsx
import React, { useState } from "react";

interface PinModalProps {
  isOpen: boolean;
  onSubmit: (pin: string) => void;
  onClose: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [pin, setPin] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Enter Event PIN</h2>
        <p className="mb-4 text-gray-600">
          This event is protected. Please enter the PIN provided by the event organizer.
        </p>
        
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/, ''))} // Numbers only
          className="w-full p-3 border border-gray-300 rounded-md mb-4 text-center text-xl text-black"
          placeholder="Enter PIN"
          maxLength={4}
          inputMode="numeric"
        />
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(pin)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={pin.length < 4}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinModal;