import React, { useState } from 'react';
import { FaTimes, FaSave, FaExclamationTriangle } from "react-icons/fa";

const PropertyForm = ({ property, editing, onSave, onCancel, onChange, isSubmitting = false }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...property,
      [name]: name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'squareMeters' || name === 'landSquareMeters'
        ? value === '' ? '' : Number(value)
        : value,
    });
  };

  const handleImageChange = (e, index) => {
    const newImages = [...property.images];
    newImages[index] = e.target.files[0];
    onChange({ ...property, images: newImages });
  };

  const addImageField = () => {
    onChange({ ...property, images: [...property.images, null] });
  };

  const removeImageField = (index) => {
    const imageToRemove = property.images[index];
    const newImages = property.images.filter((_, i) => i !== index);

    const removedImages = [...(property.removedImages || [])];
    if (imageToRemove && typeof imageToRemove === 'object') {
      const imageId = imageToRemove._id || imageToRemove.id || imageToRemove.idImagen;
      if (imageId && !removedImages.includes(imageId)) {
        removedImages.push(imageId);
      }
    }

    if (newImages.length === 0) {
      newImages.push(null);
    }

    onChange({ ...property, images: newImages, removedImages });
  };

  const handleSave = async () => {
    if (!property.title || !property.address || !property.price) {
      alert('Por favor complete los campos requeridos');
      return;
    }
    const propertyId = property._id || property.id || property.idPropiedad;

    const { images, _id, id, idPropiedad, removedImages = [], ...propertyData } = property;
    const imageFiles = (images || []).filter(file => file instanceof File);

    if (!propertyId && editing) {
      alert('Error: No se encontró el ID de la propiedad. Recarga la página e intenta nuevamente.');
      return;
    }

    if (typeof onSave === 'function') {
      onSave(propertyData, imageFiles, removedImages);
      return;
    }

  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {editing ? 'Editar Propiedad' : 'Registro de Propiedad'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Título *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={property.title}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese título de la propiedad"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
            Dirección *
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={property.address}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese dirección"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            Precio *
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={property.price}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese precio"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Tipo
          </label>
          <select
            name="type"
            id="type"
            value={property.type}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Casa">Casa</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Local">Local</option>
            <option value="Terreno">Terreno</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bedrooms">
            Dormitorios
          </label>
          <input
            type="number"
            name="bedrooms"
            id="bedrooms"
            value={property.bedrooms}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Número de dormitorios"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="landSquareMeters">
            Metros cuadrados del terreno
          </label>
          <input
            type="number"
            name="landSquareMeters"
            id="landSquareMeters"
            value={property.landSquareMeters}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese los metros cuadrados del terreno"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bathrooms">
            Baños
          </label>
          <input
            type="number"
            name="bathrooms"
            id="bathrooms"
            value={property.bathrooms}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Número de baños"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="neighborhood">
            Barrio
          </label>
          <input
            type="text"
            name="neighborhood"
            id="neighborhood"
            value={property.neighborhood}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el barrio"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="locality">
            Localidad
          </label>
          <input
            type="text"
            name="locality"
            id="locality"
            value={property.locality}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese la localidad"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">
            Provincia
          </label>
          <input
            type="text"
            name="province"
            id="province"
            value={property.province}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese la provincia"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="squareMeters">
            Metros cuadrados
          </label>
          <input
            type="number"
            name="squareMeters"
            id="squareMeters"
            value={property.squareMeters}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese los metros cuadrados de la propiedad"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="operationType">
            Tipo de operación
          </label>
          <select
            name="operationType"
            id="operationType"
            value={property.operationType}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            Estado
          </label>
          <select
            name="status"
            id="status"
            value={property.status}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="disponible">Disponible</option>
            <option value="reservado">Reservado</option>
            <option value="ocupado">Ocupado</option>
          </select>
        </div>

        <div className="col-span-full">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Descripción
          </label>
          <textarea
            name="description"
            id="description"
            value={property.description}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese la descripción de la propiedad"
            rows="4"
          />
        </div>

        <div className="col-span-full">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Imágenes *
          </label>
          {property.images.map((image, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="file"
                onChange={(e) => handleImageChange(e, index)}
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeImageField(index)}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
          >
            Añadir otra imagen
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className={`${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <FaSave />
              <span>{editing ? 'Actualizar Propiedad' : 'Guardar Propiedad'}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300"
        >
          <FaTimes />
          <span>Cancelar</span>
        </button>
      </div>

      {/* Modal de confirmación de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300 scale-100">
            <div className="flex items-center text-yellow-600 mb-4">
              <FaExclamationTriangle className="w-6 h-6 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Confirmar Cancelación</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Estás a punto de cancelar el registro. <strong className="font-extrabold text-black-600">Perderás todos los datos ingresados</strong> en el formulario. ¿Estás seguro?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-150"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  onCancel();
                }}
                className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-150"
              >
                Sí, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyForm;