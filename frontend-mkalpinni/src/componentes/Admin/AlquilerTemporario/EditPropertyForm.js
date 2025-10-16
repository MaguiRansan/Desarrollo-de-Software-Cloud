import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload } from "react-icons/fa";

const FormField = ({ label, name, value, onChange, type = "text", placeholder = "", as = "input", rows = 4 }) => {
  const InputComponent = as;
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <InputComponent
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="mt-1 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
      />
    </div>
  );
};

const EditPropertyForm = ({ property, onSave, onClose }) => {
  const initialState = {
    name: '',
    description: '',
    location: { city: '', address: '' },
    capacity: '',
    services: [],
    price: { night: 0, week: 0, month: 0 },
    images: [],
    newImages: [],
    rules: { checkIn: '', checkOut: '', cancellationPolicy: '', houseRules: '' },
    securityDeposit: 0,
    paymentMethods: [],
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (property) {
      setFormData(prev => ({ ...initialState, ...property, images: property.images || [], newImages: [] }));
    }
  }, [property]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const keys = name.split('.');
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value;

    if (keys.length === 1) {
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: processedValue,
        },
      }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        newImages: [...prev.newImages, ...Array.from(e.target.files)],
      }));
    }
  };
  
  const removeExistingImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const removeNewImage = (indexToRemove) => {
    setFormData((prev) => ({
        ...prev,
        newImages: prev.newImages.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Editar Propiedad</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <FormField label="Nombre de la Propiedad" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Villa Soleada" />
            </div>
            <div className="md:col-span-2">
                <FormField label="Descripción" name="description" value={formData.description} onChange={handleChange} as="textarea" placeholder="Describe las características principales de tu propiedad..." />
            </div>
        </div>

        <fieldset className="border p-4 rounded-lg">
          <legend className="text-lg font-semibold text-gray-700 px-2">Ubicación y Capacidad</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <FormField label="Ciudad" name="location.city" value={formData.location.city} onChange={handleChange} placeholder="Ej: Buenos Aires" />
            <FormField label="Dirección" name="location.address" value={formData.location.address} onChange={handleChange} placeholder="Ej: Av. Corrientes 1234" />
            <FormField label="Capacidad (huéspedes)" name="capacity" type="number" value={formData.capacity} onChange={handleChange} placeholder="4" />
          </div>
        </fieldset>

        <fieldset className="border p-4 rounded-lg">
          <legend className="text-lg font-semibold text-gray-700 px-2">Precios (por noche, semana, mes)</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <FormField label="Precio por Noche" name="price.night" type="number" value={formData.price.night} onChange={handleChange} />
            <FormField label="Precio por Semana" name="price.week" type="number" value={formData.price.week} onChange={handleChange} />
            <FormField label="Precio por Mes" name="price.month" type="number" value={formData.price.month} onChange={handleChange} />
          </div>
        </fieldset>

        <div className="md:col-span-2">
          <FormField label="Servicios (separados por coma)" name="services" value={Array.isArray(formData.services) ? formData.services.join(', ') : ''} onChange={(e) => setFormData(prev => ({...prev, services: e.target.value.split(',').map(s => s.trim())}))} placeholder="Ej: Wi-Fi, Piscina, Estacionamiento" />
        </div>

        <fieldset className="border p-4 rounded-lg">
          <legend className="text-lg font-semibold text-gray-700 px-2">Imágenes</legend>
          <div className="mt-4">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white">
                <FaUpload className="w-8 h-8" />
                <span className="mt-2 text-base leading-normal">Seleccionar nuevas imágenes</span>
                <input type="file" multiple onChange={handleImageChange} className="hidden" />
            </label>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                    <div key={`existing-${index}`} className="relative">
                        <img src={image} alt={`Imagen existente ${index + 1}`} className="w-full h-24 object-cover rounded-lg shadow-md" />
                        <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700 transition">
                            <FaTimes size={12}/>
                        </button>
                    </div>
                ))}
                {formData.newImages.map((file, index) => (
                    <div key={`new-${index}`} className="relative">
                        <img src={URL.createObjectURL(file)} alt={`Nueva imagen ${index + 1}`} className="w-full h-24 object-cover rounded-lg shadow-md" />
                        <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700 transition">
                             <FaTimes size={12}/>
                        </button>
                    </div>
                ))}
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onClose} className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors duration-300">
            Cancelar
          </button>
          <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPropertyForm;