import React from 'react';
import { FaTimes, FaSave } from "react-icons/fa";

const PropertyForm = ({ property: prop, editing, onSave, onCancel, onChange, isSubmitting = false }) => {
  const [formData, setFormData] = React.useState({
    title: '',
    address: '',
    price: '',
    description: '',
    neighborhood: '',
    locality: '',
    province: '',
    type: '',
    operationType: 'venta',
    status: 'disponible',
    bedrooms: '',
    bathrooms: '',
    squareMeters: '',
    landSquareMeters: '',
    lessor: '',
    lessee: '',
    allowsPets: false,
    images: [null],
    removedImages: []
  });

  // Update local state when the prop changes
  React.useEffect(() => {
    if (prop) {
      setFormData({
        title: prop.title || '',
        address: prop.address || '',
        price: prop.price || '',
        description: prop.description || '',
        neighborhood: prop.neighborhood || '',
        locality: prop.locality || '',
        province: prop.province || '',
        type: prop.type || '',
        operationType: prop.operationType || 'venta',
        status: prop.status || 'disponible',
        bedrooms: prop.bedrooms || '',
        bathrooms: prop.bathrooms || '',
        squareMeters: prop.squareMeters || '',
        landSquareMeters: prop.landSquareMeters || '',
        lessor: prop.lessor || '',
        lessee: prop.lessee || '',
        allowsPets: prop.allowsPets || false,
        images: Array.isArray(prop.images) && prop.images.length > 0 ? prop.images : [null],
        removedImages: prop.removedImages || []
      });
    }
  }, [prop]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const newValue = type === 'checkbox' ? checked : 
                   (name === 'price' || name === 'bedrooms' || name === 'bathrooms' || 
                    name === 'squareMeters' || name === 'landSquareMeters') ? 
                   (value === '' ? '' : Number(value)) : value;
    
    const updatedFormData = {
      ...formData,
      [name]: newValue
    };
    
    setFormData(updatedFormData);
    
    if (onChange) {
      onChange(updatedFormData);
    }
  };

  const handleImageChange = (e, index) => {
    const newImages = [...formData.images];
    newImages[index] = e.target.files[0];
    
    const updatedFormData = {
      ...formData,
      images: newImages
    };
    
    setFormData(updatedFormData);
    
    if (onChange) {
      onChange(updatedFormData);
    }
  };

  const addImageField = () => {
    const updatedFormData = {
      ...formData,
      images: [...formData.images, null]
    };
    
    setFormData(updatedFormData);
    
    if (onChange) {
      onChange(updatedFormData);
    }
  };

  const removeImageField = (index) => {
    const imageToRemove = formData.images[index];
    const newImages = formData.images.filter((_, i) => i !== index);
    const removedImages = [...(formData.removedImages || [])];
    
    if (imageToRemove && typeof imageToRemove === 'object') {
      const imageId = imageToRemove._id || imageToRemove.id || imageToRemove.idImagen;
      if (imageId && !removedImages.includes(imageId)) {
        removedImages.push(imageId);
      }
    }

    const updatedFormData = {
      ...formData,
      images: newImages.length > 0 ? newImages : [null],
      removedImages
    };
    
    setFormData(updatedFormData);
    
    if (onChange) {
      onChange(updatedFormData);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.address || !formData.price) {
      alert('Por favor complete los campos requeridos');
      return;
    }
    
    const propertyId = prop?._id || prop?.id || prop?.idPropiedad;
    const imageFiles = (formData.images || []).filter(file => file instanceof File);
    
    const { images, removedImages = [], ...propertyData } = formData;

    if (editing && !propertyId) {
      alert('Error: No se encontró el ID de la propiedad. Recarga la página e intenta nuevamente.');
      return;
    }

    if (typeof onSave === 'function') {
      onSave(propertyData, imageFiles, removedImages);
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
            value={formData.title}
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
            value={formData.address}
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
            value={formData.price}
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
            value={formData.type}
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
            value={formData.bedrooms}
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
            value={formData.landSquareMeters}
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
            value={formData.bathrooms}
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
            value={formData.neighborhood}
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
            value={formData.locality}
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
            value={formData.province}
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
            value={formData.squareMeters}
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
            value={formData.operationType}
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
            value={formData.status}
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
            value={formData.description}
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
          {formData.images.map((image, index) => (
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
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300"
        >
          <FaTimes />
          <span>Cancelar</span>
        </button>
      </div>
    </div>
  );
};

export default PropertyForm;