import React from 'react';
import { FaHome, FaKey } from "react-icons/fa";

const OperationSelection = ({ onSelect }) => {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-10">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          Gestioná tus propiedades
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Elige el tipo de operación que deseas administrar.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect('venta')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 text-left p-8 shadow-lg shadow-blue-200/40 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,transparent)]" aria-hidden="true" />
          <div className="relative flex flex-col h-full text-white space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20">
              <FaHome className="text-2xl" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Propiedades en Venta</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Accede a la gestión integral de tus propiedades en venta. Podrás crear, editar, publicar y dar de baja toda la información clave desde un solo lugar.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-white/90 group-hover:text-white">
              Explorar venta
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('alquiler')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 text-left p-8 shadow-lg shadow-emerald-200/40 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,transparent)]" aria-hidden="true" />
          <div className="relative flex flex-col h-full text-white space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20">
              <FaKey className="text-2xl" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Propiedades en Alquiler</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Accede a la gestión integral de tus propiedades en alquiler. Podrás crear, editar, publicar y dar de baja toda la información clave desde un solo lugar.              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-white/90 group-hover:text-white">
              Explorar alquiler
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default OperationSelection;