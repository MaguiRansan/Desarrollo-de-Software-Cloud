import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to, onClick, label = 'Volver', ariaLabel = 'Volver', fixed = false, className = '' }) => {
  const navigate = useNavigate();

  const handle = (e) => {
    if (typeof onClick === 'function') return onClick(e);
    if (to) return navigate(to);
    return navigate(-1);
  };

  const baseClasses = 'inline-flex items-center gap-2 bg-white shadow-sm px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all duration-150';
  const fixedClasses = fixed ? 'fixed top-6 left-6 z-50' : '';

  return (
    <button
      onClick={handle}
      aria-label={ariaLabel}
      className={`${baseClasses} ${fixedClasses} ${className}`.trim()}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
