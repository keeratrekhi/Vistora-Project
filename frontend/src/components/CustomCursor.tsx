import { useEffect, useState } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      {/* Small inner dot */}
      <div
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          width: 8,
          height: 8,
          backgroundColor: " #7c3aed",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999,
          transition: "0.05s ease-out",
        }}
      />
      {/* Big outer circle */}
      <div
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          width: 30,
          height: 30,
          border: "2px solid  #7c3aed",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9998,
          transition: "0.2s ease-out",
        }}
      />
    </>
  );
};

export default CustomCursor;
