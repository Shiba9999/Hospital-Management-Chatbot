import React, { useEffect } from "react";

const Toast = ({ message, onClose }) => {
  // Auto close after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer); // cleanup
  }, [onClose]);

  return (
    <div className="toast-container" onClick={onClose}>
      <div className="toast-content">{message}</div>
    </div>
  );
};

export default Toast;
