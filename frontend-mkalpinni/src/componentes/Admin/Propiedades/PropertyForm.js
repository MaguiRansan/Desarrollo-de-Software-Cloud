import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { useState } from 'react';
import { propertyService } from '../../../services/api';

const PropertyForm = ({ property, editing, onSave, onCancel, onChange, isSubmitting = false }) => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newUser, setNewUser] = useState('');
  const [userType, setUserType] = useState('');
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...property,
      [name]: name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'squareMeters'
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
    const newImages = property.images.filter((_, i) => i !== index);
    onChange({ ...property, images: newImages });
  };

  const handleSave = async () => {
    if (!property.title || !property.address || !property.price) {
      alert('Por favor complete los campos requeridos');
      return;
    }
    if ((property.status === 'reservado' || property.status === 'ocupado') && (!property.lessor || !property.lessee)) {
      alert('Por favor ingrese el nombre del locador y locatario.');
      return;
    }

    const propertyId = property._id || property.id || property.idPropiedad;
    console.log('=== PropertyForm.handleSave ===');
    console.log('Editing:', editing);
    console.log('Property._id:', property._id);
    console.log('Property.id:', property.id);
    console.log('Property.idPropiedad:', property.idPropiedad);
    console.log('Resolved propertyId:', propertyId);
    console.log('All property keys:', Object.keys(property));

    const { images, _id, id, idPropiedad, ...propertyData } = property;
    const imageFiles = (images || []).filter(file => file instanceof File);

    console.log('Image files to upload:', imageFiles.length);

    if (!propertyId && editing) {
      alert('Error: No se encontró el ID de la propiedad. Recarga la página e intenta nuevamente.');
      console.error('PropertyId is undefined and editing is true');
      return;
    }

    if (typeof onSave === 'function') {
      onSave(propertyData, imageFiles);
      return;
    }

    setLocalSubmitting(true);
    try {
      let result;
      
      if (editing && propertyId) {
        console.log('Updating property with ID:', propertyId);
        result = await propertyService.update(propertyId, propertyData);
        if (!result || result.status === false) {
          throw new Error(result?.message || 'Error updating property');
        }
        console.log('Update successful');
      } else if (!editing) {
        console.log('Creating new property');
        result = await propertyService.create(propertyData);
        if (!result || result.status === false) {
          throw new Error(result?.message || 'Error creating property');
        }
        console.log('Create successful');
      } else {
        throw new Error('Cannot determine if creating or updating');
      }

      const createdOrUpdatedId = (result.value && (result.value._id || result.value.id)) || propertyId;
      console.log('ID for image upload:', createdOrUpdatedId);

      if (createdOrUpdatedId && imageFiles.length > 0) {
        console.log('Uploading', imageFiles.length, 'images');
        const uploadResp = await propertyService.uploadImages(createdOrUpdatedId, imageFiles);
        console.log('Upload complete:', uploadResp?.status);
      }

      let refreshed;
      if (createdOrUpdatedId) {
        const getResp = await propertyService.getById(createdOrUpdatedId);
        if (getResp && getResp.status) {
          refreshed = getResp.value;
        }
      }

      alert(editing ? 'Propiedad actualizada' : 'Propiedad creada');
      if (typeof onChange === 'function' && refreshed) {
        onChange(refreshed);
      }
    } catch (err) {
      console.error('Error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLocalSubmitting(false);
    }
  };

  const openRegisterModal = (type) => {
    setUserType(type);
    setIsRegisterModalOpen(true);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setNewUser('');
  };

  const handleRegisterUser = () => {
    if (newUser) {
      onChange({
        ...property,
        [userType]: newUser,
      });
      closeRegisterModal();
    } else {
      alert('Por favor ingrese un nombre válido.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {editing ? 'Editar Propiedad' : 'Registrar Nueva Propiedad'}
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
            placeholder="Ingrese los metros cuadrados"
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

        {(property.status === 'reservado' || property.status === 'ocupado') && (
          <>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lessor">
                Cliente 1 (Propietario) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="lessor"
                  id="lessor"
                  value={property.lessor}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del propietario"
                  required
                />
                <button
                  type="button"
                  onClick={() => openRegisterModal('lessor')}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lessee">
                Cliente 2 *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="lessee"
                  id="lessee"
                  value={property.lessee}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del cliente 2"
                  required
                />
                <button
                  type="button"
                  onClick={() => openRegisterModal('lessee')}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          </>
        )}

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
          disabled={isSubmitting || localSubmitting}
          className={`${
            isSubmitting || localSubmitting
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300`}
        >
          {isSubmitting || localSubmitting ? (
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
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300"
        >
          <FaTimes />
          <span>Cancelar</span>
        </button>
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Registrar {userType === 'lessor' ? 'Locador' : 'Locatario'}
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newUser">
                Nombre
              </label>
              <input
                type="text"
                id="newUser"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 shadow-sm"
                placeholder={`Nombre del ${userType === 'lessor' ? 'locador' : 'locatario'}`}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleRegisterUser}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition duration-300"
              >
                <span>Guardar</span>
              </button>
              <button
                onClick={closeRegisterModal}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition duration-300"
              >
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyForm;