import { createContext } from "react";

createContext;

const ToastProvider = () => {
  return (
    <div className="toast toast-end">
      <div className="alert alert-info">
        <span>New mail arrived.</span>
      </div>
      <div className="alert alert-success">
        <span>Message sent successfully.</span>
      </div>
    </div>
  );
};
